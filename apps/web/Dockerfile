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
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
