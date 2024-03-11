ARG NODE_VERSION=21.7.0
FROM node:${NODE_VERSION}-alpine as alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080
CMD npm start