# 🎮 ChGaming Platform

Plataforma integral para gestión de torneos de videojuegos y comercio electrónico gamer.

## 🚀 Características Principales

### Torneos
- **Juegos Soportados**: Free Fire, COD Mobile, Mobile Legends, Wild Rift
- **Gestión Centralizada**: Solo administradores pueden crear/editar torneos
- **Brackets Automáticos**: Generación automática de llaves
- **Validación de Resultados**: Carga de capturas y validación manual
- **Premios Automatizados**: Distribución automática para Top 3

### Economía Dual
- **Chcoins**: Moneda virtual interna
- **USD**: Saldo real vía PayPal
- **Checkout Adaptativo**: Pago combinado (Chcoins + USD)
- **PayPal Integration**: Sandbox configurado

### Gamificación
- **XP y Niveles**: Sistema de experiencia por participación
- **Rachas**: Multiplicador por participación consecutiva (3+ días)
- **Membresía VIP**: Bonos de XP y beneficios exclusivos
- **Ranking Dinámico**: Líderes globales y por juego

### Tienda Híbrida
- **Productos Físicos**: Periféricos, ropa gamer
- **Productos Virtuales**: Skins, diamantes, gift cards
- **Inventario**: Gestión de stock en tiempo real

## 🛠️ Stack Tecnológico

- **Frontend Web**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL, Redis
- **Mobile**: React Native (Expo) - *en desarrollo*
- **Infraestructura**: Docker, Docker Compose, Nginx
- **Autenticación**: JWT con refresh tokens
- **Pagos**: PayPal SDK

## 📦 Instalación y Ejecución

### Requisitos Previos
- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)

### Ejecución con Docker (Recomendado)

```bash
# Clonar repositorio
cd chgaming-platform

# Dar permisos al script
chmod +x start.sh

# Ejecutar todo el sistema
./start.sh
```

El script:
1. Construye todas las imágenes Docker
2. Inicia PostgreSQL y Redis
3. Espera a que los servicios estén listos
4. Ejecuta migraciones de base de datos
5. Inserta datos iniciales (seed)
6. Inicia backend y frontend
7. Inicia Nginx como reverse proxy

### Acceso al Sistema

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| Frontend | http://localhost | - |
| Login Admin | http://localhost/login | admin@chgaming.com / admin123 |
| API | http://localhost/api | - |
| Health Check | http://localhost/health | - |
| PostgreSQL | localhost:5432 | postgres / postgres |
| Redis | localhost:6379 | password: redis123 |

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Backend (puerto 5000)
cd packages/server
npm run dev

# Frontend (puerto 3000)
cd apps/web
npm run dev
```

## 📊 Estructura del Proyecto

```
chgaming-platform/
├── apps/
│   ├── mobile/          # App React Native
│   └── web/             # Next.js frontend
├── packages/
│   ├── database/        # Migraciones y seeds SQL
│   ├── server/          # Backend Express
│   ├── ui/              # Componentes compartidos
│   └── utils/           # Utilidades compartidas
├── docker-compose.yml   # Orquestación Docker
├── nginx.conf           # Configuración Nginx
├── start.sh             # Script de inicio
└── README.md
```

## 🔐 Seguridad Implementada

- **Helmet.js**: Headers de seguridad HTTP
- **CORS**: Configuración estricta de orígenes
- **Rate Limiting**: Prevención de ataques DDoS (Redis distribuido)
- **BCrypt**: Hash de contraseñas con salt rounds
- **JWT**: Tokens firmados con expiración configurable
- **Validación Joi**: Sanitización de inputs
- **Nginx**: Reverse proxy con rate limiting adicional

## 🎯 Endpoints API Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Perfil actual
- `POST /api/auth/logout` - Cerrar sesión

### Torneos
- `GET /api/tournaments` - Listar torneos (con filtros)
- `GET /api/tournaments/:id` - Detalle de torneo
- `POST /api/tournaments` - Crear torneo (admin)
- `POST /api/tournaments/:id/register` - Inscribirse
- `POST /api/tournaments/:id/results` - Cargar resultados (admin)

### Productos
- `GET /api/products` - Catálogo de productos
- `GET /api/products/:id` - Detalle de producto
- `POST /api/products/purchase` - Comprar producto
- `GET /api/products/orders` - Historial de compras

### Ranking
- `GET /api/leaderboard/global` - Ranking global
- `GET /api/leaderboard/game/:game` - Ranking por juego
- `GET /api/leaderboard/user/:userId` - Posición de usuario

## 💰 Modelo de Monetización

1. **Membresías VIP**: Suscripción mensual con beneficios
2. **Comisión por Torneo**: Porcentaje del prize pool
3. **Publicidad Nativa**: Espacios en feed de torneos
4. **Margen en Tienda**: Diferencial en productos

## 📈 Sistema de Rachas

| Días Consecutivos | Multiplicador |
|-------------------|---------------|
| 1-2 días | 1.0x |
| 3-6 días | 1.5x |
| 7+ días | 2.0x |

## 🔔 Notificaciones Push

El sistema envía notificaciones segmentadas:
- Nuevos torneos del juego favorito del usuario
- Productos relacionados con su historial
- Recordatorios de torneos próximos
- Recompensas de rachas disponibles

## 📝 Variables de Entorno

Ver `.env.example` para referencia completa. Las principales:

```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/chgaming
REDIS_URL=redis://:redis123@redis:6379
JWT_SECRET=tu_secreto_super_seguro
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_CLIENT_SECRET=tu_client_secret
```

## 🧪 Testing

```bash
# Tests de backend
cd packages/server
npm test

# Tests de carga (simulación)
npm run load-test
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/amazing`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver LICENSE para detalles.

## 👨‍💻 Autor

ChGaming Team - Plataforma desarrollada para la comunidad gamer.

---

**¡Listo para competir! 🎮🏆**
