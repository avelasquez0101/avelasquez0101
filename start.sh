#!/bin/bash

# ChGaming Platform - Startup Script
echo "🎮 Iniciando ChGaming Platform..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker no está corriendo. Por favor inicia Docker primero.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Construyendo contenedores...${NC}"
docker-compose build

echo -e "${BLUE}🗄️  Iniciando base de datos y Redis...${NC}"
docker-compose up -d postgres redis

echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos (15 segundos)...${NC}"
sleep 15

echo -e "${BLUE}📊 Ejecutando migraciones de base de datos...${NC}"
docker-compose run --rm server node packages/server/dist/scripts/migrate.js

echo -e "${BLUE}🌱 Insertando datos iniciales (seeds)...${NC}"
docker-compose run --rm server node packages/server/dist/scripts/seed.js

echo -e "${GREEN}🚀 Iniciando todos los servicios...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}✅ ¡ChGaming Platform está corriendo!${NC}"
echo ""
echo "📍 Accede a la aplicación:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost/api"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
echo ""
echo "🔑 Credenciales de administrador por defecto:"
echo "   Email: admin@chgaming.com"
echo "   Password: admin123"
echo ""
echo "Para ver los logs: docker-compose logs -f"
echo "Para detener: docker-compose down"
