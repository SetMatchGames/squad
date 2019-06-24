FROM trufflesuite/ganache-cli:latest

RUN mkdir /curation
WORKDIR /curation

COPY ./package.json ./package.json

RUN npm install

COPY . .
