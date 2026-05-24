const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config');
const logger = require('../config/logger');

// Cargar clave pública para verificar tokens
let publicKey = null;
if (config.JWT_PUBLIC_KEY) {
  try {
    // Si es una ruta de archivo, leerlo
    if (config.JWT_PUBLIC_KEY.startsWith('-----BEGIN')) {
      publicKey = config.JWT_PUBLIC_KEY;
    } else {
      publicKey = fs.readFileSync(config.JWT_PUBLIC_KEY, 'utf8');
    }
  } catch (error) {
    logger.error('Error loading JWT public key:', error.message);
  }
}

/**
 * Middleware para validar JWT
 * Verifica el token enviado en el header Authorization: Bearer <token>
 */
exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!publicKey) {
      // Si no hay clave pública, usar secret (para desarrollo)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      req.user = decoded;
    } else {
      const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
      req.user = decoded;
    }

    next();
  } catch (error) {
    logger.warn('JWT verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

/**
 * Middleware para verificar si el usuario es admin
 * Asume que el token ya fue validado y req.user existe
 */
exports.requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

/**
 * Middleware opcional para autenticación (no requiere token pero lo usa si existe)
 */
exports.optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (!publicKey) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
        req.user = decoded;
      } else {
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        req.user = decoded;
      }
    }
  } catch (error) {
    // Token inválido o expirado, pero continuamos sin user
    logger.debug('Optional auth failed:', error.message);
  }
  next();
};
