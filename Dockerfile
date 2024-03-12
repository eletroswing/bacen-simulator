ARG NODE_VERSION=21.7.0
FROM node:${NODE_VERSION}-alpine as alpine
WORKDIR /usr/src/app

COPY . .
RUN npm install

ENV PORT=8080

EXPOSE 8080
CMD npm start