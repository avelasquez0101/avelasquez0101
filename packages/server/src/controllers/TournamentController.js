const Tournament = require('../models/Tournament');
const User = require('../models/User');

class TournamentController {
  static async getAll(req, res) {
    try {
      const { game_id, status } = req.query;
      const filters = {};

      if (game_id) filters.game_id = parseInt(game_id);
      if (status) filters.status = status;

      const tournaments = await Tournament.findAll(filters);
      res.json({ tournaments });
    } catch (error) {
      console.error('Error al obtener torneos:', error);
      res.status(500).json({ error: 'Error al obtener torneos' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const tournament = await Tournament.findById(id);

      if (!tournament) {
        return res.status(404).json({ error: 'Torneo no encontrado' });
      }

      const participants = await Tournament.getParticipants(id);
      const bracket = JSON.parse(tournament.bracket_data || '[]');

      res.json({
        tournament: {
          ...tournament,
          participants,
          bracket
        }
      });
    } catch (error) {
      console.error('Error al obtener torneo:', error);
      res.status(500).json({ error: 'Error al obtener torneo' });
    }
  }

  static async create(req, res) {
    try {
      // Solo admin puede crear torneos
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para crear torneos' });
      }

      const { name, game_id, description, max_participants, entry_fee_chcoins, entry_fee_usd, prize_pool_chcoins, prize_pool_usd, start_date, end_date, rules } = req.body;

      // Validaciones
      if (!name || !game_id || !start_date || !end_date) {
        return res.status(400).json({ error: 'Campos requeridos faltantes' });
      }

      const tournament = await Tournament.create({
        name,
        game_id,
        description: description || '',
        max_participants: max_participants || 16,
        entry_fee_chcoins: entry_fee_chcoins || 0,
        entry_fee_usd: entry_fee_usd || 0,
        prize_pool_chcoins: prize_pool_chcoins || 0,
        prize_pool_usd: prize_pool_usd || 0,
        start_date,
        end_date,
        rules: rules || ''
      });

      res.status(201).json({
        message: 'Torneo creado exitosamente',
        tournament
      });
    } catch (error) {
      console.error('Error al crear torneo:', error);
      res.status(500).json({ error: 'Error al crear torneo' });
    }
  }

  static async register(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Verificar si el usuario ya tiene saldo suficiente si hay fee
      const tournament = await Tournament.findById(id);
      
      if (tournament.entry_fee_chcoins > 0 || tournament.entry_fee_usd > 0) {
        const user = await User.findById(userId);
        
        if (user.chcoins < tournament.entry_fee_chcoins) {
          return res.status(400).json({ error: 'Saldo de Chcoins insuficiente' });
        }
        if (user.balance_usd < tournament.entry_fee_usd) {
          return res.status(400).json({ error: 'Saldo en USD insuficiente' });
        }

        // Descontar fees
        if (tournament.entry_fee_chcoins > 0) {
          await User.addChcoins(userId, -tournament.entry_fee_chcoins);
        }
        if (tournament.entry_fee_usd > 0) {
          await User.updateBalance(userId, -tournament.entry_fee_usd);
        }
      }

      const participant = await Tournament.registerParticipant(id, userId);

      // Dar XP por participar
      await User.addXP(userId, 50);

      // Bonus por racha
      const streakBonus = Math.min(participant.streak_days * 5, 50);
      if (streakBonus > 0) {
        await User.addXP(userId, streakBonus);
      }

      // Generar bracket si es el primer participante
      const participants = await Tournament.getParticipants(id);
      if (participants.length === 1) {
        const bracket = await Tournament.generateBracket(participants);
        await pool.query(
          'UPDATE tournaments SET bracket_data = $1 WHERE id = $2',
          [JSON.stringify(bracket), id]
        );
      }

      res.json({
        message: 'Te has registrado exitosamente en el torneo',
        participant
      });
    } catch (error) {
      console.error('Error al registrar en torneo:', error);
      if (error.message.includes('Ya estás registrado') || error.message.includes('Torneo lleno')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al registrar en torneo' });
    }
  }

  static async submitResult(req, res) {
    try {
      const { id } = req.params;
      const { resultData, proofUrl } = req.body;
      const userId = req.user.userId;

      if (!resultData || !proofUrl) {
        return res.status(400).json({ error: 'Datos del resultado y prueba son requeridos' });
      }

      const result = await Tournament.submitResult(id, userId, resultData, proofUrl);

      res.json({
        message: 'Resultado enviado para validación',
        result
      });
    } catch (error) {
      console.error('Error al enviar resultado:', error);
      res.status(500).json({ error: 'Error al enviar resultado' });
    }
  }

  static async finalize(req, res) {
    try {
      // Solo admin puede finalizar torneos
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para finalizar torneos' });
      }

      const { id } = req.params;
      const { rankings } = req.body; // [{user_id, position, points}]

      if (!rankings || !Array.isArray(rankings)) {
        return res.status(400).json({ error: 'Rankings inválidos' });
      }

      await Tournament.finalize(id, rankings);

      res.json({
        message: 'Torneo finalizado y premios distribuidos'
      });
    } catch (error) {
      console.error('Error al finalizar torneo:', error);
      res.status(500).json({ error: 'Error al finalizar torneo' });
    }
  }
}

module.exports = TournamentController;
