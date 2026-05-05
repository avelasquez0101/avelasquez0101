const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// GET /api/tournaments - List all tournaments
router.get('/', apiLimiter, async (req, res) => {
  try {
    const { game, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT t.*, g.name as game_name, g.slug as game_slug, 
             u.username as organizer_username,
             COUNT(tp.id) as registered_count
      FROM tournaments t
      JOIN games g ON t.game_id = g.id
      JOIN users u ON t.organizer_id = u.id
      LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (game) {
      query += ` AND g.slug = $${paramIndex}`;
      params.push(game);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    query += ` GROUP BY t.id, g.name, g.slug, u.username`;
    query += ` ORDER BY t.starts_at ASC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(DISTINCT t.id) as total FROM tournaments t JOIN games g ON t.game_id = g.id WHERE 1=1`;
    const countParams = [];
    
    if (game) {
      countQuery += ` AND g.slug = $1`;
      countParams.push(game);
    }
    
    if (status) {
      countQuery += ` AND t.status = $${countParams.length + 1}`;
      countParams.push(status);
    }
    
    const countResult = await db.query(countQuery, countParams);
    
    res.json({
      tournaments: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// GET /api/tournaments/:id - Get single tournament
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT t.*, g.name as game_name, g.slug as game_slug,
              u.username as organizer_username, u.id as organizer_id
       FROM tournaments t
       JOIN games g ON t.game_id = g.id
       JOIN users u ON t.organizer_id = u.id
       WHERE t.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    // Get participants
    const participantsResult = await db.query(
      `SELECT tp.*, u.username, u.xp
       FROM tournament_participants tp
       JOIN users u ON tp.user_id = u.id
       WHERE tp.tournament_id = $1
       ORDER BY tp.seed`,
      [id]
    );
    
    // Get matches
    const matchesResult = await db.query(
      `SELECT m.*, 
              t1.name as team1_name, t2.name as team2_name,
              p1.user_id as participant1_user_id, p2.user_id as participant2_user_id
       FROM matches m
       LEFT JOIN teams t1 ON m.team1_id = t1.id
       LEFT JOIN teams t2 ON m.team2_id = t2.id
       LEFT JOIN tournament_participants p1 ON m.participant1_id = p1.id
       LEFT JOIN tournament_participants p2 ON m.participant2_id = p2.id
       WHERE m.tournament_id = $1
       ORDER BY m.round, m.match_number`,
      [id]
    );
    
    res.json({
      tournament: result.rows[0],
      participants: participantsResult.rows,
      matches: matchesResult.rows,
    });
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// POST /api/tournaments - Create tournament (Admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const {
      gameId,
      name,
      description,
      format,
      maxTeams,
      minTeams = 2,
      registrationFeeChcoins = 0,
      registrationFeeUsd = 0,
      prizePoolChcoins = 0,
      prizePoolUsd = 0,
      prizeDistribution,
      startsAt,
      registrationDeadline,
      rules,
    } = req.body;
    
    const result = await client.query(
      `INSERT INTO tournaments 
       (game_id, organizer_id, name, description, format, max_teams, min_teams,
        registration_fee_chcoins, registration_fee_usd, prize_pool_chcoins, prize_pool_usd,
        prize_distribution, starts_at, registration_deadline, rules, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'registration')
       RETURNING *`,
      [
        gameId,
        req.user.userId,
        name,
        description,
        format,
        maxTeams,
        minTeams,
        registrationFeeChcoins,
        registrationFeeUsd,
        prizePoolChcoins,
        prizePoolUsd,
        JSON.stringify(prizeDistribution || { '1': 0.6, '2': 0.3, '3': 0.1 }),
        startsAt,
        registrationDeadline,
        rules,
      ]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Tournament created successfully',
      tournament: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create tournament error:', error);
    res.status(400).json({ error: error.message || 'Failed to create tournament' });
  } finally {
    client.release();
  }
});

// POST /api/tournaments/:id/register - Register for tournament
router.post('/:id/register', authMiddleware, async (req, res) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if tournament exists and is open for registration
    const tournamentResult = await client.query(
      `SELECT * FROM tournaments WHERE id = $1 AND status = 'registration' AND registration_deadline > NOW()`,
      [id]
    );
    
    if (tournamentResult.rows.length === 0) {
      return res.status(400).json({ error: 'Tournament not available for registration' });
    }
    
    const tournament = tournamentResult.rows[0];
    
    // Check if already registered
    const existingRegistration = await client.query(
      `SELECT id FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (existingRegistration.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered for this tournament' });
    }
    
    // Check if tournament is full
    const countResult = await client.query(
      `SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = $1`,
      [id]
    );
    
    if (parseInt(countResult.rows[0].count) >= tournament.max_teams) {
      return res.status(400).json({ error: 'Tournament is full' });
    }
    
    // Handle registration fee
    if (tournament.registration_fee_chcoins > 0 || tournament.registration_fee_usd > 0) {
      const userResult = await client.query(
        'SELECT chcoins, balance_usd FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );
      
      const user = userResult.rows[0];
      
      if (user.chcoins < tournament.registration_fee_chcoins) {
        return res.status(400).json({ error: 'Insufficient Chcoins balance' });
      }
      
      if (parseFloat(user.balance_usd) < tournament.registration_fee_usd) {
        return res.status(400).json({ error: 'Insufficient USD balance' });
      }
      
      // Deduct fees
      const newChcoins = user.chcoins - tournament.registration_fee_chcoins;
      const newUsd = parseFloat(user.balance_usd) - tournament.registration_fee_usd;
      
      await client.query(
        'UPDATE users SET chcoins = $1, balance_usd = $2 WHERE id = $3',
        [newChcoins, newUsd, userId]
      );
      
      // Record transaction
      await client.query(
        `INSERT INTO transactions 
         (user_id, type, amount_chcoins, amount_usd, balance_before_chcoins, balance_after_chcoins,
          balance_before_usd, balance_after_usd, reference_type, reference_id, description)
         VALUES ($1, 'tournament_fee', $2, $3, $4, $5, $6, $7, 'tournament', $8, $9)`,
        [
          userId,
          -tournament.registration_fee_chcoins,
          -tournament.registration_fee_usd,
          user.chcoins,
          newChcoins,
          user.balance_usd,
          newUsd,
          id,
          `Registration fee for ${tournament.name}`,
        ]
      );
    }
    
    // Register user
    await client.query(
      `INSERT INTO tournament_participants (tournament_id, user_id, status)
       VALUES ($1, $2, 'registered')`,
      [id, userId]
    );
    
    await client.query('COMMIT');
    
    res.json({ message: 'Successfully registered for tournament' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Register tournament error:', error);
    res.status(400).json({ error: error.message || 'Failed to register for tournament' });
  } finally {
    client.release();
  }
});

// GET /api/tournaments/leaderboard/global
router.get('/leaderboard/global', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const result = await db.query(
      `SELECT id, username, xp, chcoins, vip_level, streak_count,
              RANK() OVER (ORDER BY xp DESC) as rank
       FROM users
       WHERE is_active = true
       ORDER BY xp DESC
       LIMIT $1`,
      [parseInt(limit)]
    );
    
    res.json({ leaderboard: result.rows });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
