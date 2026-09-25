#!/bin/sh
# ==================================================================
# selbstupdate.sh – der Server holt sich neue Stände von selbst.
#
# Läuft als eigener kleiner Container (Dienst «selbstupdate» in der
# docker-compose.yml) und tut genau eine Sache: alle paar Minuten
# «git pull». Mehr braucht es nicht, denn
#   · nginx liefert die App direkt aus diesem Verzeichnis aus –
#     eine neue index.html ist sofort die neue App, und die App holt
#     sie sich beim nächsten Öffnen selbst;
#   · high-sync liest seinen Code aus demselben Verzeichnis und
#     startet von allein neu, sobald server.js sich ändert.
#
# Damit ist für einen gewöhnlichen neuen Stand kein Terminal nötig.
#
# Bewusst NICHT hier drin: Docker steuern. Dieser Container hat
# keinen Zugriff auf den Docker-Socket. Etwas, das automatisch Code
# aus dem Netz holt, darf niemals auch den Server umbauen können.
# Die seltenen Fälle, die einen Neubau brauchen (neue Abhängigkeit,
# geänderte nginx.conf oder docker-compose.yml), meldet das Skript
# im Log – und deploy/update.sh erledigt sie dann mit einem Befehl.
# ==================================================================
set -u

# Das Skript liegt im Repo, das es selbst aktualisiert. Läuft es von
# dort, zieht git ihm beim Pull den Boden unter den Füssen weg – die
# Shell liest Skripte häppchenweise nach. Darum zuerst beiseitelegen.
KOPIE="${SELBST_KOPIE:-/tmp/selbstupdate.sh}"
case "$0" in
  "$KOPIE") ;;
  *) cp "$0" "$KOPIE" 2>/dev/null || exit 1
     exec /bin/sh "$KOPIE" "$@" ;;
esac

REPO="${REPO:-/repo}"
ZWEIG="${ZWEIG:-main}"
INTERVALL="${INTERVALL:-300}"
QUELLE="$REPO/deploy/selbstupdate.sh"

sage() { printf '%s  %s\n' "$(date '+%d.%m. %H:%M')" "$*"; }

# Der Ordner gehört dem Server, der Container läuft als root. Ohne diese
# Zeile verweigert git die Arbeit («dubious ownership»).
git config --global --add safe.directory "$REPO" 2>/dev/null || true

cd "$REPO" 2>/dev/null || { sage "FEHLER: $REPO gibt es nicht"; exit 1; }

eigen() { md5sum "$QUELLE" 2>/dev/null | cut -d' ' -f1; }
EIGEN_START="$(eigen)"

sage "Selbstaktualisierung läuft – Zweig $ZWEIG, alle $INTERVALL s"
GEMECKERT=""

while :; do
  # Von Hand geänderte Dateien niemals überfahren. Lieber gar nichts tun
  # und es sagen, als jemandem seine Änderung wegnehmen.
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    [ "$GEMECKERT" = "dreckig" ] || sage "HALT: im Verzeichnis stehen eigene Änderungen – es wird nichts geholt."
    GEMECKERT="dreckig"
    sleep "$INTERVALL"; continue
  fi

  HIER="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  if [ "$HIER" != "$ZWEIG" ]; then
    if git checkout --quiet "$ZWEIG" 2>/dev/null; then
      sage "auf $ZWEIG gewechselt (war: $HIER)"
    else
      [ "$GEMECKERT" = "zweig" ] || sage "HALT: konnte nicht auf $ZWEIG wechseln (steht auf $HIER)."
      GEMECKERT="zweig"
      sleep "$INTERVALL"; continue
    fi
  fi

  VORHER="$(git rev-parse HEAD 2>/dev/null)"

  if ! git fetch --quiet origin "$ZWEIG" 2>/dev/null; then
    [ "$GEMECKERT" = "netz" ] || sage "kein Netz oder GitHub nicht erreichbar – versuche es weiter"
    GEMECKERT="netz"
    sleep "$INTERVALL"; continue
  fi

  if ! git merge --quiet --ff-only "origin/$ZWEIG" 2>/dev/null; then
    [ "$GEMECKERT" = "merge" ] || sage "HALT: der Stand hier passt nicht mehr auf $ZWEIG – bitte einmal von Hand ansehen."
    GEMECKERT="merge"
    sleep "$INTERVALL"; continue
  fi

  NACHHER="$(git rev-parse HEAD 2>/dev/null)"
  GEMECKERT=""

  if [ "$VORHER" != "$NACHHER" ]; then
    sage "neuer Stand: $(git rev-parse --short "$VORHER") → $(git rev-parse --short "$NACHHER")"
    git --no-pager log --oneline "$VORHER..$NACHHER" 2>/dev/null | sed 's/^/    /'

    # Alles, was die App betrifft, ist damit schon live. Alles, was in
    # einem Abbild steckt, nicht – das muss gesagt werden, sonst läuft
    # der Server monatelang mit einem alten Dienst und niemand merkt es.
    NEUBAU="$(git diff --name-only "$VORHER..$NACHHER" -- \
      deploy/docker-compose.yml deploy/nginx.conf \
      deploy/high-sync/Dockerfile deploy/high-sync/package.json \
      deploy/high-sync/start.sh 2>/dev/null)"
    if [ -n "$NEUBAU" ]; then
      sage "ACHTUNG: dieser Stand braucht einen Neubau von Hand."
      printf '%s\n' "$NEUBAU" | sed 's/^/      /'
      sage "  Auf dem Server einmal:  bash $REPO/deploy/update.sh"
    fi

    # Hat sich dieses Skript selbst geändert, neu starten – sonst liefe
    # bis zum nächsten Neustart des Containers weiter die alte Fassung.
    if [ "$(eigen)" != "$EIGEN_START" ]; then
      sage "die Selbstaktualisierung wurde selbst erneuert – startet neu"
      exec /bin/sh "$QUELLE"
    fi
  fi

  sleep "$INTERVALL"
done
