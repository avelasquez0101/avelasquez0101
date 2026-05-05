#!/bin/bash

# ChGaming Platform - Startup Script
echo "🎮 Iniciando ChGaming Platform..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker no está corriendo. Por favor inicia Docker primero.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Construyendo contenedores...${NC}"
docker compose build || {
    echo -e "${RED}❌ Error al construir los contenedores${NC}"
    exit 1
}

echo -e "${BLUE}🗄️  Iniciando base de datos y Redis...${NC}"
docker compose up -d postgres redis

echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U postgres -d chgaming > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL está listo!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ PostgreSQL no respondió en 30 segundos${NC}"
        exit 1
    fi
    sleep 1
done

echo -e "${BLUE}📊 Ejecutando migraciones de base de datos...${NC}"
docker compose run --rm server node packages/server/src/scripts/migrate.js || echo -e "${YELLOW}⚠️ Migraciones fallaron, puede que ya existan las tablas${NC}"

echo -e "${BLUE}🌱 Insertando datos iniciales (seeds)...${NC}"
docker compose run --rm server node packages/server/src/scripts/seed.js || echo -e "${YELLOW}⚠️ Seeds fallaron, puede que ya existan los datos${NC}"

echo -e "${GREEN}🚀 Iniciando todos los servicios...${NC}"
docker compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Esperando a que los servicios inicien...${NC}"
sleep 10

echo ""
echo -e "${GREEN}✅ ¡ChGaming Platform está corriendo!${NC}"
echo ""
echo "📍 Accede a la aplicación:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:5000/api"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
echo ""
echo "🔑 Credenciales de administrador por defecto:"
echo "   Email: admin@chgaming.com"
echo "   Password: admin123"
echo ""
echo "Para ver los logs: docker compose logs -f"
echo "Para detener: docker compose down"
