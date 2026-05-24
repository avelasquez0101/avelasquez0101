const express = require('express');
const router = express.Router();
const controller = require('../controllers/match.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Requieren Auth
router.get('/:matchId', controller.getMatch);
router.post('/:matchId/report', authMiddleware, controller.reportResult);
router.post('/:matchId/dispute', authMiddleware, controller.createDispute);

// Admin
router.post('/:matchId/resolve-dispute', authMiddleware, adminMiddleware, controller.resolveDispute);

module.exports = router;
