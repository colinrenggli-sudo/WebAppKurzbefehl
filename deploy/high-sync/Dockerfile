# Kleiner Dienst für HIGH: hält den Zustand der App und verschickt die Erinnerungen.
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server.js ./
ENV NODE_ENV=production
EXPOSE 8090
# Nicht als root laufen lassen; /data gehört dem Node-Benutzer.
USER node
CMD ["node", "server.js"]
