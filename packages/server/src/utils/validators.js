const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(),
  gamePreference: Joi.string().valid('Free Fire', 'COD Mobile', 'Mobile Legends', 'Wild Rift').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const tournamentSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  game: Joi.string().valid('Free Fire', 'COD Mobile', 'Mobile Legends', 'Wild Rift').required(),
  entryFee: Joi.number().min(0).required(),
  prizePool: Joi.number().min(0).required(),
  maxParticipants: Joi.number().min(2).required(),
  startDate: Joi.date().iso().required(),
  rules: Joi.string().max(2000).optional()
});

const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(2000).optional(),
  priceUSD: Joi.number().min(0).required(),
  priceChcoins: Joi.number().min(0).optional(),
  type: Joi.string().valid('physical', 'virtual').required(),
  stock: Joi.number().min(0).optional(),
  imageUrl: Joi.string().uri().optional()
});

const purchaseSchema = Joi.object({
  productId: Joi.string().required(),
  paymentMethod: Joi.string().valid('chcoins', 'paypal', 'mixed').required(),
  chcoinsAmount: Joi.number().min(0).optional(),
  usdAmount: Joi.number().min(0).optional()
});

module.exports = {
  userSchema,
  loginSchema,
  tournamentSchema,
  productSchema,
  purchaseSchema
};
