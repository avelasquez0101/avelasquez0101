const prisma = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * Servicio de Torneos
 * Maneja la lógica de negocio para creación, gestión y ejecución de torneos
 */
class TournamentService {
  /**
   * Crear un nuevo torneo (solo admin)
   */
  async createTournament(data, createdBy) {
    const tournament = await prisma.tournament.create({
      data: {
        ...data,
        createdBy,
        status: 'UPCOMING',
      },
      include: {
        registrations: true,
      },
    });

    logger.info(`Tournament created: ${tournament.id} - ${tournament.name}`);
    
    // Publicar evento para notificaciones (se implementará en RabbitMQ)
    await this.publishEvent('tournament.created', {
      tournamentId: tournament.id,
      name: tournament.name,
      game: tournament.game,
      startDate: tournament.startDate,
    });

    return tournament;
  }

  /**
   * Obtener todos los torneos con filtros
   */
  async getTournaments(filters = {}) {
    const { game, status, format, page = 1, limit = 20 } = filters;
    
    const where = {};
    if (game) where.game = game;
    if (status) where.status = status;
    if (format) where.format = format;

    const skip = (page - 1) * limit;

    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { startDate: 'asc' },
        include: {
          registrations: {
            select: {
              userId: true,
              checkedIn: true,
            },
          },
        },
      }),
      prisma.tournament.count({ where }),
    ]);

    return {
      tournaments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener un torneo por ID
   */
  async getTournamentById(id) {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        registrations: {
          select: {
            userId: true,
            checkedIn: true,
            seed: true,
            finalPosition: true,
          },
        },
        matches: {
          orderBy: [{ round: 'asc' }, { bracketPosition: 'asc' }],
        },
      },
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    return tournament;
  }

  /**
   * Registrarse en un torneo
   */
  async registerToTournament(tournamentId, userId) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { registrations: true },
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Verificar estado del torneo
    if (tournament.status !== 'UPCOMING') {
      throw new Error('Tournament is not open for registration');
    }

    // Verificar si ya está registrado
    const existing = tournament.registrations.find(r => r.userId === userId);
    if (existing) {
      throw new Error('Already registered for this tournament');
    }

    // Verificar límite de participantes
    if (tournament.registrations.length >= tournament.maxParticipants) {
      throw new Error('Tournament is full');
    }

    // Verificar fecha de inicio
    if (new Date() > tournament.checkInStart) {
      throw new Error('Registration closed');
    }

    // Crear registro
    const registration = await prisma.registration.create({
      data: {
        tournamentId,
        userId,
      },
    });

    logger.info(`User ${userId} registered for tournament ${tournamentId}`);

    return registration;
  }

  /**
   * Hacer check-in para un torneo
   */
  async checkIn(tournamentId, userId) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Verificar ventana de check-in
    const now = new Date();
    if (now < tournament.checkInStart || now > tournament.checkInEnd) {
      throw new Error('Check-in is not available at this time');
    }

    // Buscar registro
    const registration = await prisma.registration.findFirst({
      where: { tournamentId, userId },
    });

    if (!registration) {
      throw new Error('Not registered for this tournament');
    }

    if (registration.checkedIn) {
      throw new Error('Already checked in');
    }

    // Actualizar check-in
    const updated = await prisma.registration.update({
      where: { id: registration.id },
      data: { checkedIn: true, checkedInAt: new Date() },
    });

    logger.info(`User ${userId} checked in for tournament ${tournamentId}`);

    return updated;
  }

  /**
   * Generar bracket para torneo de eliminación directa
   */
  async generateBracket(tournamentId) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          where: { checkedIn: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== 'CHECK_IN') {
      throw new Error('Tournament must be in CHECK_IN status');
    }

    const participants = tournament.registrations;
    const participantCount = participants.length;

    if (participantCount < 2) {
      throw new Error('Not enough participants to start tournament');
    }

    // Calcular número de rondas
    const rounds = Math.ceil(Math.log2(participantCount));
    const bracketSize = Math.pow(2, rounds);

    // Rellenar con byes si es necesario
    const seeds = [];
    for (let i = 0; i < bracketSize; i++) {
      if (i < participantCount) {
        // Usar seeding aleatorio por ahora (se puede mejorar con SBMM)
        seeds.push(participants[i]);
      } else {
        seeds.push(null); // BYE
      }
    }

    // Crear matches de primera ronda
    const matches = [];
    for (let i = 0; i < bracketSize / 2; i++) {
      const player1 = seeds[i * 2];
      const player2 = seeds[i * 2 + 1];

      if (player1 && player2) {
        // Match normal
        matches.push({
          tournamentId,
          round: 1,
          bracketPosition: i + 1,
          player1Id: player1.userId,
          player1Name: player1.userId, // Se llenará con el username desde Profile Service
          player2Id: player2.userId,
          player2Name: player2.userId,
          status: 'PENDING',
        });
      } else if (player1) {
        // BYE - player1 avanza automáticamente
        matches.push({
          tournamentId,
          round: 1,
          bracketPosition: i + 1,
          player1Id: player1.userId,
          player1Name: player1.userId,
          player2Id: 'BYE',
          player2Name: 'BYE',
          winnerId: player1.userId,
          player1Score: 1,
          player2Score: 0,
          status: 'COMPLETED',
          completedAt: new Date(),
        });
      }
    }

    // Guardar todos los matches
    await prisma.match.createMany({
      data: matches,
    });

    // Actualizar estado del torneo
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'IN_PROGRESS', currentRound: 1 },
    });

    logger.info(`Bracket generated for tournament ${tournamentId} with ${matches.length} matches`);

    // Publicar evento
    await this.publishEvent('tournament.started', {
      tournamentId,
      matchCount: matches.length,
    });

    return matches;
  }

  /**
   * Reportar resultado de un match
   */
  async reportResult(matchId, result, reportedBy) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: true },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.status === 'COMPLETED') {
      throw new Error('Match already completed');
    }

    if (match.status === 'DISPUTED') {
      throw new Error('Match is under dispute');
    }

    // Actualizar match
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        player1Score: result.player1Score,
        player2Score: result.player2Score,
        status: 'COMPLETED',
        winnerId: result.player1Score > result.player2Score ? match.player1Id : match.player2Id,
        completedAt: new Date(),
        reportedBy,
      },
    });

    logger.info(`Match ${matchId} result reported by ${reportedBy}`);

    // Publicar evento
    await this.publishEvent('match.result_reported', {
      matchId,
      tournamentId: match.tournamentId,
      winnerId: updatedMatch.winnerId,
      reportedBy,
    });

    // Verificar si todos los matches de esta ronda completaron
    await this.checkRoundCompletion(match.tournamentId, match.round);

    return updatedMatch;
  }

  /**
   * Verificar si una ronda completó y avanzar a la siguiente
   */
  async checkRoundCompletion(tournamentId, round) {
    const pendingMatches = await prisma.match.count({
      where: {
        tournamentId,
        round,
        status: { not: 'COMPLETED' },
      },
    });

    if (pendingMatches === 0) {
      // Todos los matches completados, crear siguiente ronda
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
      });

      if (tournament.currentRound === round) {
        await this.createNextRound(tournamentId, round + 1);
      }
    }
  }

  /**
   * Crear matches para la siguiente ronda
   */
  async createNextRound(tournamentId, nextRound) {
    const currentMatches = await prisma.match.findMany({
      where: { tournamentId, round: nextRound - 1 },
      orderBy: { bracketPosition: 'asc' },
    });

    const winners = currentMatches
      .filter(m => m.winnerId && m.winnerId !== 'BYE')
      .map(m => m.winnerId);

    if (winners.length < 2) {
      // Torneo completado (solo queda un ganador)
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: 'COMPLETED' },
      });

      // Asignar posición final
      if (winners.length === 1) {
        await prisma.registration.updateMany({
          where: { tournamentId, userId: winners[0] },
          data: { finalPosition: 1 },
        });
      }

      await this.publishEvent('tournament.completed', {
        tournamentId,
        winnerId: winners[0],
      });

      logger.info(`Tournament ${tournamentId} completed. Winner: ${winners[0] || 'N/A'}`);
      return;
    }

    // Crear matches para la siguiente ronda
    const nextMatches = [];
    for (let i = 0; i < winners.length; i += 2) {
      if (i + 1 < winners.length) {
        nextMatches.push({
          tournamentId,
          round: nextRound,
          bracketPosition: nextMatches.length + 1,
          player1Id: winners[i],
          player1Name: winners[i],
          player2Id: winners[i + 1],
          player2Name: winners[i + 1],
          status: 'PENDING',
        });
      }
    }

    if (nextMatches.length > 0) {
      await prisma.match.createMany({
        data: nextMatches,
      });

      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { currentRound: nextRound },
      });

      await this.publishEvent('tournament.round_advanced', {
        tournamentId,
        newRound: nextRound,
      });

      logger.info(`Tournament ${tournamentId} advanced to round ${nextRound}`);
    }
  }

  /**
   * Obtener bracket completo de un torneo
   */
  async getBracket(tournamentId) {
    const matches = await prisma.match.findMany({
      where: { tournamentId },
      orderBy: [{ round: 'asc' }, { bracketPosition: 'asc' }],
    });

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        name: true,
        status: true,
        currentRound: true,
        format: true,
      },
    });

    // Agrupar matches por ronda
    const rounds = {};
    matches.forEach(match => {
      if (!rounds[match.round]) {
        rounds[match.round] = [];
      }
      rounds[match.round].push(match);
    });

    return {
      tournament,
      rounds: Object.keys(rounds).map(Number).sort((a, b) => a - b).map(round => ({
        round,
        matches: rounds[round],
      })),
    };
  }

  /**
   * Cancelar un torneo
   */
  async cancelTournament(tournamentId, reason) {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'CANCELLED' },
    });

    logger.warn(`Tournament ${tournamentId} cancelled: ${reason}`);

    await this.publishEvent('tournament.cancelled', {
      tournamentId,
      reason,
    });
  }

  /**
   * Publicar evento a RabbitMQ (placeholder para implementación futura)
   */
  async publishEvent(eventType, data) {
    // En producción, esto publicaría a RabbitMQ
    // Por ahora, solo logueamos el evento
    logger.info(`Event published: ${eventType}`, data);
    
    // TODO: Implementar RabbitMQ publisher
    // const channel = await rabbitmq.getChannel();
    // await channel.publish('platform.events', eventType, Buffer.from(JSON.stringify({
    //   eventId: uuidv4(),
    //   eventType,
    //   timestamp: new Date().toISOString(),
    //   source: 'tournament-service',
    //   data,
    // })));
  }
}

module.exports = new TournamentService();
