FROM node:16.13-alpine3.14

WORKDIR /opt/app
COPY package*.json ./

RUN apk add --update python3
ENV NODE_ENV=production

RUN npm install
COPY . .

USER node

CMD ["node", "src/main.js"]


