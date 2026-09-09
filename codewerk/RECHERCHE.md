# Recherche – was geprüft wurde und was dabei herauskam

Stand: 9. September 2026. Alles hier stammt aus der offiziellen
Dokumentation, nicht aus Beobachtung oder Ausprobieren an fremden
Endpunkten.

---

## 1 · Eine neue Session per HTTP starten — geht

Der Boostknopf steht auf festem Grund. Routinen kennen drei Auslöser:
Zeitplan, GitHub-Ereignis und **API**. Der API-Auslöser gibt jeder
Routine einen eigenen HTTP-Endpunkt.

```http
POST https://api.anthropic.com/v1/claude_code/routines/{routine_id}/fire
Authorization: Bearer sk-ant-oat01-…
anthropic-version: 2023-06-01
anthropic-beta: experimental-cc-routine-2026-04-01
Content-Type: application/json

{ "text": "…" }
```

Antwort bei Erfolg (`200`):

```json
{ "type": "routine_fire",
  "claude_code_session_id":  "session_01HJKLMNOPQRSTUVWXYZ",
  "claude_code_session_url": "https://claude.ai/code/session_01HJKLMNOPQRSTUVWXYZ" }
```

Geprüfte Einzelheiten, die in die App eingeflossen sind:

- **Die Kennung im Pfad beginnt mit `trig_`**, nicht mit `routine_` –
  trotz des Parameternamens `routine_id`. Steht so in der Referenz.
- **Der Beta-Kopf ist Pflicht.** Fehlt er, kommt `400`. Deshalb ist er
  in der App als Konstante `BETA` an einer Stelle abgelegt.
- **`text` ist optional**, höchstens 65 536 Zeichen, und wird *nicht*
  ausgewertet: schickt man JSON, kommt es als Zeichenkette an.
- **`text` landet in einem `<routine-fire-payload>`-Block** und gilt
  ausdrücklich als *nicht vertrauenswürdige Daten*. Eine Routine
  ignoriert ihn, wenn ihr Prompt ihn nicht ausdrücklich aufgreift –
  darum sagt der Prompt in `ROUTINE.md` das ausdrücklich.
- **Kein Idempotenzschlüssel.** Jeder Aufruf legt eine neue Session an.
  Deshalb sperrt die App den Knopf, solange eine Anfrage läuft.
- **Der Token ist auf eine Routine begrenzt** und hat keinen
  Lesezugriff, keinen Zugriff auf andere Routinen und keinen auf
  Kontodaten. Das ist der Grund, warum er in der App auch direkt auf
  dem Gerät liegen darf.
- **Fehlerbilder**: `400` fehlender Beta-Kopf / `text` zu lang /
  Routine pausiert · `401` Token passt nicht · `403` Konto ohne
  Freigabe · `404` Routine gibt es nicht · `429` Limit, mit
  `Retry-After` · `500` · `503` (nicht 529 wie sonst bei Anthropic).
  Alle sind in der Funktion `explain()` in Klartext übersetzt.

