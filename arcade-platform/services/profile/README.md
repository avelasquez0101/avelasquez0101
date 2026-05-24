# Profile Service

Servicio de gestión de perfiles, XP, niveles, logros y créditos arcade.

## Endpoints Principales

### Públicos (requieren autenticación)
- `GET /api/profiles/me` - Mi perfil
- `GET /api/profiles/:userId` - Perfil de un usuario

### Internos (requieren API Key)
- `POST /api/profiles/:userId/xp` - Añadir XP
- `POST /api/profiles/:userId/credits/add` - Añadir créditos
- `POST /api/profiles/:userId/credits/deduct` - Deducir créditos
- `GET /api/profiles/:userId/balance` - Obtener balance
- `POST /api/profiles/:userId/tournament-result` - Registrar resultado de torneo

### Administración
- `GET /api/admin/profiles` - Listar perfiles
- `PUT /api/admin/profiles/:userId/level` - Ajustar nivel
- `PUT /api/admin/profiles/:userId/credits` - Ajustar créditos

## Instalación

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Variables de Entorno

Ver `.env.example` para referencia.
