#!/bin/bash
# ==================================================================
# einrichten.sh – richtet HIGH auf dem eigenen Server in einem Zug ein
#
#   bash deploy/einrichten.sh https://routine.colin-renggli.ch
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

# «routine.example.ch» ist als Adresse gemeint, nicht als Pfad. Ohne Schema
# entstünde sonst ein Link, den kein Browser öffnet.
case "$ADRESSE" in
  '' ) ;;
  http://*|https://* ) ;;
  * ) ADRESSE="https://$ADRESSE" ;;
esac
ADRESSE="${ADRESSE%/}"
UNSICHER=""
case "$ADRESSE" in http://* ) UNSICHER="ja" ;; esac

cd "$(dirname "$(readlink -f "$0")")"     # -> deploy/
ENVDATEI="$PWD/.env"

rot()  { printf '\033[31m%s\033[0m\n' "$*"; }
gruen(){ printf '\033[32m%s\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
schritt(){ printf '\n\033[1m%s\033[0m\n' "$*"; }

# ---------- 0. Werkzeuge ----------
schritt "0/6  Werkzeuge prüfen"
if ! command -v docker >/dev/null 2>&1; then
  rot "docker fehlt. Auf Unraid ist Docker unter Settings → Docker einzuschalten."
  exit 1
fi
# Docker Compose ist ein Zusatzteil von Docker und fehlt auf Unraid oft. Es
# ist eine einzelne Datei – die holen wir selbst, statt den Besitzer im
# App-Store danach suchen zu lassen. Sie liegt auf dem USB-Stick, damit sie
# einen Neustart übersteht; /root ist bei Unraid eine RAM-Disk.
# Auf Unraid liegt /boot auf dem USB-Stick und übersteht den Neustart. Gibt es
# das nicht (anderes System), tut es auch /usr/local/lib.
if [ -d /boot/config ] && [ -w /boot/config ]; then
  COMPOSE_ABLAGE="/boot/config/docker-compose/docker-compose"
else
  COMPOSE_ABLAGE="/usr/local/lib/docker/cli-plugins/docker-compose"
fi
COMPOSE_LINK="/root/.docker/cli-plugins/docker-compose"

if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1 && [ -x "$COMPOSE_ABLAGE" ]; then
  mkdir -p "$(dirname "$COMPOSE_LINK")"
  ln -sf "$COMPOSE_ABLAGE" "$COMPOSE_LINK"
fi

if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1; then
  info "docker compose fehlt – wird einmalig geholt (rund 60 MB) …"
  mkdir -p "$(dirname "$COMPOSE_ABLAGE")" "$(dirname "$COMPOSE_LINK")"
  if curl -fL --retry 3 -o "$COMPOSE_ABLAGE.tmp" \
       "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)"; then
    chmod +x "$COMPOSE_ABLAGE.tmp" && mv "$COMPOSE_ABLAGE.tmp" "$COMPOSE_ABLAGE"
    ln -sf "$COMPOSE_ABLAGE" "$COMPOSE_LINK"
    # Nach einem Neustart ist /root wieder leer – die Verknüpfung neu setzen.
    if [ -f /boot/config/go ] && ! grep -q 'cli-plugins/docker-compose' /boot/config/go; then
      printf '\n# Docker Compose nach dem Neustart wieder verfügbar machen\nmkdir -p %s\nln -sf %s %s\n' \
        "$(dirname "$COMPOSE_LINK")" "$COMPOSE_ABLAGE" "$COMPOSE_LINK" >> /boot/config/go
      info "und so eingetragen, dass es einen Neustart übersteht"
    fi
  else
    rm -f "$COMPOSE_ABLAGE.tmp"
    rot "docker compose fehlt und liess sich nicht holen."
    info "Entweder hat der Server gerade kein Netz, oder von Hand:"
    info "  Unraid → Apps → «Docker Compose Manager» installieren"
    exit 1
  fi
fi

if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  rot "docker compose ist da, lässt sich aber nicht aufrufen."
  info "Prüfen mit:  $COMPOSE_ABLAGE version"
  exit 1
fi
info "docker und $DC sind da"

# ---------- 1. Datenordner ----------
schritt "1/6  Datenordner $DATEN"
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
# Liegen im Datenordner schon Daten, hängen daran Geräte, die den bisherigen
# Schlüssel kennen. Neue Schlüssel sperren sie aus – das muss man wissen.
DATENSCHONDA=""
[ -f "$DATEN/state.json" ] || [ -f "$DATEN/subscriptions.json" ] && DATENSCHONDA="ja"
NEUE_SCHLUESSEL=""

schritt "2/6  Schlüssel in deploy/.env"
touch "$ENVDATEI"
chmod 600 "$ENVDATEI"

hat() { grep -q "^$1=..*" "$ENVDATEI"; }
setze() { grep -q "^$1=" "$ENVDATEI" && sed -i "s|^$1=.*|$1=$2|" "$ENVDATEI" || printf '%s=%s\n' "$1" "$2" >> "$ENVDATEI"; }
hole() { sed -n "s|^$1=||p" "$ENVDATEI" | tail -1; }

if hat SYNC_TOKEN; then
  info "SYNC_TOKEN ist schon da – bleibt, sonst wären verbundene Geräte draussen"
else
  setze SYNC_TOKEN "$(head -c 32 /dev/urandom | base64 | tr -d '=+/')"
  NEUE_SCHLUESSEL="ja"
  info "SYNC_TOKEN erzeugt"
fi

if hat VAPID_PUBLIC_KEY && hat VAPID_PRIVATE_KEY; then
  info "VAPID-Schlüssel sind schon da – bleiben, sonst kämen keine Erinnerungen mehr an"
else
  info "VAPID-Schlüssel werden erzeugt (dafür wird das Abbild einmal gebaut) …"
  if ! $DC build --quiet high-sync; then
    rot "Das Abbild liess sich nicht bauen."
    info "Von Hand ansehen, was Docker sagt:  cd $PWD && $DC build high-sync"
    exit 1
  fi
  # «|| true», damit ein Fehler im Container nicht set -e auslöst – sonst
  # bräche es hier wortlos ab und die Erklärung unten käme nie an.
  SCHLUESSEL="$($DC run --rm --no-deps -T high-sync \
    node -e "const k=require('web-push').generateVAPIDKeys();console.log(k.publicKey+' '+k.privateKey)" \
    2>/dev/null | tr -d '\r' | tail -1 || true)"
  OEFF="${SCHLUESSEL%% *}"; PRIV="${SCHLUESSEL##* }"
  if [ -z "$OEFF" ] || [ -z "$PRIV" ] || [ "$OEFF" = "$PRIV" ]; then
    rot "Die VAPID-Schlüssel liessen sich nicht erzeugen."
    info "Von Hand ansehen, was schiefgeht:"
    info "  cd $PWD && $DC run --rm --no-deps high-sync node -e \"console.log(require('web-push').generateVAPIDKeys())\""
    exit 1
  fi
  setze VAPID_PUBLIC_KEY "$OEFF"
  setze VAPID_PRIVATE_KEY "$PRIV"
  NEUE_SCHLUESSEL="ja"
  info "VAPID-Schlüssel erzeugt"
fi

# Apple will wissen, wer die Meldungen verschickt. Platzhalter lehnt es ab,
# darum aus der Adresse ableiten – die eigene Mailadresse darf jederzeit in
# .env dafür eingetragen werden.
if ! hat VAPID_SUBJECT; then
  if [ -n "$ADRESSE" ]; then
    HOST="$(printf '%s' "$ADRESSE" | sed -E 's|^https?://||; s|[:/].*$||')"
    # «routine.colin-renggli.ch» → «colin-renggli.ch», «colin-renggli.ch» bleibt stehen.
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
schritt "3/6  Container starten"
if ! $DC up -d --build; then
  rot "Die Container liessen sich nicht starten."
  info "Häufigste Gründe:"
  info "  · Port 8088 ist schon belegt, oder ein alter Container heisst «webapps»:"
  info "      docker rm -f webapps"
  info "  · Zu wenig Platz oder kein Netz zum Laden der Abbilder."
  info "Danach einfach noch einmal:  bash $0 ${ADRESSE:-}"
  info "Log ansehen:  cd $PWD && $DC logs --tail=40 high-sync web"
  exit 1
fi
info "gestartet"

# ---------- 4. Prüfen ----------
schritt "4/6  Prüfen"
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
# «push» meldet der Dienst erst, wenn web-push die Schlüssel wirklich
# angenommen hat; «subject» sagt, ob eine Absenderadresse hinterlegt ist.
# Ohne beides kommt keine Erinnerung an – auch wenn sonst alles läuft.
PUSHOK=""; SUBJOK=""
case "$GESUND" in *'"push":true'*) PUSHOK="ja" ;; esac
case "$GESUND" in *'"subject":true'*) SUBJOK="ja" ;; esac
if [ -n "$PUSHOK" ] && [ -n "$SUBJOK" ]; then
  gruen "  Abgleich und Erinnerungen sind bereit."
