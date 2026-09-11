#!/bin/bash
# Prüft deploy/einrichten.sh, ohne Docker: docker und curl werden durch
# Attrappen ersetzt, die mitschreiben statt zu handeln.
#
#   bash tests/einrichten.test.sh
#
# Wichtig ist vor allem eines: ein zweiter Lauf darf die Schlüssel NICHT
# neu erzeugen – sonst wären alle verbundenen Geräte draussen.
set -uo pipefail

REPO="$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)"
WURZEL="$(mktemp -d)"
trap 'rm -rf "$WURZEL"' EXIT
FEHLER=0; ANZAHL=0

pruefe() { # name  ist  soll
  ANZAHL=$((ANZAHL+1))
  if [ "$2" = "$3" ]; then echo "ok: $1"
  else FEHLER=$((FEHLER+1)); printf 'FEHLT: %s\n   ist : %s\n   soll: %s\n' "$1" "$2" "$3"; fi
}
enthaelt() { # name  text  muster
  ANZAHL=$((ANZAHL+1))
  if printf '%s' "$2" | grep -q "$3"; then echo "ok: $1"
  else FEHLER=$((FEHLER+1)); printf 'FEHLT: %s\n   «%s» kommt nicht vor\n' "$1" "$3"; fi
}

# ---- Arbeitskopie von deploy/, damit das Repo unberührt bleibt ----
cp -r "$REPO/deploy" "$WURZEL/deploy"
rm -f "$WURZEL/deploy/.env"
DATEN="$WURZEL/daten"

# ---- Attrappen ----
mkdir -p "$WURZEL/bin"
cat > "$WURZEL/bin/docker" <<'ATTRAPPE'
#!/bin/bash
echo "docker $*" >> "$ATTRAPPEN_LOG"
case "$1 ${2:-}" in
  "info ")            exit 0 ;;
  "compose version")  exit 0 ;;
esac
# Die Schlüsselerzeugung ist der einzige Aufruf, dessen Ausgabe zählt.
case "$*" in
  *"generateVAPIDKeys"*) echo "OEFFENTLICH-${RANDOM}${RANDOM} PRIVAT-${RANDOM}${RANDOM}"; exit 0 ;;
esac
exit 0
ATTRAPPE
cat > "$WURZEL/bin/curl" <<'ATTRAPPE'
#!/bin/bash
echo "curl $*" >> "$ATTRAPPEN_LOG"
# Die öffentliche Adresse antwortet nur, wenn ATTRAPPEN_OEFFENTLICH gesetzt ist.
case "$*" in
  *localhost*) cat "$ATTRAPPEN_GESUNDHEIT"; [ -s "$ATTRAPPEN_GESUNDHEIT" ] || exit 7; exit 0 ;;
  *) [ -n "${ATTRAPPEN_OEFFENTLICH:-}" ] || exit 7; echo '{"ok":true,"push":true,"subject":true}'; exit 0 ;;
esac
ATTRAPPE
chmod +x "$WURZEL/bin/docker" "$WURZEL/bin/curl"
export ATTRAPPEN_LOG="$WURZEL/aufrufe.log"
export ATTRAPPEN_GESUNDHEIT="$WURZEL/gesundheit.txt"
printf '{"ok":true,"push":true,"subject":true}' > "$ATTRAPPEN_GESUNDHEIT"
export PATH="$WURZEL/bin:$PATH"

# ---- Lauf 1: alles frisch ----
AUS1="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
RC1=$?
ENVD="$WURZEL/deploy/.env"
pruefe "erster Lauf geht durch" "$RC1" "0"
pruefe "Datenordner ist da" "$([ -d "$DATEN" ] && echo ja)" "ja"
pruefe ".env ist nur für dich lesbar" "$(stat -c '%a' "$ENVD")" "600"
TOKEN1="$(sed -n 's|^SYNC_TOKEN=||p' "$ENVD")"
OEFF1="$(sed -n 's|^VAPID_PUBLIC_KEY=||p' "$ENVD")"
pruefe "SYNC_TOKEN ist lang genug" "$([ ${#TOKEN1} -ge 32 ] && echo ja)" "ja"
enthaelt "VAPID-Schlüssel steht drin" "$OEFF1" "OEFFENTLICH-"
enthaelt "HIGH_DATA zeigt auf den Ordner" "$(cat "$ENVD")" "HIGH_DATA=$DATEN"
enthaelt "VAPID_SUBJECT ist gesetzt" "$(cat "$ENVD")" "^VAPID_SUBJECT=mailto:"
enthaelt "Container werden gestartet" "$(cat "$ATTRAPPEN_LOG")" "compose up -d --build"
enthaelt "der Link wird gedruckt" "$AUS1" "https://routine.colin-renggli.ch/#s=$TOKEN1"
enthaelt "und der Hinweis, ihn nicht weiterzugeben" "$AUS1" "weitergeben"
enthaelt "der Schlüssel steht auch einzeln da" "$AUS1" "^    $TOKEN1$"

