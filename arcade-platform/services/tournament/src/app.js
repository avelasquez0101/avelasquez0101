const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

const tournamentRoutes = require('./routes/tournament.routes');
const matchRoutes = require('./routes/match.routes');

const app = express();

// Middlewares Globales
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'tournament-service', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);

// Manejo de Errores Global
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    message: err.message || 'Error interno del servidor',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Inicio
const PORT = config.port;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`🚀 Tournament Service running on port ${PORT}`);
  });
}

startServer();

module.exports = app;
