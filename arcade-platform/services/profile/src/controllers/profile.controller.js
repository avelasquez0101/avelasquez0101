const profileService = require('../services/profile.service');
const logger = require('../utils/logger');

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.params.userId);
    if (!profile) return res.status(404).json({ message: 'Perfil no encontrado' });
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    // Asegurar que el perfil existe
    await profileService.getOrCreateProfile(req.user.id, req.user.email);
    
    const profile = await profileService.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// Endpoints internos (llamados por otros servicios con API Key)
exports.addXP = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const result = await profileService.addXP(req.params.userId, amount);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.addCredits = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const profile = await profileService.addCredits(req.params.userId, amount, reason);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

exports.deductCredits = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const profile = await profileService.deductCredits(req.params.userId, amount);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

exports.getBalance = async (req, res, next) => {
  try {
    const balance = await profileService.getBalance(req.params.userId);
    res.json({ userId: req.params.userId, balance });
  } catch (error) {
    next(error);
  }
};

exports.recordTournamentResult = async (req, res, next) => {
  try {
    const { won } = req.body;
    const profile = await profileService.recordTournamentResult(req.params.userId, won);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// Admin endpoints
exports.listProfiles = async (req, res, next) => {
  try {
    const { prisma } = require('../config/database');
    const profiles = await prisma.profile.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
    });
    res.json(profiles);
  } catch (error) {
    next(error);
  }
};

exports.updateLevel = async (req, res, next) => {
  try {
    const { level } = req.body;
    const { prisma } = require('../config/database');
    const profile = await prisma.profile.update({
      where: { userId: req.params.userId },
      data: { level }
    });
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

exports.updateCredits = async (req, res, next) => {
  try {
    const { creditsArcade } = req.body;
    const { prisma } = require('../config/database');
    const profile = await prisma.profile.update({
      where: { userId: req.params.userId },
      data: { creditsArcade }
    });
    res.json(profile);
  } catch (error) {
    next(error);
  }
};
