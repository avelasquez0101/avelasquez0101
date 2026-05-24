const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtPublicKey, { algorithms: ['RS256'] });
    
    req.user = decoded;
    next();
  } catch (error) {
    logger.error(`Auth Error: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(403).json({ message: 'Token inválido' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Acceso denegado: Se requieren permisos de administrador' });
  }
  next();
};

const internalApiMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== config.internalApiKey) {
    return res.status(403).json({ message: 'API Key inválida o faltante' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, internalApiMiddleware };
