FROM node:23-bookworm-slim AS base

ARG PNPM_VERSION=10.33.2

WORKDIR /home/node/app
COPY package.json pnpm-lock.yaml ./

RUN apt-get -y update && \
  apt-get -y upgrade && \
  apt-get install -y ffmpeg make g++ && \
  corepack enable && \
  corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS dev

ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . ./
USER node
CMD ["node", "-r", "@swc-node/register", "-r", "dotenv/config", "src/main.ts"]

FROM dev AS build
RUN pnpm run build

FROM base AS release

ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod
COPY --chown=node:node --from=build /home/node/app/build ./
USER node

CMD ["node", "-r", "dotenv/config", "main.js"]
