#!/bin/bash
# ==================================================================
# Prüft die beiden Skripte, die den Server ohne Terminal aktuell halten:
#
#   deploy/selbstupdate.sh      holt neue Stände aus GitHub
#   deploy/high-sync/start.sh   übernimmt eine neue server.js
#
# Ohne Docker: es wird ein echtes Git-Repo gebaut und «node» durch eine
# Attrappe ersetzt. Getestet wird das, was im Betrieb wehtut – dass
# nichts überfahren wird, dass ein kaputter Stand nicht übernommen wird
# und dass sich nichts im Kreis dreht.
#
#   bash tests/selbstupdate.test.sh
# ==================================================================
set -uo pipefail

REPO="$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)"
WURZEL="$(mktemp -d)"
trap 'pkill -P $$ 2>/dev/null; rm -rf "$WURZEL"' EXIT
FEHLER=0; ANZAHL=0

pruefe() { ANZAHL=$((ANZAHL+1))
  if [ "$2" = "$3" ]; then echo "ok: $1"
  else FEHLER=$((FEHLER+1)); printf 'FEHLT: %s\n   ist : %s\n   soll: %s\n' "$1" "$2" "$3"; fi; }
enthaelt() { ANZAHL=$((ANZAHL+1))
  if printf '%s' "$2" | grep -q -- "$3"; then echo "ok: $1"
  else FEHLER=$((FEHLER+1)); printf 'FEHLT: %s\n   «%s» kommt nicht vor in:\n%s\n' "$1" "$3" "$2"; fi; }
enthaelt_nicht() { ANZAHL=$((ANZAHL+1))
  if printf '%s' "$2" | grep -q -- "$3"; then FEHLER=$((FEHLER+1)); printf 'FEHLT: %s\n   «%s» kommt vor, soll aber nicht\n' "$1" "$3"
  else echo "ok: $1"; fi; }

warte_auf() { # datei  muster  sekunden
  local i=0
  while [ "$i" -lt "${3:-15}" ]; do
    grep -q -- "$2" "$1" 2>/dev/null && return 0
    sleep 1; i=$((i+1))
  done
  return 1
}

# ==================================================================
# Teil 1 – selbstupdate.sh
# ==================================================================
echo "--- selbstupdate.sh ---"

export GIT_AUTHOR_NAME=Test GIT_AUTHOR_EMAIL=test@test
export GIT_COMMITTER_NAME=Test GIT_COMMITTER_EMAIL=test@test

# Ein echtes «GitHub»: ein blankes Repo als Gegenstelle.
FERN="$WURZEL/fern.git"
git init --quiet --bare -b main "$FERN"

QUELL="$WURZEL/quelle"
git init --quiet -b main "$QUELL"
mkdir -p "$QUELL/deploy/high-sync"
cp "$REPO/deploy/selbstupdate.sh" "$QUELL/deploy/selbstupdate.sh"
echo "<html>eins</html>" > "$QUELL/index.html"
echo "FROM node:22-alpine" > "$QUELL/deploy/high-sync/Dockerfile"
git -C "$QUELL" add -A >/dev/null
git -C "$QUELL" commit --quiet -m "erster Stand"
git -C "$QUELL" remote add origin "$FERN"
git -C "$QUELL" push --quiet -u origin main

# Der «Server»: eine Arbeitskopie, die sich selbst aktuell hält.
SERVER="$WURZEL/server"
git clone --quiet "$FERN" "$SERVER"

LOG="$WURZEL/selbst.log"
SELBST_KOPIE="$WURZEL/selbst-kopie.sh" REPO="$SERVER" ZWEIG=main INTERVALL=1 \
  /bin/sh "$SERVER/deploy/selbstupdate.sh" > "$LOG" 2>&1 &
SELBST_PID=$!
sleep 2

# --- A: ein neuer Stand kommt von selbst an ---
echo "<html>zwei</html>" > "$QUELL/index.html"
git -C "$QUELL" commit --quiet -am "zweiter Stand"
git -C "$QUELL" push --quiet origin main
warte_auf "$LOG" "neuer Stand" 20
pruefe "A: neue index.html liegt auf dem Server" \
  "$(cat "$SERVER/index.html" 2>/dev/null)" "<html>zwei</html>"
