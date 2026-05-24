require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};
