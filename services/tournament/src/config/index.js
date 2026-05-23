require('dotenv').config();

module.exports = {
  // Server
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/tournament_db?schema=public',
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // RabbitMQ
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  
  // JWT (clave pública para verificar tokens del Auth Service)
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
  
  // Profile Service URL (para comunicación síncrona)
  PROFILE_SERVICE_URL: process.env.PROFILE_SERVICE_URL || 'http://localhost:3004',
  
  // Admin API Key (para validar requests internos)
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || 'admin-secret-key-change-in-production',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
