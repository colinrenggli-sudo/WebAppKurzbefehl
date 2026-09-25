#!/bin/bash
# ==================================================================
# Prüft deploy/losgehts.sh – den einen Befehl, der auf dem Server
# alles erledigt. Ohne Docker: docker, curl und einrichten.sh werden
# durch Attrappen ersetzt, die mitschreiben statt zu handeln.
#
#   bash tests/losgehts.test.sh
#
# Wichtig ist vor allem, dass es nie still danebengeht: es muss das
# Verzeichnis finden, eigene Änderungen in Ruhe lassen, und am Ende
# den Schlüssel und den Link gross und lesbar ausgeben.
# ==================================================================
set -uo pipefail

QUELLE="$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)"
WURZEL="$(mktemp -d)"
trap 'rm -rf "$WURZEL"' EXIT
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

export GIT_AUTHOR_NAME=Test GIT_AUTHOR_EMAIL=test@test
export GIT_COMMITTER_NAME=Test GIT_COMMITTER_EMAIL=test@test

# ---- Attrappen ----
mkdir -p "$WURZEL/bin"
cat > "$WURZEL/bin/docker" <<'ATTRAPPE'
#!/bin/bash
echo "docker $*" >> "$ATTRAPPEN_LOG"
if [ "$1" = "inspect" ]; then
  [ -n "${ATTRAPPE_MOUNT:-}" ] && printf '%s\n' "$ATTRAPPE_MOUNT"
  exit 0
fi
if [ "$1" = "ps" ]; then
  [ "${ATTRAPPE_LAEUFT:-ja}" = "ja" ] && printf 'webapps\nhigh-sync\nhigh-selbstupdate\n'
  exit 0
fi
exit 0
ATTRAPPE
cat > "$WURZEL/bin/curl" <<'ATTRAPPE'
#!/bin/bash
echo "curl $*" >> "$ATTRAPPEN_LOG"
[ -n "${ATTRAPPE_GELIEFERT:-}" ] || exit 7
printf "const APP_VERSION = '%s';\n" "$ATTRAPPE_GELIEFERT"
ATTRAPPE
chmod +x "$WURZEL/bin/docker" "$WURZEL/bin/curl"
export PATH="$WURZEL/bin:$PATH"
export ATTRAPPEN_LOG="$WURZEL/attrappen.log"
export SUCHORTE="$WURZEL/suchen"
mkdir -p "$WURZEL/suchen"

# ---- Ein «Server»: blankes Repo als GitHub, dazu eine Arbeitskopie ----
FERN="$WURZEL/fern.git"
git init --quiet --bare -b main "$FERN"

baue_quelle() {
  local q="$WURZEL/quelle"
  rm -rf "$q"; mkdir -p "$q/deploy"
  printf "const APP_VERSION = '3.5.0';\n" > "$q/index.html"
  cat > "$q/deploy/einrichten.sh" <<'EIN'
#!/bin/bash
echo "einrichten $*" >> "$ATTRAPPEN_LOG"
echo "  [einrichten.sh lief mit: $1]"
exit "${ATTRAPPE_EINRICHTEN:-0}"
EIN
  # Wie im echten Repo (.gitignore:11): .env gehört nie in die Versionierung.
  echo "deploy/.env" > "$q/.gitignore"
  printf 'SYNC_TOKEN=GEHEIM123\nAPP_ADRESSE=https://routine.colin-renggli.ch\n' > "$q/deploy/.env"
  git -C "$q" init --quiet -b main
  git -C "$q" add -A >/dev/null
  git -C "$q" commit --quiet -m "Stand eins"
  git -C "$q" remote add origin "$FERN" 2>/dev/null
  git -C "$q" push --quiet -u origin main 2>/dev/null
  printf '%s' "$q"
}
Q="$(baue_quelle)"

neuer_server() { # zielordner
  rm -rf "$1"
  git clone --quiet "$FERN" "$1"
  printf 'SYNC_TOKEN=GEHEIM123\nAPP_ADRESSE=https://routine.colin-renggli.ch\n' > "$1/deploy/.env"
}

lauf() { # repo-pfad
  REPO_PFAD="$1" bash "$QUELLE/deploy/losgehts.sh" 2>&1
}

# ---- A: der gewöhnliche Fall ----
S="$WURZEL/server-a"; neuer_server "$S"
printf "const APP_VERSION = '3.6.0';\n" > "$Q/index.html"
git -C "$Q" commit --quiet -am "Stand zwei"; git -C "$Q" push --quiet origin main
: > "$ATTRAPPEN_LOG"
AUS="$(ATTRAPPE_GELIEFERT=3.6.0 lauf "$S")"
pruefe "A: läuft durch" "$?" "0"
enthaelt "A: das Verzeichnis wird genannt" "$AUS" "gefunden: $S"
enthaelt "A: der neue Stand wird geholt" "$AUS" "geholt:"
enthaelt "A: die Fassung wird genannt" "$AUS" "3.6.0"
enthaelt "A: einrichten.sh wird aufgerufen" "$(cat "$ATTRAPPEN_LOG")" "einrichten https://routine.colin-renggli.ch"
enthaelt "A: der Webserver wird nachgeprüft" "$AUS" "liefert Fassung 3.6.0 – passt"
enthaelt "A: die Selbstaktualisierung wird bestätigt" "$AUS" "hält sich ab jetzt selbst aktuell"
enthaelt "A: der Schlüssel steht gross da" "$AUS" "GEHEIM123"
enthaelt "A: der Link steht da" "$AUS" "https://routine.colin-renggli.ch/#s=GEHEIM123"
enthaelt "A: die vier Schritte fürs iPhone stehen da" "$AUS" "Datei importieren"
enthaelt "A: und die Warnung zum Weitergeben" "$AUS" "nicht weitergeben"
pruefe "A: der Stand ist wirklich angekommen" \
  "$(sed -n "s/.*'\([0-9.]*\)'.*/\1/p" "$S/index.html")" "3.6.0"

