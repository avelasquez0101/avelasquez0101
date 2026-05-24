const { prisma } = require('../config/database');
const logger = require('../utils/logger');
const { publishEvent } = require('../events/publisher');

class TournamentService {
  
  async createTournament(data) {
    const tournament = await prisma.tournament.create({
      data: {
        ...data,
        checkInStart: new Date(new Date(data.startDate).getTime() - 15 * 60 * 1000), // 15 min antes
        checkInEnd: new Date(data.startDate),
      }
    });
    
    await publishEvent('tournament.created', { tournamentId: tournament.id, name: tournament.name });
    return tournament;
  }

  async getTournaments(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.game) where.game = filters.game;
    
    return prisma.tournament.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        _count: { select: { registrations: true } }
      }
    });
  }

  async getTournamentById(id) {
    return prisma.tournament.findUnique({
      where: { id },
      include: {
        registrations: { select: { userId: true, checkedIn: true } },
        matches: { orderBy: { round: 'asc' } }
      }
    });
  }

  async registerToTournament(tournamentId, userId) {
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    
    if (!tournament) throw new Error('Torneo no encontrado');
    if (tournament.status !== 'UPCOMING') throw new Error('Inscripciones cerradas');
    
    const count = await prisma.registration.count({ where: { tournamentId } });
    if (count >= tournament.maxParticipants) throw new Error('Torneo lleno');

    const registration = await prisma.registration.create({
      data: { tournamentId, userId }
    });

    return registration;
  }

  async checkInToTournament(tournamentId, userId) {
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    const now = new Date();

    if (now < tournament.checkInStart || now > tournament.checkInEnd) {
      throw new Error('Fuera del periodo de check-in');
    }

    const registration = await prisma.registration.update({
      where: {
        userId_tournamentId: { userId, tournamentId }
      },
      data: { checkedIn: true, checkedInAt: new Date() }
    });

    return registration;
  }

  async generateBracket(tournamentId) {
    // Lógica simplificada para Single Elimination
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { registrations: { where: { checkedIn: true } } }
    });

    if (tournament.registrations.length < 2) throw new Error('Se necesitan al menos 2 jugadores');

    const participants = tournament.registrations.map(r => r.userId);
    // Aquí iría el algoritmo de emparejamiento (seedings aleatorios por ahora)
    const shuffled = participants.sort(() => Math.random() - 0.5);
    
    const matches = [];
    let bracketPosition = 1;

    // Crear primera ronda
    for (let i = 0; i < shuffled.length; i += 2) {
      const player1 = shuffled[i];
      const player2 = shuffled[i + 1] || null; // BYE si es impar
      
      matches.push({
        tournamentId,
        round: 1,
        bracketPosition,
        player1Id: player1,
        player2Id: player2,
        status: player2 ? 'PENDING' : 'COMPLETED', // Si hay BYE, avanza directo
        winnerId: player2 ? null : player1
      });
      bracketPosition++;
    }

    await prisma.match.createMany({ data: matches });
    
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'IN_PROGRESS', currentRound: 1 }
    });

    await publishEvent('tournament.started', { tournamentId });
    
    return { matchesCount: matches.length };
  }

  async cancelTournament(tournamentId) {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'CANCELLED' }
    });
    await publishEvent('tournament.cancelled', { tournamentId });
  }
}

module.exports = new TournamentService();
