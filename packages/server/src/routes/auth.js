const express = require('express');
const router = express.Router();
const Joi = require('joi');
const UserService = require('../services/UserService');
const { authMiddleware, authLimiter } = require('../middleware/auth');
const { authLimiter: rateLimiter } = require('../middleware/rateLimiter');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// POST /api/auth/register
router.post('/register', rateLimiter, async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details.map(d => d.message) 
      });
    }
    
    const user = await UserService.createUser(value);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', rateLimiter, async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details.map(d => d.message) 
      });
    }
    
    const { user, accessToken, refreshToken } = await UserService.authenticateUser(
      value.email,
      value.password
    );
    
    // Update streak
    await UserService.updateUserStreak(user.id);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role_name,
        xp: user.xp,
        chcoins: user.chcoins,
        balanceUsd: user.balance_usd,
        vipLevel: user.vip_level,
        streakCount: user.streak_count,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message || 'Authentication failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    const decoded = await UserService.verifyToken(refreshToken);
    const user = await UserService.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const newAccessToken = UserService.generateAccessToken(user);
    const newRefreshToken = UserService.generateRefreshToken(user);
    
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await UserService.getUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role_name,
      xp: user.xp,
      chcoins: user.chcoins,
      balanceUsd: user.balance_usd,
      vipLevel: user.vip_level,
      vipExpiresAt: user.vip_expires_at,
      streakCount: user.streak_count,
      profileData: user.profile_data,
      preferences: user.preferences,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // In a real implementation, you would revoke the refresh token here
    // For now, we just return success
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
