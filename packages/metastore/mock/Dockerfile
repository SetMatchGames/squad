FROM node

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json /app

RUN npm install

COPY . .

ENV METASTORE_URL https://mock-metastore.azurewebsites.net/
EXPOSE 80

CMD npm run start