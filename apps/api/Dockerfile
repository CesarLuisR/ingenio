# 1. Base compartida (Node + Alpine)
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# 2. Dependencias (Cacheable)
FROM base AS deps
COPY package*.json ./
# Instalamos TODO para tener herramientas de desarrollo disponibles si se necesitan
RUN npm ci

# ==========================================
#  TARGET: DEVELOPMENT (Para ti y tus amigos)
# ==========================================
FROM base AS dev
ENV NODE_ENV=development
# Copiamos dependencias
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generamos prisma client
RUN npx prisma generate
EXPOSE 5000
# Comando con hot-reload (ajusta si usas nodemon o ts-node-dev)
CMD ["sh", "-c", "npx prisma db push && npm run dev"]

# ==========================================
#  TARGET: BUILDER (Solo para compilar)
# ==========================================
FROM deps AS builder
COPY . .
RUN npx prisma generate
RUN npm run build

# ==========================================
#  TARGET: PRODUCTION (Para el Servidor VPS)
# ==========================================
FROM base AS runner
ENV NODE_ENV=production
# Copiamos solo lo compilado y necesario
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Limpiamos dependencias de desarrollo para ahorrar espacio
RUN npm prune --production

EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]