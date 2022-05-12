FROM node:16.13.2

WORKDIR /app

COPY . /app

# COPY package.json /app
# COPY package-lock.json /app

RUN npm install

EXPOSE 8000

CMD [ "npm", "start" ]