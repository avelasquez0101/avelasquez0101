const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

// GET /api/products - List all products
router.get('/', async (req, res) => {
  try {
    const { category, game, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `SELECT p.*, g.name as game_name, g.slug as game_slug FROM products p
                 LEFT JOIN games g ON p.game_id = g.id WHERE p.is_active = true`;
    
    const params = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (game) {
      query += ` AND g.slug = $${paramIndex}`;
      params.push(game);
      paramIndex++;
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM products p 
                      LEFT JOIN games g ON p.game_id = g.id WHERE p.is_active = true`;
    const countParams = [];
    
    if (category) {
      countQuery += ` AND p.category = $1`;
      countParams.push(category);
    }
    
    if (game) {
      countQuery += ` AND g.slug = $${countParams.length + 1}`;
      countParams.push(game);
    }
    
    const countResult = await db.query(countQuery, countParams);
    
    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT p.*, g.name as game_name, g.slug as game_slug
       FROM products p
       LEFT JOIN games g ON p.game_id = g.id
       WHERE p.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products/:id/purchase - Purchase a product
router.post('/:id/purchase', authMiddleware, paymentLimiter, async (req, res) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const userId = req.user.userId;
    const { paymentMethod = 'mixed' } = req.body; // chcoins, paypal, mixed
    
    // Get product
    const productResult = await client.query(
      'SELECT * FROM products WHERE id = $1 AND is_active = true FOR UPDATE',
      [id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or inactive' });
    }
    
    const product = productResult.rows[0];
    
    // Check stock
    if (product.stock_quantity <= 0) {
      return res.status(400).json({ error: 'Product out of stock' });
    }
    
    // Get user balance
    const userResult = await client.query(
      'SELECT chcoins, balance_usd FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    
    const user = userResult.rows[0];
    
    // Calculate payment split
    let chcoinsToPay = 0;
    let usdToPay = 0;
    
    if (paymentMethod === 'chcoins') {
      if (user.chcoins < product.price_chcoins) {
        return res.status(400).json({ error: 'Insufficient Chcoins balance' });
      }
      chcoinsToPay = product.price_chcoins;
    } else if (paymentMethod === 'paypal') {
      usdToPay = parseFloat(product.price_usd);
    } else if (paymentMethod === 'mixed' && product.allows_mixed_payment) {
      // Use Chcoins first, then USD
      if (user.chcoins >= product.price_chcoins) {
        chcoinsToPay = product.price_chcoins;
      } else {
        chcoinsToPay = user.chcoins;
        const remainingPercentage = 1 - (chcoinsToPay / product.price_chcoins);
        usdToPay = parseFloat(product.price_usd) * remainingPercentage;
      }
      
      if (user.balance_usd < usdToPay) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
    }
    
    // Deduct balances
    const newChcoins = user.chcoins - chcoinsToPay;
    const newUsd = parseFloat(user.balance_usd) - usdToPay;
    
    await client.query(
      'UPDATE users SET chcoins = $1, balance_usd = $2 WHERE id = $3',
      [newChcoins, newUsd, userId]
    );
    
    // Decrease stock
    await client.query(
      'UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = $1',
      [id]
    );
    
    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders 
       (user_id, total_chcoins, total_usd, payment_method, status, items)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        chcoinsToPay,
        usdToPay,
        paymentMethod,
        usdToPay > 0 ? 'pending' : 'paid',
        JSON.stringify([{
          product_id: id,
          name: product.name,
          quantity: 1,
          price_chcoins: product.price_chcoins,
          price_usd: parseFloat(product.price_usd),
        }]),
      ]
    );
    
    // Record transaction
    await client.query(
      `INSERT INTO transactions 
       (user_id, type, amount_chcoins, amount_usd, balance_before_chcoins, balance_after_chcoins,
        balance_before_usd, balance_after_usd, reference_type, reference_id, description)
       VALUES ($1, 'purchase', $2, $3, $4, $5, $6, $7, 'order', $8, $9)`,
      [
        userId,
        -chcoinsToPay,
        -usdToPay,
        user.chcoins,
        newChcoins,
        user.balance_usd,
        newUsd,
        id,
        `Purchase: ${product.name}`,
      ]
    );
    
    await client.query('COMMIT');
    
    // If PayPal payment needed, initiate PayPal flow here
    if (usdToPay > 0) {
      // In production, integrate with PayPal SDK
      res.json({
        message: 'Order created',
        order: orderResult.rows[0],
        paypalRequired: true,
        paypalAmount: usdToPay,
      });
    } else {
      res.json({
        message: 'Purchase successful',
        order: orderResult.rows[0],
      });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Purchase error:', error);
    res.status(400).json({ error: error.message || 'Purchase failed' });
  } finally {
    client.release();
  }
});

// GET /api/products/orders - Get user orders
router.get('/orders/my', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await db.query(
      `SELECT * FROM orders WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.userId, parseInt(limit), parseInt(offset)]
    );
    
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
      [req.user.userId]
    );
    
    res.json({
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
