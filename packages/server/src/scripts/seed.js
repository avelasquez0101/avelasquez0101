const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'postgres',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'chgaming_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
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

    console.log('✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
