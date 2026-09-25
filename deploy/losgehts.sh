#!/bin/bash
# ==================================================================
# losgehts.sh – ein Befehl, und der Server ist auf dem neuesten Stand.
#
# Gedacht für das Terminal in der Unraid-Oberfläche (Symbol >_ oben
# rechts), wo man ohne Anmeldung schon root ist. Ein Aufruf genügt:
#
#   curl -fsSL https://raw.githubusercontent.com/colinrenggli-sudo/WebAppKurzbefehl/main/deploy/losgehts.sh | bash
#
# Es sucht das Verzeichnis selbst, holt den neuesten Stand, baut und
# startet, prüft nach und druckt am Schluss den Link fürs iPhone.
#
# Mehrfach ausführen ist ungefährlich: vorhandene Schlüssel bleiben,
# Daten werden nicht angefasst.
# ==================================================================
set -uo pipefail

ADRESSE="${1:-}"

rot()   { printf '\033[31m%s\033[0m\n' "$*"; }
gruen() { printf '\033[32m%s\033[0m\n' "$*"; }
info()  { printf '  %s\n' "$*"; }
titel() { printf '\n\033[1m%s\033[0m\n' "$*"; }

abbruch() {
  echo
  rot "$1"
  shift
  for z in "$@"; do info "$z"; done
  echo
  info "Diesen ganzen Text kopieren und zurückschicken – daraus ist zu sehen,"
  info "woran es liegt."
  exit 1
}

# ---------- 1. Wo liegt das Repo? ----------
titel "1/4  Verzeichnis suchen"

istRepo() { [ -f "$1/deploy/einrichten.sh" ] && [ -d "$1/.git" ]; }

REPO=""
for k in "${REPO_PFAD:-}" /mnt/user/appdata/webapps/repo; do
  [ -n "$k" ] && istRepo "$k" && { REPO="$k"; break; }
done

# Docker weiss es am sichersten: der Webserver hängt genau dieses
# Verzeichnis unter /srv/web ein.
if [ -z "$REPO" ] && command -v docker >/dev/null 2>&1; then
  K="$(docker inspect webapps --format '{{range .Mounts}}{{if eq .Destination "/srv/web"}}{{.Source}}{{end}}{{end}}' 2>/dev/null)"
  [ -n "$K" ] && istRepo "$K" && REPO="$K"
fi

# Letzter Ausweg: suchen. Nur auf dem eigenen Dateisystem, sonst dauert
# es auf einem Server mit vielen Platten ewig.
SUCHORTE="${SUCHORTE:-/mnt /srv /opt /home /root}"
if [ -z "$REPO" ]; then
  info "nicht am üblichen Ort – wird gesucht (kann einen Moment dauern) …"
  for K in $(find $SUCHORTE -xdev -maxdepth 6 -name einrichten.sh -path '*/deploy/*' 2>/dev/null | head -5); do
    K="$(dirname "$(dirname "$K")")"
    istRepo "$K" && { REPO="$K"; break; }
  done
fi

[ -n "$REPO" ] || abbruch "Das Verzeichnis der App ist nicht zu finden." \
  "Gesucht wurde unter: $SUCHORTE" \
  "Möglich ist auch, dass die App auf einem anderen Rechner läuft." \
  "Zum Nachsehen, was hier überhaupt läuft:" \
  "    docker ps --format '{{.Names}}'"

info "gefunden: $REPO"
cd "$REPO" || abbruch "In $REPO lässt sich nicht wechseln."

# Das Verzeichnis gehört dem Server, gearbeitet wird als root. Ohne diese
# Zeile verweigert git die Arbeit mit «dubious ownership».
git config --global --add safe.directory "$REPO" >/dev/null 2>&1 || true

# ---------- 2. Neuesten Stand holen ----------
titel "2/4  Neuesten Stand holen"

if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo
  rot "Im Verzeichnis stehen Änderungen von Hand."
  git --no-pager status --short | sed 's/^/      /'
  abbruch "Deshalb wird nichts geholt – sonst ginge diese Arbeit verloren." \
    "Wenn sie weg darf, einmal:  git -C \"$REPO\" checkout -- ." \
    "Danach diesen Befehl noch einmal."
fi

VORHER="$(git rev-parse --short HEAD 2>/dev/null)"
git fetch --quiet origin main 2>/tmp/high-los.err \
  || abbruch "Es liess sich nichts von GitHub holen." "$(sed 's/^/      /' /tmp/high-los.err 2>/dev/null)" \
             "Meist fehlt dem Server der Zugang ins Internet."
