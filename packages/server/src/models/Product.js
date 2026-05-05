const pool = require('../config/database');

class Product {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM products WHERE status = $1';
    const params = ['active'];
    let paramCount = 2;

    if (filters.category) {
      query += ` AND category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    if (filters.game_id) {
      query += ` AND game_id = $${paramCount}`;
      params.push(filters.game_id);
      paramCount++;
    }

    if (filters.type) {
      query += ` AND type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT p.*, g.name as game_name, g.image as game_image FROM products p LEFT JOIN games g ON p.game_id = g.id WHERE p.id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create({ name, description, price_chcoins, price_usd, category, game_id, type, stock, image_url }) {
    const result = await pool.query(
      `INSERT INTO products (name, description, price_chcoins, price_usd, category, game_id, type, stock, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
       RETURNING *`,
      [name, description, price_chcoins, price_usd, category, game_id, type, stock, image_url]
    );
    return result.rows[0];
  }

  static async purchase(productId, userId, paymentMethod, chcoinsAmount = 0, usdAmount = 0) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar producto
      const product = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
      if (product.rows.length === 0) {
        throw new Error('Producto no encontrado');
      }

      // Verificar stock
      if (product.rows[0].stock < 1 && product.rows[0].type === 'physical') {
        throw new Error('Producto agotado');
      }

      // Verificar saldo del usuario
      const user = await client.query('SELECT chcoins, balance_usd FROM users WHERE id = $1', [userId]);
      if (user.rows[0].chcoins < chcoinsAmount) {
        throw new Error('Saldo de Chcoins insuficiente');
      }
      if (user.rows[0].balance_usd < usdAmount) {
        throw new Error('Saldo en USD insuficiente');
      }

      // Descontar saldo
      if (chcoinsAmount > 0) {
        await client.query('UPDATE users SET chcoins = chcoins - $1 WHERE id = $2', [chcoinsAmount, userId]);
      }
      if (usdAmount > 0) {
        await client.query('UPDATE users SET balance_usd = balance_usd - $1 WHERE id = $2', [usdAmount, userId]);
      }

      // Reducir stock si es físico
      if (product.rows[0].type === 'physical') {
        await client.query('UPDATE products SET stock = stock - 1 WHERE id = $1', [productId]);
      }

      // Crear transacción
      const transaction = await client.query(
        `INSERT INTO transactions (user_id, product_id, amount_chcoins, amount_usd, payment_method, status, transaction_type)
         VALUES ($1, $2, $3, $4, $5, 'completed', 'purchase')
         RETURNING *`,
        [userId, productId, chcoinsAmount, usdAmount, paymentMethod]
      );

      // Crear orden
      const order = await client.query(
        `INSERT INTO orders (user_id, total_chcoins, total_usd, payment_method, status)
         VALUES ($1, $2, $3, $4, 'completed')
         RETURNING *`,
        [userId, chcoinsAmount, usdAmount, paymentMethod]
      );

      // Crear item de orden
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_chcoins, price_usd)
         VALUES ($1, $2, 1, $3, $4)`,
        [order.rows[0].id, productId, chcoinsAmount, usdAmount]
      );

      // Si es producto virtual, entregar automáticamente
      if (product.rows[0].type === 'virtual') {
        await client.query(
          `INSERT INTO user_inventory (user_id, product_id, quantity, status)
           VALUES ($1, $2, 1, 'active')`,
          [userId, productId]
        );
      }

      await client.query('COMMIT');
      return { transaction: transaction.rows[0], order: order.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getUserOrders(userId) {
    const result = await pool.query(
      `SELECT o.*, COUNT(oi.product_id) as items_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getUserInventory(userId) {
    const result = await pool.query(
      `SELECT ui.*, p.name, p.description, p.image_url, p.type
       FROM user_inventory ui
       JOIN products p ON ui.product_id = p.id
       WHERE ui.user_id = $1 AND ui.status = 'active'
       ORDER BY ui.acquired_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = Product;
