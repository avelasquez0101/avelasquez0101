const shopService = require('../services/shop.service');
const logger = require('../utils/logger');

exports.getItems = async (req, res, next) => {
  try {
    const items = await shopService.getItems(req.query);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

exports.getItem = async (req, res, next) => {
  try {
    const item = await shopService.getItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item no encontrado' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.purchase = async (req, res, next) => {
  try {
    const { itemId } = req.body;
    const result = await shopService.purchaseItem(req.user.id, itemId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getInventory = async (req, res, next) => {
  try {
    const inventory = await shopService.getInventory(req.user.id);
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

exports.equipItem = async (req, res, next) => {
  try {
    const result = await shopService.equipItem(req.user.id, req.params.itemId);
    res.json({ message: 'Item equipado', result });
  } catch (error) {
    next(error);
  }
};

exports.unequipItem = async (req, res, next) => {
  try {
    const result = await shopService.unequipItem(req.user.id, req.params.itemId);
    res.json({ message: 'Item desequipado', result });
  } catch (error) {
    next(error);
  }
};

// Admin
exports.createItem = async (req, res, next) => {
  try {
    const item = await shopService.createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await shopService.updateItem(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const item = await shopService.deleteItem(req.params.id);
    res.json({ message: 'Item eliminado', item });
  } catch (error) {
    next(error);
  }
};
