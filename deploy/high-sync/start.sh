#!/bin/sh
# ==================================================================
# start.sh – startet den Dienst und hält ihn aktuell.
#
# server.js liegt zweimal vor: einmal im Abbild (/app, beim Bauen
# hineinkopiert) und einmal im eingehängten Repo (/src, wird von der
# Selbstaktualisierung frisch gehalten). Diese Datei nimmt die aus dem
# Repo, sofern sie brauchbar ist, und beendet sich, sobald sie sich
# ändert. Docker startet den Container dann wegen
# «restart: unless-stopped» neu – mit dem neuen Stand.
#
# Warum nicht einfach neu bauen? Weil das ein Terminal bräuchte.
# So kommt ein neuer Dienst genauso von selbst an wie eine neue App.
#
# Zwei Sicherungen, damit daraus nie ein Ausfall wird:
#   · «node --check»: eine kaputte server.js wird nicht übernommen,
#     der Dienst läuft mit der letzten guten weiter.
#   · Die Kennung der Repo-Datei wird IMMER gemerkt, auch wenn sie
#     verworfen wurde – sonst beendete sich der Dienst endlos.
# ==================================================================
set -u

QUELLE="${QUELLE:-/src/server.js}"
ZIEL="${ZIEL:-/app/server.js}"
TAKT="${TAKT:-15}"

sage() { printf '[start] %s  %s\n' "$(date '+%d.%m. %H:%M:%S')" "$*"; }
kennung() { md5sum "$1" 2>/dev/null | cut -d' ' -f1; }

# Merken, bevor irgendetwas entschieden wird: sonst dreht sich der
# Dienst im Kreis, wenn die Datei aus dem Repo nicht übernommen wird.
GESEHEN="$(kennung "$QUELLE")"

if [ -n "$GESEHEN" ]; then
  if [ "$GESEHEN" = "$(kennung "$ZIEL")" ]; then
    :
  elif ! node --check "$QUELLE" >/dev/null 2>&1; then
    sage "server.js aus dem Repo ist fehlerhaft – es läuft die letzte gute weiter."
  elif cp -f "$QUELLE" "$ZIEL" 2>/dev/null; then
    sage "server.js aus dem Repo übernommen."
  else
    sage "server.js liess sich nicht übernehmen (kein Schreibrecht auf $ZIEL) – es läuft die aus dem Abbild."
  fi
fi

# Eine neue Abhängigkeit steckt im Abbild und kommt so nicht mit.
PAKET_NEU="$(dirname "$QUELLE")/package.json"
PAKET_ALT="$(dirname "$ZIEL")/package.json"
if [ -f "$PAKET_NEU" ] && [ -f "$PAKET_ALT" ] \
   && [ "$(kennung "$PAKET_NEU")" != "$(kennung "$PAKET_ALT")" ]; then
  sage "ACHTUNG: package.json hat sich geändert – dieser Stand braucht einen Neubau."
  sage "         Auf dem Server einmal:  bash <repo>/deploy/update.sh"
fi

node "$ZIEL" &
PID=$!

# Beim Beenden des Containers das Kind sauber mitnehmen, damit ein
# Neustart nicht auf einen belegten Port trifft.
trap 'kill "$PID" 2>/dev/null; wait "$PID" 2>/dev/null; exit 0' INT TERM

while kill -0 "$PID" 2>/dev/null; do
  sleep "$TAKT"
  NEU="$(kennung "$QUELLE")"
  if [ -n "$NEU" ] && [ "$NEU" != "$GESEHEN" ]; then
    sage "server.js hat sich geändert – der Dienst startet neu."
    kill "$PID" 2>/dev/null
    wait "$PID" 2>/dev/null
    exit 0
  fi
done

wait "$PID"
ENDE=$?
sage "der Dienst hat sich beendet (Code $ENDE) – Docker startet ihn neu."
exit "$ENDE"
