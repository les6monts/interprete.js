FROM node:18

RUN mkdir -p /usr/src/bot

WORKDIR /usr/src/bot

#Installation de ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

COPY package.json /usr/src/bot

RUN npm install

COPY . /usr/src/bot

#Start the discord bot
CMD ["node", "src/index.js"]