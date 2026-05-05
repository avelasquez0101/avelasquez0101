const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const redis = require('../config/redis');

// Obtener ranking global
router.get('/global', async (req, res) => {
  try {
    const cacheKey = 'leaderboard:global';
    
    // Intentar obtener de caché
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.xp,
        u.chcoins,
        u.level,
        u.isVip,
        u.gamePreference,
        COUNT(DISTINCT t.id) as tournamentsPlayed,
        COUNT(DISTINCT CASE WHEN r.position = 1 THEN t.id END) as wins
      FROM users u
      LEFT JOIN tournament_results r ON u.id = r.userId
      LEFT JOIN tournaments t ON r.tournamentId = t.id
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY u.xp DESC, wins DESC
      LIMIT 100
    `);

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      ...row
    }));

    // Guardar en caché por 5 minutos
    await redis.setex(cacheKey, 300, JSON.stringify(leaderboard));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ranking' });
  }
});

// Obtener ranking por juego
router.get('/game/:game', async (req, res) => {
  try {
    const { game } = req.params;
    const cacheKey = `leaderboard:game:${game}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await query(`
      SELECT 
        u.id,
        u.username,
        u.xp,
        u.chcoins,
        u.level,
        COUNT(DISTINCT t.id) as tournamentsPlayed,
        COUNT(DISTINCT CASE WHEN r.position = 1 THEN t.id END) as wins
      FROM users u
      LEFT JOIN tournament_results r ON u.id = r.userId
      LEFT JOIN tournaments t ON r.tournamentId = t.id
      WHERE u.gamePreference = $1 AND u.role = 'user'
      GROUP BY u.id
      ORDER BY u.xp DESC, wins DESC
      LIMIT 50
    `, [game]);

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      ...row
    }));

    await redis.setex(cacheKey, 300, JSON.stringify(leaderboard));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Game leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ranking' });
  }
});

// Obtener posición de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(`
      WITH ranked_users AS (
        SELECT 
          u.id,
          u.username,
          u.xp,
          ROW_NUMBER() OVER (ORDER BY u.xp DESC) as rank
        FROM users u
        WHERE u.role = 'user'
      )
      SELECT * FROM ranked_users WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener posición' });
  }
});

module.exports = router;
