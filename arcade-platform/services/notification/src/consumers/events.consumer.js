const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');

let channel = null;
const EXCHANGE_NAME = 'platform.events';
const QUEUE_NAME = 'notification-service-queue';

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel();
    
    // Declarar exchange de tipo topic
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    
    // Declarar cola para este servicio
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    // Suscribirse a eventos relevantes
    const routingKeys = [
      'user.*',              // user.registered, user.verified
      'tournament.*',        // tournament.started, tournament.completed
      'match.*',             // match.result_reported
      'shop.*'               // shop.item_purchased
    ];
    
    for (const key of routingKeys) {
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, key);
    }
    
    logger.info(`✅ RabbitMQ conectado. Escuchando en ${QUEUE_NAME}`);
    
    // Consumir mensajes
    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;
      
      try {
        const event = JSON.parse(msg.content.toString());
        logger.debug(`Evento recibido: ${event.eventType}`, event.data);
        
        await handleEvent(event);
        
        // Acknowledge manual solo si se procesó correctamente
        channel.ack(msg);
      } catch (error) {
        logger.error('Error procesando evento:', error.message);
        // Rechazar y reencolar (o enviar a dead letter queue)
        channel.nack(msg, false, true);
      }
    }, { noAck: false });
    
    return connection;
  } catch (error) {
    logger.error('❌ Error conectando a RabbitMQ:', error.message);
    setTimeout(connectRabbitMQ, 5000); // Reintentar en 5s
    return null;
  }
}

async function handleEvent(event) {
  const { eventType, data } = event;
  
  switch (eventType) {
    case 'user.registered':
      await sendWelcomeEmail(data);
      break;
    case 'user.verified':
      await sendVerificationConfirmationEmail(data);
      break;
    case 'tournament.checkin_reminder':
      await sendCheckInReminder(data);
      break;
    case 'tournament.started':
      await sendTournamentStartedEmail(data);
      break;
    case 'tournament.completed':
      await sendTournamentCompletedEmail(data);
      break;
    case 'match.result_reported':
      // Notificar al oponente (pendiente implementación completa)
      logger.info('Resultado reportado:', data);
      break;
    case 'shop.item_purchased':
      await sendPurchaseConfirmation(data);
      break;
    default:
      logger.warn(`Evento no manejado: ${eventType}`);
  }
}

// Plantillas de email
async function sendWelcomeEmail(data) {
  const { userId, email, username, verificationToken } = data;
  const subject = '¡Bienvenido a Arcade Platform!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">¡Bienvenido a Arcade Platform!</h1>
      <p>Hola <strong>${username}</strong>,</p>
      <p>Gracias por registrarte en Arcade Platform. Estamos emocionados de tenerte con nosotros.</p>
      <p>Para activar tu cuenta, por favor verifica tu email haciendo clic en el siguiente enlace:</p>
      <a href="http://localhost:5173/verify-email?token=${verificationToken}" 
         style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Verificar Email
      </a>
      <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all; color: #666;">http://localhost:5173/verify-email?token=${verificationToken}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">© 2024 Arcade Platform. Todos los derechos reservados.</p>
    </div>
  `;
  
  await require('./email.service').sendEmail(email, subject, html);
}

async function sendVerificationConfirmationEmail(data) {
  const { email, username } = data;
  const subject = 'Email verificado - ¡Todo listo!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981;">¡Email verificado!</h1>
      <p>Hola <strong>${username}</strong>,</p>
      <p>Tu email ha sido verificado exitosamente. Tu cuenta está ahora completamente activa.</p>
      <p>Ya puedes participar en torneos, ganar premios y personalizar tu perfil.</p>
      <a href="http://localhost:5173/tournaments" 
         style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Ver Torneos Disponibles
      </a>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">© 2024 Arcade Platform. Todos los derechos reservados.</p>
    </div>
  `;
  
  await require('./email.service').sendEmail(email, subject, html);
}

async function sendCheckInReminder(data) {
  const { tournamentId, tournamentName, startTime, participants } = data;
  // Enviar a todos los participantes (en producción esto sería más eficiente)
  for (const participant of participants) {
    const subject = `⏰ Check-in abierto: ${tournamentName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">¡Tu torneo comienza pronto!</h1>
        <p>El torneo <strong>${tournamentName}</strong> inicia en 15 minutos.</p>
        <p><strong>Fecha de inicio:</strong> ${new Date(startTime).toLocaleString()}</p>
        <p style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          ⚠️ <strong>Importante:</strong> Debes hacer check-in antes de que comience el torneo o perderás tu lugar.
        </p>
        <a href="http://localhost:5173/tournaments/${tournamentId}" 
           style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px;">
          Ir al Torneo y Hacer Check-in
        </a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">© 2024 Arcade Platform. Todos los derechos reservados.</p>
      </div>
    `;
    
    await require('./email.service').sendEmail(participant.email, subject, html);
  }
}

async function sendTournamentStartedEmail(data) {
  const { tournamentId, tournamentName, bracketUrl } = data;
  const subject = `🎮 ¡${tournamentName} ha comenzado!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">¡El torneo ha comenzado!</h1>
      <p>El torneo <strong>${tournamentName}</strong> ya está en progreso.</p>
      <p>Revisa el bracket para ver tus emparejamientos y el estado de las partidas.</p>
      <a href="http://localhost:5173/tournaments/${tournamentId}" 
         style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Ver Bracket en Vivo
      </a>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">© 2024 Arcade Platform. Todos los derechos reservados.</p>
    </div>
  `;
  
  // En producción, enviar a todos los participantes
  logger.info(`Enviando notificación de inicio para torneo ${tournamentName}`);
}

async function sendTournamentCompletedEmail(data) {
  const { tournamentId, tournamentName, winnerId, prizePool } = data;
  const subject = `🏆 ${tournamentName} ha finalizado`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #fbbf24;">¡Torneo finalizado!</h1>
      <p>El torneo <strong>${tournamentName}</strong> ha concluido.</p>
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px;">🏆 Ganador</p>
        <p style="margin: 10px 0; font-size: 24px; font-weight: bold; color: #6366f1;">Usuario #${winnerId}</p>
        <p style="margin: 0; color: #10b981;">Premio: ${prizePool} Créditos Arcade</p>
      </div>
      <p>Gracias a todos los participantes por hacer de este torneo un éxito.</p>
      <a href="http://localhost:5173/tournaments/${tournamentId}" 
         style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px;">
        Ver Resultados Completos
      </a>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">© 2024 Arcade Platform. Todos los derechos reservados.</p>
    </div>
  `;
  
  // En producción, enviar a todos los participantes
  logger.info(`Enviando notificación de finalización para torneo ${tournamentName}`);
}

async function sendPurchaseConfirmation(data) {
  const { userId, itemId, itemName, price, userEmail } = data;
  const subject = 'Confirmación de compra - Arcade Shop';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">¡Compra realizada!</h1>
      <p>Gracias por tu compra en Arcade Shop.</p>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #999;">Item comprado:</p>
        <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: white;">${itemName}</p>
        <p style="margin: 15px 0 0 0; color: #10b981; font-size: 20px; font-weight: bold;">-${price} Créditos Arcade</p>
      </div>
      <p>El item ha sido añadido a tu inventario y está listo para equipar.</p>
      <a href="http://localhost:5173/profile" 
         style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px;">
        Ver mi Inventario
      </a>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">© 2024 Arcade Platform. Todos los derechos reservados.</p>
    </div>
  `;
  
  await require('./email.service').sendEmail(userEmail, subject, html);
}

module.exports = { connectRabbitMQ };
