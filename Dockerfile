FROM node:23-bookworm-slim AS base

ARG PNPM_VERSION=10.33.2

# apt and corepack need root, so they run before the user switch.
RUN apt-get -y update && \
  apt-get -y upgrade && \
  apt-get install -y ffmpeg make g++ && \
  corepack enable && \
  corepack prepare pnpm@${PNPM_VERSION} --activate

# WORKDIR would create this as root, leaving the `node` user unable to write in
# its own working directory - that breaks `pnpm run build` and any `pnpm
# install` inside a running container.
RUN mkdir -p /home/node/app && chown node:node /home/node/app

WORKDIR /home/node/app
USER node

COPY --chown=node:node package.json pnpm-lock.yaml ./

FROM base AS dev

ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . ./
CMD ["node", "-r", "@swc-node/register", "-r", "dotenv/config", "src/main.ts"]

FROM dev AS build
RUN pnpm run build

FROM base AS release

ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod
COPY --chown=node:node --from=build /home/node/app/build ./

CMD ["node", "-r", "dotenv/config", "main.js"]
