const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const logger = require('./utils/logger');
const { connectRabbitMQ } = require('./consumers/events.consumer');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'notification-service', 
    timestamp: new Date().toISOString() 
  });
});

// Error handler global
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    message: err.message || 'Error interno del servidor',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Iniciar servicio
const PORT = config.port;

async function startServer() {
  // Conectar a RabbitMQ para consumir eventos
  await connectRabbitMQ();
  
  app.listen(PORT, () => {
    logger.info(`🔔 Notification Service running on port ${PORT}`);
  });
}

startServer();

module.exports = app;
