# ---- Deps ------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=development
RUN npm ci --include=dev

# ----- Dev ------
FROM node:20-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
