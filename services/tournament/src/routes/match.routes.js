const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const { authenticate } = require('../middleware/auth');
const { validate, reportResultSchema, createDisputeSchema } = require('../middleware/validate');

/**
 * Rutas para gestión de matches/partidas
 */

// Reportar resultado de un match (ambos jugadores pueden reportar)
router.post(
  '/:matchId/report',
  authenticate,
  validate(reportResultSchema),
  matchController.reportResult
);

// Abrir disputa en un match
router.post(
  '/:matchId/dispute',
  authenticate,
  validate(createDisputeSchema),
  matchController.createDispute
);

// Obtener detalles de un match
router.get('/:matchId', matchController.getMatch);

module.exports = router;
