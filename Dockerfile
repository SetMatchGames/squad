FROM node:lts-alpine

RUN mkdir /app
WORKDIR /app

RUN apk add --no-cache git python build-base

RUN npm install -g lerna

COPY lerna.json lerna.json
COPY package.json package.json

# This is a dev environment container.
# All packages are mounted in

ENV BROWSER none
ENV REACT_EDITOR none

COPY bootstrap.sh /bin/bootstrap.sh
ENTRYPOINT ["bootstrap.sh"]
