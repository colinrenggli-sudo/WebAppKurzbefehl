# CODEWERK – Kommandostand für Claude

Ein Dashboard über deine Claude-Code-Sessions und Claude-Chats: was
läuft, was du weiterverfolgen musst, was erledigt ist. Und ein
Boostknopf, der eine neue Remote-Session startet und direkt öffnet.

**[Live ansehen](https://colinrenggli-sudo.github.io/WebAppKurzbefehl/codewerk/)**
· oder `codewerk/index.html` im Browser öffnen.

---

## Aufs Handy holen

Die App ist eine PWA – kein App Store, keine Installation im
eigentlichen Sinn.

**iPhone:** Adresse in **Safari** öffnen (nicht Chrome) → Teilen-Symbol
unten → *Zum Home-Bildschirm*.

**Android:** Adresse in Chrome öffnen → Menü ⋮ → *App installieren*.

Danach liegt sie als eigenes Symbol auf dem Bildschirm, startet ohne
Browserleiste und funktioniert auch ohne Netz – die Liste kommt dann
aus dem Gerätespeicher.

Auf Android kommt zusätzlich ein Eintrag ins Teilen-Menü: einen Chat
oder eine Session aus Claude heraus **Teilen → CODEWERK**, und sie
landet im Dashboard.

---

## Der Boostknopf

Ein Druck, und eine neue Claude-Code-Session läuft — im optionalen
Feld darüber steht, woran sie arbeiten soll.

Dahinter steckt eine **Routine** mit API-Auslöser. Die App schickt:

```http
POST https://api.anthropic.com/v1/claude_code/routines/<trig_…>/fire
Authorization: Bearer sk-ant-oat01-…
anthropic-version: 2023-06-01
anthropic-beta: experimental-cc-routine-2026-04-01

{ "text": "<dein Auftrag>" }
```

und bekommt zurück:

```json
{ "claude_code_session_id":  "session_…",
  "claude_code_session_url": "https://claude.ai/code/session_…" }
```

Diesen Link öffnet die App sofort in einem neuen Tab. Damit der Browser
das Fenster nicht als ungebetenes Pop-up wegwirft, wird es schon beim
Antippen geöffnet und erst danach mit dem Link gefüllt. Klappt das
trotzdem nicht, erscheint stattdessen ein grosser *Session öffnen*-Knopf.

### Einrichten – zwei Minuten

1. Auf [claude.ai/code/routines](https://claude.ai/code/routines) eine
   Routine anlegen. Fertiger Prompt: [`ROUTINE.md`](ROUTINE.md).
2. Routine speichern, zum Bearbeiten öffnen → **Add another trigger** →
   **API**.
3. URL kopieren (endet auf `/fire`), **Generate token** drücken, Token
   kopieren. Er wird **nur einmal** gezeigt.
4. In CODEWERK: Einstellungen → Boost → beides einsetzen →
   *Verbindung testen*.

Der Token gilt für genau diese eine Routine, gibt keinen Lesezugriff
aufs Konto und bleibt auf dem Gerät. Sollte der Browser die Anfrage
blocken (CORS), gibt es den Weg über den eigenen Server:
[`deploy/claude-hub`](../deploy/claude-hub/).

---

## Woher die Liste kommt

**Ehrlich gesagt: nicht von selbst.** Für das Auflisten der eigenen
Sessions und Chats gibt es keine öffentliche Schnittstelle – weder für
Claude Code noch für claude.ai. Es gibt keinen Endpunkt, den die App
einfach abfragen könnte.

Der Weg drumherum: Eine **zweite Routine** läuft stündlich in der
Cloud. Dort *hat* die Session Zugriff auf die eigene Sitzungsliste. Sie
sieht sich die letzten zehn Sessions an, stuft jede ein und legt das
Ergebnis als JSON auf deinem Server ab, wo die App es liest. Prompt und
Aufbau stehen in [`ROUTINE.md`](ROUTINE.md).

```
  Routine (stündlich, Cloud)  ──POST──►  claude-hub  ◄──GET──  Handy
       liest die Sitzungsliste           /api/feed
       und stuft sie ein
```

Ohne diesen Aufbau funktioniert die App genauso, nur füllst du die
Liste dann selbst: **+** antippen und Link einsetzen, oder aus Claude
heraus teilen. Es gibt auch **Einstellungen → Feed → JSON von Hand
einsetzen**, wenn du die Übersicht lieber aus einer Routine kopierst,
statt einen Server zu betreiben.

Die **Chats** von claude.ai kommen in jedem Fall von Hand ins
Dashboard – dafür existiert auch aus einer Routine heraus kein Zugang.

### Aufbau des Feeds

```json
{
  "updated": "2026-09-09T18:00:00Z",
  "items": [
    { "id":      "session_01ABC",
      "kind":    "code",
      "title":   "DACHWERK: QR-Rechnung rundet falsch",
      "url":     "https://claude.ai/code/session_01ABC",
      "updated": "2026-09-09T17:40:00Z",
      "status":  "offen",
      "note":    "Rappen-Rundung in der Referenzzeile prüfen.",
      "repo":    "colinrenggli-sudo/WebAppKurzbefehl",
      "branch":  "claude/qr-fix",
      "pr":      "" }
  ]
}
```

`kind` ist `code` oder `chat`. Je Art werden die zehn neuesten
übernommen. `status` ist eine der vier Lagen:

| Status   | im Dashboard       | heisst                                   |
| -------- | ------------------ | ---------------------------------------- |
| `laeuft` | **läuft**          | arbeitet gerade noch                     |
| `offen`  | **weiter**         | angefangen, nicht zu Ende – das musst du verfolgen |
| `wartet` | **wartet**         | fertig, aber CI/Review/PR steht aus      |
| `fertig` | **fertig**         | nichts mehr zu tun                       |

Was länger als drei Tage offen liegt, bekommt zusätzlich ein
*liegt seit N Tagen* – die Einstellung dafür lässt sich ändern.

---

## Bedienung

- **Checkbox links** – nicht mehr relevant. Der Eintrag wandert ins
  Archiv und ist dort mit demselben Tippen zurückzuholen. Kommt er beim
  nächsten Feed-Abgleich noch einmal, bleibt er trotzdem abgehakt.
- **Fertig** – Stand auf *fertig*, verschwindet aus *Jetzt dran*,
  bleibt unter *Alle*.
- **⋯** – Stand ändern, eigene Notiz schreiben, nach oben anpinnen,
  entfernen.
- **Jetzt dran / Alle / Archiv** – die drei Ansichten. *Jetzt dran*
  gruppiert nach *Läuft gerade*, *Weiterverfolgen*, *Wartet*.

Deine Entscheidungen liegen getrennt von den Feed-Daten. Ein neuer Feed
überschreibt Titel und Status aus der Cloud, aber nie, was du selbst
abgehakt, umgestuft oder notiert hast.

---

## Wo was liegt

Alles im Browser (`localStorage`, Schlüssel `codewerk.v1`) – Einträge,
Entscheidungen, Einstellungen und der Routinen-Token. Nichts davon
verlässt das Gerät, ausser den Anfragen an die Routinen-Schnittstelle
und an deinen eigenen Server.

Die Sicherung unter Einstellungen → Daten enthält **auch die Token**.
Behandle die Datei wie ein Passwort.

## Grenzen

- Sessions und Chats lassen sich nicht direkt abfragen – siehe oben.
- Die Routinen-Schnittstelle ist als *experimentell* gekennzeichnet.
  Ändert sich der Beta-Kopf, muss die Zeile `BETA` in `index.html`
  nachgezogen werden.
- Jeder Boost verbraucht einen Routinen-Lauf vom Tageskontingent.
  Ist es aufgebraucht, meldet die App das als *Limit erreicht (429)*.
- Der Feed ist nur so aktuell wie sein letzter Lauf – stündlich, plus
  jedes Mal, wenn du die App nach fünf Minuten Pause wieder öffnest.

Quellen und geprüfte Details: [`RECHERCHE.md`](RECHERCHE.md).
