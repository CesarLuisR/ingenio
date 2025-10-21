FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npm install -g ts-node typescript
ENV NODE_ENV=development
ENV API=http://api:5000
COPY . .
CMD ["ts-node", "src/index.ts"]