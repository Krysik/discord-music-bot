FROM node:23.11-bookworm-slim AS base

WORKDIR /home/node/app
COPY package.json package-lock.json ./
# RUN chown -R node:node /opt/app

RUN apt-get -y update && \
  apt-get -y upgrade && \
  apt-get install -y ffmpeg make g++

# TODO: Fix permission issue [Error: EACCES: permission denied, rmdir '/opt/app/node_modules/.bin'] to use node user
# USER node

FROM base AS dev

ENV NODE_ENV=development
RUN npm ci --no-audit
COPY --chown=node:node . ./
CMD [ "npm", "run", "start" ]

FROM dev AS build
RUN npm run build

FROM base

ENV NODE_ENV=production
RUN npm ci --no-audit --omit=dev
COPY --chown=node:node --from=build /home/node/app/build ./

CMD ["node", "-r", "dotenv/config", "main.js"]
