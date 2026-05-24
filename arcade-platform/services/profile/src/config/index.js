require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3004,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  rabbitmqUrl: process.env.RABBITMQ_URL,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n'),
  internalApiKey: process.env.INTERNAL_API_KEY,
  tournamentServiceUrl: process.env.TOURNAMENT_SERVICE_URL,
  shopServiceUrl: process.env.SHOP_SERVICE_URL,
};
