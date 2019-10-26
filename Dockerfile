FROM node:lts-alpine

RUN mkdir /app
WORKDIR /app

RUN apk add --no-cache git python build-base

RUN npm install -g lerna

# copy in SDK dependencies
COPY packages/metastore/clients/js packages/metastore/clients/js
COPY packages/curation-market/clients/js packages/curation-market/clients/js
COPY packages/squad-sdk/js packages/squad-sdk/js
COPY lerna.json lerna.json
COPY package.json package.json

RUN lerna bootstrap

CMD lerna ls