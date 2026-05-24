require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3005,
  nodeEnv: process.env.NODE_ENV || 'development',
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: process.env.SMTP_PORT || 587,
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@arcadeplatform.com',
};
