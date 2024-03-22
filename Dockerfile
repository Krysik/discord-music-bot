FROM node:18.19.1-alpine3.19 as base

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
RUN npm ci --no-audit --omit=dev
COPY --chown=node:node --from=build /opt/app/build ./

CMD ["node", "-r", "dotenv/config", "main.js"]
