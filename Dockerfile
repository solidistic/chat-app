FROM node:latest

COPY . /application
WORKDIR /application
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start"]
