# GymLink US – Webseite für den US-Markt (Prototyp v1)

Eine komplett neue, eigenständige Webseite für den Markteintritt von GymLink in
den USA. Auf Englisch (en-US), weil die Zielgruppe US-Betreiber sind – die
Dokumentation bleibt auf Deutsch.

**Sofort ansehen:** `gymlink-us/index.html` im Browser öffnen. Kein Build, kein
Server, kein einziger externer Request.

```bash
cd gymlink-us && python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Was die Seite anders macht als die Schweizer Seite

Der Auftrag war, das Angebot besser darzustellen – bisher war vor allem die
Kundenansicht sichtbar. Die neue Seite zeigt **alle drei Rollen** als bedienbare
Produkt-Tour mit echten, nachgebauten Oberflächen:

| Rolle | Gerät | Was zu sehen ist |
|---|---|---|
| **Member** | iPhone | Tagessession, Live-Auslastung des Centers mit Prognose, Geräteverfügbarkeit pro Übung, Coach-Chat |
| **Trainer** | Tablet | Aufmerksamkeits-Queue nach Kündigungsrisiko, Adhärenz pro Mitglied, letzter Kontakt, Ein-Klick-Aktionen |
| **Manager** | Desktop | 90-Tage-Retention, Churn, PT-Attach-Rate, Auslastung nach Stunde, Geräte-Nachfrage vs. Kapazität, Risiko-Kohorte |

Die Umschaltung läuft über echte ARIA-Tabs (Pfeiltasten, Home/End funktionieren).
Auf schmalen Bildschirmen sind Tablet und Desktop horizontal scrollbar statt
unlesbar geschrumpft.

## Aufbau der Seite

1. **Hero** – „Keep the members you already paid for." + drei Karten, je eine Rolle
2. **The US retention math** – vier belegte Marktzahlen mit Quellenangabe
3. **Product tour** – die drei Dashboards (Kernstück)
4. **Equipment-aware programming** – der eigentliche Burggraben, mit Beispiel
5. **Rollout** – Analyse → Pilot-Club → Entscheid → Estate-Rollout
6. **ROI-Rechner** – rechnet live im Browser, Annahmen offengelegt
7. **Integrationen + Security** – ehrlich mit Status „Live" / „Roadmap"
8. **Pricing** – pro Standort, nie pro Mitglied
9. **Launch partners** – warum es noch keine US-Logos gibt
10. **FAQ** – inkl. der unangenehmen Fragen, mit FAQ-Schema für Google
11. **Demo-Formular** – mit Validierung und Fallback ohne Backend

## Konfiguration

### Demo-Formular

Ganz unten in `index.html`:

```js
const FORM_CONFIG = {
  endpoint: "",                 // z.B. "https://formspree.io/f/xxxxxxx"
  fallbackEmail: "hello@gymlink.us"
};
```

- **Leer gelassen:** Das Formular öffnet das Mailprogramm mit allen Feldern
  vorausgefüllt. Die Seite ist damit sofort nutzbar, auch ohne Backend.
- **Endpoint gesetzt:** Es wird JSON per POST geschickt (Formspree, Basin, eigener
  Handler). Fehlerfall fällt sauber auf die E-Mail-Adresse zurück.

### URLs vor dem Livegang ersetzen

In `index.html` (Canonical, Open Graph, JSON-LD), `sitemap.xml` und `robots.txt`
steht aktuell die GitHub-Pages-Adresse. Bei eigener Domain überall ersetzen.

## Technik

- Eine einzige Datei, ~2200 Zeilen, keine externen Requests, keine Schrift von
  Google, kein Tracker. Damit sind die Core Web Vitals von Anfang an grün und die
  Seite ist DSGVO-/CCPA-technisch unkompliziert.
- Drei Theme-Zustände: Hell, Dunkel per Systemeinstellung, und ein Umschalter der
  beide Richtungen überstimmt (`localStorage`).
- WCAG 2.1 AA: Skip-Link, sichtbarer Fokus, ARIA-Tabs mit Tastatur, Formular mit
  `aria-invalid` und Fehlertexten, alle Diagramme mit `role="img"` und
  beschreibendem Label, `prefers-reduced-motion` respektiert.
- Diagrammfarben sind gegen den Validator der Data-Viz-Vorgaben geprüft
  (Helligkeitsband, Chroma, Farbfehlsichtigkeit, Kontrast) – Details in
  [`RECHERCHE.md`](RECHERCHE.md).

## Was bewusst **nicht** auf der Seite steht

Keine erfundenen Testimonials, keine fremden Kundenlogos, kein „SOC 2 zertifiziert",
keine Erfolgszahlen von US-Kunden, die es noch nicht gibt. Das ist keine
Zurückhaltung, sondern Risikomanagement: erfundene Endorsements verstossen gegen
die FTC Endorsement Guides, und ein Betreiber, der dir Mitgliederdaten anvertraut,
darf sich bei keiner einzigen Aussage fragen müssen, ob sie stimmt. Stattdessen
gibt es den Abschnitt „Launch partners", der offen sagt, wo GymLink in den USA
steht.

**Ein echtes Problem, das vor dem Launch geklärt werden muss:** der Name
„GymLink" ist im US-App-Store bereits mehrfach besetzt. Details und Empfehlung in
[`RECHERCHE.md`](RECHERCHE.md), Abschnitt „Namensrisiko".

## Vor dem Livegang noch nötig

- [ ] **Markenrecherche „GymLink" in den USA** (USPTO + App Stores) – siehe RECHERCHE.md
- [ ] Domain und URLs ersetzen, `og-image.jpg` (1200×630) erstellen
- [ ] Formular-Endpoint eintragen und einmal echt durchtesten
- [ ] Preise final bestätigen – die Zahlen hier sind ein begründeter Vorschlag,
      kein Beschluss
- [ ] Rechtsseiten ergänzen: Privacy Policy (CCPA/CPRA), Terms, Accessibility
      Statement, Impressum der US-Entität
- [ ] Integrations-Status pro Anbieter verifizieren, bevor er öffentlich steht
- [ ] Analytics ohne Cookies (z.B. Plausible) einbauen, falls gewünscht

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die komplette Seite – Markup, Design-Tokens, Mockups, Logik |
| `RECHERCHE.md` | Marktrecherche, Wettbewerb, Positionierung, Compliance, Quellen |
| `robots.txt` | Crawler-Freigabe und Sitemap-Verweis |
| `sitemap.xml` | URLs für die Search Console |
