#!/bin/bash
# ==================================================================
# update.sh – holt den neuesten Stand aus GitHub
#
# Der Webserver liefert die Dateien direkt aus dem Arbeitsverzeichnis,
# ein "git pull" genügt also. Kein Neustart, kein Rebuild.
#
# Von Hand:      bash deploy/update.sh
# Automatisch:   Unraid → Settings → User Scripts → neues Skript
#                mit dem Zeitplan "stündlich":
#                  bash /mnt/user/appdata/webapps/repo/deploy/update.sh
# ==================================================================
set -eu

cd "$(dirname "$(readlink -f "$0")")/.."

before=$(git rev-parse HEAD)
git fetch --quiet origin main
git checkout --quiet main 2>/dev/null || true
git pull --quiet --ff-only origin main
after=$(git rev-parse HEAD)

if [ "$before" = "$after" ]; then
  echo "$(date '+%d.%m. %H:%M')  bereits aktuell ($(git rev-parse --short HEAD))"
else
  echo "$(date '+%d.%m. %H:%M')  aktualisiert: $(git rev-parse --short "$before") → $(git rev-parse --short "$after")"
  git --no-pager log --oneline "$before..$after" | sed 's/^/    /'
fi
