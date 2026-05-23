# Arcade Platform - Plataforma de Torneos Competitivos

## Visión General

Plataforma de torneos competitivos para gamers, desarrollada en fases siguiendo el principio de "lanzar pronto, medir, iterar y escalar".

## Roadmap

### ✅ Fase 1: Núcleo Competitivo (MVP) - En Progreso
- **Objetivo:** Validar que los usuarios juegan, compiten y regresan
- **Duración:** 4-5 meses
- **Hito Principal:** 1,000 usuarios activos mensuales

### ⏳ Fase 2: Engagement y Monetización
- Activar fuentes de ingreso directo y duplicar retención

### ⏳ Fase 3: Comunidad y Crecimiento
- Convertir usuarios en comunidad y abrir canal B2B

### ⏳ Fase 4: Ecosistema y Escala
- Autosostenibilidad con UGC y expansión de mercado

---

## Arquitectura Técnica - Fase 1

### Stack Tecnológico

**Backend:**
- Node.js + Express.js
- Prisma ORM
- PostgreSQL (base de datos)
- Redis (caché y sesiones)
- RabbitMQ (mensajería asíncrona)
- JWT (autenticación)

**Frontend:**
- React 18 + Vite
- TanStack Query
- Zustand (estado global)
- TailwindCSS

**Infraestructura:**
- Docker + Docker Compose
- NGINX (API Gateway)

### Microservicios Fase 1

| Servicio | Puerto | Responsabilidad | Estado |
|----------|--------|----------------|---------|
| **Auth Service** | 3001 | Registro, login, JWT, verificación email | ✅ Completado |
| **Tournament Service** | 3002 | Gestión de torneos, brackets, resultados | 🔄 Pendiente |
| **Shop Service** | 3003 | Catálogo, compras, inventario | 🔄 Pendiente |
| **Profile Service** | 3004 | XP, niveles, logros, créditos | 🔄 Pendiente |
| **Notification Service** | 3005 | Emails y notificaciones | 🔄 Pendiente |
| **Admin Service** | 3006 | Panel de administración | 🔄 Pendiente |

---

## Estructura del Proyecto

```
arcade-platform/
├── services/
│   ├── auth/              # ✅ Auth Service
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   └── app.js
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── tournament/        # 🔄 Pendiente
│   ├── shop/              # 🔄 Pendiente
│   ├── profile/           # 🔄 Pendiente
│   ├── notification/      # 🔄 Pendiente
│   └── admin/             # 🔄 Pendiente
├── frontend/              # 🔄 Pendiente
├── nginx/                 # ✅ Configurado
├── db/                    # ✅ Scripts init
└── docker-compose.yml     # ✅ Configurado
```

---

## Quick Start - Desarrollo Local

### Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Git

### Iniciar Infraestructura

```bash
cd /workspace/arcade-platform

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener todo
docker-compose down
```

### Auth Service (Ejemplo)

```bash
cd services/auth

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Ejecutar migraciones (con Docker corriendo)
npx prisma migrate dev

# Generar Prisma Client
npx prisma generate

# Iniciar en modo desarrollo
npm run dev
```

El servicio estará disponible en `http://localhost:3001` o vía API Gateway en `http://localhost:8080/api/auth/`

---

## Endpoints Auth Service

### Públicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registro de usuario |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/verify-email/:token` | Verificar email |
| POST | `/auth/forgot-password` | Inicio recuperación password |
| POST | `/auth/reset-password/:token` | Resetear password |

### Protegidos (requieren JWT)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Obtener usuario actual |

---

## Endpoints por Servicio (Planificados)

### Tournament Service

- `GET /tournaments` - Listar torneos
- `POST /tournaments` - Crear torneo (admin)
- `GET /tournaments/:id` - Detalle del torneo
- `POST /tournaments/:id/register` - Inscripción
- `POST /tournaments/:id/checkin` - Check-in
- `GET /tournaments/:id/bracket` - Ver bracket
- `POST /matches/:id/report` - Reportar resultado

### Shop Service

- `GET /shop/items` - Catálogo
- `POST /shop/purchase` - Comprar item
- `GET /shop/inventory/:userId` - Inventario
- `POST /shop/inventory/equip` - Equipar item

### Profile Service

- `GET /profiles/:userId` - Perfil público
- `GET /profiles/:userId/stats` - Estadísticas
- `POST /profiles/:userId/xp` - Añadir XP
- `GET /profiles/:userId/achievements` - Logros

---

## Modelo de Datos

### Auth Service

```prisma
User {
  id, email, username, passwordHash,
  isVerified, isActive, createdAt,
  lastLoginAt, verificationToken, resetToken
}
```

### Tournament Service (planificado)

```prisma
Tournament {
  id, name, game, format, status,
  maxParticipants, prizePool, startDate
}

Registration {
  id, userId, tournamentId, checkedIn, seed
}

Match {
  id, tournamentId, round, player1Id, player2Id,
  winnerId, score, status
}
```

---

## Métricas y KPIs Fase 1

- **Usuarios Registrados:** Objetivo 1,000
- **Torneos Completados:** Medir engagement
- **Tiempo Promedio en Plataforma:** > 30 min/sesión
- **Retención D7:** > 25%
- **Tasa de Conversión Registro → Primer Torneo:** > 60%

---

## Contribución

Este es un proyecto en desarrollo activo. Las siguientes áreas están pendientes de implementación:

1. ⏳ Tournament Service - Motor de torneos
2. ⏳ Shop Service - Tienda virtual
3. ⏳ Profile Service - Sistema de XP y logros
4. ⏳ Notification Service - Emails y notificaciones
5. ⏳ Admin Service - Panel de administración
6. ⏳ Frontend React - Interfaz de usuario

---

## Licencia

MIT

---

**Estado Actual:** Sprint 1-2 - Auth Service completado ✅
