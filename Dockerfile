FROM node:lts-alpine

RUN mkdir /app
WORKDIR /app

RUN apk add --no-cache git python build-base

RUN npm install -g lerna

COPY packages/metastore/clients/js packages/metastore/clients/js
COPY packages/curation-market/clients/js packages/curation-market/clients/js
COPY packages/squad-sdk/js packages/squad-sdk/js
COPY lerna.json lerna.json
COPY package.json package.json
RUN lerna bootstrap

ENV BROWSER none
ENV REACT_EDITOR none

COPY bootstrap.sh /bin/bootstrap.sh
ENTRYPOINT ["bootstrap.sh"]
