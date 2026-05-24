const tournamentService = require('../services/tournament.service');
const logger = require('../config/logger');

/**
 * Controlador de Torneos
 * Maneja las requests HTTP y delega la lógica al servicio
 */

class TournamentController {
  /**
   * Listar torneos con filtros
   * GET /api/tournaments?game=valorant&status=UPCOMING&page=1&limit=20
   */
  async getTournaments(req, res, next) {
    try {
      const filters = {
        game: req.query.game,
        status: req.query.status,
        format: req.query.format,
        page: req.query.page || 1,
        limit: req.query.limit || 20,
      };

      const result = await tournamentService.getTournaments(filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener detalles de un torneo
   * GET /api/tournaments/:id
   */
  async getTournamentById(req, res, next) {
    try {
      const { id } = req.params;
      const tournament = await tournamentService.getTournamentById(id);

      res.json({
        success: true,
        data: tournament,
      });
    } catch (error) {
      if (error.message === 'Tournament not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Obtener bracket de un torneo
   * GET /api/tournaments/:id/bracket
   */
  async getBracket(req, res, next) {
    try {
      const { id } = req.params;
      const bracket = await tournamentService.getBracket(id);

      res.json({
        success: true,
        data: bracket,
      });
    } catch (error) {
      if (error.message === 'Tournament not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Registrarse en un torneo
   * POST /api/tournaments/:id/register
   */
  async registerToTournament(req, res, next) {
    try {
      const { id: tournamentId } = req.params;
      const userId = req.user.userId || req.user.id;

      const registration = await tournamentService.registerToTournament(tournamentId, userId);

      logger.info(`User ${userId} registered for tournament ${tournamentId}`);

      res.status(201).json({
        success: true,
        message: 'Successfully registered for tournament',
        data: registration,
      });
    } catch (error) {
      if (['Tournament not found', 'Tournament is not open for registration', 
           'Already registered for this tournament', 'Tournament is full', 
           'Registration closed'].includes(error.message)) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Hacer check-in para un torneo
   * POST /api/tournaments/:id/checkin
   */
  async checkIn(req, res, next) {
    try {
      const { id: tournamentId } = req.params;
      const userId = req.user.userId || req.user.id;

      const registration = await tournamentService.checkIn(tournamentId, userId);

      res.json({
        success: true,
        message: 'Check-in successful',
        data: registration,
      });
    } catch (error) {
      if (['Tournament not found', 'Check-in is not available at this time',
           'Not registered for this tournament', 'Already checked in'].includes(error.message)) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Crear un nuevo torneo (admin)
   * POST /api/tournaments/
   */
  async createTournament(req, res, next) {
    try {
      const createdBy = req.user.userId || req.user.id;
      
      const tournament = await tournamentService.createTournament(req.body, createdBy);

      res.status(201).json({
        success: true,
        message: 'Tournament created successfully',
        data: tournament,
      });
    } catch (error) {
      logger.error('Error creating tournament:', error);
      next(error);
    }
  }

  /**
   * Actualizar torneo (admin)
   * PUT /api/tournaments/:id
   */
  async updateTournament(req, res, next) {
    try {
      const { id } = req.params;
      
      // Eliminar campos que no se pueden actualizar directamente
      const { id: _, ...updateData } = req.body;

      const tournament = await prisma.tournament.update({
        where: { id },
        data: updateData,
      });

      res.json({
        success: true,
        message: 'Tournament updated successfully',
        data: tournament,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found',
        });
      }
      next(error);
    }
  }

  /**
   * Cancelar torneo (admin)
   * POST /api/tournaments/:id/cancel
   */
  async cancelTournament(req, res, next) {
    try {
      const { id } = req.params;
      const reason = req.body.reason || 'No reason provided';

      await tournamentService.cancelTournament(id, reason);

      res.json({
        success: true,
        message: 'Tournament cancelled successfully',
      });
    } catch (error) {
      if (error.message === 'Tournament not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Generar bracket e iniciar torneo (admin)
   * POST /api/tournaments/:id/generate-bracket
   */
  async generateBracket(req, res, next) {
    try {
      const { id: tournamentId } = req.params;

      const matches = await tournamentService.generateBracket(tournamentId);

      res.json({
        success: true,
        message: 'Bracket generated and tournament started',
        data: {
          tournamentId,
          matchCount: matches.length,
          matches,
        },
      });
    } catch (error) {
      if (['Tournament not found', 'Tournament must be in CHECK_IN status',
           'Not enough participants to start tournament'].includes(error.message)) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}

module.exports = new TournamentController();
