const User = require('../models/User');

class LeaderboardController {
  static async getGlobal(req, res) {
    try {
      const { limit = 50 } = req.query;
      const leaderboard = await User.getLeaderboard(null, parseInt(limit));

      // Calcular posiciones y badges
      const enrichedLeaderboard = leaderboard.map((user, index) => ({
        ...user,
        position: index + 1,
        badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null,
        vipBadge: user.vip_level > 0 ? `VIP ${user.vip_level}` : null,
        streakBadge: user.streak_days >= 7 ? '🔥' : null
      }));

      res.json({ leaderboard: enrichedLeaderboard });
    } catch (error) {
      console.error('Error al obtener leaderboard global:', error);
      res.status(500).json({ error: 'Error al obtener leaderboard' });
    }
  }

  static async getByGame(req, res) {
    try {
      const { game_id } = req.params;
      const { limit = 50 } = req.query;

      if (!game_id) {
        return res.status(400).json({ error: 'Game ID requerido' });
      }

      const leaderboard = await User.getLeaderboard(parseInt(game_id), parseInt(limit));

      const enrichedLeaderboard = leaderboard.map((user, index) => ({
        ...user,
        position: index + 1,
        badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null,
        vipBadge: user.vip_level > 0 ? `VIP ${user.vip_level}` : null,
        streakBadge: user.streak_days >= 7 ? '🔥' : null
      }));

      res.json({ leaderboard: enrichedLeaderboard });
    } catch (error) {
      console.error('Error al obtener leaderboard por juego:', error);
      res.status(500).json({ error: 'Error al obtener leaderboard' });
    }
  }

  static async getUserRank(req, res) {
    try {
      const { userId } = req.params;
      const { game_id } = req.query;

      // Obtener todos los usuarios para calcular el rank
      const allUsers = await User.getLeaderboard(game_id ? parseInt(game_id) : null, 10000);
      
      const userIndex = allUsers.findIndex(u => u.id === parseInt(userId));
      
      if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado en el ranking' });
      }

      const user = allUsers[userIndex];
      const totalUsers = allUsers.length;

      res.json({
        rank: {
          ...user,
          position: userIndex + 1,
          percentile: ((totalUsers - userIndex) / totalUsers * 100).toFixed(2),
          badge: userIndex === 0 ? '🥇' : userIndex === 1 ? '🥈' : userIndex === 2 ? '🥉' : null
        }
      });
    } catch (error) {
      console.error('Error al obtener rank de usuario:', error);
      res.status(500).json({ error: 'Error al obtener rank' });
    }
  }
}

module.exports = LeaderboardController;