# ---- Lauf 2: darf nichts Wichtiges anfassen ----
: > "$ATTRAPPEN_LOG"
AUS2="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
pruefe "zweiter Lauf geht durch" "$?" "0"
pruefe "SYNC_TOKEN bleibt gleich" "$(sed -n 's|^SYNC_TOKEN=||p' "$ENVD")" "$TOKEN1"
pruefe "VAPID-Schlüssel bleibt gleich" "$(sed -n 's|^VAPID_PUBLIC_KEY=||p' "$ENVD")" "$OEFF1"
pruefe "kein zweites Erzeugen" "$(grep -c generateVAPIDKeys "$ATTRAPPEN_LOG")" "0"
pruefe "genau ein SYNC_TOKEN in der Datei" "$(grep -c '^SYNC_TOKEN=' "$ENVD")" "1"
pruefe "genau ein HIGH_DATA in der Datei" "$(grep -c '^HIGH_DATA=' "$ENVD")" "1"

# ---- Öffentliche Adresse: nicht erreichbar → sagen, was fehlt ----
: > "$ATTRAPPEN_LOG"
AUS_ZU="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
pruefe "unerreichbare Adresse ist kein Abbruch" "$?" "0"
enthaelt "sie wird als solche gemeldet" "$AUS_ZU" "antwortet nicht"
enthaelt "mit der genauen Subdomain" "$AUS_ZU" "Subdomain: routine"
enthaelt "und der genauen Domain" "$AUS_ZU" "Domain:    colin-renggli.ch"
enthaelt "der Link kommt trotzdem" "$AUS_ZU" "#s=$TOKEN1"

# ---- Öffentliche Adresse: erreichbar ----
AUS_AUF="$(ATTRAPPEN_OEFFENTLICH=1 bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
enthaelt "erreichbare Adresse wird bestätigt" "$AUS_AUF" "ist erreichbar"
ANZAHL=$((ANZAHL+1))
if printf '%s' "$AUS_AUF" | grep -q "antwortet nicht"; then
  FEHLER=$((FEHLER+1)); echo "FEHLT: erreichbare Adresse wird trotzdem bemängelt"
else echo "ok: erreichbare Adresse wird nicht bemängelt"; fi

# ---- Lauf 3: ohne Adresse ----
AUS3="$(bash "$WURZEL/deploy/einrichten.sh" "" "$DATEN" 2>&1)"
enthaelt "ohne Argument wird die gemerkte Adresse genommen" "$AUS3" "https://routine.colin-renggli.ch/#s=$TOKEN1"

# ---- Lauf 4: Dienst antwortet nicht ----
: > "$ATTRAPPEN_GESUNDHEIT"
AUS4="$(TIMEOUT_KURZ=1 timeout 90 bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
RC4=$?
pruefe "stummer Dienst führt zu einem Fehler" "$([ "$RC4" -ne 0 ] && echo ja)" "ja"
enthaelt "und sagt, wo das Log steht" "$AUS4" "logs --tail"

# ---- Erinnerungen nicht wirklich bereit: das muss auffallen ----
printf '{"ok":true,"push":false,"pushFehler":"Vapid public key should be 65 bytes long when decoded."}' > "$ATTRAPPEN_GESUNDHEIT"
AUS_PUSH="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
enthaelt "kaputte Schlüssel werden gemeldet" "$AUS_PUSH" "Erinnerungen sind AUS"
ANZAHL=$((ANZAHL+1))
if printf '%s' "$AUS_PUSH" | grep -q "Erinnerungen sind bereit"; then
  FEHLER=$((FEHLER+1)); echo "FEHLT: es meldet trotzdem «bereit»"
else echo "ok: es meldet nicht «bereit»"; fi

printf '{"ok":true,"push":true,"subject":false}' > "$ATTRAPPEN_GESUNDHEIT"
AUS_SUBJ="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
enthaelt "fehlende Absenderadresse wird gemeldet" "$AUS_SUBJ" "VAPID_SUBJECT fehlt"
printf '{"ok":true,"push":true,"subject":true}' > "$ATTRAPPEN_GESUNDHEIT"

