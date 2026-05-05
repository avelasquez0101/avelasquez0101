const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 10) {
      return null;
    }
    return Math.min(times * 50, 2000);
  },
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

// Cache utilities
const cache = {
  async get(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key, value, ttlSeconds = 3600) {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  },

  async del(key) {
    await redis.del(key);
  },

  async delPattern(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  // Rate limiting
  async incrementRateLimit(key, windowMs = 60000, maxRequests = 10) {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;
    const count = await redis.incr(windowKey);
    
    if (count === 1) {
      await redis.expire(windowKey, Math.ceil(windowMs / 1000));
    }
    
    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetAt: new Date(Math.ceil(now / windowMs) * windowMs + windowMs),
    };
  },

  // User session caching
  async cacheUser(userId, userData, ttlSeconds = 1800) {
    await this.set(`user:${userId}`, userData, ttlSeconds);
  },

  async getCachedUser(userId) {
    return await this.get(`user:${userId}`);
  },

  // Leaderboard caching
  async updateLeaderboard(gameSlug, userId, xp) {
    await redis.zadd(`leaderboard:${gameSlug}`, xp, userId);
  },

  async getLeaderboard(gameSlug, start = 0, end = 9) {
    return await redis.zrevrange(`leaderboard:${gameSlug}`, start, end, 'WITHSCORES');
  },

  // Streak tracking
  async updateUserStreak(userId, dateStr) {
    const key = `streak:${userId}`;
    const lastDate = await redis.hget(key, 'last_date');
    let streak = parseInt(await redis.hget(key, 'count') || '0', 10);

    if (lastDate !== dateStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        streak += 1;
      } else if (lastDate !== dateStr) {
        streak = 1;
      }

      await redis.hmset(key, { last_date: dateStr, count: streak.toString() });
      await redis.expire(key, 86400 * 30); // Keep for 30 days
    }

    return streak;
  },

  async getUserStreak(userId) {
    const count = await redis.hget(`streak:${userId}`, 'count');
    return parseInt(count || '0', 10);
  },
};

module.exports = { redis, cache };
