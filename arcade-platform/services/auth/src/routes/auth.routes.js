const { Router } = require('express');
const AuthService = require('../services/auth.service');
const prisma = require('../config/database');
const jwtService = require('../services/jwt.service');
const { 
  registerSchema, 
  loginSchema, 
  refreshSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema 
} = require('../middleware/validate');
const authenticate = require('../middleware/auth');

const router = Router();
const authService = new AuthService(prisma, jwtService);

// Middleware para validar errores de Zod
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

// POST /register - Registro de usuario
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    const result = await authService.register(email, username, password);

    // En producción, enviar email de verificación aquí
    // await publishEvent('user.registered', { userId: result.user.id, email });

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    if (error.code === 'USER_EXISTS') {
      return res.status(409).json({ error: error.message, code: error.code });
    }
    next(error);
  }
});

// POST /login - Login de usuario
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    const result = await authService.login(emailOrUsername, password);

    // Set refresh token en cookie httpOnly
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    if (error.code === 'INVALID_CREDENTIALS' || error.code === 'ACCOUNT_DEACTIVATED') {
      return res.status(401).json({ error: error.message, code: error.code });
    }
    next(error);
  }
});

// POST /refresh - Refresh access token
router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refresh(refreshToken);

    res.json({
      accessToken: result.accessToken,
    });
  } catch (error) {
    if (error.code === 'INVALID_TOKEN') {
      return res.status(401).json({ error: error.message, code: error.code });
    }
    next(error);
  }
});

// POST /logout - Logout de usuario
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await authService.logout(req.user.userId);

    // Limpiar cookie de refresh token
    res.clearCookie('refreshToken');

    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
});

// GET /verify-email/:token - Verificar email
router.get('/verify-email/:token', validate(verifyEmailSchema), async (req, res, next) => {
  try {
    const { token } = req.params;

    await authService.verifyEmail(token);

    res.json({ 
      message: 'Email verified successfully',
      success: true 
    });
  } catch (error) {
    if (error.code === 'INVALID_TOKEN') {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    next(error);
  }
});

// POST /forgot-password - Inicio de recuperación de contraseña
router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    if (result.resetToken) {
      // En producción, enviar email con el token
      // await publishEvent('password.reset_requested', { email, resetToken: result.resetToken });
      console.log(`Reset token for ${email}: ${result.resetToken}`);
    }

    res.json({ 
      message: 'If the email exists, a reset link has been sent',
      success: true 
    });
  } catch (error) {
    next(error);
  }
});

// POST /reset-password/:token - Resetear contraseña
router.post('/reset-password/:token', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.json({ 
      message: 'Password reset successfully',
      success: true 
    });
  } catch (error) {
    if (error.code === 'INVALID_TOKEN') {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    next(error);
  }
});

// GET /me - Obtener usuario actual
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
