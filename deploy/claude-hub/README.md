# claude-hub

Der Serverteil von [CODEWERK](../../codewerk/). Ein einziges
Python-Skript ohne Abhängigkeiten, das drei Dinge tut:

| Route            | wer ruft es       | wozu                                        |
| ---------------- | ----------------- | ------------------------------------------- |
| `POST /api/boost`| die App           | löst die Boost-Routine aus, gibt den Session-Link zurück |
| `POST /api/feed` | die Sammel-Routine| liefert die stündliche Übersicht ein        |
| `GET  /api/feed` | die App           | gibt die Übersicht aus                      |
| `GET  /api/health`| du               | steht alles?                                |

## Wozu überhaupt ein Server?

Die App könnte die Routinen-Schnittstelle auch direkt ansprechen, und
in den Einstellungen ist genau das der Standard. Zwei Gründe sprechen
trotzdem für den Umweg:

1. **CORS.** Ein Browser darf eine fremde Schnittstelle nur ansprechen,
   wenn diese es ausdrücklich erlaubt. Ob `api.anthropic.com` das für
   den `/fire`-Endpunkt tut, ist nicht dokumentiert. Über den eigenen
   Server ist die Frage vom Tisch.
2. **Der Token.** Direkt liegt er im Browser deines Handys. Über den
   Server bleibt er hier, und aufs Handy kommt nur ein Token, das du
   jederzeit ändern kannst.

Ausserdem braucht der Feed ohnehin einen Ort, an den die Sammel-Routine
schreiben kann.

## Einrichten

**1 · Token in `deploy/.env`** (die Datei ist per `.gitignore`
ausgenommen, sie gehört nie nach GitHub):

```sh
ROUTINE_FIRE_URL=https://api.anthropic.com/v1/claude_code/routines/trig_…/fire
ROUTINE_TOKEN=sk-ant-oat01-…
HUB_TOKEN=<lang und selbst ausgedacht – das kommt aufs Handy>
INGEST_TOKEN=<lang und selbst ausgedacht – das bekommt die Routine>
ALLOW_ORIGIN=https://colinrenggli-sudo.github.io
```

URL und Routinen-Token stammen aus dem API-Auslöser der Boost-Routine,
siehe [`codewerk/ROUTINE.md`](../../codewerk/ROUTINE.md). Für die beiden
selbst gewählten Token genügt:

```sh
head -c 32 /dev/urandom | base64
```

**2 · Starten**

```sh
cd deploy
docker compose --profile hub up -d
docker compose logs -f claude-hub
```

**3 · Prüfen**

```sh
wget -qO- http://localhost:8090/api/health
# {"ok": true, "boost": true, "feed": false}
```

`"feed": false` ist am Anfang richtig – erst wenn die Sammel-Routine
das erste Mal gelaufen ist, liegt eine Übersicht da.

**4 · In der App eintragen**: Einstellungen → Boost → *Über den eigenen
Server*, Adresse und `HUB_TOKEN` einsetzen. Unter *Feed* dann *Vom
eigenen Server*.

## Von aussen erreichbar machen

Damit das Handy unterwegs herankommt und die Sammel-Routine aus der
Cloud einliefern kann, muss der Port erreichbar sein. Der bequeme Weg
ist der Cloudflare Tunnel, der in
[`docker-compose.yml`](../docker-compose.yml) schon vorbereitet ist: im
Tunnel eine zweite Hostname-Regel anlegen, etwa
`hub.deine-domain.ch` → `http://claude-hub:8090`.

Zwei Punkte, an denen solche Setups hängen bleiben:

- **Die Routine kommt nicht durch.** Cloud-Sessions laufen
  standardmässig mit eingeschränktem Netzzugang; nur eine Liste
  bekannter Domains ist offen. Deine eigene ist es nicht. In der
  Umgebung der Routine unter *Network access* entweder **Custom** mit
  deiner Domain wählen oder **Full**.
- **`ALLOW_ORIGIN` eng stellen**, sobald die Adresse öffentlich
  erreichbar ist. Steht dort `*`, darf jede beliebige Webseite im
  Browser deines Handys Anfragen an den Hub schicken – der Token
  schützt dann zwar noch, aber eine Verteidigungslinie weniger ist
  eine Verteidigungslinie weniger.

## Ohne Docker

```sh
ROUTINE_FIRE_URL=… ROUTINE_TOKEN=… HUB_TOKEN=… \
  FEED_FILE=./claude-feed.json python3 hub.py
```

Läuft mit jedem Python ab 3.8.

## Was der Hub nicht tut

Er speichert keine Verläufe, keine Nachrichten, nichts aus deinen
Sessions – nur die Übersicht, die die Routine schickt, und die kannst
du jederzeit ansehen: sie liegt als lesbares JSON unter `FEED_FILE`.
