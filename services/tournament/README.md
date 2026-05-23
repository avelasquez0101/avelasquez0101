# 🏆 Tournament Service

Servicio de gestión de torneos para Arcade Platform. Maneja la creación, inscripción, brackets, y ejecución de torneos competitivos.

## Funcionalidades Principales

- ✅ Creación de torneos (formatos: Eliminación Directa, Round Robin)
- ✅ Inscripción y check-in de participantes
- ✅ Generación automática de brackets
- ✅ Reporte de resultados de partidas
- ✅ Sistema de disputas con revisión manual
- ✅ Avance automático de rondas
- ✅ Visualización de brackets en tiempo real
- ✅ Eventos asíncronos para notificaciones

## Endpoints API

### Públicos (usuario autenticado)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tournaments` | Listar torneos con filtros |
| GET | `/api/tournaments/:id` | Obtener detalles de torneo |
| GET | `/api/tournaments/:id/bracket` | Ver bracket completo |
| POST | `/api/tournaments/:id/register` | Registrarse en torneo |
| POST | `/api/tournaments/:id/checkin` | Hacer check-in |
| GET | `/api/matches/:matchId` | Ver detalles de partida |
| POST | `/api/matches/:matchId/report` | Reportar resultado |
| POST | `/api/matches/:matchId/dispute` | Abrir disputa |

### Administración (solo admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/tournaments` | Crear torneo |
| PUT | `/api/tournaments/:id` | Actualizar torneo |
| POST | `/api/tournaments/:id/cancel` | Cancelar torneo |
| POST | `/api/tournaments/:id/generate-bracket` | Iniciar torneo |

## Modelos de Datos

### Tournament
- `id`: UUID
- `name`: string
- `game`: string
- `format`: SINGLE_ELIMINATION | ROUND_ROBIN
- `status`: UPCOMING | CHECK_IN | IN_PROGRESS | COMPLETED | CANCELLED
- `maxParticipants`: int
- `prizePool`: int (Créditos Arcade)
- `startDate`: DateTime
- `checkInStart`: DateTime
- `checkInEnd`: DateTime

### Registration
- `userId`: string
- `tournamentId`: UUID
- `checkedIn`: boolean
- `seed`: int (posición en bracket)
- `finalPosition`: int

### Match
- `tournamentId`: UUID
- `round`: int
- `player1Id`, `player2Id`: string
- `winnerId`: string
- `player1Score`, `player2Score`: int
- `status`: PENDING | IN_PROGRESS | COMPLETED | DISPUTED

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servicio
npm run dev
```

## Variables de Entorno

Ver `.env.example` para configuración completa.

## Tests

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch
```

## Eventos Publicados

El servicio publica eventos a RabbitMQ:

- `tournament.created` - Nuevo torneo creado
- `tournament.started` - Torneo iniciado (bracket generado)
- `tournament.round_advanced` - Ronda completada, siguiente iniciada
- `tournament.completed` - Torneo finalizado
- `match.result_reported` - Resultado reportado

## Integración con Otros Servicios

- **Auth Service**: Validación de tokens JWT
- **Profile Service**: Obtener usernames, actualizar XP/créditos
- **Notification Service**: Emails de recordatorio y resultados

## Flujo de un Torneo

1. Admin crea torneo (estado: UPCOMING)
2. Usuarios se registran
3. 15 min antes: estado cambia a CHECK_IN
4. Usuarios hacen check-in
5. Hora de inicio: Admin genera bracket (estado: IN_PROGRESS)
6. Jugadores reportan resultados
7. Sistema avanza rondas automáticamente
8. Torneo completado (estado: COMPLETED)
9. Se asignan premios y posiciones finales
