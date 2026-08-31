# Plan: modulares ERP-Baukastensystem, Erstkunde MAXXPARK

Stand 30.08.2026. Anschluss an das ERP-Dossier vom 28.08.2026 (Betriebsanalyse
MAXXPARK AG / MAXX Factory AG, Oftringen AG).

| Datei | Inhalt |
|---|---|
| `maxxpark-plan.html` | Der vollständige Plan: Ziel, die vier Entscheide, Fachkern, Modulschnitt, Konfigurator, Architektur, Artikelstamm, Partnernetz, KI, Schweizer Pflichtteil, Bestandsanalyse, Nutzen und Preis, Vertrag und Eigentum, Markt, Kapazität und Fahrplan, Einführung und Betrieb, Ablauf und Fragenkatalog für den Discovery-Termin, Risiken und Abbruchkriterien. Im Browser öffnen. |
| `dachwerk-code-inventar.md` | Vermessung von `dach/index.html` (10'356 Zeilen): Bausteine mit Zeilenbereichen, was in eine Plattform überlebt, was ersetzt werden muss. |

## Grundlage

Zwanzig Rechercheläufe mit anschliessender adversarischer Gegenprüfung. Jede Aussage im
Plan trägt eine Belegstufe: `belegt`, `abgeleitet`, `offen`, `nachprüfen`. Die Stufe
`nachprüfen` markiert Aussagen, die inhaltlich mit hoher Sicherheit richtig sind, aber in
der Recherche nicht an der Primärquelle verifiziert werden konnten — sie gehören vor
jeder Verwendung gegenüber dem Kunden oder in einem Vertrag geprüft.

Am 30.08. selbst an der Quelle geprüft: Swiss-QR-Implementation-Guidelines (seit
21.11.2025 nur noch strukturierte Adressen, Typ S), MWST-Sätze 2026 (Normalsatz 8.1 %),
Art. 5 Entsendegesetz (Solidarhaftung des Erstunternehmers im Bauneben­gewerbe über die
ganze Vertragskette), Allgemeinverbindlichkeit des LGAV Plattenlegergewerbe für den
Kanton Aargau.

## Die vier Entscheide vor der ersten Codezeile

1. **Fundament** – eigener Kern, Aufsatz oder Standard plus eigene Schicht. Entschieden
   nach fünf Tagen Prüfung mit fünf Testfällen aus dem echten Geschäft, nicht vorher.
2. **Mandantenmodell** – ein Mandant mit zwei Gesellschaften, zweistufig in jeder Tabelle
   ab Tag 1.
3. **Wiederverwendungsrecht** – schriftlich, im ersten bezahlten Dokument, nicht erst im
   Projektvertrag.
4. **Die Nicht-Liste** – Buchhaltung, Lohn, Zahlungsverkehr, CRM und 3D-Planung werden
   angebunden, nicht gebaut.
