# Kleiner Dienst für HIGH: hält den Zustand der App und verschickt die Erinnerungen.
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server.js ./
COPY start.sh /start.sh
# /app muss dem Node-Benutzer gehören: start.sh legt dort die server.js
# ab, die es aus dem eingehängten Repo holt. Ohne Schreibrecht käme
# kein neuer Stand an, ohne dass jemand es merkt.
RUN chmod +x /start.sh && chown -R node:node /app
ENV NODE_ENV=production
EXPOSE 8090
# Nicht als root laufen lassen; /data gehört dem Node-Benutzer.
USER node
CMD ["/bin/sh", "/start.sh"]
