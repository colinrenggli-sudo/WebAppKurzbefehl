# HIGH auf dem eigenen Server

Zwei Dinge, die GitHub Pages nicht kann:

1. **Erinnerungen, auch wenn die App zu ist.** iOS friert die App im
   Hintergrund ein. Eine Meldung um 07:30 kann nur von aussen kommen.
   Dieser Dienst schickt sie.
2. **Abgleich ohne fremden Anbieter.** Der Zustand liegt als lesbare
   JSON-Datei auf deiner Platte. Keine Anmeldung über Google, kein
   Konto, keine Weiterleitung, die Safari blockieren könnte.

Der Dienst ist absichtlich klein: eine Datei, keine Datenbank. Er rechnet
nichts über Routinen. Die App legt bei jedem Abgleich einen Plan dazu
(«um 07:30 erinnern, offen sind gerade zwei Routinen»), der Dienst liest
daraus nur ab, was fällig ist.

**Wichtig:** Für das Verschicken muss der Server nicht von aussen
erreichbar sein. Er schickt nur ausgehend zu Apple. Erreichbar sein muss
er nur für dein iPhone, und dafür sorgt der Cloudflare Tunnel.

---

## Schritt 1 · Datenordner und Schlüssel

Der Dienst läuft im Container nicht als root. Gehört der Datenordner
root, kann er nichts schreiben – darum einmal anlegen und übergeben:

```bash
mkdir -p /mnt/user/appdata/webapps/high-daten
chown -R 1000:1000 /mnt/user/appdata/webapps/high-daten
```

Stimmt das nicht, startet der Dienst gar nicht erst und schreibt ins
Log, was zu tun ist. Ein Container, der scheinbar läuft und still nichts
speichert, wäre schlimmer.

Dann die Schlüssel, im Unraid-Terminal im Verzeichnis `deploy`:

```bash
# Zufallsschlüssel für den Abgleich
echo "SYNC_TOKEN=$(head -c 32 /dev/urandom | base64 | tr -d '=+/' )" >> .env

# Schlüsselpaar für die Erinnerungen (VAPID)
docker compose build high-sync
docker compose run --rm --no-deps high-sync \
  node -e "const k=require('web-push').generateVAPIDKeys();console.log('VAPID_PUBLIC_KEY='+k.publicKey);console.log('VAPID_PRIVATE_KEY='+k.privateKey)" \
  | tee -a .env
```

Dazu noch von Hand in `.env`:

```
VAPID_SUBJECT=mailto:deine@adresse.ch
HIGH_DATA=/mnt/user/appdata/webapps/high-daten
```

`VAPID_SUBJECT` muss eine echte Adresse sein. Apple lehnt `localhost`
und Platzhalter ab. Der private Schlüssel bleibt auf dem Server;
`.env` ist per `.gitignore` ausgenommen und gehört nie ins Repo.

## Schritt 2 · Starten

```bash
docker compose up -d --build
docker compose logs -f high-sync
```

Im Log muss stehen: `bereit auf Port 8090 · Daten in /data · Zeitzone
Europe/Zurich`. Steht dort die falsche Zeitzone, stimmen später die
Erinnerungszeiten nicht.

Prüfen:

```bash
curl -s http://localhost:8088/api/health
# {"ok":true,"push":true}
```

`"push":false` heisst: die VAPID-Schlüssel fehlen oder sind unbrauchbar.
Der Abgleich läuft dann trotzdem, Erinnerungen kommen aber keine.

## Schritt 3 · Adresse im Tunnel

Zuerst prüfen, ob der Tunnel überhaupt schon von aussen erreichbar ist:
am iPhone **WLAN ausschalten**, dann `https://schlaf.colin-renggli.ch/schlaf/`
öffnen. Lädt die Seite über Mobilfunk, läuft der Tunnel und die Domain
liegt bei Cloudflare. Dann sind es unten zwei Klicks.

Im Cloudflare-Dashboard → Zero Trust → Networks → Tunnels → dein Tunnel
→ **Public Hostnames** → Add:

| Feld | Wert |
| --- | --- |
| Subdomain | `routine` |
| Domain | `colin-renggli.ch` |
| Service | `HTTP` → `webapps:8080` |

Den DNS-Eintrag legt Cloudflare dabei selbst an, du musst nichts
eintragen. Läuft cloudflared nicht im selben Compose-Netz, steht statt
`webapps:8080` die IP des Servers mit Port 8088.

Danach liefert `https://routine.colin-renggli.ch/` die App aus und
`https://routine.colin-renggli.ch/api/health` den Dienst. Beide auf
derselben Adresse: genau deshalb braucht es kein CORS und keine
Anmeldung über eine fremde Domain.

## Schritt 4 · App verbinden

1. In der alten App (GitHub Pages) **Einstellungen → Als Datei
   exportieren**. Der Speicher hängt an der Adresse, beim Wechsel bleibt
   sonst nichts erhalten.
2. `https://routine.colin-renggli.ch/` in Safari öffnen, **Teilen → Zum
   Home-Bildschirm**. Das alte Symbol vorher löschen, sonst hast du zwei.
