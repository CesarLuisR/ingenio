# 1. Base
FROM node:20-alpine AS base
WORKDIR /app

# 2. Dependencias
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ==========================================
#  TARGET: DEVELOPMENT (Para ti y tus amigos)
# ==========================================
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
# Vite server con host expuesto
CMD ["npm", "run", "dev", "--", "--host"]

# ==========================================
#  TARGET: BUILDER (Compilación)
# ==========================================
FROM deps AS builder
COPY . .
RUN npm run build

# ==========================================
#  TARGET: PRODUCTION (Nginx)
# ==========================================
FROM nginx:alpine AS runner
# Copiamos los estáticos compilados
COPY --from=builder /app/dist /usr/share/nginx/html
# Copiamos config de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]