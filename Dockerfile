FROM node:20-bookworm-slim

RUN apt-get update
RUN apt-get --assume-yes --no-install-recommends install chromium && apt-get clean

WORKDIR /app

ENV NODE_ENV=production
ENV PUPPETEER_CACHE_DIR=/app/puppeteer
ENV PUPPETEER_TMP_DIR=/tmp/.puppeteer
ENV XDG_CONFIG_HOME=/tmp/.chromium
ENV XDG_CACHE_HOME=/tmp/.chromium

COPY package*.json .env /app/
COPY node_modules /app/node_modules/
COPY server/dist  /app/server/dist/
COPY server/package*.json /app/server/
COPY server/node_modules /app/server/node_modules/
COPY .cache/puppeteer /app/puppeteer/

EXPOSE 3399
CMD ["npm", "run", "start"]
