FROM node:14.15.4-alpine

ADD . /lyrical_visual

WORKDIR /lyrical_visual

RUN npm install

ENV NODE_APP=app.js
ENV NODE_ENV=development

EXPOSE 5000

CMD ["npm", "start"]
