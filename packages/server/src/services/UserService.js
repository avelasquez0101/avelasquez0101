const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { cache } = require('../config/redis');
const config = require('../config');

class UserService {
  static async createUser({ email, username, password, roleId = 2 }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );
      
      if (existingUser.rows.length > 0) {
        throw new Error('Email or username already exists');
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user
      const result = await client.query(
        `INSERT INTO users (email, username, password_hash, role_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, username, role_id, xp, chcoins, balance_usd, created_at`,
        [email, username, passwordHash, roleId]
      );
      
      await client.query('COMMIT');
      
      const user = result.rows[0];
      await cache.cacheUser(user.id, user);
      
      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async authenticateUser(email, password) {
    const cachedUser = await cache.getCachedUserByEmail(email);
    
    let user;
    if (cachedUser) {
      user = cachedUser;
    } else {
      const result = await db.query(
        `SELECT u.id, u.email, u.username, u.password_hash, u.role_id, u.xp, u.chcoins, 
                u.balance_usd, u.vip_level, u.streak_count, u.is_active, u.email_verified,
                u.profile_data, u.last_login_at, r.name as role_name, r.permissions
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.email = $1`,
        [email]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }
      
      user = result.rows[0];
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }
    
    // Update last login
    await db.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    // Save refresh token
    await this.saveRefreshToken(user.id, refreshToken);
    
    // Remove sensitive data
    delete user.password_hash;
    
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  static generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role_name,
        permissions: user.permissions,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  static generateRefreshToken(user) {
    return jwt.sign(
      { userId: user.id, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  static async saveRefreshToken(userId, token) {
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      if (decoded.type === 'refresh') {
        // Verify refresh token exists and is not revoked
        const result = await db.query(
          'SELECT * FROM refresh_tokens WHERE user_id = $1 AND revoked = false AND expires_at > NOW()',
          [decoded.userId]
        );
        
        if (result.rows.length === 0) {
          throw new Error('Invalid refresh token');
        }
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async getUserById(userId) {
    const cached = await cache.getCachedUser(userId);
    if (cached) {
      return cached;
    }
    
    const result = await db.query(
      `SELECT u.id, u.email, u.username, u.role_id, u.xp, u.chcoins, 
              u.balance_usd, u.vip_level, u.vip_expires_at, u.streak_count,
              u.is_active, u.email_verified, u.profile_data, u.preferences,
              u.created_at, u.last_login_at, r.name as role_name, r.permissions
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    await cache.cacheUser(user.id, user);
    
    return user;
  }

  static async updateUserStreak(userId) {
    const today = new Date().toISOString().split('T')[0];
    const streak = await cache.updateUserStreak(userId, today);
    
    // Update database
    await db.query(
      `UPDATE users SET streak_count = $1, last_streak_date = $2 WHERE id = $3`,
      [streak, today, userId]
    );
    
    return streak;
  }

  static async calculateRewards(userId, placement, tournamentId) {
    const user = await this.getUserById(userId);
    const { baseXpParticipation, baseChcoinsParticipation, winnerMultipliers, streakMultiplier, vipBonuses } = config.ranking;
    
    // Get streak
    const streak = await cache.getUserStreak(userId);
    
    // Calculate multipliers
    let totalMultiplier = 1;
    
    // Placement multiplier
    const placementMultiplier = winnerMultipliers[placement] || 1;
    totalMultiplier *= placementMultiplier;
    
    // Streak multiplier
    const applicableStreakThresholds = Object.keys(streakMultiplier)
      .filter(threshold => streak >= parseInt(threshold))
      .sort((a, b) => b - a);
    
    if (applicableStreakThresholds.length > 0) {
      totalMultiplier *= streakMultiplier[applicableStreakThresholds[0]];
    }
    
    // VIP multiplier
    if (user.vip_level && vipBonuses[user.vip_level]) {
      totalMultiplier *= vipBonuses[user.vip_level];
    }
    
    // Calculate rewards
    const xpEarned = Math.floor(baseXpParticipation * totalMultiplier);
    const chcoinsEarned = Math.floor(baseChcoinsParticipation * totalMultiplier);
    
    return {
      xpEarned,
      chcoinsEarned,
      multipliers: {
        placement: placementMultiplier,
        streak,
        vipLevel: user.vip_level,
        total: totalMultiplier,
      },
    };
  }

  static async addFunds(userId, chcoins = 0, usd = 0, xp = 0, type, referenceType, referenceId, description) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get current balance
      const userResult = await client.query(
        'SELECT chcoins, balance_usd, xp FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );
      
      const user = userResult.rows[0];
      const newChcoins = user.chcoins + chcoins;
      const newUsd = parseFloat(user.balance_usd) + parseFloat(usd);
      const newXp = user.xp + xp;
      
      // Update user balance
      await client.query(
        'UPDATE users SET chcoins = $1, balance_usd = $2, xp = $3 WHERE id = $4',
        [newChcoins, newUsd, newXp, userId]
      );
      
      // Record transaction
      await client.query(
        `INSERT INTO transactions 
         (user_id, type, amount_chcoins, amount_usd, xp_earned, balance_before_chcoins, balance_after_chcoins,
          balance_before_usd, balance_after_usd, reference_type, reference_id, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          userId,
          type,
          chcoins,
          usd,
          xp,
          user.chcoins,
          newChcoins,
          user.balance_usd,
          newUsd,
          referenceType,
          referenceId,
          description,
        ]
      );
      
      await client.query('COMMIT');
      
      // Invalidate cache
      await cache.del(`user:${userId}`);
      
      return {
        chcoins: newChcoins,
        usd: newUsd,
        xp: newXp,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = UserService;
