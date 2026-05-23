# 🕹️ Arcade Platform - Fase 1 (MVP)

Plataforma de torneos competitivos para gamers. El MVP permite a los usuarios registrarse, participar en torneos, competir y ganar recompensas.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (React SPA)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY (NGINX) - Puerto 8080              │
└─────────────────────────────────────────────────────────────┘
          │                        │
          ▼                        ▼
┌──────────────────┐    ┌──────────────────────┐
│  Auth Service    │    │  Tournament Service  │
│   Puerto 3001    │    │     Puerto 3002      │
└──────────────────┘    └──────────────────────┘
          │                        │
          └────────────┬───────────┘
                       ▼
            ┌─────────────────────┐
            │   PostgreSQL +      │
            │   Redis + RabbitMQ  │
            └─────────────────────┘
```

## Servicios Implementados

### ✅ Auth Service
- Registro de usuarios
- Login con JWT (RS256)
- Refresh tokens
- Verificación de email
- Recuperación de contraseña

### ✅ Tournament Service
- Creación de torneos (admin)
- Inscripción de participantes
- Check-in antes del torneo
- Generación de brackets (Single Elimination)
- Reporte de resultados
- Sistema de disputas
- Avance automático de rondas

### 🚧 En Desarrollo (Próximos)
- Profile Service (XP, niveles, logros)
- Shop Service (tienda virtual)
- Notification Service (emails)
- Frontend React

## Quick Start

### Requisitos Previos
- Docker & Docker Compose
- Node.js 18+ (para desarrollo local)

### Levantar la Plataforma

```bash
# Clonar repositorio
cd arcade-platform

# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar salud de servicios
curl http://localhost:8080/health
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Tournament Service
```

### Desarrollo Local

```bash
# Auth Service
cd services/auth
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# Tournament Service
cd services/tournament
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## Endpoints API

### Auth Service (`/api/auth`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/refresh` | Refrescar token |
| POST | `/auth/logout` | Cerrar sesión |
| GET | `/auth/verify-email/:token` | Verificar email |
| POST | `/auth/forgot-password` | Recuperar contraseña |
| GET | `/auth/me` | Obtener perfil actual |

### Tournament Service (`/api/tournaments`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/tournaments` | Listar torneos | Público |
| GET | `/tournaments/:id` | Ver torneo | Público |
| GET | `/tournaments/:id/bracket` | Ver bracket | Público |
| POST | `/tournaments/:id/register` | Registrarse | ✅ |
| POST | `/tournaments/:id/checkin` | Check-in | ✅ |
| POST | `/tournaments` | Crear torneo | Admin |
| PUT | `/tournaments/:id` | Actualizar | Admin |
| POST | `/tournaments/:id/generate-bracket` | Iniciar | Admin |

### Matches (`/api/matches`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/matches/:matchId` | Ver partida | Público |
| POST | `/matches/:matchId/report` | Reportar resultado | ✅ |
| POST | `/matches/:matchId/dispute` | Abrir disputa | ✅ |

## Variables de Entorno

Cada servicio tiene su propio archivo `.env`. Ver `.env.example` en cada carpeta.

## Bases de Datos

El sistema crea automáticamente 5 databases en PostgreSQL:
- `auth_db` - Usuarios y autenticación
- `tournament_db` - Torneos, registros, matches
- `shop_db` - Items, compras, inventario (futuro)
- `profile_db` - XP, niveles, logros (futuro)
- `admin_db` - Configuración admin (futuro)

## Tecnologías

**Backend:**
- Node.js 18 + Express.js
- Prisma ORM
- PostgreSQL 15
- Redis 7
- RabbitMQ 3.12
- JWT (RS256)
- Winston (logging)
- Zod (validación)

**Infraestructura:**
- Docker & Docker Compose
- NGINX (API Gateway)
- Health checks integrados

## Próximos Pasos (Roadmap Fase 1)

1. ✅ Auth Service - COMPLETADO
2. ✅ Tournament Service - COMPLETADO
3. 🚧 Profile Service - XP, niveles, logros
4. 🚧 Shop Service - Tienda virtual
5. 🚧 Frontend React - Interfaz de usuario
6. 🚧 Notification Service - Emails
7. 🚧 Admin Dashboard - Panel de administración

## Contribuir

1. Crear rama feature (`git checkout -b feature/amazing-feature`)
2. Commit cambios (`git commit -m 'Add amazing feature'`)
3. Push (`git push origin feature/amazing-feature`)
4. Abrir Pull Request

## Licencia

MIT License - Ver LICENSE para más detalles.

---

**Estado del Proyecto:** 🟢 En Desarrollo Activo
