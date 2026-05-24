const express = require('express');
const router = express.Router();
const controller = require('../controllers/profile.controller');
const { authMiddleware, adminMiddleware, internalApiMiddleware } = require('../middleware/auth');

// Rutas públicas (requieren auth)
router.get('/me', authMiddleware, controller.getMyProfile);
router.get('/:userId', authMiddleware, controller.getProfile);

// Rutas internas (solo servicios con API Key)
router.post('/:userId/xp', internalApiMiddleware, controller.addXP);
router.post('/:userId/credits/add', internalApiMiddleware, controller.addCredits);
router.post('/:userId/credits/deduct', internalApiMiddleware, controller.deductCredits);
router.get('/:userId/balance', internalApiMiddleware, controller.getBalance);
router.post('/:userId/tournament-result', internalApiMiddleware, controller.recordTournamentResult);

// Rutas de administración
router.get('/admin/profiles', authMiddleware, adminMiddleware, controller.listProfiles);
router.put('/admin/profiles/:userId/level', authMiddleware, adminMiddleware, controller.updateLevel);
router.put('/admin/profiles/:userId/credits', authMiddleware, adminMiddleware, controller.updateCredits);

module.exports = router;