elif [ -n "$PUSHOK" ]; then
  rot "  Erinnerungen kommen nicht an: VAPID_SUBJECT fehlt in .env."
  info "Apple lehnt Meldungen ohne echte Absenderadresse ab. In $ENVDATEI:"
  info "    VAPID_SUBJECT=mailto:du@deine-adresse.ch"
  info "Danach:  cd $PWD && $DC up -d"
else
  rot "  Erinnerungen sind AUS."
  info "Der Dienst sagt warum: $GESUND"
  info "Meist stimmen die VAPID-Zeilen in $ENVDATEI nicht. Sie dürfen nur aus"
  info "dem erzeugten Schlüsselpaar bestehen, ohne Anführungszeichen."
fi

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
  if [ -n "$UNSICHER" ]; then
    info "Die App verbindet sich damit von selbst – Routinen, To-Dos und"
    info "Abgleich laufen."
    echo
    rot "  Über http gibt es KEINE Erinnerungen und keine Installation auf"
    rot "  dem Home-Bildschirm. iOS verlangt dafür https."
    info "Das hier ist also zum Ausprobieren. Für Erinnerungen:"
    info "  bash $0 https://routine.colin-renggli.ch"
  else
    info "Die App verbindet sich damit von selbst. Danach: Teilen → Zum"
    info "Home-Bildschirm, App von dort starten, dann Einstellungen →"
    info "«Erinnerungen aufs Gerät» einschalten."
  fi
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
  info "  bash $0 https://routine.colin-renggli.ch"
  info "Zum Ausprobieren im eigenen Netz geht auch schon jetzt:"
  info "  http://$(hostname -I 2>/dev/null | awk '{print $1}'):8088/  ·  Schlüssel: $TOKEN"
  info "  (über http laufen Abgleich und App, Erinnerungen aber nicht)"
fi

# Das Wichtigste zuletzt, damit es nicht nach oben wegrollt.
if [ -n "$NEUE_SCHLUESSEL" ] && [ -n "$DATENSCHONDA" ]; then
  echo
  rot "ACHTUNG: Es sind NEUE Schlüssel entstanden, obwohl auf dem Server"
  rot "         schon Daten liegen."
  info "Das passiert, wenn deploy/.env fehlte – etwa nach einem frischen"
  info "Klon des Repos. Deine Daten sind unberührt, aber jedes Gerät kennt"
  info "noch den alten Schlüssel und kommt ab jetzt nicht mehr durch:"
  info "kein Abgleich, keine Erinnerung, ohne Fehlermeldung am Telefon."
  echo
  info "Auf JEDEM Gerät den Link oben einmal öffnen, dann läuft es wieder."
  info "Die bisherigen Erinnerungs-Abos sind ebenfalls hinfällig; sie räumen"
  info "sich beim nächsten Einschalten des Schalters von selbst auf."
fi
