FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i --include=dev
ENV NODE_ENV=development
COPY . .
EXPOSE 8081
CMD ["npm", "run", "dev"]