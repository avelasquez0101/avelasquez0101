module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    apiUrl: process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com',
  },
  ranking: {
    // Base points for participation
    baseXpParticipation: 50,
    baseChcoinsParticipation: 10,
    
    // Winner multipliers
    winnerMultipliers: {
      1: 5.0, // 1st place: 5x
      2: 3.0, // 2nd place: 3x
      3: 2.0, // 3rd place: 2x
    },
    
    // Streak multiplier (consecutive days)
    streakMultiplier: {
      3: 1.1,   // 3 days: +10%
      7: 1.25,  // 7 days: +25%
      14: 1.5,  // 14 days: +50%
      30: 2.0,  // 30 days: +100%
    },
    
    // VIP bonuses
    vipBonuses: {
      1: 1.1,   // VIP Level 1: +10%
      2: 1.25,  // VIP Level 2: +25%
      3: 1.5,   // VIP Level 3: +50%
    },
    
    // XP required for each level
    xpPerLevel: [
      0,      // Level 0
      100,    // Level 1
      500,    // Level 2
      1500,   // Level 3
      5000,   // Level 4
      10000,  // Level 5
      25000,  // Level 6
      50000,  // Level 7
      100000, // Level 8
      250000, // Level 9
      500000, // Level 10
    ],
  },
};
