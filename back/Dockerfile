FROM node:18.18.2
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
ENTRYPOINT [ "npm" ]
CMD [ "run", "start" ]
