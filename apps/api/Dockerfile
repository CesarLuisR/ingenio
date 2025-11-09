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
RUN apk add --no-cache postgresql-client
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate

EXPOSE 5000
CMD ["sh", "-c", "until nc -z mongo 27017; do echo 'Esperando Mongo...'; sleep 2; done; until pg_isready -h postgres -p 5432 -U postgres; do echo 'Esperando Postgres (pg_isready)...'; sleep 2; done; npx prisma migrate deploy && npm run dev"]



