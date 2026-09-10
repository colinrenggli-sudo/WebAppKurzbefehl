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
cat "$ATTRAPPEN_GESUNDHEIT"
[ -s "$ATTRAPPEN_GESUNDHEIT" ] || exit 7
exit 0
ATTRAPPE
chmod +x "$WURZEL/bin/docker" "$WURZEL/bin/curl"
export ATTRAPPEN_LOG="$WURZEL/aufrufe.log"
export ATTRAPPEN_GESUNDHEIT="$WURZEL/gesundheit.txt"
printf '{"ok":true,"push":true}' > "$ATTRAPPEN_GESUNDHEIT"
export PATH="$WURZEL/bin:$PATH"

# ---- Lauf 1: alles frisch ----
AUS1="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.gymlinkapp.ch "$DATEN" 2>&1)"
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
enthaelt "der Link wird gedruckt" "$AUS1" "https://routine.gymlinkapp.ch/#s=$TOKEN1"
enthaelt "und der Hinweis, ihn nicht weiterzugeben" "$AUS1" "nicht weitergeben"

# ---- Lauf 2: darf nichts Wichtiges anfassen ----
: > "$ATTRAPPEN_LOG"
AUS2="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.gymlinkapp.ch "$DATEN" 2>&1)"
pruefe "zweiter Lauf geht durch" "$?" "0"
pruefe "SYNC_TOKEN bleibt gleich" "$(sed -n 's|^SYNC_TOKEN=||p' "$ENVD")" "$TOKEN1"
pruefe "VAPID-Schlüssel bleibt gleich" "$(sed -n 's|^VAPID_PUBLIC_KEY=||p' "$ENVD")" "$OEFF1"
pruefe "kein zweites Erzeugen" "$(grep -c generateVAPIDKeys "$ATTRAPPEN_LOG")" "0"
pruefe "genau ein SYNC_TOKEN in der Datei" "$(grep -c '^SYNC_TOKEN=' "$ENVD")" "1"
pruefe "genau ein HIGH_DATA in der Datei" "$(grep -c '^HIGH_DATA=' "$ENVD")" "1"

# ---- Lauf 3: ohne Adresse ----
AUS3="$(bash "$WURZEL/deploy/einrichten.sh" "" "$DATEN" 2>&1)"
enthaelt "ohne Argument wird die gemerkte Adresse genommen" "$AUS3" "https://routine.gymlinkapp.ch/#s=$TOKEN1"

# ---- Lauf 4: Dienst antwortet nicht ----
: > "$ATTRAPPEN_GESUNDHEIT"
AUS4="$(TIMEOUT_KURZ=1 timeout 90 bash "$WURZEL/deploy/einrichten.sh" https://routine.gymlinkapp.ch "$DATEN" 2>&1)"
RC4=$?
pruefe "stummer Dienst führt zu einem Fehler" "$([ "$RC4" -ne 0 ] && echo ja)" "ja"
enthaelt "und sagt, wo das Log steht" "$AUS4" "logs --tail"

# ---- Lauf 5: kein docker compose ----
printf '{"ok":true,"push":true}' > "$ATTRAPPEN_GESUNDHEIT"
cat > "$WURZEL/bin/docker" <<'ATTRAPPE'
#!/bin/bash
[ "$1" = "info" ] && exit 0
exit 1
ATTRAPPE
chmod +x "$WURZEL/bin/docker"
AUS5="$(bash "$WURZEL/deploy/einrichten.sh" https://routine.gymlinkapp.ch "$DATEN" 2>&1)"
pruefe "ohne docker compose bricht es ab" "$([ $? -ne 0 ] && echo ja)" "ja"
enthaelt "und sagt, was zu installieren ist" "$AUS5" "Docker Compose Manager"

echo
if [ "$FEHLER" -gt 0 ]; then echo "$FEHLER von $ANZAHL Prüfungen fehlgeschlagen"; exit 1; fi
echo "alle $ANZAHL Prüfungen bestanden"
