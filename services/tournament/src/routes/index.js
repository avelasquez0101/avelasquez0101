const express = require('express');
const router = express.Router();

const tournamentRoutes = require('./tournament.routes');
const matchRoutes = require('./match.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'tournament-service',
    timestamp: new Date().toISOString(),
    status: 'healthy',
  });
});

// Rutas principales
router.use('/tournaments', tournamentRoutes);
router.use('/matches', matchRoutes);

module.exports = router;
