const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

function formatDate(date) {
  return new Date(date).toISOString();
}

function generateBracketCode(tournamentId, participantCount) {
  return `TRN-${tournamentId}-${participantCount}`;
}

function calculateXP(participation, winPosition, isVIP) {
  let baseXP = 10; // XP por participar
  
  if (winPosition === 1) baseXP += 100;
  else if (winPosition === 2) baseXP += 50;
  else if (winPosition === 3) baseXP += 25;
  
  if (isVIP) baseXP = Math.floor(baseXP * 1.5);
  
  return baseXP;
}

function calculateChcoinsReward(participation, winPosition, streakMultiplier) {
  let baseChcoins = 5;
  
  if (winPosition === 1) baseChcoins += 500;
  else if (winPosition === 2) baseChcoins += 250;
  else if (winPosition === 3) baseChcoins += 100;
  
  return Math.floor(baseChcoins * streakMultiplier);
}

function getStreakMultiplier(daysStreak) {
  if (daysStreak >= 7) return 2.0;
  if (daysStreak >= 3) return 1.5;
  return 1.0;
}

module.exports = {
  hashPassword,
  comparePassword,
  formatCurrency,
  formatDate,
  generateBracketCode,
  calculateXP,
  calculateChcoinsReward,
  getStreakMultiplier
};
