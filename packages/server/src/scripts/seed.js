const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'chgaming',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed() {
  try {
    console.log('🌱 Iniciando seed de datos...');
    
    // Admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (email, password, username, role_id, game_preference)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@chgaming.com', adminPassword, 'Admin', 1, 'free_fire']);
    
    // Demo users
    const user1Password = await bcrypt.hash('user123', 10);
    await pool.query(`
      INSERT INTO users (email, password, username, role_id, game_preference)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['user1@example.com', user1Password, 'Gamer1', 2, 'cod_mobile']);
    
    await pool.query(`
      INSERT INTO users (email, password, username, role_id, game_preference)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['user2@example.com', user1Password, 'Gamer2', 2, 'wild_rift']);
    
    // Sample tournaments
    await pool.query(`
      INSERT INTO tournaments (name, game, registration_deadline, start_date, prize_pool, max_participants, status)
      VALUES 
        ('Torneo Free Fire #1', 'free_fire', NOW() + INTERVAL '7 days', NOW() + INTERVAL '10 days', 1000, 32, 'registration'),
        ('COD Mobile Championship', 'cod_mobile', NOW() + INTERVAL '5 days', NOW() + INTERVAL '8 days', 500, 16, 'registration'),
        ('Mobile Legends Pro', 'mobile_legends', NOW() + INTERVAL '3 days', NOW() + INTERVAL '6 days', 750, 8, 'registration')
      ON CONFLICT DO NOTHING
    `);
    
    // Sample products
    await pool.query(`
      INSERT INTO products (name, description, price_usd, price_chcoins, type, category, stock)
      VALUES 
        ('Skin Legendaria FF', 'Skin exclusiva para Free Fire', 9.99, 1000, 'virtual', 'skins', 999),
        ('Auriculares Gamer', 'Auriculares con sonido surround', 49.99, 5000, 'physical', 'peripherals', 50),
        ('Tarjeta Regalo $10', 'Tarjeta de regalo PayPal', 10.00, 1100, 'virtual', 'gift_cards', 100),
        ('Mouse RGB', 'Mouse gaming de alta precisión', 29.99, 3000, 'physical', 'peripherals', 30)
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Seed completado exitosamente');
    console.log('📊 Usuarios creados:');
    console.log('   - admin@chgaming.com / admin123');
    console.log('   - user1@example.com / user123');
    console.log('   - user2@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
