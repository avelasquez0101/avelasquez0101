# ChGaming Platform

Plataforma integral para gestión de torneos de videojuegos y comercio electrónico con enfoque en retención de usuarios y monetización.

## 🎮 Características Principales

### Torneos
- Creación y gestión de torneos para Free Fire, COD Mobile, Mobile Legends y Wild Rift
- Sistema de brackets automáticos
- Validación de resultados con capturas de pantalla
- Distribución automática de premios (Top 3)

### Economía Dual
- **Chcoins**: Moneda virtual interna
- **USD**: Saldo real mediante PayPal
- Sistema de pagos híbrido (combinación de ambas monedas)

### Gamificación
- XP por participación
- Multiplicadores por rachas diarias
- Sistema de niveles VIP
- Ranking dinámico global y por juego

### Tienda Híbrida
- Productos físicos (periféricos, ropa gamer)
- Productos virtuales (skins, diamantes, gift cards)
- Checkout adaptativo multi-moneda

## 🏗️ Arquitectura Tecnológica

### Stack
- **Frontend Web**: Next.js 14 + React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL
- **Cache/Rate Limiting**: Redis
- **Proxy/Load Balancer**: Nginx
- **Monorepo**: TurboRepo

### Estructura del Proyecto
```
chgaming-platform/
├── apps/
│   ├── web/              # Aplicación Next.js
│   └── mobile/           # React Native (próximamente)
├── packages/
│   ├── database/         # Migraciones y seeds SQL
│   ├── server/           # Backend Express
│   ├── ui/               # Componentes compartidos
│   └── utils/            # Utilidades compartidas
├── docker-compose.yml    # Orquestación Docker
└── start.sh             # Script de inicio
```

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)

### Ejecutar con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <repo-url>
cd chgaming-platform

# Iniciar la plataforma
./start.sh
```

La aplicación estará disponible en:
- **Frontend**: http://localhost
- **API Backend**: http://localhost/api
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Credenciales por Defecto
```
Email: admin@chgaming.com
Password: admin123
```

### Desarrollo Local

```bash
# Instalar dependencias
pnpm install

# Iniciar servicios de infraestructura
docker-compose up -d postgres redis

# Ejecutar migraciones
pnpm --filter=server migrate
pnpm --filter=server seed

# Iniciar backend
pnpm --filter=server dev

# Iniciar frontend (en otra terminal)
pnpm --filter=web dev
```

## 📊 Base de Datos

### Tablas Principales
- `users`: Usuarios con sistema de XP, niveles y VIP
- `roles`: Roles y permisos
- `tournaments`: Torneos con configuración completa
- `tournament_participants`: Inscripciones a torneos
- `products`: Catálogo de productos físicos/virtuales
- `transactions`: Historial de transacciones auditables
- `user_streaks`: Seguimiento de rachas diarias

### Migraciones
Las migraciones se encuentran en `packages/database/migrations/` y se ejecutan automáticamente al iniciar.

## 🔐 Seguridad

- Autenticación JWT con tokens de acceso y refresco
- Hash de contraseñas con BCrypt
- Rate limiting distribuido con Redis
- Protección contra inyección SQL
- Headers de seguridad con Helmet
- CORS configurado estrictamente
- Validación de entradas con Joi

## 💰 Monetización

### Membresías VIP
- Bonus de XP multiplicador
- Acceso anticipado a torneos
- Descuentos en la tienda
- Badge exclusivo

### Publicidad
- Espacios nativos en el feed de torneos
- Anuncios segmentados por juego favorito
- Sponsorships de torneos

### Comisión por Transacciones
- Porcentaje en compras con USD
- Fee por retiro de premios

## 📱 Endpoints API Principales

### Autenticación
```
POST /api/auth/register     # Registro de usuario
POST /api/auth/login        # Login
POST /api/auth/refresh      # Refrescar token
POST /api/auth/logout       # Logout
```

### Torneos
```
GET  /api/tournaments       # Listar torneos
POST /api/tournaments       # Crear torneo (admin)
GET  /api/tournaments/:id   # Detalle de torneo
POST /api/tournaments/:id/join  # Inscribirse
POST /api/tournaments/:id/result  # Cargar resultado
```

### Productos
```
GET  /api/products          # Listar productos
POST /api/products          # Crear producto (admin)
POST /api/transactions/purchase  # Comprar producto
```

### Usuario
```
GET  /api/users/me          # Perfil propio
PUT  /api/users/me          # Actualizar perfil
GET  /api/users/me/stats    # Estadísticas
GET  /api/leaderboard       # Ranking
```

## 🎯 Sistema de Ranking

### Fórmula de XP
```javascript
XP Base por Participación = 100
XP por Victoria = 500
Bonus por Racha = XP * (1 + rachaActual * 0.1)
Bonus VIP = XP * 1.5
XP Total = (XP Base + Bonus) * Multiplicadores
```

### Niveles
- Nivel 1-10: Novato
- Nivel 11-30: Intermedio
- Nivel 31-50: Experto
- Nivel 50+: Leyenda

## 🔧 Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/chgaming

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# JWT
JWT_SECRET=tu_secreto_muy_seguro_cambialo_en_produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# PayPal
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_CLIENT_SECRET=tu_client_secret
PAYPAL_MODE=sandbox

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost
```

## 📈 Escalabilidad

- Balanceo de carga con Nginx
- Cache distribuido con Redis
- Pool de conexiones a PostgreSQL
- Rate limiting por IP
- Preparado para múltiples instancias del backend

## 🧪 Testing

```bash
# Tests unitarios
pnpm test

# Tests de integración
pnpm test:integration

# Tests de carga
pnpm test:load
```

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

## 👥 Contacto

Para soporte o consultas comerciales:
- Email: support@chgaming.com
- Discord: https://discord.gg/chgaming

---

**Hecho con ❤️ para la comunidad gamer**
