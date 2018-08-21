FROM node:slim
RUN npm install express cookie-parser request request-promise passport mongoose passport-jwt
RUN export NODE_PATH=.
COPY . ./
CMD ["node","src/server.js"]

