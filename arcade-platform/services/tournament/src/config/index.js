require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  rabbitmqUrl: process.env.RABBITMQ_URL,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n'),
  profileServiceUrl: process.env.PROFILE_SERVICE_URL || 'http://localhost:3004',
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
  internalApiKey: process.env.INTERNAL_API_KEY || 'super_secret_internal_key_123',
};
