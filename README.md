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
| **Daten** | alles im `localStorage` dieses Geräts; Backup als JSON; optional Cloud-Sync per Google-Login (Firestore). Geräte werden zusammengeführt – neuere Änderung gewinnt, Verlauf wird vereinigt, Löschungen und Rücknahmen überleben den Abgleich |

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

### Google-Anmeldung in der installierten iPhone-App

Safari blockiert den Anmelde-Speicher fremder Domains. Solange die App von
`github.io` läuft, aber die Anmeldung über `firebaseapp.com` geht, kann die
Anmeldung in der installierten App scheitern (im Safari-Tab klappt sie).
Zwei Wege:

1. **Ohne Server:** in Safari anmelden, dort «Als Datei exportieren», in
   der installierten App «Datei importieren» – wird zusammengeführt.
2. **Eigene Domain (Selbsthosting):** in `deploy/nginx.conf` den Block
   `/__/auth/` einkommentieren, in `index.html` bei `FIREBASE_CONFIG` das
   `authDomain` auf die eigene Domain setzen, in der Firebase-Konsole
   (Authentication → Settings → Authorized domains) die Domain ergänzen
   und im Google-Cloud-OAuth-Client `https://<domain>/__/auth/handler` als
   Redirect-URI eintragen.

### Testen

`tests/focus.smoke.mjs` fährt die App mit Playwright in Chromium durch:
Erststart, Routinen und To-Dos anlegen und erledigen, Tagesabschluss,
Migration alter Daten, Tageswechsel mit Joker über eine gestellte Uhr,
Merge-Konvergenz, Token-Scoreboard mit Belohnungen, den Modus «Bewegung
reduzieren» (nichts Unsichtbares darf Knöpfe blockieren) und die
Erinnerungen (ohne Systemberechtigung, keine Überlagerung, Ruhe in der
Pause). Voraussetzungen und Aufruf stehen im Kopf der Datei.

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
