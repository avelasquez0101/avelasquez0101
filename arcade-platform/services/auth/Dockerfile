FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema para bcrypt
RUN apk add --no-cache python3 make g++

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Exponer puerto
EXPOSE 3001

# Comando para iniciar
CMD ["npm", "run", "dev"]
