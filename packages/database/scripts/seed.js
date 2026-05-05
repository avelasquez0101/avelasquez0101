const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://chgaming_user:chgaming_secure_pass_2024@localhost:5432/chgaming_db',
});

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('Seeding database...');
    
    // Create admin user if not exists
    const adminEmail = 'admin@chgaming.com';
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (adminCheck.rows.length === 0) {
      const passwordHash = await bcrypt.hash('Admin@123456', 10);
      
      await client.query(`
        INSERT INTO users (email, username, password_hash, role_id, is_active, email_verified)
        VALUES ($1, $2, $3, 1, true, true)
      `, [adminEmail, 'admin', passwordHash]);
      
      console.log('✓ Admin user created (email: admin@chgaming.com, password: Admin@123456)');
    } else {
      console.log('✓ Admin user already exists');
    }
    
    // Create sample products
    const sampleProducts = [
      {
        name: 'Gaming Mouse RGB',
        description: 'High-precision gaming mouse with customizable RGB lighting',
        category: 'physical',
        price_chcoins: 5000,
        price_usd: 49.99,
        stock_quantity: 100,
        metadata: { brand: 'GamePro', color: 'Black' }
      },
      {
        name: 'Free Fire Diamonds 1000',
        description: '1000 Diamonds for Free Fire',
        category: 'virtual',
        game_slug: 'free-fire',
        price_chcoins: 1000,
        price_usd: 9.99,
        stock_quantity: 999999,
        metadata: { amount: 1000, currency: 'diamonds' }
      },
      {
        name: 'COD Mobile CP 800',
        description: '800 COD Points for Call of Duty Mobile',
        category: 'virtual',
        game_slug: 'cod-mobile',
        price_chcoins: 800,
        price_usd: 7.99,
        stock_quantity: 999999,
        metadata: { amount: 800, currency: 'CP' }
      },
      {
        name: 'Wild Rift Essence 1500',
        description: '1500 Wild Cores for League of Legends Wild Rift',
        category: 'virtual',
        game_slug: 'wild-rift',
        price_chcoins: 1500,
        price_usd: 14.99,
        stock_quantity: 999999,
        metadata: { amount: 1500, currency: 'Wild Cores' }
      },
      {
        name: 'Gaming Headset Pro',
        description: 'Professional gaming headset with 7.1 surround sound',
        category: 'physical',
        price_chcoins: 8000,
        price_usd: 79.99,
        stock_quantity: 50,
        metadata: { brand: 'SoundGame', color: 'Red/Black' }
      }
    ];
    
    for (const product of sampleProducts) {
      const gameId = product.game_slug 
        ? (await client.query('SELECT id FROM games WHERE slug = $1', [product.game_slug])).rows[0]?.id 
        : null;
      
      const existing = await client.query('SELECT id FROM products WHERE name = $1', [product.name]);
      
      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO products (name, description, category, game_id, price_chcoins, price_usd, stock_quantity, metadata, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
        `, [
          product.name,
          product.description,
          product.category,
          gameId || null,
          product.price_chcoins,
          product.price_usd,
          product.stock_quantity,
          JSON.stringify(product.metadata)
        ]);
        console.log(`✓ Product created: ${product.name}`);
      }
    }
    
    // Create sample tournament
    const freeFireGame = await client.query('SELECT id FROM games WHERE slug = $1', ['free-fire']);
    const adminUser = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (freeFireGame.rows.length > 0 && adminUser.rows.length > 0) {
      const existingTournament = await client.query("SELECT id FROM tournaments WHERE name = 'Free Fire Weekly Cup #1'");
      
      if (existingTournament.rows.length === 0) {
        const startsAt = new Date();
        startsAt.setDate(startsAt.getDate() + 7);
        const registrationDeadline = new Date();
        registrationDeadline.setDate(registrationDeadline.getDate() + 5);
        
        await client.query(`
          INSERT INTO tournaments (game_id, organizer_id, name, description, format, max_teams, min_teams, prize_pool_chcoins, prize_pool_usd, starts_at, registration_deadline, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'registration')
        `, [
          freeFireGame.rows[0].id,
          adminUser.rows[0].id,
          'Free Fire Weekly Cup #1',
          'Weekly tournament for Free Fire players. Top 3 teams win prizes!',
          'single_elimination',
          32,
          2,
          10000,
          100.00,
          startsAt,
          registrationDeadline
        ]);
        console.log('✓ Sample tournament created: Free Fire Weekly Cup #1');
      }
    }
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
