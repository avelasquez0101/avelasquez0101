const tournamentService = require('../services/tournament.service');
const logger = require('../utils/logger');

exports.createTournament = async (req, res, next) => {
  try {
    const tournament = await tournamentService.createTournament(req.body);
    res.status(201).json(tournament);
  } catch (error) {
    next(error);
  }
};

exports.listTournaments = async (req, res, next) => {
  try {
    const tournaments = await tournamentService.getTournaments(req.query);
    res.json(tournaments);
  } catch (error) {
    next(error);
  }
};

exports.getTournament = async (req, res, next) => {
  try {
    const tournament = await tournamentService.getTournamentById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Torneo no encontrado' });
    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const result = await tournamentService.registerToTournament(req.params.id, req.user.id);
    res.status(201).json({ message: 'Inscrito exitosamente', data: result });
  } catch (error) {
    next(error);
  }
};

exports.checkIn = async (req, res, next) => {
  try {
    const result = await tournamentService.checkInToTournament(req.params.id, req.user.id);
    res.json({ message: 'Check-in realizado', data: result });
  } catch (error) {
    next(error);
  }
};

exports.generateBracket = async (req, res, next) => {
  try {
    const result = await tournamentService.generateBracket(req.params.id);
    res.json({ message: 'Bracket generado', data: result });
  } catch (error) {
    next(error);
  }
};

exports.cancelTournament = async (req, res, next) => {
  try {
    await tournamentService.cancelTournament(req.params.id);
    res.json({ message: 'Torneo cancelado' });
  } catch (error) {
    next(error);
  }
};
