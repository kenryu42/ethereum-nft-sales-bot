FROM node:16.16.0

WORKDIR /app

COPY package.json ./app
COPY . /app

RUN npm install
RUN npm run build

CMD [ "npm", "run", "start" ]
