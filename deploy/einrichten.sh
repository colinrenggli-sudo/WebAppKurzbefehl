#!/bin/bash
# ==================================================================
# einrichten.sh – richtet HIGH auf dem eigenen Server in einem Zug ein
#
#   bash deploy/einrichten.sh https://routine.gymlinkapp.ch
#
# Legt den Datenordner an, erzeugt die Schlüssel, startet die Container
# und druckt am Ende einen Link. Diesen Link am iPhone öffnen – mehr
# ist an der App nicht zu tun.
#
# Mehrfaches Ausführen ist ungefährlich: vorhandene Schlüssel bleiben,
# wie sie sind. Sonst wären die schon verbundenen Geräte draussen.
# ==================================================================
set -euo pipefail

ADRESSE="${1:-}"
DATEN="${2:-/mnt/user/appdata/webapps/high-daten}"

cd "$(dirname "$(readlink -f "$0")")"     # -> deploy/
ENVDATEI="$PWD/.env"

rot()  { printf '\033[31m%s\033[0m\n' "$*"; }
gruen(){ printf '\033[32m%s\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
schritt(){ printf '\n\033[1m%s\033[0m\n' "$*"; }

# ---------- 0. Werkzeuge ----------
schritt "0/5  Werkzeuge prüfen"
if ! command -v docker >/dev/null 2>&1; then
  rot "docker fehlt. Auf Unraid ist Docker unter Settings → Docker einzuschalten."
  exit 1
fi
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  rot "docker compose fehlt. Auf Unraid: Apps → «Docker Compose Manager» installieren."
  exit 1
fi
info "docker und $DC sind da"

# ---------- 1. Datenordner ----------
schritt "1/5  Datenordner $DATEN"
mkdir -p "$DATEN"
# Der Dienst läuft im Container als Benutzer «node» (1000). Gehört der
# Ordner root, könnte er nichts schreiben – und das fiele erst am Handy auf.
if [ "$(id -u)" = "0" ]; then
  chown -R 1000:1000 "$DATEN"
  info "gehört jetzt 1000:1000"
else
  info "nicht als root – falls der Dienst später über Schreibrechte klagt:"
  info "  sudo chown -R 1000:1000 $DATEN"
fi

# ---------- 2. Schlüssel ----------
schritt "2/5  Schlüssel in deploy/.env"
touch "$ENVDATEI"
chmod 600 "$ENVDATEI"

hat() { grep -q "^$1=..*" "$ENVDATEI"; }
setze() { grep -q "^$1=" "$ENVDATEI" && sed -i "s|^$1=.*|$1=$2|" "$ENVDATEI" || printf '%s=%s\n' "$1" "$2" >> "$ENVDATEI"; }
hole() { sed -n "s|^$1=||p" "$ENVDATEI" | tail -1; }

if hat SYNC_TOKEN; then
  info "SYNC_TOKEN ist schon da – bleibt, sonst wären verbundene Geräte draussen"
else
  setze SYNC_TOKEN "$(head -c 32 /dev/urandom | base64 | tr -d '=+/')"
  info "SYNC_TOKEN erzeugt"
fi

if hat VAPID_PUBLIC_KEY && hat VAPID_PRIVATE_KEY; then
  info "VAPID-Schlüssel sind schon da – bleiben, sonst kämen keine Erinnerungen mehr an"
else
  info "VAPID-Schlüssel werden erzeugt (dafür wird das Abbild einmal gebaut) …"
  $DC build --quiet high-sync
  SCHLUESSEL="$($DC run --rm --no-deps -T high-sync \
    node -e "const k=require('web-push').generateVAPIDKeys();console.log(k.publicKey+' '+k.privateKey)" \
    | tr -d '\r' | tail -1)"
  OEFF="${SCHLUESSEL%% *}"; PRIV="${SCHLUESSEL##* }"
  if [ -z "$OEFF" ] || [ -z "$PRIV" ] || [ "$OEFF" = "$PRIV" ]; then
    rot "Die VAPID-Schlüssel liessen sich nicht erzeugen."
    info "Von Hand: $DC run --rm --no-deps high-sync node -e \"console.log(require('web-push').generateVAPIDKeys())\""
    exit 1
  fi
  setze VAPID_PUBLIC_KEY "$OEFF"
  setze VAPID_PRIVATE_KEY "$PRIV"
  info "VAPID-Schlüssel erzeugt"
fi

# Apple will wissen, wer die Meldungen verschickt. Platzhalter lehnt es ab,
# darum aus der Adresse ableiten – die eigene Mailadresse darf jederzeit in
# .env dafür eingetragen werden.
if ! hat VAPID_SUBJECT; then
  if [ -n "$ADRESSE" ]; then
    HOST="$(printf '%s' "$ADRESSE" | sed -E 's|^https?://||; s|[:/].*$||')"
    # «routine.gymlinkapp.ch» → «gymlinkapp.ch», «gymlinkapp.ch» bleibt stehen.
    # Bei einer blossen IP käme Unsinn heraus – dann lieber gar nichts.
    case "$HOST" in
      *[a-zA-Z]*.*)
        DOMAIN="$HOST"
        [ "$(printf '%s' "$HOST" | tr -cd . | wc -c)" -ge 2 ] && DOMAIN="${HOST#*.}"
        setze VAPID_SUBJECT "mailto:admin@$DOMAIN" ;;
      *) info "VAPID_SUBJECT noch offen – vor dem ersten Erinnern in .env eintragen." ;;
    esac
  else
    info "VAPID_SUBJECT noch offen – ohne öffentliche Adresse nicht ableitbar."
    info "Vor dem ersten Erinnern in .env eintragen: VAPID_SUBJECT=mailto:du@…"
  fi
