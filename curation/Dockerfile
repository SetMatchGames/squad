FROM trufflesuite/ganache-cli:latest

RUN mkdir /app
WORKDIR /app

COPY ./package.json ./package.json

RUN npm install

COPY . .
