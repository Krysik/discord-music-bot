FROM node:23-bookworm-slim AS base

WORKDIR /app

# Build tools needed for native modules (@discordjs/opus, @swc/core)
RUN apt-get -y update \
    && apt-get -y upgrade \
    && apt-get install -y ffmpeg make g++

# node:23 bundles corepack 0.32, which resolves the pnpm shim to bin/pnpm.cjs.
# pnpm 12 ships bin/pnpm.mjs instead, so the bundled corepack fails with
# MODULE_NOT_FOUND. Pinned rather than @latest because CI builds this image on
# deploy; bump it alongside "packageManager".
RUN npm install -g corepack@0.36.0 \
    && corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Bakes the version from package.json's "packageManager" field into the image,
# so the shim doesn't fetch pnpm on every container start.
RUN corepack install

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    pnpm install

COPY . .

CMD ["node", "-r", "@swc-node/register", "-r", "dotenv/config", "src/main.ts"]


FROM node:23-bookworm-slim AS builder

ENV NODE_ENV=production

WORKDIR /app

RUN npm install -g corepack@0.36.0 \
    && corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack install

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    pnpm install --prod --frozen-lockfile

RUN pnpm run build

FROM node:23-bookworm-slim as prod-runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/build ./build

CMD ["node", "-r", "dotenv/config", "main.js"]