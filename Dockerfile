FROM node:alpine

COPY ./ ./
RUN npm i --production

CMD ["node", "bin/www"]
