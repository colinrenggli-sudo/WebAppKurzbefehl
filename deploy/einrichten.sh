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
# App-Store danach suchen zu lassen.
# Auf Unraid liegt /boot auf dem USB-Stick und übersteht den Neustart. Gibt es
# das nicht (anderes System), tut es auch /usr/local/lib.
if [ -n "${COMPOSE_ABLAGE:-}" ]; then
  : # von aussen vorgegeben (Tests)
elif [ -d /boot/config ] && [ -w /boot/config ]; then
  COMPOSE_ABLAGE="/boot/config/docker-compose/docker-compose"
else
  COMPOSE_ABLAGE="/usr/local/lib/docker/cli-plugins/docker-compose"
fi

# Docker findet Erweiterungen in mehreren Ordnern. Wir legen dort eine Kopie
# ab – immer kopieren, nie verknüpfen: die dauerhafte Ablage liegt bei Unraid
# auf dem USB-Stick, und ein FAT-Dateisystem kennt kein Ausführungsrecht. Eine
# Verknüpfung dorthin wäre da, liesse sich aber nicht starten.
COMPOSE_LAUF=""
compose_verdrahten() {
  quelle="$1"
  [ -s "$quelle" ] || return 1
  for ziel in /usr/local/lib/docker/cli-plugins /usr/lib/docker/cli-plugins /root/.docker/cli-plugins; do
    mkdir -p "$ziel" 2>/dev/null || continue
    cp -f "$quelle" "$ziel/docker-compose" 2>/dev/null || continue
    chmod +x "$ziel/docker-compose" 2>/dev/null || true
    # Erst wenn es sich dort wirklich starten lässt, gilt es als eingerichtet.
    if "$ziel/docker-compose" version >/dev/null 2>&1; then
      COMPOSE_LAUF="$ziel/docker-compose"
      return 0
    fi
  done
  return 1
}

compose_da() { docker compose version >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1; }

# Schon einmal geholt? Dann nur noch eine lauffähige Kopie anlegen.
if ! compose_da && [ -s "$COMPOSE_ABLAGE" ]; then
  compose_verdrahten "$COMPOSE_ABLAGE" || true
fi

if ! compose_da && [ -z "$COMPOSE_LAUF" ]; then
  info "docker compose fehlt – wird einmalig geholt (rund 60 MB) …"
  COMPOSE_TMP="/tmp/docker-compose.$$"
  if curl -fL --retry 3 -o "$COMPOSE_TMP" \
       "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
     && compose_verdrahten "$COMPOSE_TMP"; then
    # Für das nächste Mal aufheben. Klappt das nicht, ist es nicht schlimm –
    # dann wird beim nächsten Lauf eben noch einmal geladen.
    mkdir -p "$(dirname "$COMPOSE_ABLAGE")" 2>/dev/null || true
    cp -f "$COMPOSE_TMP" "$COMPOSE_ABLAGE" 2>/dev/null || true
    rm -f "$COMPOSE_TMP"
  else
    rm -f "$COMPOSE_TMP"
    rot "docker compose fehlt und liess sich nicht einrichten."
    info "Entweder hat der Server gerade kein Netz, oder von Hand:"
    info "  Unraid → Apps → «Docker Compose Manager» installieren"
    exit 1
  fi
fi

if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
elif [ -n "$COMPOSE_LAUF" ]; then
  DC="$COMPOSE_LAUF"
else
  rot "docker compose liess sich nicht einrichten."
  info "Von Hand prüfen:  /usr/local/lib/docker/cli-plugins/docker-compose version"
  info "Oder: Unraid → Apps → «Docker Compose Manager» installieren"
  exit 1
fi

# Nach einem Neustart ist /usr/local wieder leer (RAM-Disk). Einmal eintragen,
# damit die Verknüpfung von selbst wieder entsteht.
case "$COMPOSE_ABLAGE" in
  /boot/*)
    if [ -f /boot/config/go ] && ! grep -q 'cli-plugins/docker-compose' /boot/config/go 2>/dev/null; then
      {
        printf '\n# Docker Compose nach dem Neustart wieder verfügbar machen\n'
        printf 'mkdir -p /usr/local/lib/docker/cli-plugins\n'
        printf 'cp -f %s /usr/local/lib/docker/cli-plugins/docker-compose 2>/dev/null\n' "$COMPOSE_ABLAGE"
        printf 'chmod +x /usr/local/lib/docker/cli-plugins/docker-compose 2>/dev/null\n'
      } >> /boot/config/go && info "und so eingetragen, dass es einen Neustart übersteht"
    fi
    ;;
esac

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
# Der Webserver hängt das Repo schreibgeschützt ein und die Schlafdaten in
# einen Ordner darin. Fehlt dieser Ordner, kann Docker ihn im schreibgeschützten
# Mount nicht anlegen und der Container startet gar nicht erst.
mkdir -p "$PWD/../daten" 2>/dev/null || true
mkdir -p "$(cd "$PWD/.." && pwd)/../daten" 2>/dev/null || true
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
    info "Der Dienst hier läuft (siehe oben) – es fehlt der Weg von aussen."
    echo
    info "In Cloudflare → Zero Trust → Networks → Tunnels → dein Tunnel →"
    info "Published application routes muss dieser Eintrag stehen:"
    info "    Subdomain: $(printf '%s' "$ADRESSE" | sed -E 's|^https?://||; s|\..*$||')"
    info "    Domain:    $(printf '%s' "$ADRESSE" | sed -E 's|^https?://[^.]*\.||; s|/.*$||')"
    info "    Type:      HTTP"
    echo
    # Welche Adresse als Service gehört, hängt einzig daran, WIE cloudflared
    # läuft – nicht daran, ob es ein Container ist. Im Host-Netz sieht es
    # keine Container-Namen, wohl aber die Ports des Servers; im selben
    # Docker-Netz ist es umgekehrt. Raten muss man das nicht.
    CFS="$(docker ps --format '{{.Names}}' 2>/dev/null | grep -iE 'cloudflare|tunnel' || true)"
    if [ -z "$CFS" ]; then
      info "    URL:       127.0.0.1:8088"
      echo
      info "(cloudflared läuft gerade nicht. Starten:"
      info "  cd $PWD && $DC --profile tunnel up -d )"
    else
      for c in $CFS; do
        MODUS="$(docker inspect -f '{{.HostConfig.NetworkMode}}' "$c" 2>/dev/null || echo '?')"
        NETZE="$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$c" 2>/dev/null || true)"
        case "$MODUS" in
          host)
            info "    URL:       127.0.0.1:8088"
            info "               (cloudflared «$c» läuft im Netzmodus host:"
            info "                Container-Namen kennt es dort nicht, die"
            info "                Ports des Servers aber schon)" ;;
          *)
            case "$NETZE" in
              *webapps_default*)
                info "    URL:       webapps:8080"
                info "               (cloudflared «$c» ist im selben Docker-Netz)" ;;
              *)
                info "    URL:       webapps:8080"
                info "               (cloudflared «$c» war noch nicht im Netz des"
                info "                Webservers – das hole ich jetzt nach)"
                docker network connect webapps_default "$c" >/dev/null 2>&1 \
                  && docker restart "$c" >/dev/null 2>&1 \
                  && info "               → erledigt, «$c» neu gestartet" \
                  || info "               → ging nicht; dann stattdessen: 127.0.0.1:8088" ;;
            esac ;;
        esac
      done
    fi
    echo
    info "Taucht die Domain im Auswahlfeld gar nicht auf, liegt sie nicht in"
    info "diesem Cloudflare-Konto."
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
