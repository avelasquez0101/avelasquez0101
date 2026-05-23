const prisma = require('../config/database');
const tournamentService = require('../services/tournament.service');
const logger = require('../config/logger');

/**
 * Controlador de Matches/Partidas
 */

class MatchController {
  /**
   * Reportar resultado de un match
   * POST /api/matches/:matchId/report
   */
  async reportResult(req, res, next) {
    try {
      const { matchId } = req.params;
      const { player1Score, player2Score } = req.body;
      const userId = req.user.userId || req.user.id;

      // Verificar que el usuario es uno de los jugadores
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Match not found',
        });
      }

      if (match.player1Id !== userId && match.player2Id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only players can report results',
        });
      }

      const updatedMatch = await tournamentService.reportResult(matchId, {
        player1Score,
        player2Score,
      }, userId);

      res.json({
        success: true,
        message: 'Result reported successfully',
        data: updatedMatch,
      });
    } catch (error) {
      if (['Match not found', 'Match already completed', 'Match is under dispute'].includes(error.message)) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Abrir disputa en un match
   * POST /api/matches/:matchId/dispute
   */
  async createDispute(req, res, next) {
    try {
      const { matchId } = req.params;
      const { reason, screenshotUrl } = req.body;
      const userId = req.user.userId || req.user.id;

      // Verificar que el match existe
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Match not found',
        });
      }

      // Verificar que el usuario es uno de los jugadores
      if (match.player1Id !== userId && match.player2Id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only players can create disputes',
        });
      }

      // Crear disputa
      const dispute = await prisma.dispute.create({
        data: {
          matchId,
          reason,
          screenshotUrl,
          status: 'PENDING',
        },
      });

      // Actualizar estado del match
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'DISPUTED', disputeReason: reason },
      });

      logger.warn(`Dispute created for match ${matchId} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Dispute created successfully. Admin will review.',
        data: dispute,
      });
    } catch (error) {
      logger.error('Error creating dispute:', error);
      next(error);
    }
  }

  /**
   * Obtener detalles de un match
   * GET /api/matches/:matchId
   */
  async getMatch(req, res, next) {
    try {
      const { matchId } = req.params;

      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
              game: true,
            },
          },
        },
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Match not found',
        });
      }

      res.json({
        success: true,
        data: match,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MatchController();