enthaelt "A: der Wechsel steht im Log" "$(cat "$LOG")" "zweiter Stand"
enthaelt_nicht "A: kein Neubau verlangt, es war nur die App" "$(cat "$LOG")" "ACHTUNG"

# --- B: eine Änderung am Abbild wird gemeldet, nicht selbst gemacht ---
echo "FROM node:22-alpine" > "$QUELL/deploy/high-sync/Dockerfile"
echo "RUN echo neu" >> "$QUELL/deploy/high-sync/Dockerfile"
git -C "$QUELL" commit --quiet -am "Abbild geaendert"
git -C "$QUELL" push --quiet origin main
warte_auf "$LOG" "ACHTUNG" 20
enthaelt "B: Neubau wird verlangt" "$(cat "$LOG")" "braucht einen Neubau von Hand"
enthaelt "B: die Datei wird benannt" "$(cat "$LOG")" "deploy/high-sync/Dockerfile"
enthaelt "B: der nötige Befehl steht dabei" "$(cat "$LOG")" "deploy/update.sh"

# --- C: eigene Änderungen werden nicht überfahren ---
echo "von Hand geaendert" >> "$SERVER/index.html"
echo "<html>drei</html>" > "$QUELL/index.html"
git -C "$QUELL" commit --quiet -am "dritter Stand"
git -C "$QUELL" push --quiet origin main
warte_auf "$LOG" "HALT" 20
enthaelt "C: es hält an statt zu überfahren" "$(cat "$LOG")" "eigene Änderungen"
enthaelt "C: die Änderung von Hand steht noch da" \
  "$(cat "$SERVER/index.html")" "von Hand geaendert"
pruefe "C: der dritte Stand wurde NICHT geholt" \
  "$(grep -c 'dritter Stand' "$LOG")" "0"

# --- D: nach dem Aufräumen läuft es weiter ---
git -C "$SERVER" checkout --quiet -- index.html
warte_auf "$LOG" "dritter Stand" 20
pruefe "D: der dritte Stand kam nach dem Aufräumen an" \
  "$(cat "$SERVER/index.html" 2>/dev/null)" "<html>drei</html>"

# --- E: ändert sich das Skript selbst, startet es neu ---
printf '\n# Randnotiz fuer den Test\n' >> "$QUELL/deploy/selbstupdate.sh"
git -C "$QUELL" commit --quiet -am "Selbstaktualisierung erneuert"
git -C "$QUELL" push --quiet origin main
warte_auf "$LOG" "startet neu" 20
enthaelt "E: es startet sich selbst neu" "$(cat "$LOG")" "selbst erneuert"
sleep 3
kill -0 "$SELBST_PID" 2>/dev/null
pruefe "E: es läuft danach weiter" "$?" "0"
enthaelt "E: die neue Fassung ist in Betrieb" \
  "$(tail -3 "$LOG")" "Selbstaktualisierung läuft"

# --- F: ein neuer Stand kommt auch nach dem Neustart an ---
echo "<html>vier</html>" > "$QUELL/index.html"
git -C "$QUELL" commit --quiet -am "vierter Stand"
git -C "$QUELL" push --quiet origin main
warte_auf "$LOG" "vierter Stand" 20
pruefe "F: auch danach kommt Neues an" \
  "$(cat "$SERVER/index.html" 2>/dev/null)" "<html>vier</html>"

kill "$SELBST_PID" 2>/dev/null; wait "$SELBST_PID" 2>/dev/null

# ==================================================================
# Teil 2 – high-sync/start.sh
# ==================================================================
echo
echo "--- start.sh ---"

mkdir -p "$WURZEL/bin"
cat > "$WURZEL/bin/node" <<'ATTRAPPE'
#!/bin/sh
if [ "$1" = "--check" ]; then
  grep -q KAPUTT "$2" && exit 1
  exit 0
fi
echo "node startet mit: $(cat "$1")" >> "$NODE_LOG"
exec sleep 300
ATTRAPPE
chmod +x "$WURZEL/bin/node"
export PATH="$WURZEL/bin:$PATH"

neuer_dienst() { # ordnername
  local d="$WURZEL/$1"
  rm -rf "$d"; mkdir -p "$d/src" "$d/app"
  echo "alter Dienst" > "$d/app/server.js"
  echo '{"a":1}' > "$d/app/package.json"
  printf '%s' "$d"
}

