const bcrypt = require('bcrypt');

class AuthService {
  constructor(prisma, jwtService) {
    this.prisma = prisma;
    this.jwtService = jwtService;
  }

  // Registrar usuario
  async register(email, username, password) {
    // Verificar si email o username ya existen
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const error = new Error('Email or username already exists');
      error.code = 'USER_EXISTS';
      throw error;
    }

    // Hashear contraseña (12 rondas)
    const passwordHash = await bcrypt.hash(password, 12);

    // Generar token de verificación
    const verificationToken = this.jwtService.generateVerificationToken();

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        verificationToken,
      },
    });

    // Generar tokens
    const accessToken = this.jwtService.generateAccessToken(
      user.id,
      user.email,
      user.username
    );

    const refreshToken = this.jwtService.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
      verificationToken, // Para enviar en email de verificación
    };
  }

  // Login
  async login(emailOrUsername, password) {
    // Buscar usuario por email o username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
      },
    });

    if (!user) {
      const error = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.code = 'ACCOUNT_DEACTIVATED';
      throw error;
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      const error = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generar tokens
    const accessToken = this.jwtService.generateAccessToken(
      user.id,
      user.email,
      user.username
    );

    const refreshToken = this.jwtService.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  // Refresh token
  async refresh(refreshToken) {
    try {
      const decoded = this.jwtService.verifyToken(refreshToken);
      
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        const error = new Error('Invalid refresh token');
        error.code = 'INVALID_TOKEN';
        throw error;
      }

      const newAccessToken = this.jwtService.generateAccessToken(
        user.id,
        user.email,
        user.username
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      const err = new Error('Invalid or expired refresh token');
      err.code = 'INVALID_TOKEN';
      throw err;
    }
  }

  // Verificar email
  async verifyEmail(token) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      const error = new Error('Invalid verification token');
      error.code = 'INVALID_TOKEN';
      throw error;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return { success: true };
  }

  // Forgot password
  async forgotPassword(email) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // No revelar si el email existe o no
      return { success: true };
    }

    const resetToken = this.jwtService.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    return { resetToken, email: user.email };
  }

  // Reset password
  async resetPassword(token, newPassword) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      const error = new Error('Invalid or expired reset token');
      error.code = 'INVALID_TOKEN';
      throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { success: true };
  }

  // Logout (invalidar refresh token - se maneja en Redis en producción)
  async logout(userId) {
    // En producción, añadir el tokenId a una blacklist en Redis
    return { success: true };
  }
}

module.exports = AuthService;
