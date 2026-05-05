const rateLimit = require('express-rate-limit');
const { cache } = require('../config/redis');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment endpoints rate limiter
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 payment requests per minute
  message: { error: 'Too many payment attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Redis-based distributed rate limiter middleware
const redisRateLimiter = (keyPrefix = 'api', windowMs = 60000, maxRequests = 10) => {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const key = `${keyPrefix}:${ip}`;
      
      const result = await cache.incrementRateLimit(key, windowMs, maxRequests);
      
      res.set('X-RateLimit-Limit', maxRequests);
      res.set('X-RateLimit-Remaining', result.remaining);
      res.set('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000));
      
      if (!result.allowed) {
        return res.status(429).json({ 
          error: 'Too many requests', 
          retryAfter: Math.ceil((result.resetAt - new Date()) / 1000) 
        });
      }
      
      next();
    } catch (error) {
      // If Redis fails, fail open (allow request)
      console.error('Redis rate limiter error:', error);
      next();
    }
  };
};

module.exports = {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  redisRateLimiter,
};
