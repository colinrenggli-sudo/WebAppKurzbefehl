# Auf dem eigenen Server betreiben

Alle Apps in diesem Repo sind statische Dateien – kein Node, keine
Datenbank, kein Build. Ein kleiner Webserver genügt, der das Verzeichnis
ausliefert. Das hier ist das fertige Setup dafür: nginx im Container,
optional per Cloudflare Tunnel unter der eigenen Domain.

**Warum überhaupt selbst hosten,** wo es auf GitHub Pages schon läuft?
Eigene Adresse (`schlaf.colin-renggli.ch` statt der langen GitHub-URL),
kein fremder Anbieter dazwischen, und du kannst später Dinge ergänzen,
die Pages nicht kann – etwa einen kleinen Dienst, der Fitbit-Daten
nachts von selbst abholt.

---

## Schritt 1 · Repo auf den Server holen

Im Unraid-Terminal (Symbol oben rechts in der Weboberfläche):

```bash
mkdir -p /mnt/user/appdata/webapps
cd /mnt/user/appdata/webapps
git clone https://github.com/colinrenggli-sudo/WebAppKurzbefehl.git repo
cd repo/deploy
```

Kein `git` an Bord? Auf Unraid über die **Nerd Tools** installieren
(Apps → Nerd Tools → `git`). Alternative ohne git: das Repo als ZIP
herunterladen und entpacken – dann entfällt später aber das bequeme
Aktualisieren per `update.sh`.

## Schritt 2 · Starten

```bash
docker compose up -d
docker compose ps
```

Braucht das Plugin **Docker Compose Manager** (Apps → Compose). Ohne
Plugin geht es genauso mit einem einzelnen Befehl:

```bash
docker run -d --name webapps --restart unless-stopped \
  -p 8088:8080 \
  -v /mnt/user/appdata/webapps/repo:/srv/web:ro \
  -v /mnt/user/appdata/webapps/repo/deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine
```

Test im Browser: `http://<server-ip>:8088/schlaf/`

## Schritt 3 · Unter der eigenen Domain erreichbar machen

Ein Wecker ohne HTTPS ist nutzlos: Service Worker, Benachrichtigungen
und das Wachhalten des Bildschirms verlangen alle einen sicheren
Kontext. `http://192.168.x.x:8088` erfüllt das nicht. Also entweder
Cloudflare Tunnel (öffentlich) oder Tailscale Serve (privat) – beide
liefern ein gültiges Zertifikat.

### Variante A · Cloudflare Tunnel (von überall erreichbar)

1. Cloudflare-Dashboard → **Zero Trust → Networks → Tunnels → Create a
   tunnel** → Typ *Cloudflared* → Name z. B. `unraid`.
2. Bei „Install and run“ das **Token** kopieren (der lange
   `eyJhIjoi…`-String).
3. Auf dem Server:
   ```bash
   cd /mnt/user/appdata/webapps/repo/deploy
   echo 'TUNNEL_TOKEN=eyJhIjoi…' > .env
   chmod 600 .env
   ```
   In `docker-compose.yml` den `cloudflared`-Block einkommentieren, dann
   `docker compose up -d`.
4. Im Tunnel unter **Public Hostnames** anlegen:

   | Feld | Wert |
   | --- | --- |
   | Subdomain | `schlaf` |
   | Domain | `colin-renggli.ch` |
   | Service | `HTTP` → `web:8080` |

   `web:8080` funktioniert, weil beide Container im selben
   Compose-Netz liegen. Läuft cloudflared woanders, nimm
   `http://<server-ip>:8088`.
5. Fertig: `https://schlaf.colin-renggli.ch` – Zertifikat kommt von
   Cloudflare, Port musst du im Router keinen öffnen.

Mit *Zero Trust → Access* liesse sich die Seite zusätzlich hinter einen
Login legen. Für SCHLAFWERK unnötig (die Daten liegen ohnehin nur im
Browser), für alles Administrative dagegen Pflicht – siehe
[HOMESERVER.md](HOMESERVER.md).

### Variante B · Tailscale Serve (nur für dich, nichts öffentlich)

Wenn läuft, was du schon hast:

```bash
tailscale serve --bg --https=443 http://127.0.0.1:8088
tailscale serve status
```

Ergibt `https://<servername>.<dein-tailnet>.ts.net` mit gültigem
Zertifikat, erreichbar nur von deinen eigenen Geräten. Läuft Tailscale
bei dir im Container, den Befehl mit
`docker exec <container> tailscale serve …` absetzen.

> `tailscale funnel` würde dieselbe Adresse öffentlich machen – dafür
> ist aber der Cloudflare-Weg der sauberere.

## Schritt 4 · Fitbit-Redirect nachtragen

Die Redirect-URL muss zeichengenau zur aufgerufenen Adresse passen.
Nach dem Umzug also auf dev.fitbit.com in deiner App ergänzen (Fitbit
nimmt mehrere, eine pro Zeile):

