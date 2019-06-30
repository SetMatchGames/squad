FROM node:8.11.4

RUN npm install -g truffle

RUN mkdir /curation
WORKDIR /curation

COPY ./package.json ./package.json

RUN npm install

COPY . .

CMD npm run deploy-docker