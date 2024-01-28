FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json .env /app/
COPY node_modules /app/node_modules/
COPY server/dist  /app/server/dist/
COPY server/package*.json /app/server/
COPY server/node_modules /app/server/node_modules/

EXPOSE 3399
CMD ["npm", "run", "start"]
