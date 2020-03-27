FROM node

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY . .

ENV METASTORE_PORT 80
EXPOSE 80

CMD npm run start