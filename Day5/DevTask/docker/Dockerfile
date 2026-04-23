FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./src
COPY jest.config.cjs ./
COPY .eslintrc.cjs ./
COPY tests ./tests
RUN npm test

FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
EXPOSE 3000
CMD ["node","src/server.js"]

