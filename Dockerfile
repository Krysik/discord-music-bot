FROM node:16-alpine3.12

WORKDIR /opt/app
COPY package*.json .

RUN apt-get -y update \
  apt-get install -y ffmpeg

ENV NODE_ENV=production

RUN npm install
COPY . .

USER node

CMD ["node", "src/main.js"]


