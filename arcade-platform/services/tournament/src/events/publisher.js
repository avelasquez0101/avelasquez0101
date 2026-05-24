const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');

let channel = null;
const EXCHANGE_NAME = 'platform.events';

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    logger.info('✅ RabbitMQ Connected');
    return connection;
  } catch (error) {
    logger.error('❌ RabbitMQ Connection Failed:', error.message);
    setTimeout(connectRabbitMQ, 5000); // Reintentar
    return null;
  }
}

async function publishEvent(eventType, data) {
  if (!channel) {
    logger.warn('RabbitMQ no conectado, evento no publicado:', eventType);
    return;
  }
  
  const message = JSON.stringify({
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType,
    timestamp: new Date().toISOString(),
    source: 'tournament-service',
    data
  });

  channel.publish(EXCHANGE_NAME, eventType, Buffer.from(message), { persistent: true });
  logger.debug(`Evento publicado: ${eventType}`);
}

connectRabbitMQ();

module.exports = { publishEvent };
