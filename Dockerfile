FROM node:23.1.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3003

RUN npm run build
CMD ["node", ".output/server/index.mjs"]