Quellen:
- [Trigger a routine through the API](https://platform.claude.com/docs/en/api/claude-code/routines-fire)
- [Automate work with routines → Add an API trigger](https://code.claude.com/docs/en/routines#add-an-api-trigger)

### Was nicht geprüft werden konnte

Ob `api.anthropic.com` für diesen Endpunkt **CORS** erlaubt, ist
nirgends dokumentiert, und ein Test von aussen wäre nur ein Indiz
gewesen. Darum kann die App beides: direkt anfragen, und – wenn der
Browser dichtmacht – über den eigenen Server
([`deploy/claude-hub`](../deploy/claude-hub/)). Der Fehlerfall ist
abgefangen und weist genau darauf hin.

---

## 2 · Die eigenen Sessions auflisten — geht nicht

Gesucht war ein Endpunkt, der die letzten Sessions zurückgibt. Es gibt
keinen.

- Die Dokumentation zu Claude Code im Web beschreibt die Sitzungsliste
  nur als Oberfläche in der Seitenleiste von claude.ai/code.
- Die CLI kann Cloud-Sessions **nicht** als JSON auflisten. `--teleport`
  öffnet eine Auswahl zum Anklicken, `/tasks` eine Ansicht im Terminal.
  `--output-format json` gibt es nur zusammen mit `-p`, und dort für
  das Zustellen einer Nachricht an eine **bereits bekannte** Session.
- Die Referenz zum Routinen-Endpunkt hält ausdrücklich fest, dass der
  Token **keinen Lesezugriff** gibt und dass es unter
  `/v1/claude_code/…` sonst nichts Öffentliches gibt.
- Für die Unterhaltungen auf claude.ai gibt es ebenfalls keine
  öffentliche Schnittstelle.

**Konsequenz für die App.** Der Umweg führt über eine Routine: eine
Cloud-Session *hat* über ihre Claude-Code-Remote-Anbindung Zugriff auf
die eigene Sitzungsliste. Sie kann sie also einsammeln, einstufen und
als JSON ablegen. Genau das macht die zweite Routine in
[`ROUTINE.md`](ROUTINE.md).

Bewusst **nicht** gemacht: die internen Endpunkte nachbauen, die die
Weboberfläche von claude.ai selbst benutzt. Die sind nicht
dokumentiert, brauchen das Sitzungs-Cookie und ändern sich ohne
Ankündigung – eine App darauf zu stellen hiesse, sie regelmässig
reparieren zu müssen.

Quellen:
- [Use Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)
- [CLI reference](https://code.claude.com/docs/en/cli-reference)

---

## 3 · Netzzugang der Routine

Cloud-Sessions laufen standardmässig mit **Trusted**-Netzzugang: offen
ist nur eine Liste bekannter Domains (Paketregistries,
Cloud-Anbieter-APIs, übliche Entwicklerdomains). Alles andere wird mit
`403` und `x-deny-reason: host_not_allowed` abgewiesen.

Damit die Sammel-Routine den Feed an den eigenen Server schicken kann,
muss dessen Domain in der Umgebung unter *Network access* → **Custom**
eingetragen oder **Full** gewählt werden. Steht so in der Anleitung zum
Hub und in `ROUTINE.md`.

Quelle: [Routines → Environments and network access](https://code.claude.com/docs/en/routines#environments-and-network-access)

---

## 4 · Kontingente

Routinen zählen doppelt: gegen die normale Nutzung des Abos **und**
gegen ein tägliches Kontingent an Läufen pro Konto. Ist eines davon
aufgebraucht, kommt `429` mit `Retry-After`. Der aktuelle Stand steht
auf [claude.ai/code/routines](https://claude.ai/code/routines).

Für die App heisst das: Der Boostknopf ist kein Spielzeug, jeder Druck
kostet einen Lauf. Die stündliche Sammel-Routine ebenfalls – wem das zu
viel ist, stellt sie auf einen grösseren Abstand oder lässt sie ganz
weg und pflegt die Liste von Hand.

Quelle: [Routines → Usage and limits](https://code.claude.com/docs/en/routines#usage-and-limits)

---

## 5 · Kleinkram, der in der App steckt

- **Pop-up-Blocker.** Ein `window.open()` nach einem `await` gilt nicht
  mehr als Folge des Antippens und wird geblockt. Die App öffnet das
  Fenster deshalb schon im Klick und füllt es später mit dem Link.
  Scheitert auch das, gibt es einen Knopf zum Antippen.
- **Teilen-Menü.** `share_target` im Manifest funktioniert auf Android,
  auf iOS nicht. Darum ist Einsetzen von Hand der Hauptweg und das
  Teilen die Zugabe.
- **`text-transform` und Prüfungen.** Die Gruppenüberschriften stehen im
  CSS in Grossbuchstaben; im Markup steht *Läuft gerade*. Wer den
  sichtbaren Text prüft, muss das wissen.
