FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]