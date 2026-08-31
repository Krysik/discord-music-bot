FROM node:23-bookworm-slim AS base

ARG PNPM_VERSION=10.33.2

WORKDIR /app

# Build tools needed for native modules (@discordjs/opus, @swc/core)
RUN apt-get -y update \
    && apt-get -y upgrade \
    && apt-get install -y ffmpeg make g++ \
    && corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    pnpm install

COPY . .

CMD ["node", "-r", "@swc-node/register", "-r", "dotenv/config", "src/main.ts"]


FROM node:23-bookworm-slim AS builder

ENV NODE_ENV=production

WORKDIR /app

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    pnpm ci --prod

RUN pnpm run build

FROM node:23-bookworm-slim as prod-runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/build ./build

CMD ["node", "-r", "dotenv/config", "main.js"]