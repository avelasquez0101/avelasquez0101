const Product = require('../models/Product');
const User = require('../models/User');

class ProductController {
  static async getAll(req, res) {
    try {
      const { category, game_id, type } = req.query;
      const filters = {};

      if (category) filters.category = category;
      if (game_id) filters.game_id = parseInt(game_id);
      if (type) filters.type = type;

      const products = await Product.findAll(filters);
      res.json({ products });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ product });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  }

  static async create(req, res) {
    try {
      // Solo admin puede crear productos
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para crear productos' });
      }

      const { name, description, price_chcoins, price_usd, category, game_id, type, stock, image_url } = req.body;

      // Validaciones
      if (!name || !price_chcoins === undefined && price_usd === undefined) {
        return res.status(400).json({ error: 'Nombre y al menos un precio son requeridos' });
      }

      const product = await Product.create({
        name,
        description: description || '',
        price_chcoins: price_chcoins || 0,
        price_usd: price_usd || 0,
        category: category || 'general',
        game_id: game_id || null,
        type: type || 'virtual',
        stock: stock || 999,
        image_url: image_url || ''
      });

      res.status(201).json({
        message: 'Producto creado exitosamente',
        product
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  }

  static async purchase(req, res) {
    try {
      const { id } = req.params;
      const { paymentMethod, useChcoins, useUsd } = req.body;
      const userId = req.user.userId;

      // Obtener producto
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Calcular amounts según método de pago seleccionado
      let chcoinsAmount = 0;
      let usdAmount = 0;

      if (useChcoins && useUsd) {
        // Pago combinado: 50% con cada uno
        chcoinsAmount = Math.floor(product.price_chcoins * 0.5);
        usdAmount = product.price_usd * 0.5;
      } else if (useChcoins) {
        // Todo con Chcoins (convertir si es necesario)
        chcoinsAmount = product.price_chcoins > 0 ? product.price_chcoins : Math.floor(product.price_usd * 100);
      } else if (useUsd) {
        // Todo con USD
        usdAmount = product.price_usd > 0 ? product.price_usd : product.price_chcoins / 100;
      } else {
        // Default: usar Chcoins si está disponible, sino USD
        if (product.price_chcoins > 0) {
          chcoinsAmount = product.price_chcoins;
        } else {
          usdAmount = product.price_usd;
        }
      }

      const result = await Product.purchase(id, userId, paymentMethod || 'balance', chcoinsAmount, usdAmount);

      // Dar XP por compra
      await User.addXP(userId, 25);

      res.json({
        message: 'Compra realizada exitosamente',
        transaction: result.transaction,
        order: result.order
      });
    } catch (error) {
      console.error('Error al comprar producto:', error);
      if (error.message.includes('saldo') || error.message.includes('agotado')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al comprar producto' });
    }
  }

  static async getOrders(req, res) {
    try {
      const userId = req.user.userId;
      const orders = await Product.getUserOrders(userId);

      res.json({ orders });
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      res.status(500).json({ error: 'Error al obtener órdenes' });
    }
  }

  static async getInventory(req, res) {
    try {
      const userId = req.user.userId;
      const inventory = await Product.getUserInventory(userId);

      res.json({ inventory });
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      res.status(500).json({ error: 'Error al obtener inventario' });
    }
  }
}

module.exports = ProductController;
