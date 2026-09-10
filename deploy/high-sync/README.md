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

## Schritt 1 · Cloudflare-Eintrag

Der einzige Schritt, den kein Skript abnehmen kann.

Zuerst prüfen, ob der Tunnel überhaupt schon von aussen erreichbar ist:
am iPhone **WLAN ausschalten**, dann `https://schlaf.colin-renggli.ch/schlaf/`
öffnen. Lädt die Seite über Mobilfunk, läuft der Tunnel.

Cloudflare-Dashboard → Zero Trust → Networks → Tunnels → dein Tunnel →
**Public Hostnames** → Add:

| Feld | Wert |
| --- | --- |
| Subdomain | `routine` |
| Domain | `gymlinkapp.ch` |
| Service | `HTTP` → `webapps:8080` |

Den DNS-Eintrag legt Cloudflare selbst an. Taucht `gymlinkapp.ch` im
Auswahlfeld nicht auf, liegt die Domain nicht in diesem Cloudflare-Konto –
dann muss sie dort zuerst hinzugefügt werden (Add a site), oder du nimmst
eine Subdomain einer Domain, die schon drin ist.

Läuft cloudflared nicht im selben Compose-Netz, steht statt `webapps:8080`
die IP des Servers mit Port 8088.

## Schritt 2 · Ein Befehl auf dem Server

```bash
cd /mnt/user/appdata/webapps/repo
git pull
bash deploy/einrichten.sh https://routine.gymlinkapp.ch
```

Das legt den Datenordner an und übergibt ihn dem Container, erzeugt den
Abgleichschlüssel und die VAPID-Schlüssel für die Erinnerungen, startet
alles und prüft, ob es antwortet. Am Ende steht dort ein Link:

```
https://routine.gymlinkapp.ch/#s=<dein Schlüssel>
```

Ein zweites Ausführen ist ungefährlich – vorhandene Schlüssel bleiben, wie
sie sind. Würden sie neu erzeugt, wären alle verbundenen Geräte draussen.

Läuft es nicht durch, sagt das Skript, woran es liegt. Das Log dazu:
`cd deploy && docker compose logs --tail=40 high-sync web`.

## Schritt 3 · Den Link am iPhone öffnen

1. Falls du HIGH schon von GitHub Pages benutzt: dort **Einstellungen →
   Als Datei exportieren**. Der Speicher hängt an der Adresse, beim
   Wechsel bleibt sonst nichts erhalten.
2. Den Link aus Schritt 2 in **Safari** öffnen. Die App verbindet sich von
   selbst – in den Einstellungen steht danach «Verbunden».
3. **Teilen → Zum Home-Bildschirm.** Das alte Symbol vorher löschen, sonst
   hast du zwei. Ohne diesen Schritt gibt es keine Erinnerungen: iOS
   erlaubt sie nur der installierten App.
4. Falls du in Schritt 1 exportiert hast: **Einstellungen → Datei
   importieren**.
5. Schalter **Erinnerungen aufs Gerät** an. iOS fragt einmal nach der
   Erlaubnis. Danach **Probe-Erinnerung vom Server** antippen: sie muss
   auch bei gesperrtem Bildschirm ankommen.

Den Link nicht weitergeben – er enthält den Schlüssel. Für ein zweites
eigenes Gerät gibt es in den Einstellungen **Kopplungscode kopieren**.

## Vorher ausprobieren, ohne Cloudflare

Der Abgleich lässt sich schon im eigenen Netz testen, bevor die Adresse
steht:

```bash
bash deploy/einrichten.sh
```

Ohne Adresse druckt das Skript die Server-IP und den Schlüssel. Die App
unter `http://<server-ip>:8088/` öffnen, **Einstellungen → Server
einrichten**, Adresse `http://<server-ip>:8088/api` und den Schlüssel
eintragen. Abgleich und App laufen damit. **Erinnerungen nicht:** dafür
verlangt iOS https und die Installation auf dem Home-Bildschirm.

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
| Die Seite ist gar nicht erreichbar | Der Cloudflare-Eintrag aus Schritt 1 fehlt, oder cloudflared läuft nicht: `cd deploy && docker compose --profile tunnel up -d`. Prüfen lässt sich beides an einer Adresse, die schon geht |
| `"push":false` unter `/api/health` | VAPID-Schlüssel fehlen in `.env` – `bash deploy/einrichten.sh` noch einmal laufen lassen |
| Probe-Erinnerung kommt nicht an | App nicht vom Home-Bildschirm gestartet, oder Mitteilungen für HIGH in den iPhone-Einstellungen aus |
| Erinnerung kommt zur falschen Zeit | Zeitzone des Containers, siehe Log beim Start |
| Erinnerung kommt gar nicht mehr | Abo abgelaufen oder der Server hat neue VAPID-Schlüssel. Die App prüft beides bei jedem Start und meldet sich neu an; einmal öffnen genügt |
| Dienst startet nicht, Log sagt «lässt sich nicht schreiben» | Der Datenordner gehört root: `chown -R 1000:1000 /mnt/user/appdata/webapps/high-daten` |
| `/api/health` liefert 502 | Der Container `high-sync` läuft nicht: `docker compose up -d --build` |
| «Schlüssel wird abgelehnt» in der App | `SYNC_TOKEN` in `.env` und in der App stimmen nicht überein |
| «Andere Adresse als die App – das blockiert der Browser» | Die App wurde von einer anderen Adresse geöffnet als der Server, z. B. noch von GitHub Pages. Richtig ist der Weg über Schritt 3: den Link von `routine.gymlinkapp.ch` öffnen und von dort zum Home-Bildschirm hinzufügen. Nur für einen Übergang lässt sich in `.env` `ALLOW_ORIGIN=https://…` setzen |
| «Eingerichtet – noch keine Verbindung» | Adresse ist gespeichert, der Server antwortet noch nicht. Tunnel oder Container aus; die App arbeitet lokal weiter und verbindet sich von selbst, sobald es geht |
| Der Link tut nichts | Er wurde nicht in **Safari** geöffnet, sondern in einer anderen App. Adresse kopieren und in Safari einfügen |

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
