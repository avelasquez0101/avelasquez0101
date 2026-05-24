const matchService = require('../services/match.service');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

exports.reportResult = async (req, res, next) => {
  try {
    const { score1, score2 } = req.body;
    const result = await matchService.reportResult(req.params.matchId, req.user.id, score1, score2);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createDispute = async (req, res, next) => {
  try {
    const { reason, screenshotUrl } = req.body;
    const dispute = await matchService.createDispute(req.params.matchId, req.user.id, reason, screenshotUrl);
    res.status(201).json(dispute);
  } catch (error) {
    next(error);
  }
};

exports.resolveDispute = async (req, res, next) => {
  // Solo Admin
  try {
    const { winnerId, resolution } = req.body;
    const matchId = req.params.matchId;

    // Actualizar disputa
    await prisma.dispute.updateMany({
      where: { matchId },
      data: { status: 'RESOLVED', resolution, resolvedAt: new Date() }
    });

    // Si hay ganador, actualizar match manualmente
    if (winnerId) {
      const match = await prisma.match.findUnique({ where: { id: matchId } });
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'COMPLETED', winnerId }
      });
      
      // Llamar a advanceBracket manualmente
      await matchService.advanceBracket(match.tournamentId, match.round, winnerId);
    } else {
      // Repetir match o anular
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'PENDING', winnerId: null, player1Score: null, player2Score: null }
      });
    }

    res.json({ message: 'Disputa resuelta' });
  } catch (error) {
    next(error);
  }
};

exports.getMatch = async (req, res, next) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.matchId },
      include: { tournament: true }
    });
    
    if (!match) return res.status(404).json({ message: 'Partida no encontrada' });
    
    res.json(match);
  } catch (error) {
    next(error);
  }
};
