const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

class JwtService {
  // Generar access token (15 minutos)
  generateAccessToken(userId, email, username) {
    return jwt.sign(
      { userId, email, username },
      config.jwtPrivateKey,
      { 
        algorithm: 'RS256', 
        expiresIn: config.jwtExpiresIn 
      }
    );
  }

  // Generar refresh token (7 días)
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      config.jwtPrivateKey,
      { 
        algorithm: 'RS256', 
        expiresIn: config.jwtRefreshExpiresIn 
      }
    );
  }

  // Verificar token
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtPublicKey || config.jwtPrivateKey, {
        algorithms: ['RS256'],
      });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Generar token para verificación de email
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generar token para reset de password
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = new JwtService();
