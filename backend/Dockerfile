FROM node:20-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run prisma:generate \
    && npm run build \
    && mkdir -p dist/prisma \
    && cp -R prisma/generated dist/prisma/generated

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:push && node dist/src/main.js"]
