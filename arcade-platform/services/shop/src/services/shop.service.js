const { prisma } = require('../config/database');
const logger = require('../utils/logger');
const axios = require('axios');
const config = require('../config');

class ShopService {
  async getItems(filters = {}) {
    const where = { isActive: true };
    if (filters.category) where.category = filters.category;
    if (filters.rarity) where.rarity = filters.rarity;
    
    return prisma.shopItem.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getItemById(id) {
    return prisma.shopItem.findUnique({ where: { id } });
  }

  async purchaseItem(userId, itemId) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.shopItem.findUnique({ where: { id: itemId } });
      if (!item) throw new Error('Item no encontrado');
      if (!item.isActive) throw new Error('Item no disponible');

      // Verificar saldo con Profile Service
      const balanceRes = await axios.get(
        `${config.profileServiceUrl}/api/profiles/${userId}/balance`,
        { headers: { 'x-api-key': config.internalApiKey } }
      );
      
      if (balanceRes.data.balance < item.price) {
        throw new Error('Saldo insuficiente');
      }

      // Verificar si ya lo tiene
      const existing = await tx.userInventory.findFirst({
        where: { userId, itemId }
      });
      if (existing) throw new Error('Ya posees este item');

      // Crear compra
      await tx.purchase.create({ data: { userId, itemId, price: item.price } });
      await tx.userInventory.create({ data: { userId, itemId } });

      // Deducir créditos
      await axios.post(
        `${config.profileServiceUrl}/api/profiles/${userId}/credits/deduct`,
        { amount: item.price },
        { headers: { 'x-api-key': config.internalApiKey } }
      );

      logger.info(`Usuario ${userId} compró item ${itemId}`);
      return { success: true, item };
    });
  }

  async getInventory(userId) {
    return prisma.userInventory.findMany({
      where: { userId },
      include: { item: true }
    });
  }

  async equipItem(userId, itemId) {
    return prisma.$transaction(async (tx) => {
      const inventoryItem = await tx.userInventory.findFirst({
        where: { userId, itemId }
      });
      
      if (!inventoryItem) throw new Error('No posees este item');

      const item = await tx.shopItem.findUnique({ where: { id: itemId } });
      
      // Desequipar items del mismo tipo
      await tx.userInventory.updateMany({
        where: { userId, equipped: true },
        data: { equipped: false }
      });

      // Equipar nuevo
      return tx.userInventory.update({
        where: { id: inventoryItem.id },
        data: { equipped: true }
      });
    });
  }

  async unequipItem(userId, itemId) {
    return prisma.userInventory.updateMany({
      where: { userId, itemId },
      data: { equipped: false }
    });
  }

  async createItem(data) {
    return prisma.shopItem.create({ data });
  }

  async updateItem(id, data) {
    return prisma.shopItem.update({ where: { id }, data });
  }

  async deleteItem(id) {
    return prisma.shopItem.update({ 
      where: { id }, 
      data: { isActive: false } 
    });
  }
}

module.exports = new ShopService();
