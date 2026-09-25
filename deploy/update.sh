#!/bin/bash
# ==================================================================
# update.sh – holt den neuesten Stand aus GitHub und macht ihn scharf.
#
# Im Normalfall braucht es dieses Skript gar nicht: der Container
# «selbstupdate» holt neue Stände von selbst, nginx liefert die App
# direkt aus dem Verzeichnis und high-sync startet bei geänderter
# server.js von allein neu.
#
# Von Hand nötig ist es nur, wenn sich etwas ändert, das in einem
# Docker-Abbild steckt: eine neue Abhängigkeit (package.json), das
# Dockerfile, die nginx.conf oder die docker-compose.yml. Genau das
# sagt die Selbstaktualisierung dann auch im Log.
#
#   bash deploy/update.sh
# ==================================================================
set -eu

# Dieses Skript liegt in dem Repo, das es gleich aktualisiert. Bash
# liest Skripte häppchenweise nach – zöge git die Datei unter dem
# laufenden Prozess weg, führte er Bruchstücke aus. Also beiseitelegen.
if [ "${UPDATE_AUS_KOPIE:-}" != "ja" ]; then
  KOPIE="$(mktemp)"
  cat "$(readlink -f "$0")" > "$KOPIE"
  UPDATE_AUS_KOPIE=ja UPDATE_ORT="$(readlink -f "$0")" exec bash "$KOPIE" "$@"
fi

cd "$(dirname "${UPDATE_ORT:-$0}")/.."
REPO="$PWD"

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
  echo "    Zeigen mit:  git -C \"$REPO\" status --short"
  exit 1
fi
after=$(git rev-parse HEAD)

if [ "$before" = "$after" ]; then
  echo "$(date '+%d.%m. %H:%M')  bereits aktuell ($(git rev-parse --short HEAD))"
else
  echo "$(date '+%d.%m. %H:%M')  aktualisiert: $(git rev-parse --short "$before") → $(git rev-parse --short "$after")"
  git --no-pager log --oneline "$before..$after" | sed 's/^/    /'
fi

# Die App ist damit schon aktuell, und eine neue server.js übernimmt der
# Dienst von selbst. Alles, was in einem Abbild steckt, nicht – das wird
# hier gleich mit erledigt, statt es jemandem als Hausaufgabe zu geben.
# Steht dieselbe Fassung wie vorher da, wurde das Skript bewusst noch
# einmal aufgerufen – dann wird gebaut, denn meist ist genau das der
# zweite Versuch nach einem misslungenen ersten.
NEUBAU="ja"
if [ "$before" != "$after" ]; then
  if git diff --quiet --name-only "$before..$after" -- \
       deploy/docker-compose.yml deploy/nginx.conf \
       deploy/high-sync/Dockerfile deploy/high-sync/package.json \
       deploy/high-sync/start.sh deploy/selbstupdate.sh; then
    NEUBAU=""
  fi
fi

if [ -z "$NEUBAU" ]; then
  echo "    Nichts neu zu bauen – die Container laufen schon richtig."
  exit 0
fi

ADRESSE="$(sed -n 's|^APP_ADRESSE=||p' "$REPO/deploy/.env" 2>/dev/null | tail -1)"
echo
echo "$(date '+%d.%m. %H:%M')  Container werden neu gebaut und gestartet …"
# einrichten.sh kann als einziges Skript zuverlässig docker compose
# finden (auf Unraid liegt es nicht im Pfad) und es lässt vorhandene
# Schlüssel unangetastet. Darum diesen Weg und keinen eigenen.
exec bash "$REPO/deploy/einrichten.sh" ${ADRESSE:+"$ADRESSE"}