3. App öffnen → **Einstellungen → Server einrichten**. Adresse
   `https://routine.colin-renggli.ch/api`, Schlüssel der `SYNC_TOKEN` aus
   `.env`. Auf **Verbinden**.
4. **Datei importieren** – das Backup aus Schritt 1.
5. Schalter **Erinnerungen aufs Gerät** an. iOS fragt einmal nach der
   Erlaubnis. Danach **Probe-Erinnerung vom Server** antippen: sie muss
   auch bei gesperrtem Bildschirm ankommen.

Ein zweites Gerät (Mac, iPad) braucht kein erneutes Tippen: auf dem
verbundenen Gerät **Kopplungscode kopieren**, auf dem neuen in das Feld
«Adresse» einfügen. Adresse und Schlüssel werden automatisch getrennt.

---

## Was wo liegt

```
/mnt/user/appdata/webapps/high-daten/
├── state.json           aktueller Zustand (das Wichtigste)
├── subscriptions.json   welche Geräte Erinnerungen bekommen
├── sent.json            was heute schon an welches Gerät ging
└── backup/2026-09-11.json  eine Kopie pro Tag, 60 Tage lang
```

`state.json` ist lesbares JSON. Ein Backup ist ein `cp`, eine
Wiederherstellung auch. Nimm den Ordner in die Unraid-Sicherung auf.

Beide Dateiarten lassen sich auch direkt in die App zurückholen:
**Einstellungen → Datei importieren**, dann `state.json` oder eine Kopie
aus `backup/` auswählen. Importiert wird zusammenführend, nichts wird
dabei überschrieben.

## Schnittstelle

Alles unter `/api`, alles mit `Authorization: Bearer <SYNC_TOKEN>`.

| Weg | Zweck |
| --- | --- |
| `GET /state` | aktuelle Fassung holen, `rev` ist die Fassungsnummer; mit `?device=<id>` kommt dazu, welche Erinnerungen dieses Gerät heute schon bekommen hat |
| `PUT /state` | Fassung ablegen, mit `If-Match: "<rev>"`; bei `409` hat ein anderes Gerät zuerst geschrieben, die Antwort enthält dessen Fassung |
| `POST /push/subscribe` | Gerät für Erinnerungen anmelden |
| `DELETE /push/subscribe` | Gerät abmelden |
| `POST /push/test` | Probe-Erinnerung an alle Geräte |
| `GET /push/key` | öffentlicher VAPID-Schlüssel, ohne Anmeldung |
| `GET /health` | Lebenszeichen, ohne Anmeldung |

Zusammengeführt wird immer im Gerät, nie hier. Der Dienst kennt die
Bedeutung der Daten nicht und entscheidet nichts über sie.

## Wenn etwas nicht kommt

| Beobachtung | Wahrscheinliche Ursache |
| --- | --- |
| `"push":false` unter `/api/health` | VAPID-Schlüssel fehlen in `.env` |
| Probe-Erinnerung kommt nicht an | App nicht vom Home-Bildschirm gestartet, oder Mitteilungen für HIGH in den iPhone-Einstellungen aus |
| Erinnerung kommt zur falschen Zeit | Zeitzone des Containers, siehe Log beim Start |
| Erinnerung kommt gar nicht mehr | Abo abgelaufen oder der Server hat neue VAPID-Schlüssel. Die App prüft beides bei jedem Start und meldet sich neu an; einmal öffnen genügt |
| Dienst startet nicht, Log sagt «lässt sich nicht schreiben» | Der Datenordner gehört root, siehe Schritt 1 |
| `/api/health` liefert 502 | Der Container `high-sync` läuft nicht: `docker compose up -d --build` |
| «Schlüssel wird abgelehnt» in der App | `SYNC_TOKEN` in `.env` und in der App stimmen nicht überein |
| «Andere Adresse als die App – das blockiert der Browser» | Die App wurde von einer anderen Adresse geöffnet als der Server, z. B. noch von GitHub Pages. Richtig ist der Weg über Schritt 4: von `routine.colin-renggli.ch` neu zum Home-Bildschirm hinzufügen. Nur für einen Übergang lässt sich in `.env` `ALLOW_ORIGIN=https://…` setzen |
| Abgleich hängt bei «Nicht verbunden» | Tunnel oder Container aus; die App arbeitet lokal weiter und holt es nach |

Log ansehen: `docker compose logs --tail=50 high-sync`. Jede verschickte
Erinnerung steht dort mit Zeit und Anzahl Geräte.

## Grenzen, ehrlich

- Ist der Server aus, kommt keine Erinnerung. Das iPhone merkt davon
  nichts, es kann sie nicht selbst nachholen.
- Ist das iPhone aus oder ohne Netz, hält Apple die Meldung eine Weile
  zurück und stellt sie später zu. Garantiert ist das nicht.
- «Nicht stören» und Fokus-Modi unterdrücken die Zustellung. Willst du
  die Erinnerung trotzdem, muss HIGH in den iPhone-Einstellungen unter
  dem jeweiligen Fokus erlaubt sein.
- Löschst du die App vom Home-Bildschirm, ist das Abo weg. Der Server
  merkt es erst, wenn Apple die Zustellung ablehnt, und räumt es dann auf.
