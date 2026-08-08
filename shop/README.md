# ELF11 Trikot Shop – Demo

Ein vollständig testbarer Trikot-Onlineshop: Katalog, Produktdetails,
Warenkorb, dreistufige Kasse mit simulierter Stripe-Zahlung, SEO-Vollausbau
und Apple-HIG-Design in Hell und Dunkel.

## Sofort ausprobieren

`shop/index.html` im Browser öffnen – mehr braucht es nicht. Keine
Installation, kein Build, kein Server. Die Seite kommt ohne einen einzigen
externen Request aus.

Lokal mit Server (empfohlen, damit das Deep-Linking sauber funktioniert):

```bash
cd shop && python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Den Kaufablauf durchspielen

1. Trikot antippen, Grösse wählen, in den Warenkorb legen
2. Tab **Warenkorb** → **Zur Kasse**
3. Adresse ausfüllen (leer lassen zeigt die Feldvalidierung)
4. Versandart wählen – A-Post kostet auch über CHF 100 Aufpreis
5. AGB bestätigen und mit einer Testkarte bezahlen:
   - `4242 4242 4242 4242` → Zahlung gelingt
   - `4000 0000 0000 0002` → Karte wird abgelehnt
   - Datum in der Zukunft, beliebiger CVC

Warenkorb und Favoriten liegen im lokalen Speicher des Browsers und überleben
das Neuladen. Unter **Mehr → Warenkorb & Favoriten löschen** wird alles
zurückgesetzt.

## Echte Stripe-Zahlungen aktivieren

In `index.html` den Block `STRIPE_CONFIG` ausfüllen:

```js
const STRIPE_CONFIG = {
  publishableKey: "",     // Weg B: "pk_live_..."
  checkoutEndpoint: "",   // Weg B: eigener Server-Endpunkt
  paymentLinks: {}        // Weg A: { "zuerich-heim-1986": "https://buy.stripe.com/..." }
};
```

- **Weg A (ohne Server):** Payment Links im Stripe-Dashboard erstellen und hier
  eintragen. Reicht für den Start und läuft auf statischem Hosting.
- **Weg B (mit Server):** Endpunkt gibt eine Checkout Session zurück. Nötig für
  Warenkörbe mit mehreren Positionen.

Sobald etwas konfiguriert ist, zeigt **Mehr → Stripe** statt „Demo-Modus" den
Status „Konfiguriert" und der Kauf-Button springt in den echten Ablauf.
Beispiel-Servercode: [`RECHERCHE.md`](RECHERCHE.md).

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die komplette App – Markup, Design-Tokens, Logik, Produktdaten |
| `RECHERCHE.md` | Recherche zu Sortiment, SEO, Stripe, Schweizer Recht, HIG |
| `robots.txt` | Crawler-Freigabe und Sitemap-Verweis |
| `sitemap.xml` | Alle URLs für die Search Console |

## Was vor dem Livegang noch nötig ist

- Bei eigener Domain die URLs in `index.html`, `sitemap.xml` und `robots.txt`
  ersetzen (aktuell die GitHub-Pages-Adresse)
- Pro Trikot eine statisch generierte, indexierbare Produktseite
- Echte Produktfotos statt der generierten Trikot-Grafiken
- Impressum, Datenschutzerklärung und AGB mit echten Angaben füllen
- Demo-Bewertungen durch echte ersetzen – erfundene Ratings verstossen gegen
  Google-Richtlinien und das UWG

Details und Quellen stehen in [`RECHERCHE.md`](RECHERCHE.md).
