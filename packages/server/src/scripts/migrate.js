const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'postgres',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'chgaming_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migraciones...');

    const migrationPath = path.join(__dirname, '../../../../packages/database/migrations/001_initial_schema.sql');
    console.log('Buscando migración en:', migrationPath);

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Archivo de migración no encontrado: ${migrationPath}`);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Migraciones completadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migraciones:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
