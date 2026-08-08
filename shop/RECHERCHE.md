# Recherche: Was ein Trikot-Onlineshop braucht

Stand: August 2026 · Grundlage für den ELF11 Trikot Shop (`shop/index.html`)

> Hinweis: `musan.shop` liess sich aus dieser Umgebung nicht abrufen (der
> Netzwerk-Proxy blockiert die Domain). Die Struktur unten stammt daher aus
> aktueller Fachliteratur zu D2C-Trikotshops, E-Commerce-SEO und Schweizer
> Onlinehandelsrecht – die Quellen stehen in Abschnitt 7.

---

## 1. Geschäftsmodell und Sortiment

Retro-Trikotshops verkaufen direkt an Endkunden (D2C) und leben von drei Dingen:

- **Kuratiertes Sortiment statt Riesenkatalog.** 10–50 Trikots, klar gruppiert
  nach Club-Retro, Nationalteams und Eigen-Editionen. Die Demo bildet genau
  diese drei Kategorien ab.
- **Emotionales Storytelling.** Jedes Trikot erzählt eine Geschichte – Saison,
  Turnier, legendäres Spiel. Das ist gleichzeitig SEO-Content und Kaufargument.
- **Preisanker und Schwellen.** CHF 60–90 pro Trikot, Streichpreise für Sales,
  Gratisversand ab CHF 100 als Anreiz für einen zweiten Artikel im Korb.
