FROM node:16.18-alpine3.16 as base
# node:16.13-alpine3.14

WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN apk update && apk add --update python3
RUN chown -R node:node /opt/app
USER node

FROM base as build

RUN npm ci --no-audit
COPY --chown=node:node . ./
RUN npm run build

FROM base

ENV NODE_ENV=production
RUN npm ci --no-audit --only=production
COPY --chown=node:node --from=build /opt/app/build ./

ENTRYPOINT []
CMD ["node", "-r", "dotenv/config", "main.js"]