fi
setze HIGH_DATA "$DATEN"
[ -n "$ADRESSE" ] && setze APP_ADRESSE "${ADRESSE%/}"
info "VAPID_SUBJECT = $(hole VAPID_SUBJECT)   (in .env auf die eigene Adresse ändern)"

# ---------- 3. Starten ----------
schritt "3/5  Container starten"
$DC up -d --build
info "gestartet"

# ---------- 4. Prüfen ----------
schritt "4/5  Prüfen"
GESUND=""
for i in $(seq 1 30); do
  if ANTWORT="$(curl -fsS -m 3 http://localhost:8088/api/health 2>/dev/null)"; then GESUND="$ANTWORT"; break; fi
  sleep 2
done
if [ -z "$GESUND" ]; then
  rot "Der Dienst antwortet nicht auf http://localhost:8088/api/health"
  info "Log ansehen:  cd $PWD && $DC logs --tail=40 high-sync web"
  exit 1
fi
info "Antwort: $GESUND"
case "$GESUND" in
  *'"push":true'*) gruen "  Abgleich und Erinnerungen sind bereit." ;;
  *) rot "  Erinnerungen sind AUS: die VAPID-Schlüssel in .env stimmen nicht." ;;
esac

# ---------- 5. Von aussen erreichbar? ----------
TOKEN="$(hole SYNC_TOKEN)"
ADRESSE="${ADRESSE:-$(hole APP_ADRESSE)}"
VONAUSSEN=""
if [ -n "$ADRESSE" ]; then
  schritt "5/6  Öffentliche Adresse prüfen"
  # Die Anfrage geht auch aus dem Heimnetz zu Cloudflare und von dort durch
  # den Tunnel zurück. Klappt sie hier, klappt sie auch vom Handy aus.
  if curl -fsS -m 15 "${ADRESSE%/}/api/health" >/dev/null 2>&1; then
    VONAUSSEN="ja"
    gruen "  $ADRESSE ist erreichbar."
  else
    rot "  $ADRESSE antwortet nicht."
    info "Der Dienst läuft (siehe oben) – es fehlt der Weg von aussen."
    info "In Cloudflare → Zero Trust → Networks → Tunnels → dein Tunnel →"
    info "Public Hostnames → Add:"
    info "    Subdomain: $(printf '%s' "$ADRESSE" | sed -E 's|^https?://||; s|\..*$||')"
    info "    Domain:    $(printf '%s' "$ADRESSE" | sed -E 's|^https?://[^.]*\.||; s|/.*$||')"
    info "    Service:   HTTP → webapps:8080"
    info "Taucht die Domain dort nicht auf, liegt sie nicht in diesem"
    info "Cloudflare-Konto. Läuft cloudflared noch nicht:"
    info "    cd $PWD && $DC --profile tunnel up -d"
  fi
fi

# ---------- 6. Link ----------
schritt "6/6  Fertig"
if [ -n "$ADRESSE" ]; then
  echo
  if [ -n "$VONAUSSEN" ]; then gruen "Diesen Link am iPhone in Safari öffnen:"
  else gruen "Diesen Link am iPhone in Safari öffnen, sobald der Eintrag oben steht:"; fi
  echo
  echo "    ${ADRESSE%/}/#s=$TOKEN"
  echo
  echo
  info "Die App verbindet sich damit von selbst. Danach: Teilen → Zum"
  info "Home-Bildschirm, App von dort starten, dann Einstellungen →"
  info "«Erinnerungen aufs Gerät» einschalten."
  echo
  info "iOS trennt Safari und die installierte App manchmal. Fragt die App"
  info "vom Home-Bildschirm noch nach dem Schlüssel, ist es dieser:"
  echo
  echo "    $TOKEN"
  echo
  info "Weder Link noch Schlüssel weitergeben – wer sie hat, kommt an deine Daten."
else
  echo
  info "Noch ohne öffentliche Adresse. Sobald der Cloudflare-Eintrag steht:"
  info "  bash deploy/einrichten.sh https://routine.gymlinkapp.ch"
  info "Zum Ausprobieren im eigenen Netz geht auch schon jetzt:"
  info "  http://$(hostname -I 2>/dev/null | awk '{print $1}'):8088/  ·  Schlüssel: $TOKEN"
  info "  (über http laufen Abgleich und App, Erinnerungen aber nicht)"
fi
