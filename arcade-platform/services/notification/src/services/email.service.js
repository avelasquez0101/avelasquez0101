const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

// Verificar conexión SMTP
transporter.verify((error, success) => {
  if (error) {
    logger.error('Error de conexión SMTP:', error.message);
  } else {
    logger.info('Servidor SMTP listo para enviar correos');
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Arcade Platform" <${config.fromEmail}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email enviado a ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Error enviando email a ${to}:`, error.message);
    throw error;
  }
};

module.exports = { sendEmail };
