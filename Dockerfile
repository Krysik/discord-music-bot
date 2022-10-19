FROM node:16.18-alpine3.16

WORKDIR /opt/app
COPY package*.json ./

RUN apk update && apk add make && apk add --update python3

ENV NODE_ENV=production

RUN npm ci --no-audit
COPY . .

USER node

CMD ["node", "src/main.js"]


