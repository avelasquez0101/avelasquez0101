const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createTournamentSchema,
  updateTournamentSchema,
  registerTournamentSchema,
  checkInSchema,
} = require('../middleware/validate');

/**
 * Rutas públicas (cualquier usuario autenticado)
 */

// Listar torneos (con filtros opcionales)
router.get('/', tournamentController.getTournaments);

// Obtener detalles de un torneo
router.get('/:id', tournamentController.getTournamentById);

// Obtener bracket de un torneo
router.get('/:id/bracket', tournamentController.getBracket);

// Registrarse en un torneo
router.post(
  '/:id/register',
  authenticate,
  validate(registerTournamentSchema),
  tournamentController.registerToTournament
);

// Hacer check-in para un torneo
router.post(
  '/:id/checkin',
  authenticate,
  validate(checkInSchema),
  tournamentController.checkIn
);

/**
 * Rutas de administración (solo admin)
 */

// Crear nuevo torneo
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createTournamentSchema),
  tournamentController.createTournament
);

// Actualizar torneo
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateTournamentSchema),
  tournamentController.updateTournament
);

// Cancelar torneo
router.post(
  '/:id/cancel',
  authenticate,
  requireAdmin,
  tournamentController.cancelTournament
);

// Generar bracket (iniciar torneo)
router.post(
  '/:id/generate-bracket',
  authenticate,
  requireAdmin,
  tournamentController.generateBracket
);

module.exports = router;