```
https://colinrenggli-sudo.github.io/WebAppKurzbefehl/schlaf/
https://schlaf.colin-renggli.ch/
```

Die App zeigt im Fitbit-Bereich immer genau die Adresse an, die sie
gerade verwendet – der Knopf „Redirect-URL kopieren“ nimmt dir das
Abtippen ab.

Achtung: Der Fitbit-Token liegt im `localStorage` und der gehört zur
Herkunft (Origin). Nach dem Wechsel der Adresse musst du dich einmal
neu verbinden, und die alten Daten liegen weiterhin unter der alten
Adresse. Vorher in den Einstellungen **Exportieren**, danach unter der
neuen Adresse **Importieren** – dann ist alles wieder da.

## Schritt 5 · Daten vom Server holen lassen

Optional, aber der eigentliche Grund, selbst zu hosten: Statt dass sich
jedes Gerät einzeln mit Fitbit verbindet, holt der Server die Daten
einmal und legt sie für alle bereit. SCHLAFWERK liest sie beim Öffnen
von selbst – auf dem Handy, am Laptop, überall dieselbe Grundlage. Und
du hast ein Archiv, das bleibt, falls Fitbit die Schnittstelle
irgendwann abstellt.

**1. Redirect-URL ergänzen.** Auf dev.fitbit.com in deiner App eine
zweite Zeile hinzufügen – das Skript darf nicht dieselbe Adresse
benutzen wie die App selbst, sonst greifen sich beide den Code weg:

```
https://schlaf.colin-renggli.ch/schlaf/sync/
```

Diese Seite gehört zum Repo und zeigt nach der Freigabe nur den Code
gross an, mit Knopf zum Kopieren.

**2. Zugangsdaten hinterlegen** in `deploy/.env`:

```
FITBIT_CLIENT_ID=23XYZ7
FITBIT_REDIRECT=https://schlaf.colin-renggli.ch/schlaf/sync/
DAYS=365
```

**3. Einmalig verknüpfen:**

```bash
docker compose --profile sync run --rm fitbit-sync python sync.py setup
```

Das Skript zeigt eine Adresse, die du im Browser öffnest. Nach der
Freigabe landest du auf der Code-Seite, kopierst den Code und fügst ihn
im Terminal ein. Danach holt sich das Skript neue Zugriffstoken selbst –
ein zweites Mal ist das nie nötig.

**4. Dauerbetrieb starten:**

```bash
docker compose --profile sync up -d
docker compose logs -f fitbit-sync
```

Alle sechs Stunden ein Abgleich, Ergebnis in
`/mnt/user/appdata/webapps/daten/schlaf.json`. Beim nächsten Öffnen der
App erscheint oben im Tab *Schlaf* die Karte „Vom Server“.

> **Diese Datei enthält deine Gesundheitsdaten.** Deshalb ist sie in
> `.gitignore` ausgenommen (landet also nie in GitHub) und liegt
> ausserhalb des Repo-Verzeichnisses. Die mitgelieferte nginx-Regel
> liefert `/daten/` ausserdem nicht durch den Cloudflare-Tunnel aus:
> Anfragen von dort bekommen 404, im Heimnetz und über Tailscale
> funktioniert es normal. Wenn du das anders willst, ist die Zeile in
> `nginx.conf` mit dem `CF-Ray`-Kopf die richtige Stelle – aber
> überleg es dir gut.

Der Token liegt in `daten/token.json` mit Rechten 600. Wer ihn hat,
kommt an deine Fitbit-Daten – bei einem Backup dieses Verzeichnisses
also mitdenken.

## Schritt 6 · Aktuell halten

```bash
bash /mnt/user/appdata/webapps/repo/deploy/update.sh
```

Automatisch per **Settings → User Scripts** (Plugin *User Scripts*),
Zeitplan „stündlich“ oder „täglich“. Der Webserver liest die Dateien
direkt aus dem Verzeichnis – nach dem `git pull` ist die neue Version
sofort da, ohne Neustart.

Der Server zieht nur, er schiebt nie: Änderungen macht man in GitHub,
nicht auf dem Server. Sonst kollidiert das nächste `git pull`.

---

## Wenn etwas nicht geht

| Symptom | Ursache |
| --- | --- |
| Container startet nicht | `docker logs webapps` – meist ein Tippfehler in `nginx.conf` |
| 403 statt Seite | Rechte am Verzeichnis: `chmod -R a+rX /mnt/user/appdata/webapps/repo` |
| `/schlaf` leitet auf Port 8088 um | passiert nur ohne `absolute_redirect off` – die mitgelieferte Konfiguration hat es drin |
| Alte Version klebt fest | Service Worker: in den Entwicklerwerkzeugen unter *Application → Service Workers* abmelden, oder einmal hart neu laden |
| Fitbit meldet „redirect_uri mismatch“ | Adresse in der Fitbit-App weicht ab – Schrägstrich am Ende und `https` beachten |
| Benachrichtigungen fehlen | nur über HTTPS bzw. `localhost` möglich |
