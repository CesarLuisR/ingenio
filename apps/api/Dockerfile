# ---- Deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=development
RUN npm install --include=dev

# ---- Dev ----
FROM node:20-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate

EXPOSE 5000
CMD ["sh", "-c", "until nc -z mongo 27017; do echo 'Esperando Mongo...'; sleep 2; done; until nc -z postgres 5432; do echo 'Esperando Postgres...'; sleep 2; done; npx prisma migrate deploy && npm run dev"]


