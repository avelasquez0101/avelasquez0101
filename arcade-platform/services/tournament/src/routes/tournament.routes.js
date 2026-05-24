const express = require('express');
const router = express.Router();
const controller = require('../controllers/tournament.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

const createSchema = z.object({
  name: z.string().min(3),
  game: z.string(),
  format: z.enum(['SINGLE_ELIMINATION', 'ROUND_ROBIN']),
  maxParticipants: z.number().int().positive(),
  prizePool: z.number().int().nonnegative(),
  startDate: z.string().datetime(),
});

// Públicas (pero requieren auth para acciones)
router.get('/', controller.listTournaments);
router.get('/:id', controller.getTournament);

// Requieren Auth
router.post('/:id/register', authMiddleware, controller.register);
router.post('/:id/checkin', authMiddleware, controller.checkIn);

// Requieren Admin
router.post('/', authMiddleware, adminMiddleware, validate(createSchema), controller.createTournament);
router.post('/:id/generate-bracket', authMiddleware, adminMiddleware, controller.generateBracket);
router.post('/:id/cancel', authMiddleware, adminMiddleware, controller.cancelTournament);

module.exports = router;