# ---- B: Verzeichnis nur über Docker auffindbar ----
S="$WURZEL/server-b"; neuer_server "$S"
: > "$ATTRAPPEN_LOG"
AUS="$(ATTRAPPE_MOUNT="$S" ATTRAPPE_GELIEFERT=3.6.0 bash "$QUELLE/deploy/losgehts.sh" 2>&1)"
pruefe "B: läuft durch" "$?" "0"
enthaelt "B: Docker verrät den Pfad" "$AUS" "gefunden: $S"
enthaelt "B: es wurde docker inspect benutzt" "$(cat "$ATTRAPPEN_LOG")" "docker inspect webapps"

# ---- C: eigene Änderungen werden nicht überfahren ----
S="$WURZEL/server-c"; neuer_server "$S"
echo "von Hand" >> "$S/index.html"
: > "$ATTRAPPEN_LOG"
AUS="$(ATTRAPPE_GELIEFERT=3.6.0 lauf "$S")"
pruefe "C: bricht ab" "$?" "1"
enthaelt "C: der Grund wird genannt" "$AUS" "Änderungen von Hand"
enthaelt "C: die Datei wird gezeigt" "$AUS" "index.html"
enthaelt "C: und wie man weiterkommt" "$AUS" "checkout -- ."
enthaelt "C: die Änderung steht noch da" "$(cat "$S/index.html")" "von Hand"
pruefe "C: einrichten.sh lief NICHT" "$(grep -c einrichten "$ATTRAPPEN_LOG")" "0"

# ---- D: einrichten.sh geht schief ----
S="$WURZEL/server-d"; neuer_server "$S"
AUS="$(ATTRAPPE_EINRICHTEN=1 ATTRAPPE_GELIEFERT=3.6.0 lauf "$S")"
pruefe "D: bricht ab" "$?" "1"
enthaelt "D: sagt, dass das Einrichten scheiterte" "$AUS" "nicht durchgelaufen"
enthaelt "D: und bittet um den Text" "$AUS" "zurückschicken"

# ---- E: der Webserver liefert noch die alte Fassung ----
S="$WURZEL/server-e"; neuer_server "$S"
AUS="$(ATTRAPPE_GELIEFERT=3.0.0 lauf "$S")"
pruefe "E: ist kein Abbruch" "$?" "0"
enthaelt "E: der Unterschied fällt auf" "$AUS" "liefert 3.0.0, im Verzeichnis liegt aber 3.6.0"
enthaelt "E: mit dem Befehl dagegen" "$AUS" "compose restart web"
enthaelt "E: der Schlüssel kommt trotzdem" "$AUS" "GEHEIM123"

# ---- F: der Webserver antwortet gar nicht ----
S="$WURZEL/server-f"; neuer_server "$S"
AUS="$(lauf "$S")"
pruefe "F: ist kein Abbruch" "$?" "0"
enthaelt "F: das Schweigen fällt auf" "$AUS" "antwortet nicht"
enthaelt "F: mit dem Weg zum Log" "$AUS" "logs --tail=40 web"

# ---- G: die Selbstaktualisierung läuft nicht ----
S="$WURZEL/server-g"; neuer_server "$S"
AUS="$(ATTRAPPE_LAEUFT=nein ATTRAPPE_GELIEFERT=3.6.0 lauf "$S")"
enthaelt "G: das fällt auf" "$AUS" "Selbstaktualisierung läuft nicht"
enthaelt "G: der Schlüssel kommt trotzdem" "$AUS" "GEHEIM123"

# ---- H: gar kein Verzeichnis zu finden ----
AUS="$(REPO_PFAD=/gibt/es/nicht bash "$QUELLE/deploy/losgehts.sh" 2>&1)"
pruefe "H: bricht ab" "$?" "1"
enthaelt "H: sagt es verständlich" "$AUS" "nicht zu finden"
enthaelt "H: nennt die durchsuchten Orte" "$AUS" "$WURZEL/suchen"
enthaelt "H: und was als Nächstes hilft" "$AUS" "docker ps"

# ---- I: zweiter Lauf ohne Neues ----
S="$WURZEL/server-i"; neuer_server "$S"
ATTRAPPE_GELIEFERT=3.6.0 lauf "$S" >/dev/null
AUS="$(ATTRAPPE_GELIEFERT=3.6.0 lauf "$S")"
pruefe "I: zweiter Lauf geht durch" "$?" "0"
enthaelt "I: er sagt, dass nichts Neues da war" "$AUS" "war schon aktuell"
enthaelt "I: und druckt den Schlüssel wieder" "$AUS" "GEHEIM123"

# ---- J: fehlt der Schlüssel, wird das gesagt statt leer zu drucken ----
S="$WURZEL/server-j"; neuer_server "$S"
: > "$S/deploy/.env"
AUS="$(ATTRAPPE_GELIEFERT=3.6.0 lauf "$S")"
enthaelt "J: fehlender Schlüssel wird benannt" "$AUS" "Kein SYNC_TOKEN in"
enthaelt "J: und wo man nachsieht" "$AUS" "cat .*deploy/.env"
enthaelt_nicht "J: und nicht als leerer Link getarnt" "$AUS" "#s=$"

echo
echo "==== $((ANZAHL-FEHLER))/$ANZAHL ===="
[ "$FEHLER" -eq 0 ] && echo "alles gut" || echo "$FEHLER Fehler"
exit $((FEHLER > 0))
