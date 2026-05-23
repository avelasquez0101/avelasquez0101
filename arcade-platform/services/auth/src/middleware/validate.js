const { z } = require('zod');

// Schema para registro
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
    password: z.string().min(8).max(100),
  }),
});

// Schema para login
const loginSchema = z.object({
  body: z.object({
    emailOrUsername: z.string().min(1),
    password: z.string().min(1),
  }),
});

// Schema para refresh token
const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

// Schema para verificación de email
const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string(),
  }),
});

// Schema para forgot password
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

// Schema para reset password
const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string(),
  }),
  body: z.object({
    newPassword: z.string().min(8).max(100),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
