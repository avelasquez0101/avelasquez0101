# 🎮 Arcade Platform - Fase 1 (MVP)

Plataforma de torneos competitivos para eSports. Este repositorio contiene la implementación completa de la **Fase 1: Núcleo Competitivo (MVP)**.

## 📋 Estado del Proyecto

### ✅ Completado (Fase 1)

| Servicio/Módulo | Estado | Puerto | Descripción |
|----------------|--------|--------|-------------|
| **Auth Service** | ✅ Completo | 3001 | Registro, login, JWT, verificación de email |
| **Tournament Service** | ✅ Completo | 3002 | Gestión de torneos, brackets, check-in, resultados |
| **Profile Service** | ✅ Completo | 3004 | XP, niveles, logros, créditos arcade |
| **Shop Service** | ✅ Completo | 3003 | Tienda virtual, inventario, compras |
| **Notification Service** | ✅ Completo | 3005 | Emails transaccionales vía RabbitMQ |
| **Frontend React** | ✅ Completo | 5173 | SPA con autenticación, torneos, tienda y perfil |
| **Admin Dashboard** | ✅ Completo | - | Panel para crear torneos y gestionar disputas |
| **API Gateway (NGINX)** | ✅ Completo | 8080 | Enrutamiento y balanceo de carga |

## 🏗️ Arquitectura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend  │────▶│  NGINX       │────▶│  Microservicios │
│   (React)   │     │  (Gateway)   │     │  (Node.js)      │
│   :5173     │     │  :8080       │     │  :3001-3005     │
└─────────────┘     └──────────────┘     └─────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────┐
                    ▼                          ▼              ▼
            ┌───────────────┐         ┌────────────┐  ┌────────────┐
            │  PostgreSQL   │         │   Redis    │  │  RabbitMQ  │
            │  (5 DBs)      │         │  (Cache)   │  │  (Events)  │
            └───────────────┘         └────────────┘  └────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Git

### 1. Clonar el repositorio

```bash
cd /workspace/arcade-platform
```

### 2. Configurar variables de entorno

```bash
# Generar claves JWT (solo una vez)
openssl genrsa -out jwt_private.pem 2048
openssl rsa -in jwt_private.pem -pubout -outform PEM -out jwt_public.pem

# Copiar las claves al archivo .env del docker-compose
export JWT_PRIVATE_KEY=$(cat jwt_private.pem)
export JWT_PUBLIC_KEY=$(cat jwt_public.pem)
```

### 3. Levantar toda la infraestructura

```bash
docker-compose up --build
```

Esto levantará:
- PostgreSQL con 5 bases de datos
- Redis
- RabbitMQ
- 5 microservicios backend
- Frontend React
- API Gateway NGINX

### 4. Acceder a la aplicación

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672 (user: arcade_user, pass: arcade_secure_password_123)

## 📁 Estructura del Proyecto

```
arcade-platform/
├── docker-compose.yml          # Orquestación de contenedores
├── db/
│   └── init.sql                # Inicialización de databases
├── nginx/
│   └── nginx.conf              # Configuración del API Gateway
├── services/
│   ├── auth/                   # Servicio de autenticación
│   ├── tournament/             # Servicio de torneos
│   ├── profile/                # Servicio de perfiles
│   ├── shop/                   # Servicio de tienda
│   └── notification/           # Servicio de notificaciones
└── frontend/                   # Aplicación React
    ├── src/
    │   ├── api/                # Clientes HTTP
    │   ├── components/         # Componentes reutilizables
    │   ├── hooks/              # Custom hooks
    │   ├── pages/              # Páginas principales
    │   ├── store/              # Estado global (Zustand)
    │   └── App.jsx             # Router principal
    └── package.json
```

## 🔑 Endpoints Principales

### Auth Service (`/api/auth`)
- `POST /register` - Registro de usuario
- `POST /login` - Inicio de sesión
- `POST /logout` - Cerrar sesión
- `GET /verify-email/:token` - Verificar email
- `GET /me` - Obtener usuario actual

### Tournament Service (`/api/tournaments`, `/api/matches`)
- `GET /tournaments` - Listar torneos
- `POST /tournaments` - Crear torneo (admin)
- `POST /tournaments/:id/register` - Inscribirse
- `POST /tournaments/:id/checkin` - Check-in
- `POST /tournaments/:id/generate-bracket` - Generar bracket (admin)
- `POST /matches/:id/report` - Reportar resultado
- `POST /matches/:id/dispute` - Abrir disputa

### Profile Service (`/api/profiles`)
- `GET /profiles/:userId` - Perfil público
- `GET /profiles/me` - Mi perfil
- `POST /internal/profiles/:userId/xp` - Añadir XP (interno)
- `POST /internal/profiles/:userId/credits/add` - Añadir créditos (interno)

### Shop Service (`/api/shop`)
- `GET /items` - Catálogo de items
- `POST /purchase` - Comprar item
- `GET /inventory` - Mi inventario
- `POST /inventory/:itemId/equip` - Equipar item

## 🎯 Flujo MVP Completo

1. **Registro/Login**: Usuario crea cuenta y verifica email
2. **Explorar Torneos**: Ve lista de torneos disponibles
3. **Inscripción**: Se inscribe en un torneo
4. **Check-in**: Hace check-in 15 min antes del inicio
5. **Competición**: El admin genera el bracket, juega su partida
6. **Reporte**: Reporta el resultado de su match
7. **Victoria**: Si gana, recibe Créditos Arcade y XP automáticamente
8. **Tienda**: Gasta sus créditos comprando avatares o insignias
9. **Perfil**: Personaliza su perfil con los items comprados

## 🛠️ Desarrollo Local

### Instalar dependencias de un servicio

```bash
cd services/tournament
npm install
```

### Ejecutar un servicio en modo desarrollo

```bash
cd services/tournament
npm run dev
```

### Ejecutar migraciones de Prisma

```bash
cd services/tournament
npx prisma migrate dev
npx prisma generate
```

## 📊 Métricas de la Fase 1

- **Usuarios objetivo**: 1,000 usuarios activos mensuales
- **Torneos soportados**: Eliminación directa y Round Robin
- **Moneda**: Créditos Arcade (gratis, ganados jugando)
- **Items en tienda**: Avatares, banners, insignias

## 🔐 Seguridad

- JWT con RS256 (clave pública/privada)
- Contraseñas hasheadas con bcrypt (12 rondas)
- Rate limiting en todos los endpoints
- Validación de datos con Zod
- CORS configurado
- Helmet.js para headers de seguridad

## 📝 Licencia

© 2024 Arcade Platform. Todos los derechos reservados.
