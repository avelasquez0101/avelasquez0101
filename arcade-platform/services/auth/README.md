# Auth Service - Registro, autenticación y gestión de sesiones

## Endpoints

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/verify-email/:token` - Verificar email
- `POST /auth/forgot-password` - Inicio recuperación password
- `POST /auth/reset-password/:token` - Resetear password
- `GET /auth/me` - Obtener usuario actual (requiere auth)

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar JWT_PRIVATE_KEY y JWT_PUBLIC_KEY en .env

# Iniciar base de datos y servicios (desde root del proyecto)
docker-compose up postgres redis rabbitmq

# Ejecutar migraciones
npx prisma migrate dev

# Generar Prisma Client
npx prisma generate

# Iniciar servicio
npm run dev
```

## Testing

```bash
npm test
```
