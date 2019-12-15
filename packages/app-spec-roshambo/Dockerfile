FROM node

RUN mkdir app
WORKDIR app

COPY package-lock.json package-lock.json

RUN npm install

COPY . .
