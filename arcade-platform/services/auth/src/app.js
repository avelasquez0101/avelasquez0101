const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const config = require('./config');
const authRoutes = require('./routes/auth.routes');

// Configurar logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const app = express();

// Middlewares globales
app.use(helmet()); // Seguridad HTTP
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Routes
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  logger.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Auth Service running on port ${PORT}`);
  console.log(`🚀 Auth Service listening on port ${PORT}`);
});

module.exports = app;
