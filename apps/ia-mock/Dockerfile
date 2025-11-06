FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=development
RUN npm ci --include=dev
COPY . .
EXPOSE 8081
CMD ["npm", "run", "dev"]