start_dienst() { # ordner  logdatei
  NODE_LOG="$2.node" QUELLE="$1/src/server.js" ZIEL="$1/app/server.js" TAKT=1 \
    /bin/sh "$REPO/deploy/high-sync/start.sh" > "$2" 2>&1 &
  echo $!
}

# --- G: eine gute server.js aus dem Repo wird übernommen ---
D="$(neuer_dienst dienst1)"
echo "neuer Dienst" > "$D/src/server.js"
echo '{"a":1}' > "$D/src/package.json"
L="$WURZEL/start1.log"
P="$(start_dienst "$D" "$L")"
sleep 2
enthaelt "G: die neue server.js wird übernommen" "$(cat "$L")" "übernommen"
pruefe "G: sie liegt danach in /app" "$(cat "$D/app/server.js")" "neuer Dienst"
enthaelt "G: der Dienst läuft damit" "$(cat "$L.node" 2>/dev/null)" "neuer Dienst"
enthaelt_nicht "G: keine Warnung zu package.json" "$(cat "$L")" "package.json"

# --- H: ändert sie sich, beendet sich der Dienst für den Neustart ---
echo "noch neuerer Dienst" > "$D/src/server.js"
warte_auf "$L" "startet neu" 15
sleep 1
kill -0 "$P" 2>/dev/null
pruefe "H: der Prozess hat sich beendet (Docker startet neu)" "$?" "1"
enthaelt "H: der Grund steht im Log" "$(cat "$L")" "hat sich geändert"

# --- I: eine kaputte server.js wird NICHT übernommen ---
D="$(neuer_dienst dienst2)"
echo "KAPUTT (" > "$D/src/server.js"
L="$WURZEL/start2.log"
P="$(start_dienst "$D" "$L")"
sleep 3
enthaelt "I: sie wird als fehlerhaft erkannt" "$(cat "$L")" "fehlerhaft"
pruefe "I: in /app steht weiter die letzte gute" "$(cat "$D/app/server.js")" "alter Dienst"
enthaelt "I: der Dienst läuft mit der alten weiter" "$(cat "$L.node" 2>/dev/null)" "alter Dienst"
kill -0 "$P" 2>/dev/null
pruefe "I: und er dreht sich nicht im Kreis" "$?" "0"

# --- J: die reparierte Fassung wird dann übernommen ---
echo "repariert" > "$D/src/server.js"
warte_auf "$L" "startet neu" 15
enthaelt "J: die Reparatur löst den Neustart aus" "$(cat "$L")" "startet neu"
kill "$P" 2>/dev/null

D2="$(neuer_dienst dienst2b)"
echo "repariert" > "$D2/src/server.js"
L2="$WURZEL/start2b.log"
P2="$(start_dienst "$D2" "$L2")"
sleep 2
pruefe "J: danach läuft die reparierte Fassung" "$(cat "$D2/app/server.js")" "repariert"
kill "$P2" 2>/dev/null

# --- K: eine neue Abhängigkeit wird gemeldet ---
D="$(neuer_dienst dienst3)"
echo "gleicher Dienst" > "$D/src/server.js"
echo '{"a":2}' > "$D/src/package.json"
L="$WURZEL/start3.log"
P="$(start_dienst "$D" "$L")"
sleep 2
enthaelt "K: die geänderte package.json wird gemeldet" "$(cat "$L")" "braucht einen Neubau"
kill -0 "$P" 2>/dev/null
pruefe "K: der Dienst läuft trotzdem" "$?" "0"
kill "$P" 2>/dev/null

# --- L: ohne eingehängtes Repo läuft alles wie bisher ---
D="$(neuer_dienst dienst4)"
L="$WURZEL/start4.log"
P="$(start_dienst "$D" "$L")"
sleep 2
kill -0 "$P" 2>/dev/null
pruefe "L: ohne /src startet der Dienst normal" "$?" "0"
enthaelt "L: er läuft mit der Fassung aus dem Abbild" "$(cat "$L.node" 2>/dev/null)" "alter Dienst"
kill "$P" 2>/dev/null

echo
echo "==== $((ANZAHL-FEHLER))/$ANZAHL ===="
[ "$FEHLER" -eq 0 ] && echo "alles gut" || echo "$FEHLER Fehler"
exit $((FEHLER > 0))
