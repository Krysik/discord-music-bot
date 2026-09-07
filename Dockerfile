# syntax=docker/dockerfile:1.7
FROM node:23-bookworm-slim AS pnpm-base

WORKDIR /app
RUN npm install -g corepack@0.36.0 \
    && corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack install

FROM pnpm-base AS build-base

RUN apt-get -y update \
    && apt-get install -y --no-install-recommends make g++ python3 \
    && rm -rf /var/lib/apt/lists/*


# Development image (docker-compose target). The whole repo is bind-mounted over
# /app, so this only needs the toolchain and the dependencies.
FROM build-base AS base

RUN apt-get -y update \
    && apt-get -y upgrade \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile

COPY . .

CMD ["node", "-r", "@swc-node/register", "-r", "dotenv/config", "src/main.ts"]


# Runtime dependencies only - this tree is what the final image ships.
FROM build-base AS prod-deps

RUN --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=locked \
    pnpm install --prod --frozen-lockfile


FROM build-base AS builder

RUN --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build


FROM node:23-bookworm-slim AS prod-runner

ENV NODE_ENV=production
RUN apt-get -y update \
    && apt-get -y upgrade \
    && apt-get install -y --no-install-recommends ffmpeg python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/build ./build
COPY --chown=node:node package.json ./

USER node

CMD ["node", "-r", "dotenv/config", "build/main.js"]
