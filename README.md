# WebAppKurzbefehl

## Projekte

- **`index.html`** – [HIGH](#high--routinen--to-dos): Routinen und To-Dos, die man
  wirklich durchzieht. Tagesring, Serie mit Joker und «nie zweimal»-Regel,
  Mini-Version für schwere Tage, Tagesabschluss mit den drei wichtigsten
  To-Dos für morgen, XP, Level und Abzeichen, Token-Scoreboard mit
  Belohnungen; Design nach Apple Human
  Interface Guidelines (hell und dunkel), offline als installierte App,
  Cloud-Sync, der Geräte zusammenführt statt überschreibt.
  [Live ansehen](https://colinrenggli-sudo.github.io/WebAppKurzbefehl/)
  oder `index.html` im Browser öffnen.
- **`shop/`** – [ELF11 Trikot Shop](shop/README.md): testbarer Onlineshop-Demo
  für Retro-Fussballtrikots mit SEO-Vollausbau, simulierter Stripe-Kasse und
  Apple-HIG-Design. Einfach `shop/index.html` im Browser öffnen.
- **`raumdesign/`** – [RAUMWERK](raumdesign/README.md): Grundriss hochladen,
  Stil wählen, komplette Einrichtung für jeden Raum erhalten – mit
  Raumansicht, möbliertem Plan, Moodboard und Möbelliste samt Budget.
  [Live ansehen](https://colinrenggli-sudo.github.io/WebAppKurzbefehl/raumdesign/)
  oder `raumdesign/index.html` im Browser öffnen.
- **`schlaf/`** – [SCHLAFWERK](schlaf/README.md): Wecker, der den eigenen
  Rhythmus kennt. Fester Wecker oder «weck mich in viereinhalb Stunden»,
  gerechnet mit der selbst gemessenen Zykluslänge; Fitbit-Daten per OAuth
  oder von Hand erfasst; Analyse von Chronotyp, Schlafbedarf,
  Regelmässigkeit, sozialem Jetlag und Schlafschuld; Schlafpläne von
  einphasig bis «zweimal pennen». Höchstens ein Hinweis pro Tag.
  [Live ansehen](https://colinrenggli-sudo.github.io/WebAppKurzbefehl/schlaf/)
  oder `schlaf/index.html` im Browser öffnen.
- **`dach/`** – [DACHWERK](dach/README.md): Auftragsverwaltung für
  Dachdecker und Spengler. Zwei Oberflächen aus einer Datei – der
  vierstellige Code entscheidet: Büro-Konsole am PC (Disposition,
  Aufträge, Karte, Lager, Rechnungen mit Schweizer QR-Zahlteil) oder
  Monteur-App am Handy (Sicherheitscheck, Checkliste, Fotos, Material,
  Zeit, Unterschrift). `dach/index.html` im Browser öffnen, Code `1234`
  für das Büro, `3456` für den Monteur.

## HIGH – Routinen & To-Dos

Eine HTML-Datei (`index.html`), dazu `sw.js`, `manifest.json` und die Icons.
Kein Build, kein Server nötig. Am besten als App installieren: in Safari
**Teilen → Zum Home-Bildschirm**.

### Was drin ist

| Bereich | Mechanik |
| --- | --- |
| **Heute** | Tagesring (erledigte / geplante Routinen), Wochenstreifen, Routinen mit Schritten, Anker («Nachdem ich …»), Mini-Version, Erinnerungszeit und Wochentagen; «Heute im Fokus» zeigt die nummerierten Fokus-To-Dos; abends «Tag abschliessen» |
| **Serie** | zählt Tage, an denen mindestens eine Routine erledigt wurde. Ein Joker (Start: 1, +1 alle 7 Tage, max. 2) springt an einem Tag ohne Haken automatisch ein. Ein einzelner Aussetzer nach einem erledigten Tag bricht nichts («nie zweimal»), Ruhetage sind neutral. Perfekte Tage (alle Routinen) geben Bonus und den Flammen-Kalender |
| **Nachsicht** | Tagesende einstellbar (Standard 03:00), «Gestern nachtragen» über den Wochenstreifen, Pause für Ferien, «Willkommen zurück» nach längerer Abwesenheit, Routine pro Tag pausieren |
| **XP & Level** | Routine 10, To-Do 5 (+5 Fokus, gedeckelt), perfekter Tag 25 + Serienbonus, Einrichtung 10. Levelkurve 100·(L−1)^1.5 mit Titeln von «Anfang» bis «Ein Fels». Ruhiger Modus blendet alles davon aus |
| **Abzeichen** | 30+, ohne Beschämung: auch «Zurück im Spiel», «Nie zweimal», «Mini zählt». Sichtbar sind die verdienten und die nächsten erreichbaren, alle auf einen Tipp |
| **To-Dos** | Schnelleingabe, Fälligkeit und Tageszeit, bis zu drei Fokus-To-Dos in Reihenfolge, Mitwander-Hinweis nach drei Tagen, Überfällige mit einem Tipp auf heute legen |
| **Token** | Scoreboard für erledigte Aufträge im echten Leben: Emoji antippen, kurz notieren, was geschafft wurde, Token gutschreiben. Jeder Token zählt für alle Belohnungen gleichzeitig (Standard: Kokosnuss 30, Schwein 100, Palme 500, Hund 1000; eigene Belohnungen mit Emoji und Schwelle möglich). Erreichte Belohnungen werden gefeiert; Einträge lassen sich bearbeiten, löschen und widerrufen |
| **Daten** | alles im `localStorage` dieses Geräts; Backup als JSON; optional Abgleich mit dem [eigenen Server](deploy/high-sync/README.md). Geräte werden zusammengeführt – neuere Änderung gewinnt, Verlauf wird vereinigt, Löschungen und Rücknahmen überleben den Abgleich |
| **Erinnerungen** | ohne Server nur, solange die App offen ist – iOS friert sie im Hintergrund ein. Mit dem eigenen Server kommen sie als echte Mitteilung, auch bei gesperrtem Bildschirm |

Die Zahlen und Regeln stehen kommentiert am Anfang des Skripts in
`index.html` (`GAME`, `LEVEL_TITLES`, `BADGES`). Der Hintergrund dazu:
Lally et al. 2010 (Gewohnheit nach ~66 Tagen, ein Aussetzer schadet nicht),
Gollwitzer (Wenn-dann-Pläne), Deci & Ryan (Belohnung als Information, nicht
als Grund – darum leise XP, kein Bonus für «rechtzeitig», keine
Zufallsbelohnungen), Milkman (Neustart-Effekt am Montag und Monatsersten).

### Erinnerungen – ehrlich benannt

Die App hat keinen Server. Erinnerungen werden von der App selbst
ausgelöst: am Computer auch im Hintergrund, auf dem iPhone dann, wenn die
App geöffnet wird oder kurz zuvor offen war. Ist die App im Vordergrund,
erscheint ein Hinweis oben im Bild statt einer Systemmeldung – dafür
braucht es keine Systemberechtigung. Pro Durchlauf kommt höchstens ein
Hinweis, nie über einem offenen Fenster; was man einmal hatte, kommt am
selben Kalendertag nicht wieder, und während einer Pause schweigen auch
die Routine-Erinnerungen. Für eine
Erinnerung zu einer festen Uhrzeit hilft die Kurzbefehle-App: Automation
«Um 07:30 → HIGH öffnen»; `index.html?tab=heute`, `?tab=todos`, `?tab=tokens` und
`?tab=progress` öffnen direkt den passenden Tab.

### Erinnerungen, die wirklich ankommen

iOS friert eine Web-App im Hintergrund ein: solange HIGH nicht offen
ist, läuft darin kein Code, also auch kein Timer. Eine Meldung um 07:30
kann deshalb nur von aussen kommen. Dafür gibt es unter
[`deploy/high-sync/`](deploy/high-sync/README.md) einen kleinen Dienst
für den eigenen Server. Er hält den Zustand als JSON-Datei und schickt
die Erinnerungen als Web Push.

Zum Verschicken muss der Server nicht von aussen erreichbar sein, er
schickt nur ausgehend. Erreichbar sein muss er nur für das eigene Gerät.
App und Schnittstelle liegen dabei auf derselben Adresse, deshalb
braucht es weder CORS noch eine Anmeldung über eine fremde Domain.

### Testen

Vier Testläufe, alle ohne Netz und ohne Konto:

| Datei | Was sie prüft | Dauer |
| --- | --- | --- |
| `tests/focus.smoke.mjs` | die App im Browser: Erststart, Routinen und To-Dos anlegen und erledigen, Tagesabschluss, Migration alter Daten, Tageswechsel mit Joker über eine gestellte Uhr, Merge-Konvergenz (auch: verdiente Joker gehen beim Koppeln nicht verloren), Token-Scoreboard, «Bewegung reduzieren», Erinnerungen, helles Thema bei 320 pt, Abgleich zwischen zwei Geräten | ~2 min |
| `tests/high-sync.plan.test.mjs` | die Erinnerungslogik des Dienstes als reine Rechnung: Tagesende um 03:00, Wecker nach Mitternacht, Ferien, erledigte Routinen | Sekunden |
| `tests/high-sync.haerte.test.mjs` | dass der Dienst nichts still verliert: kein Überschreiben ohne Bedingung, unlesbare Dateien gelten nie als leer, unsinnige Anfragen werfen ihn nicht um | Sekunden |
| `tests/high-sync.versand.test.mjs` | dass keine Erinnerung verlorengeht: ein gescheitertes Gerät wird wiederholt, kein anderes doppelt, abgelaufene Abos fliegen raus, und bei kaputtem Zustand läuft es aus der Tageskopie weiter | ~1 min |
| `tests/einrichten.test.sh` | `deploy/einrichten.sh` ohne Docker: erzeugt die Schlüssel einmal und beim zweiten Lauf gerade nicht mehr, druckt den richtigen Link, bricht mit verständlicher Meldung ab | ~1 min |

Playwright braucht der erste, die übrigen laufen mit blossem Node bzw. Bash.
Voraussetzungen und Aufruf stehen jeweils im Kopf der Datei.

## Selbst hosten

Alle Apps sind statische Dateien. Für den Betrieb auf dem eigenen Server
liegt unter [`deploy/`](deploy/) ein fertiges Setup: nginx im Container,
optional per Cloudflare Tunnel unter eigener Domain oder per Tailscale
nur im eigenen Netz.

- [`deploy/README.md`](deploy/README.md) – Schritt für Schritt auf Unraid
- [`deploy/HOMESERVER.md`](deploy/HOMESERVER.md) – was so ein Server sonst
  noch kann und was sich zuerst zu verbessern lohnt
- [`deploy/serverinfo.sh`](deploy/serverinfo.sh) – Bestandsaufnahme der
  Hardware, ändert nichts
