const express = require('express');
const router = express.Router();
const controller = require('../controllers/shop.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Públicas (requieren auth)
router.get('/items', authMiddleware, controller.getItems);
router.get('/items/:id', authMiddleware, controller.getItem);

// Usuario autenticado
router.post('/purchase', authMiddleware, controller.purchase);
router.get('/inventory', authMiddleware, controller.getInventory);
router.post('/inventory/:itemId/equip', authMiddleware, controller.equipItem);
router.post('/inventory/:itemId/unequip', authMiddleware, controller.unequipItem);

// Admin
router.post('/admin/items', authMiddleware, adminMiddleware, controller.createItem);
router.put('/admin/items/:id', authMiddleware, adminMiddleware, controller.updateItem);
router.delete('/admin/items/:id', authMiddleware, adminMiddleware, controller.deleteItem);

module.exports = router;
