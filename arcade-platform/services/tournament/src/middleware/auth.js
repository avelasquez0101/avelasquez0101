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
    
    // Verificamos con la clave pública (RS256)
    const decoded = jwt.verify(token, config.jwtPublicKey, { algorithms: ['RS256'] });
    
    req.user = decoded; // { id, email, role, iat, exp }
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

module.exports = { authMiddleware, adminMiddleware };