# ---- Neue Schlüssel auf vorhandene Daten: laute Warnung ----
printf '{"rev":1}' > "$DATEN/state.json"
rm -f "$ENVD"
AUS_NEU="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
enthaelt "neue Schlüssel auf alten Daten werden gemeldet" "$AUS_NEU" "NEUE Schlüssel"
enthaelt "und was dagegen zu tun ist" "$AUS_NEU" "JEDEM Gerät den Link"
TOKEN2="$(sed -n 's|^SYNC_TOKEN=||p' "$ENVD")"
ANZAHL=$((ANZAHL+1))
if [ "$TOKEN2" = "$TOKEN1" ]; then FEHLER=$((FEHLER+1)); echo "FEHLT: der Schlüssel hätte neu sein müssen"
else echo "ok: ohne .env entsteht ein neuer Schlüssel"; fi
rm -f "$DATEN/state.json" "$DATEN/subscriptions.json" "$ENVD"
AUS_FRISCH="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
ANZAHL=$((ANZAHL+1))
if printf '%s' "$AUS_FRISCH" | grep -q "NEUE Schlüssel"; then
  FEHLER=$((FEHLER+1)); echo "FEHLT: Warnung kommt auch ohne alte Daten"
else echo "ok: ohne alte Daten keine Warnung"; fi
TOKEN1="$(sed -n 's|^SYNC_TOKEN=||p' "$ENVD")"

# ---- http-Adresse: keine Versprechen über Erinnerungen ----
AUS_HTTP="$(ATTRAPPEN_OEFFENTLICH=1 bash "$WURZEL/deploy/einrichten.sh" http://192.168.1.50:8088 "$DATEN" 2>&1)"
enthaelt "über http wird klar gesagt, dass Erinnerungen fehlen" "$AUS_HTTP" "KEINE Erinnerungen"
ANZAHL=$((ANZAHL+1))
if printf '%s' "$AUS_HTTP" | grep -q "«Erinnerungen aufs Gerät» einschalten"; then
  FEHLER=$((FEHLER+1)); echo "FEHLT: über http wird trotzdem zum Einschalten aufgefordert"
else echo "ok: über http keine Aufforderung zum Einschalten"; fi

# ---- Adresse ohne Schema wird ergänzt ----
AUS_OHNE="$(ATTRAPPEN_OEFFENTLICH=1 bash "$WURZEL/deploy/einrichten.sh" routine.colin-renggli.ch "$DATEN" 2>&1)"
enthaelt "fehlendes https:// wird ergänzt" "$AUS_OHNE" "https://routine.colin-renggli.ch/#s="

# ---- Docker bricht bei der Schlüsselerzeugung ab ----
rm -f "$ENVD"
cat > "$WURZEL/bin/docker" <<'ATTRAPPE'
#!/bin/bash
case "$1 ${2:-}" in "info "|"compose version") exit 0 ;; esac
case "$*" in *generateVAPIDKeys*) echo "Error response from daemon: no such image" >&2; exit 125 ;; esac
exit 0
ATTRAPPE
chmod +x "$WURZEL/bin/docker"
AUS_KEY="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
pruefe "Fehler bei der Schlüsselerzeugung bricht ab" "$([ $? -ne 0 ] && echo ja)" "ja"
enthaelt "und erklärt es verständlich" "$AUS_KEY" "liessen sich nicht erzeugen"

# ---- Container starten nicht ----
cat > "$WURZEL/bin/docker" <<'ATTRAPPE'
#!/bin/bash
case "$1 ${2:-}" in "info "|"compose version") exit 0 ;; esac
case "$*" in
  *generateVAPIDKeys*) echo "OEFFENTLICH-1 PRIVAT-2"; exit 0 ;;
  *"up -d"*) echo "Bind for 0.0.0.0:8088 failed: port is already allocated" >&2; exit 1 ;;
esac
exit 0
ATTRAPPE
chmod +x "$WURZEL/bin/docker"
AUS_UP="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
pruefe "Startfehler bricht ab" "$([ $? -ne 0 ] && echo ja)" "ja"
enthaelt "und nennt den häufigsten Grund" "$AUS_UP" "schon belegt"

# ---- Schrittnummern laufen durch ----
cat > "$WURZEL/bin/docker" <<'ATTRAPPE'
#!/bin/bash
case "$1 ${2:-}" in "info "|"compose version") exit 0 ;; esac
case "$*" in *generateVAPIDKeys*) echo "OEFFENTLICH-1 PRIVAT-2"; exit 0 ;; esac
exit 0
ATTRAPPE
chmod +x "$WURZEL/bin/docker"
AUS_NR="$(ATTRAPPEN_OEFFENTLICH=1 bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
ANZAHL=$((ANZAHL+1))
NENNER="$(printf '%s' "$AUS_NR" | grep -oE '[0-9]/[0-9]' | cut -d/ -f2 | sort -u | tr -d '\n')"
if [ "$NENNER" = "6" ]; then echo "ok: alle Schritte zählen gegen denselben Nenner"
else FEHLER=$((FEHLER+1)); echo "FEHLT: Schrittzahlen springen (Nenner: $NENNER)"; fi

