#!/bin/bash
# ==================================================================
# update.sh – holt den neuesten Stand aus GitHub
#
# Der Webserver liefert die Dateien direkt aus dem Arbeitsverzeichnis,
# für die Apps genügt also ein "git pull". Ändert sich etwas unter
# deploy/ (Dienst, nginx, compose), sagt das Skript Bescheid – neu
# gebaut wird bewusst von Hand, ein stündlicher Cron soll nicht
# unbeaufsichtigt alle Container neu starten.
#
# Von Hand:      bash deploy/update.sh
# Automatisch:   Unraid → Settings → User Scripts → neues Skript
#                mit dem Zeitplan "stündlich":
#                  bash /mnt/user/appdata/webapps/repo/deploy/update.sh
# ==================================================================
set -eu

cd "$(dirname "$(readlink -f "$0")")/.."

before=$(git rev-parse HEAD)

# Schlägt das Holen fehl – kein Netz, oder eine von Hand geänderte Datei
# steht im Weg –, darf das nicht still enden. Sonst läuft der Server
# monatelang auf einem alten Stand und niemand merkt es.
if ! git fetch --quiet origin main 2>/tmp/high-update.err; then
  echo "$(date '+%d.%m. %H:%M')  FEHLER: konnte nichts holen"
  sed 's/^/    /' /tmp/high-update.err
  exit 1
fi
git checkout --quiet main 2>/dev/null || true
if ! git pull --quiet --ff-only origin main 2>/tmp/high-update.err; then
  echo "$(date '+%d.%m. %H:%M')  FEHLER: Update nicht eingespielt"
  sed 's/^/    /' /tmp/high-update.err
  echo "    Meist steht eine von Hand geänderte Datei im Weg."
  echo "    Zeigen mit:  git -C \"$PWD\" status --short"
  exit 1
fi
after=$(git rev-parse HEAD)

if [ "$before" = "$after" ]; then
  echo "$(date '+%d.%m. %H:%M')  bereits aktuell ($(git rev-parse --short HEAD))"
  exit 0
fi

echo "$(date '+%d.%m. %H:%M')  aktualisiert: $(git rev-parse --short "$before") → $(git rev-parse --short "$after")"
git --no-pager log --oneline "$before..$after" | sed 's/^/    /'

# Die Apps sind damit schon aktuell. Der Dienst und die Container nicht:
# die stecken in Images, die gebaut werden müssen.
if ! git diff --quiet --name-only "$before..$after" -- deploy/; then
  echo
  echo "    ACHTUNG: unter deploy/ hat sich etwas geändert:"
  git --no-pager diff --name-only "$before..$after" -- deploy/ | sed 's/^/      /'
  echo "    Damit das wirksam wird, auf dem Server einmal:"
  echo "      cd \"$PWD/deploy\" && docker compose up -d --build"
fi
