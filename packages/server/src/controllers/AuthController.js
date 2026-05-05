const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const redis = require('../config/redis');

const JWT_SECRET = process.env.JWT_SECRET || 'chgaming-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'chgaming-refresh-secret-key-change-in-production';

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, username, game_id } = req.body;

      // Validaciones
      if (!email || !password || !username || !game_id) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      // Crear usuario
      const user = await User.create({ email, password, username, game_id });

      // Generar tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: 'user' },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Guardar refresh token en Redis
      await redis.setex(`refresh:${user.id}`, 604800, refreshToken);

      // Bonus de bienvenida: 100 Chcoins adicionales
      await User.addChcoins(user.id, 100);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          game_id: user.game_id,
          chcoins: user.chcoins + 100,
          xp: user.xp
        },
        tokens: { accessToken, refreshToken }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      // Buscar usuario
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Actualizar racha
      const streak = await User.updateStreak(user.id);

      // Generar tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role || 'user' },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Guardar refresh token en Redis
      await redis.setex(`refresh:${user.id}`, 604800, refreshToken);

      // Recargar datos del usuario
      const updatedUser = await User.findById(user.id);

      res.json({
        message: 'Login exitoso',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          game_id: updatedUser.game_id,
          chcoins: updatedUser.chcoins,
          balance_usd: updatedUser.balance_usd,
          xp: updatedUser.xp,
          vip_level: updatedUser.vip_level,
          streak_days: streak
        },
        tokens: { accessToken, refreshToken }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token requerido' });
      }

      // Verificar token en Redis
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const storedToken = await redis.get(`refresh:${decoded.userId}`);

      if (!storedToken || storedToken !== refreshToken) {
        return res.status(401).json({ error: 'Refresh token inválido' });
      }

      // Generar nuevo access token
      const user = await User.findById(decoded.userId);
      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role || 'user' },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error('Error al refrescar token:', error);
      res.status(401).json({ error: 'Refresh token inválido o expirado' });
    }
  }

  static async logout(req, res) {
    try {
      const userId = req.user.userId;

      // Eliminar refresh token de Redis
      await redis.del(`refresh:${userId}`);

      res.json({ message: 'Logout exitoso' });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({ error: 'Error al cerrar sesión' });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Obtener racha desde Redis o DB
      let streak = await redis.get(`user:${userId}:streak`);
      if (!streak) {
        streak = user.streak_days;
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          game_id: user.game_id,
          chcoins: user.chcoins,
          balance_usd: user.balance_usd,
          xp: user.xp,
          vip_level: user.vip_level,
          streak_days: parseInt(streak),
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const { username, game_id } = req.body;

      const result = await pool.query(
        'UPDATE users SET username = COALESCE($1, username), game_id = COALESCE($2, game_id) WHERE id = $3 RETURNING *',
        [username, game_id, userId]
      );

      res.json({
        message: 'Perfil actualizado',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  }
}

module.exports = AuthController;