# ---- Lauf 5: kein docker compose ----
printf '{"ok":true,"push":true,"subject":true}' > "$ATTRAPPEN_GESUNDHEIT"
cat > "$WURZEL/bin/docker" <<'ATTRAPPE'
#!/bin/bash
[ "$1" = "info" ] && exit 0
exit 1
ATTRAPPE
chmod +x "$WURZEL/bin/docker"
# ---- Compose fehlt, lässt sich aber holen: das Skript muss weiterlaufen ----
# Genau der Fall vom Unraid-Server: die Datei kommt an, das Verknüpfen als
# Docker-Erweiterung scheitert (FAT kann keine Symlinks) – dann muss das
# Skript die Datei einfach direkt benutzen statt aufzugeben.
rm -f "$ENVD"
export COMPOSE_ABLAGE="$WURZEL/compose/docker-compose"
cat > "$WURZEL/bin/docker" <<'ATTRAPPE'
#!/bin/bash
echo "docker $*" >> "$ATTRAPPEN_LOG"
[ "$1" = "info" ] && exit 0
# «docker compose» gibt es hier nie – wie auf einem Unraid ohne Plugin
[ "$1" = "compose" ] && exit 1
exit 0
ATTRAPPE
chmod +x "$WURZEL/bin/docker"
cat > "$WURZEL/bin/curl" <<'ATTRAPPE'
#!/bin/bash
echo "curl $*" >> "$ATTRAPPEN_LOG"
case "$*" in *docker/compose/releases*)
  ZIEL=""; for a in "$@"; do [ "$MERK" = "o" ] && ZIEL="$a"; MERK=""; [ "$a" = "-o" ] && MERK="o"; done
  {
    echo '#!/bin/bash'
    echo 'case "$1" in version) echo "Docker Compose version v2.99.0";; esac'
    echo 'case "$*" in *generateVAPIDKeys*) echo "GEHOLT-OEFF-1 GEHOLT-PRIV-2";; esac'
    echo 'exit 0'
  } > "$ZIEL"
  exit 0 ;;
esac
case "$*" in
  *localhost*) cat "$ATTRAPPEN_GESUNDHEIT"; [ -s "$ATTRAPPEN_GESUNDHEIT" ] || exit 7; exit 0 ;;
  *) [ -n "${ATTRAPPEN_OEFFENTLICH:-}" ] || exit 7; echo '{"ok":true,"push":true,"subject":true}'; exit 0 ;;
esac
ATTRAPPE
chmod +x "$WURZEL/bin/curl"
AUS_HOL="$(ATTRAPPEN_OEFFENTLICH=1 bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
pruefe "fehlendes Compose wird geholt und das Skript läuft weiter" "$?" "0"
enthaelt "es sagt, dass es geholt wird" "$AUS_HOL" "wird einmalig geholt"
enthaelt "und kommt bis zum Schluss" "$AUS_HOL" "6/6  Fertig"
pruefe "die Datei liegt am vorgegebenen Ort" "$([ -x "$COMPOSE_ABLAGE" ] && echo ja)" "ja"
unset COMPOSE_ABLAGE

# curl darf den Download nicht liefern, sonst würde das Skript hier wirklich
# etwas herunterladen. Also scheitern lassen.
cat > "$WURZEL/bin/curl" <<'ATTRAPPE'
#!/bin/bash
echo "curl $*" >> "$ATTRAPPEN_LOG"
case "$*" in *docker/compose/releases*) exit 22 ;; esac
case "$*" in
  *localhost*) cat "$ATTRAPPEN_GESUNDHEIT"; [ -s "$ATTRAPPEN_GESUNDHEIT" ] || exit 7; exit 0 ;;
  *) [ -n "${ATTRAPPEN_OEFFENTLICH:-}" ] || exit 7; echo '{"ok":true,"push":true,"subject":true}'; exit 0 ;;
esac
ATTRAPPE
chmod +x "$WURZEL/bin/curl"
AUS5="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.colin-renggli.ch "$DATEN" 2>&1)"
pruefe "ohne docker compose bricht es ab" "$([ $? -ne 0 ] && echo ja)" "ja"
enthaelt "es versucht zuerst, es selbst zu holen" "$AUS5" "wird einmalig geholt"
enthaelt "und nennt sonst den Weg von Hand" "$AUS5" "Docker Compose Manager"

echo
if [ "$FEHLER" -gt 0 ]; then echo "$FEHLER von $ANZAHL Prüfungen fehlgeschlagen"; exit 1; fi
echo "alle $ANZAHL Prüfungen bestanden"
