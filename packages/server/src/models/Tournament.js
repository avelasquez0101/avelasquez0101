const pool = require('../config/database');

class Tournament {
  static async findAll(filters = {}) {
    let query = `
      SELECT t.*, g.name as game_name, g.image as game_image,
             COUNT(DISTINCT p.user_id) as participant_count
      FROM tournaments t
      LEFT JOIN games g ON t.game_id = g.id
      LEFT JOIN participants p ON t.id = p.tournament_id
      WHERE t.status = 'active'
    `;
    const params = [];
    let paramCount = 1;

    if (filters.game_id) {
      query += ` AND t.game_id = $${paramCount}`;
      params.push(filters.game_id);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    query += ' GROUP BY t.id, g.name, g.image ORDER BY t.start_date DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT t.*, g.name as game_name, g.image as game_image,
              COUNT(DISTINCT p.user_id) as participant_count
       FROM tournaments t
       LEFT JOIN games g ON t.game_id = g.id
       LEFT JOIN participants p ON t.id = p.tournament_id
       WHERE t.id = $1
       GROUP BY t.id, g.name, g.image`,
      [id]
    );
    return result.rows[0];
  }

  static async create({ name, game_id, description, max_participants, entry_fee_chcoins, entry_fee_usd, prize_pool_chcoins, prize_pool_usd, start_date, end_date, rules }) {
    const result = await pool.query(
      `INSERT INTO tournaments (name, game_id, description, max_participants, entry_fee_chcoins, entry_fee_usd, prize_pool_chcoins, prize_pool_usd, start_date, end_date, rules, status, bracket_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', '[]')
       RETURNING *`,
      [name, game_id, description, max_participants, entry_fee_chcoins, entry_fee_usd, prize_pool_chcoins, prize_pool_usd, start_date, end_date, rules]
    );
    return result.rows[0];
  }

  static async registerParticipant(tournamentId, userId) {
    // Verificar si ya está registrado
    const existing = await pool.query(
      'SELECT * FROM participants WHERE tournament_id = $1 AND user_id = $2',
      [tournamentId, userId]
    );

    if (existing.rows.length > 0) {
      throw new Error('Ya estás registrado en este torneo');
    }

    // Verificar cupo disponible
    const tournament = await this.findById(tournamentId);
    if (tournament.participant_count >= tournament.max_participants) {
      throw new Error('Torneo lleno');
    }

    const result = await pool.query(
      'INSERT INTO participants (tournament_id, user_id, status) VALUES ($1, $2, $3) RETURNING *',
      [tournamentId, userId, 'registered']
    );

    return result.rows[0];
  }

  static async getParticipants(tournamentId) {
    const result = await pool.query(
      `SELECT p.*, u.username, u.xp, u.vip_level
       FROM participants p
       JOIN users u ON p.user_id = u.id
       WHERE p.tournament_id = $1
       ORDER BY p.registered_at`,
      [tournamentId]
    );
    return result.rows;
  }

  static async submitResult(tournamentId, userId, resultData, proofUrl) {
    const result = await pool.query(
      `INSERT INTO tournament_results (tournament_id, user_id, result_data, proof_url, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [tournamentId, userId, JSON.stringify(resultData), proofUrl]
    );
    return result.rows[0];
  }

  static async finalize(tournamentId, rankings) {
    // rankings: [{user_id, position, points}]
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Actualizar estado del torneo
      await client.query(
        "UPDATE tournaments SET status = 'completed', bracket_data = $1 WHERE id = $2",
        [JSON.stringify(rankings), tournamentId]
      );

      // Distribuir premios y XP
      for (const rank of rankings) {
        const prizeMultiplier = rank.position === 1 ? 1.0 : rank.position === 2 ? 0.6 : rank.position === 3 ? 0.4 : 0;
        const xpBonus = rank.position === 1 ? 500 : rank.position === 2 ? 300 : rank.position === 3 ? 150 : 50;

        // Obtener premio del torneo
        const tournament = await client.query(
          'SELECT prize_pool_chcoins, prize_pool_usd FROM tournaments WHERE id = $1',
          [tournamentId]
        );

        const chcoinsPrize = Math.floor(tournament.rows[0].prize_pool_chcoins * prizeMultiplier);
        const usdPrize = tournament.rows[0].prize_pool_usd * prizeMultiplier;

        if (chcoinsPrize > 0) {
          await client.query(
            'UPDATE users SET chcoins = chcoins + $1 WHERE id = $2',
            [chcoinsPrize, rank.user_id]
          );
        }

        if (usdPrize > 0) {
          await client.query(
            'UPDATE users SET balance_usd = balance_usd + $1 WHERE id = $2',
            [usdPrize, rank.user_id]
          );
        }

        // Agregar XP
        await client.query(
          'UPDATE users SET xp = xp + $1 WHERE id = $2',
          [xpBonus, rank.user_id]
        );

        // Registrar resultado final
        await client.query(
          `INSERT INTO tournament_results (tournament_id, user_id, result_data, status)
           VALUES ($1, $2, $3, 'validated')
           ON CONFLICT (tournament_id, user_id) DO UPDATE SET status = 'validated'`,
          [tournamentId, rank.user_id, JSON.stringify({ position: rank.position, points: rank.points })]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async generateBracket(participants) {
    // Algoritmo simple de bracket para power of 2
    const count = participants.length;
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(count)));
    
    const bracket = [];
    for (let i = 0; i < nextPowerOf2 / 2; i++) {
      bracket.push({
        round: 1,
        match: i + 1,
        player1: participants[i]?.user_id || null,
        player2: participants[nextPowerOf2 - 1 - i]?.user_id || null,
        winner: null
      });
    }

    return bracket;
  }
}

module.exports = Tournament;
