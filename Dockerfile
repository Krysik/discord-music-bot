FROM node:23.11-bookworm-slim AS base

WORKDIR /home/node/app
COPY package.json pnpm-lock.yaml ./
# RUN chown -R node:node /opt/app

RUN apt-get -y update && \
  apt-get -y upgrade && \
  apt-get install -y ffmpeg make g++ && \
  corepack enable

# TODO: Fix permission issue [Error: EACCES: permission denied, rmdir '/opt/app/node_modules/.bin'] to use node user
# USER node

FROM base AS dev

ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . ./
CMD ["pnpm", "run", "start"]

FROM dev AS build
RUN pnpm run build

FROM base

ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod
COPY --chown=node:node --from=build /home/node/app/build ./

CMD ["node", "-r", "dotenv/config", "main.js"]
