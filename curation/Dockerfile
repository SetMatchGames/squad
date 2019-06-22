FROM trufflesuite/ganache-cli:latest

RUN npm i -g npm

COPY . ./squad-curation
WORKDIR ./squad-curation

RUN npm install --no-package-lock