FROM node:18.20-alpine3.19 AS base

WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN chown -R node:node /opt/app

RUN apk update && apk add python3 make g++
RUN npm i node-pre-gyp@0.17.0 node-gyp@7.1.2

# TODO: Fix permission issue [Error: EACCES: permission denied, rmdir '/opt/app/node_modules/.bin'] to use node user
# USER node

FROM base AS build

RUN npm ci --no-audit
COPY --chown=node:node . ./
RUN npm run build

FROM base

ENV NODE_ENV=production
RUN npm ci --no-audit --omit=dev
COPY --chown=node:node --from=build /opt/app/build ./

CMD ["node", "-r", "dotenv/config", "main.js"]
