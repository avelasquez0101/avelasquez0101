const { z } = require('zod');

// Schema para crear torneo (admin)
exports.createTournamentSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    description: z.string().max(500).optional(),
    game: z.string().min(2).max(50),
    format: z.enum(['SINGLE_ELIMINATION', 'ROUND_ROBIN']),
    maxParticipants: z.number().int().positive().min(2).max(64),
    prizePool: z.number().int().nonnegative().default(0),
    entryFee: z.number().int().nonnegative().default(0),
    startDate: z.string().datetime(),
    checkInStart: z.string().datetime(),
    checkInEnd: z.string().datetime(),
  }),
});

// Schema para actualizar torneo
exports.updateTournamentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().max(500).optional(),
    maxParticipants: z.number().int().positive().min(2).max(64).optional(),
    prizePool: z.number().int().nonnegative().optional(),
    status: z.enum(['UPCOMING', 'CHECK_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

// Schema para registrarse en torneo
exports.registerTournamentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Schema para check-in
exports.checkInSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Schema para reportar resultado
exports.reportResultSchema = z.object({
  params: z.object({
    matchId: z.string().uuid(),
  }),
  body: z.object({
    player1Score: z.number().int().nonnegative(),
    player2Score: z.number().int().nonnegative(),
  }),
});

// Schema para abrir disputa
exports.createDisputeSchema = z.object({
  params: z.object({
    matchId: z.string().uuid(),
  }),
  body: z.object({
    reason: z.string().min(10).max(500),
    screenshotUrl: z.string().url().optional(),
  }),
});

// Middleware de validación
exports.validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          errors,
        });
      }
      next(error);
    }
  };
};
