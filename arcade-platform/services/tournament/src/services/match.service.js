const { prisma } = require('../config/database');
const logger = require('../utils/logger');
const { publishEvent } = require('../events/publisher');
const axios = require('axios');
const config = require('../config');

class MatchService {

  async reportResult(matchId, reporterId, score1, score2) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error('Partida no encontrada');
    if (match.status === 'COMPLETED') throw new Error('Resultado ya reportado');

    const winner = score1 > score2 ? match.player1Id : (score2 > score1 ? match.player2Id : null);
    
    if (winner) {
      const updatedMatch = await prisma.match.update({
        where: { id: matchId },
        data: {
          player1Score: score1,
          player2Score: score2,
          status: 'COMPLETED',
          winnerId: winner,
          completedAt: new Date()
        }
      });

      // Avanzar bracket si corresponde
      await this.advanceBracket(match.tournamentId, match.round, winner);
      
      await publishEvent('match.result_reported', { matchId, winnerId: winner });
      return updatedMatch;
    } else {
      // Empate (raro en eliminación directa, pero posible) -> Disputa automática o replay
      throw new Error('Empate no permitido en este formato');
    }
  }

  async advanceBracket(tournamentId, round, winnerId) {
    // Verificar si todos los matches de esta ronda están completos
    const pending = await prisma.match.count({
      where: { tournamentId, round, status: { not: 'COMPLETED' } }
    });

    if (pending === 0) {
      // Obtener ganadores de esta ronda
      const winners = await prisma.match.findMany({
        where: { tournamentId, round, status: 'COMPLETED' },
        select: { winnerId: true, bracketPosition: true }
      });

      // Ordenar ganadores por posición original para emparejar correctamente
      winners.sort((a, b) => a.bracketPosition - b.bracketPosition);

      const nextRoundMatches = [];
      let nextBracketPos = 1;

      for (let i = 0; i < winners.length; i += 2) {
        const p1 = winners[i].winnerId;
        const p2 = winners[i+1]?.winnerId || null; // Si queda impar, pasa directo (BYE en siguiente ronda)

        nextRoundMatches.push({
          tournamentId,
          round: round + 1,
          bracketPosition: nextBracketPos,
          player1Id: p1,
          player2Id: p2,
          status: p2 ? 'PENDING' : 'COMPLETED',
          winnerId: p2 ? null : p1
        });
        nextBracketPos++;
      }

      if (nextRoundMatches.length > 0) {
        await prisma.match.createMany({ data: nextRoundMatches });
        await prisma.tournament.update({
          where: { id: tournamentId },
          data: { currentRound: round + 1 }
        });
        
        await publishEvent('tournament.round_advanced', { tournamentId, newRound: round + 1 });
      } else {
        // No hay más rondas, el torneo ha terminado
        await this.finishTournament(tournamentId, winnerId);
      }
    }
  }

  async finishTournament(tournamentId, winnerId) {
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'COMPLETED' }
    });

    // Asignar premios vía Profile Service
    try {
      await axios.post(`${config.profileServiceUrl}/api/internal/profiles/${winnerId}/credits/add`, {
        amount: tournament.prizePool,
        reason: `Victoria en torneo ${tournament.name}`
      }, { headers: { 'x-api-key': process.env.INTERNAL_API_KEY || 'super_secret_internal_key_123' } });
      
      await axios.post(`${config.profileServiceUrl}/api/internal/profiles/${winnerId}/xp`, {
        amount: 100, // XP base por ganar
        reason: 'Victoria en torneo'
      }, { headers: { 'x-api-key': process.env.INTERNAL_API_KEY || 'super_secret_internal_key_123' } });
    } catch (error) {
      logger.error('Error asignando premios:', error.message);
    }

    await publishEvent('tournament.completed', { tournamentId, winnerId, prizePool: tournament.prizePool });
  }

  async createDispute(matchId, userId, reason, screenshotUrl) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    
    const dispute = await prisma.dispute.create({
      data: {
        matchId,
        tournamentId: match.tournamentId,
        reportedBy: userId,
        reason,
        screenshotUrl,
        status: 'PENDING'
      }
    });

    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'DISPUTED' }
    });

    await publishEvent('match.disputed', { matchId, disputeId: dispute.id });
    return dispute;
  }
}

module.exports = new MatchService();
