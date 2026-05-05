const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const redis = require('../config/redis');

class User {
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, username, game_id, xp, chcoins, balance_usd, vip_level, streak_days, last_login, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create({ email, password, username, game_id }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, password, username, game_id, xp, chcoins, balance_usd, vip_level, streak_days)
       VALUES ($1, $2, $3, $4, 0, 100, 0, 0, 0)
       RETURNING id, email, username, game_id, xp, chcoins, balance_usd, vip_level, streak_days, created_at`,
      [email, hashedPassword, username, game_id]
    );
    return result.rows[0];
  }

  static async updateStreak(userId) {
    const user = await this.findById(userId);
    const lastLogin = new Date(user.last_login);
    const today = new Date();
    const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));

    let newStreak = user.streak_days;
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    const result = await pool.query(
      'UPDATE users SET streak_days = $1, last_login = NOW() WHERE id = $2 RETURNING streak_days',
      [newStreak, userId]
    );

    // Cache en Redis
    await redis.setex(`user:${userId}:streak`, 3600, newStreak);

    return result.rows[0].streak_days;
  }

  static async addXP(userId, amount) {
    const user = await this.findById(userId);
    const vipMultiplier = 1 + (user.vip_level * 0.1);
    const totalXP = Math.floor(amount * vipMultiplier);

    const result = await pool.query(
      'UPDATE users SET xp = xp + $1 WHERE id = $2 RETURNING xp, vip_level',
      [totalXP, userId]
    );

    // Actualizar nivel VIP basado en XP
    const newVIPLevel = Math.floor(result.rows[0].xp / 1000);
    if (newVIPLevel > user.vip_level) {
      await pool.query(
        'UPDATE users SET vip_level = $1 WHERE id = $2',
        [newVIPLevel, userId]
      );
    }

    return { xp: result.rows[0].xp, vipLevel: newVIPLevel };
  }

  static async addChcoins(userId, amount) {
    const result = await pool.query(
      'UPDATE users SET chcoins = chcoins + $1 WHERE id = $2 RETURNING chcoins',
      [amount, userId]
    );
    return result.rows[0].chcoins;
  }

  static async updateBalance(userId, amount) {
    const result = await pool.query(
      'UPDATE users SET balance_usd = balance_usd + $1 WHERE id = $2 RETURNING balance_usd',
      [amount, userId]
    );
    return result.rows[0].balance_usd;
  }

  static async getLeaderboard(gameId = null, limit = 50) {
    let query = `
      SELECT id, username, game_id, xp, chcoins, vip_level, streak_days
      FROM users
    `;
    const params = [];

    if (gameId) {
      query += ' WHERE game_id = $1';
      params.push(gameId);
    }

    query += ' ORDER BY xp DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = User;
