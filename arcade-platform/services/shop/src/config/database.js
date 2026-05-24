const { PrismaClient } = require('@prisma/client');
const config = require('./index');

const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Shop Database connected successfully');
  } catch (error) {
    console.error('❌ Shop Database connection failed:', error.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  await prisma.$disconnect();
}

module.exports = { prisma, connectDB, disconnectDB };
