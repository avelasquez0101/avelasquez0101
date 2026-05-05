const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://chgaming_user:chgaming_secure_pass_2024@localhost:5432/chgaming_db',
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Running migrations...');
    
    // Read migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration file(s)`);
    
    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get already executed migrations
    const result = await client.query('SELECT filename FROM schema_migrations ORDER BY filename');
    const executedMigrations = new Set(result.rows.map(row => row.filename));
    
    // Run pending migrations
    for (const file of migrationFiles) {
      if (executedMigrations.has(file)) {
        console.log(`Skipping ${file} (already executed)`);
        continue;
      }
      
      console.log(`Executing ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✓ ${file} completed`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Error executing ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