- **Grössen S–XXL** mit Lagerbestand pro Grösse und ehrlicher
  Verfügbarkeitsanzeige („Nur noch 3 Stück in Grösse L").

⚠️ **Markenrecht:** Vereinslogos, Vereinsnamen und Trikotdesigns sind
geschützt. Entweder Lizenzware beziehungsweise Originale verkaufen – oder, wie
in dieser Demo, eigenständige Designs mit Stadt- und Jahrgangsbezug ohne
geschützte Embleme.

## 2. SEO

### In der Demo umgesetzt

| Massnahme | Wo |
|---|---|
| Title und Meta Description mit Kauf-Keyword und Schweiz-Bezug | `<head>` |
| JSON-LD `OnlineStore` (Adresse, Währung, Zahlungsmittel) | `<head>` |
| JSON-LD `WebSite` mit `SearchAction` | `<head>` |
| JSON-LD `ItemList` mit 10 `Product`-Einträgen: Preis, Währung, `availability`, `itemCondition`, `shippingDetails`, `hasMerchantReturnPolicy`, `AggregateRating` | `<head>` |
| JSON-LD `BreadcrumbList` und `FAQPage` (passend zum sichtbaren FAQ-Block) | `<head>` |
| Open Graph und Twitter Cards inkl. `og:image:alt` | `<head>` |
| Canonical-URL, `robots`-Meta, `theme-color` je Farbschema | `<head>` |
| `robots.txt` und `sitemap.xml` | `shop/` |
| Semantisches HTML, genau eine H1, Aria-Labels, sichtbarer Fokus | ganze Seite |
| Core Web Vitals: eine Datei, null externe Requests, keine Web-Fonts | Architektur |

Zwei Punkte aus der Recherche, die die Architektur bestimmt haben:

1. **JSON-LD ist das von Google bevorzugte Format** und hält rund 55 % Anteil
   unter den Strukturdaten-Formaten.
2. **Strukturierte Daten müssen statisch im HTML stehen.** Crawler parsen
   statisches HTML mit rund 94 % Erfolgsquote, per JavaScript nachgeladene
   Inhalte nur mit rund 23 %. Darum stehen alle fünf JSON-LD-Blöcke fix im
   `<head>` und werden nicht zur Laufzeit erzeugt.

Rich Snippets – Sterne, Preis, Verfügbarkeit – heben die Klickrate messbar an
(je nach Studie 20–30 % gegenüber reinen Textergebnissen).

### Vor dem Livegang

1. Eigene Domain eintragen, alle `shop.example.ch`-Platzhalter ersetzen.
2. **Eine indexierbare URL pro Trikot.** Statisch generierte Produktseiten mit
   eigenem `Product`-Schema. Hash-Routen wie `#/trikot/...` werden von Google
   nicht als eigenständige Seiten indexiert – sie sind in der Demo nur für
   teilbare Deep-Links da.
3. Echte Produktfotos (Front, Rücken, Detail), sprechende Dateinamen,
   Alt-Texte, WebP oder AVIF, dazu ein eigenes `og:image` pro Produkt.
4. Google Search Console einrichten, Sitemap einreichen, Rich-Results-Test und
   Schema-Validator laufen lassen, Fehler im Bericht beobachten.
5. Kategorietexte („Retro Trikots Schweiz kaufen") und Ratgeber-Artikel
   („Die 10 schönsten Trikots der 90er") für Longtail-Suchanfragen.
6. **Nur echte Bewertungen auszeichnen.** Erfundene Ratings verstossen gegen
   die Google-Richtlinien und gegen das UWG. Die Demo-Bewertungen und
   `AggregateRating`-Werte vor dem Livegang durch echte ersetzen oder entfernen.
7. Hreflang, falls zusätzlich französische oder italienische Versionen kommen.

## 3. Stripe-Anbindung

Die Demo simuliert den Stripe-Zahlungsfluss vollständig: Zahlungsblatt,
Kartenformatierung, Luhn-Prüfung, Ablaufdatums-Check, Ladezustand, Ablehnung,
Bestellbestätigung mit Liefertermin. Testkarten wie bei echtem Stripe:
`4242 4242 4242 4242` gelingt, `4000 0000 0000 0002` wird abgelehnt.

### Weg A: Payment Links – ohne Backend

Payment Links brauchen **keinen Server und keinen Code**. Im Stripe-Dashboard
pro Produkt einen Link erstellen (Produkt, Preis in CHF, Grössen als Optionen),
dann in `shop/index.html` eintragen:

```js
const STRIPE_CONFIG = {
  paymentLinks: {
    "zuerich-heim-1986": "https://buy.stripe.com/test_XXXX"
  }
};
```

Der Kauf-Button leitet dann direkt auf Stripes gehostete Kasse – inklusive
Apple Pay, Google Pay und **TWINT**, in der Schweiz die wichtigste Zahlungsart.
Ideal für statisches Hosting wie GitHub Pages.

### Weg B: Checkout Sessions – mit eigenem Backend

Nötig für Warenkörbe mit mehreren Positionen, Lagerverwaltung und eigene
Bestell-E-Mails:

```js
// Node/Express, serverseitig
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
  const line_items = req.body.items.map((i) => ({
    price_data: {
      currency: "chf",
      product_data: { name: `${i.name} (Grösse ${i.size})` },
      unit_amount: Math.round(i.price * 100)
    },
    quantity: i.qty
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    payment_method_types: ["card", "twint"],
    shipping_address_collection: { allowed_countries: ["CH", "LI"] },
    success_url: "https://deinshop.ch/danke?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "https://deinshop.ch/warenkorb"
  });
  res.json({ url: session.url });
});
```

Dazu ein Webhook auf `checkout.session.completed` für Bestellbestätigung und
Versandauslösung. Im Frontend genügt es, `publishableKey` und
`checkoutEndpoint` in `STRIPE_CONFIG` zu setzen – der Rest des Codes ruft
den echten Checkout dann automatisch auf.

**Wichtig:** Preise immer serverseitig aus der eigenen Datenbank holen, nie aus
dem Browser übernehmen. Sonst kann der Warenkorb manipuliert werden.

**Gebühren (Richtwert Schweiz):** rund 2.9 % plus CHF 0.30 pro Transaktion für
europäische Karten, TWINT separat. Auszahlung auf ein CHF-Konto. Kartendaten
erreichen den eigenen Server nie, dadurch stark reduzierter PCI-Aufwand (SAQ A).

## 4. Recht in der Schweiz

- **Impressum ist Pflicht** (UWG Art. 3): vollständige Firma beziehungsweise
  Vor- und Nachname, physische Adresse – kein reines Postfach – und eine
  Kontaktmöglichkeit.
- **Preisangaben:** Endpreise inklusive MwSt., Versandkosten klar ausgewiesen
  (Preisbekanntgabeverordnung).
- **Kein gesetzliches Widerrufsrecht** im Schweizer Onlinehandel, anders als in
  der EU. Ein freiwilliges Rückgaberecht – hier 30 Tage – muss ausdrücklich in
  den AGB geregelt sein.
- **AGB** sind nicht zwingend, aber dringend empfohlen: Vertragsschluss,
  Zahlung, Lieferung, Retouren, Gewährleistung, Gerichtsstand. Sie müssen vor
  dem Kauf leicht zugänglich sein und im Checkout bestätigt werden – genau das
  macht die Checkbox im Zahlungsschritt der Demo.
- **Datenschutzerklärung nach revDSG** (in Kraft seit September 2023) ist
  Pflicht: erhobene Daten, Zwecke, Empfänger (Stripe, Post, Hosting),
  Auslandtransfer in die USA, Betroffenenrechte, verantwortliche Person.
- **Verkauf in die EU:** dann gilt zusätzlich das Recht am Kundenwohnsitz –
  14 Tage Widerrufsrecht, Button-Lösung („zahlungspflichtig bestellen"), unter
  Umständen das OSS-Verfahren für die EU-Mehrwertsteuer.
- **MwSt. Schweiz:** Registrierungspflicht ab CHF 100'000 Umsatz weltweit.

Die Demo enthält unter **Mehr → Rechtliches** Platzhalterseiten mit genau
diesen Checklisten.

## 5. UI/UX nach den Apple Human Interface Guidelines

Umgesetzt:

- **Systemtypografie** (SF Pro über `-apple-system`), Large Title mit 34 pt,
  der beim Scrollen in eine kompakte Navigation Bar mit Milchglaseffekt
  (`backdrop-filter`) übergeht.
- **Tab-Bar** unten mit vier Tabs und Badge auf dem Warenkorb, respektiert die
  Safe-Area-Insets von Notch und Homebar (`env(safe-area-inset-*)`).
- **iOS-Bausteine:** Segmented Control, Inset-Grouped-Listen, Sheets mit
  Grabber und Feder-Animation (`cubic-bezier(0.32,0.72,0,1)`), Stepper,
  Radio- und Checkbox-Zeilen, Toasts.
- **Systemfarben in beiden Erscheinungsbildern**, automatisch über
  `prefers-color-scheme` und manuell über den Umschalter oben rechts – drei
  Zustände: System, Hell, Dunkel, gespeichert im lokalen Speicher.
- **Barrierefreiheit:** Touch-Ziele ab 44 pt, sichtbare Fokusringe, Fokusfalle
  in Sheets, `inert` für den Hintergrund, Escape schliesst das oberste Sheet,
  `prefers-reduced-motion` wird respektiert, `aria-live` für Lagerhinweise.
- **Zahlen mit `tabular-nums`**, damit Preisspalten sauber untereinander stehen.
- **Klare Sprache:** Buttons sagen, was passiert („CHF 179.70 bezahlen"),
  Fehlermeldungen nennen die Lösung („Für die Demo: 4242 4242 4242 4242").

## 6. Roadmap bis zum Livebetrieb

1. Domain und Hosting – für den Start genügt GitHub Pages oder Cloudflare Pages
2. Echte Produktfotos und finale Produkttexte
3. Stripe-Konto (Schweiz) eröffnen, TWINT aktivieren, Payment Links eintragen
4. Rechtstexte finalisieren: Impressum, Datenschutz, AGB
5. Bestell-E-Mails – bei Payment Links übernimmt das Stripe, bei Weg B der Webhook
6. Statische Produktseiten generieren, Search Console einrichten
7. Analytics, zum Beispiel Plausible – cookiefrei und revDSG-freundlich
8. Lager- und Bestellverwaltung, zu Beginn genügt das Stripe-Dashboard

## 7. Quellen

- [Product Schema Markup Guide for Ecommerce (2026), rankai.ai](https://rankai.ai/articles/product-schema-markup-guide-for-ecommerce-json-ld)
- [Ecommerce Product-Page SEO 2026 Optimization Guide, digitalapplied.com](https://www.digitalapplied.com/blog/ecommerce-product-page-seo-2026-optimization-playbook)
- [Rich Snippets & Structured Data for eCommerce, outerboxdesign.com](https://www.outerboxdesign.com/articles/seo/rich-snippets-importance-for-an-ecommerce-website/)
- [Schema Markup for SEO: Structured Data Guide, opace.agency](https://opace.agency/blog/structured-data-schema-for-seo/)
- [Product & Category Schema for eCommerce, resultfirst.com](https://www.resultfirst.com/blog/ecommerce-seo/product-and-category-schema-for-ecommerce/)
- [Stripe Payment Links – Dokumentation](https://docs.stripe.com/payment-links)
- [Stripe Online Payments – Dokumentation](https://docs.stripe.com/payments/online-payments)
- [Guide to using payment links, stripe.com](https://stripe.com/resources/more/payment-links)
- [Impressumspflicht Schweiz, fraglexa.ch](https://fraglexa.ch/blog/impressumspflicht-schweiz)
- [Impressumspflicht Schweiz – Guide für KMU, digital-cloud-market.ch](https://www.digital-cloud-market.ch/blog/impressumspflicht-schweiz-2026)
- [Sind AGB für Online-Shops zwingend? VertragsZentrum](https://vertragszentrum.ch/online-shops-agb/)
- [Onlineshop in der Schweiz: 5 Fragen, 5 Antworten, legal-office.ch](https://legal-office.ch/blog/onlineshop-in-der-schweiz-5-fragen-5-antworten)