git checkout --quiet main 2>/dev/null || true
git merge --quiet --ff-only origin/main 2>/tmp/high-los.err \
  || abbruch "Der neue Stand liess sich nicht einspielen." "$(sed 's/^/      /' /tmp/high-los.err 2>/dev/null)"
NACHHER="$(git rev-parse --short HEAD 2>/dev/null)"

if [ "$VORHER" = "$NACHHER" ]; then
  info "war schon aktuell ($NACHHER)"
else
  gruen "  geholt: $VORHER → $NACHHER"
fi

VERSION="$(sed -n "s/^const APP_VERSION = '\([0-9.]*\)';.*/\1/p" index.html 2>/dev/null | head -1)"
info "Fassung der App im Verzeichnis: ${VERSION:-unbekannt}"

# ---------- 3. Bauen und starten ----------
titel "3/4  Container bauen und starten"

if [ -z "$ADRESSE" ]; then
  ADRESSE="$(sed -n 's|^APP_ADRESSE=||p' deploy/.env 2>/dev/null | tail -1)"
fi
[ -n "$ADRESSE" ] || ADRESSE="https://routine.colin-renggli.ch"
info "Adresse: $ADRESSE"
echo

bash deploy/einrichten.sh "$ADRESSE" || abbruch "Das Einrichten ist nicht durchgelaufen." \
  "Die Meldungen darüber sagen, woran es lag."

# ---------- 4. Nachsehen, ob es wirklich stimmt ----------
titel "4/4  Nachsehen"

GELIEFERT="$(curl -fsS -m 10 http://localhost:8088/ 2>/dev/null | sed -n "s/^const APP_VERSION = '\([0-9.]*\)';.*/\1/p" | head -1)"
if [ -n "$GELIEFERT" ] && [ "$GELIEFERT" = "$VERSION" ]; then
  gruen "  Der Webserver liefert Fassung $GELIEFERT – passt."
elif [ -n "$GELIEFERT" ]; then
  rot "  Der Webserver liefert $GELIEFERT, im Verzeichnis liegt aber $VERSION."
  info "Einmal:  cd $REPO/deploy && docker compose restart web"
else
  rot "  Der Webserver antwortet nicht auf http://localhost:8088/"
  info "Log ansehen:  cd $REPO/deploy && docker compose logs --tail=40 web"
fi

if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx 'high-selbstupdate'; then
  gruen "  Der Server hält sich ab jetzt selbst aktuell."
else
  rot "  Die Selbstaktualisierung läuft nicht – neue Stände kämen nicht von selbst an."
fi

# ---------- Das Wichtigste zuletzt ----------
TOKEN="$(sed -n 's|^SYNC_TOKEN=||p' deploy/.env 2>/dev/null | tail -1)"
echo
echo "================================================================"
gruen " FERTIG. Jetzt am iPhone:"
echo "================================================================"
echo
info "1. App vom Home-Bildschirm wegwischen und neu öffnen."
info "   Unten in den Einstellungen muss stehen:  HIGH ${VERSION:-3.5.0}"
echo
if [ -n "$TOKEN" ]; then
  info "2. Einstellungen → Server einrichten → dort eintragen:"
  echo
  printf '        \033[1m%s\033[0m\n' "$TOKEN"
  echo
  info "   Oder diesen Link im Safari öffnen, dann geht es von selbst:"
  printf '        %s/#s=%s\n' "$ADRESSE" "$TOKEN"
  echo
else
  # Einen halben Link zu drucken wäre schlimmer als gar keinen: man
  # probiert ihn, er tut nichts, und niemand weiss warum.
  rot "  2. Kein SYNC_TOKEN in $REPO/deploy/.env gefunden."
  info "   Ohne ihn kann sich das iPhone nicht verbinden. Nachsehen mit:"
  info "       cat $REPO/deploy/.env"
  echo
fi
info "3. Einstellungen → Datei importieren → focus-backup-….json"
info "   → «Zusammenführen». Damit sind Routinen, Verlauf, XP,"
info "     Abzeichen und Tokens wieder da."
echo
info "4. Einstellungen → «Erinnerungen aufs Gerät» einschalten."
echo
echo "================================================================"
info "Link und Schlüssel nicht weitergeben – wer sie hat, kommt an deine Daten."
echo
