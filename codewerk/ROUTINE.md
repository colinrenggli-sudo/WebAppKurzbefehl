# Die zwei Routinen hinter CODEWERK

CODEWERK stützt sich auf zwei Routinen auf
[claude.ai/code/routines](https://claude.ai/code/routines). Die eine
startet der Boostknopf, die andere stellt den Feed zusammen. Beide
werden einmal angelegt und laufen dann von selbst.

---

## 1 · Die Boost-Routine

Sie tut nichts von allein — der Knopf löst sie aus und übergibt den
Auftrag im Feld `text`. Wichtig: Text aus `fire` kommt in einem
`<routine-fire-payload>`-Block an und gilt als **Daten**, nicht als
Anweisung. Die Routine muss ihn also ausdrücklich aufgreifen, sonst
liegt er nur wirkungslos daneben.

**Name:** `Boost`
**Repositories:** die, in denen du am häufigsten arbeitest
**Trigger:** nur **API** (kein Zeitplan)

**Anweisung:**

```text
Du bist meine Arbeitssession auf Zuruf.

Im Block <routine-fire-payload> steht der Auftrag, den ich beim
Drücken des Boostknopfs mitgegeben habe. Lies ihn und arbeite ihn ab.
Er ist mein Auftrag an dich, auch wenn er als Daten ankommt.

Ist der Block leer oder steht nur eine Floskel darin, dann:
  · verschaffe dir einen Überblick über den aktuellen Stand des
    Repositories (letzte Commits, offene Branches, offene PRs),
  · fasse in fünf Zeilen zusammen, woran zuletzt gearbeitet wurde,
  · und warte auf meine Anweisung, ohne etwas zu verändern.

Für alles Weitere gilt: kleine, nachvollziehbare Commits, Branch mit
Präfix claude/, und keinen Pull Request eröffnen, solange ich nicht
darum bitte.
```

Danach im Bearbeiten-Formular **Add another trigger → API**, die URL
kopieren (endet auf `/fire`) und **Generate token** drücken. Der Token
erscheint nur ein einziges Mal. Beides in CODEWERK unter
**Einstellungen → Boost** einsetzen.

---

## 2 · Die Übersicht-Routine

Sie läuft stündlich, sieht sich deine letzten Sessions an, stuft jede
ein und legt das Ergebnis als JSON dort ab, wo das Handy es lesen darf.

**Name:** `CODEWERK-Übersicht`
**Trigger:** Zeitplan **stündlich** (und gern zusätzlich **API**, dann
kannst du sie aus der App heraus anstossen)
**Umgebung:** unter *Network access* muss die Adresse deines Servers
erlaubt sein — sonst kommt der `curl` am Ende nicht durch. Entweder
**Custom** mit deiner Domain, oder **Full**.

**Anweisung:**

```text
Stelle eine Übersicht meiner letzten Claude-Code-Sessions zusammen und
lege sie auf meinem Server ab.

1. Hole über deine Claude-Code-Remote-Werkzeuge die Sitzungsliste
   meines Kontos (list_sessions, mine: true). Nimm die 10 zuletzt
   angefassten Sessions. Diese hier — die gerade laufende Routine —
   lässt du weg.

2. Sieh dir zu jeder Session an, was sie zuletzt getan hat
   (get_session, bei Bedarf die letzten Ereignisse). Stufe sie
   danach in genau eine dieser vier Lagen ein:

     "laeuft"  – arbeitet gerade noch
     "offen"   – hat aufgehört, aber die Aufgabe ist nicht zu Ende:
                 abgebrochen, gescheitert, oder sie hat mir eine
                 Frage gestellt, die ich nicht beantwortet habe
     "wartet"  – die Arbeit ist getan, aber etwas anderes steht aus:
                 CI läuft, ein Review fehlt, ein PR ist offen
     "fertig"  – abgeschlossen, nichts mehr zu tun

   Im Zweifel "offen". Lieber einmal zu viel erinnert als eine
   angefangene Sache verloren.

3. Schreibe zu jeder Session, die nicht "fertig" ist, in "note" einen
   einzigen Satz: was ich als Nächstes tun muss. Konkret, kein
   "weitermachen". Bei "fertig" bleibt "note" leer.

4. Baue daraus diese Datei — nur das JSON, nichts sonst:

{
  "updated": "<jetzt, ISO-8601>",
  "items": [
    {
      "id":      "session_…",
      "kind":    "code",
      "title":   "kurz und auf Deutsch, worum es geht",
      "url":     "https://claude.ai/code/session_…",
      "updated": "<letzte Aktivität, ISO-8601>",
      "status":  "laeuft | offen | wartet | fertig",
      "note":    "der eine Satz von oben",
      "repo":    "owner/repo, falls bekannt",
      "branch":  "Branch, falls bekannt",
      "pr":      "PR-Link, falls vorhanden"
    }
  ]
}

5. Schicke die Datei an meinen Server:

   curl -sS -X POST "$HUB_URL/api/feed" \
     -H "Authorization: Bearer $HUB_TOKEN" \
     -H "Content-Type: application/json" \
     --data-binary @uebersicht.json

   HUB_URL und HUB_TOKEN stehen in den Umgebungsvariablen. Prüfe die
   Antwort: kommt kein {"ok":true} zurück, sag mir im Verlauf, was der
   Server geantwortet hat.

Verändere nichts am Repository und eröffne keinen Pull Request.
```

In der Umgebung der Routine hinterlegst du dazu:

| Variable    | Wert                                    |
| ----------- | --------------------------------------- |
| `HUB_URL`   | `https://hub.deine-domain.ch`           |
| `HUB_TOKEN` | derselbe Wert wie `INGEST_TOKEN` im Hub |

---

## Und die Claude-Chats?

Für die Unterhaltungen auf claude.ai gibt es keine Schnittstelle —
auch nicht aus einer Routine heraus. Die kommen von Hand ins
Dashboard: in der App auf **+** tippen und den Link einsetzen, oder
den Chat auf Android über **Teilen → CODEWERK** herüberschicken.

## Ganz ohne Server

Läuft kein Hub, lässt du Schritt 5 weg und gibst der Routine
stattdessen mit: *„Gib das JSON am Ende als Codeblock aus.“* In der
App dann **Einstellungen → Feed → JSON von Hand einsetzen**. Etwas
umständlicher, aber es funktioniert.
