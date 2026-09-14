# Recherche: Treuhandfirmen mit offenen Stellen als Zielkunden

Stand: 14. September 2026 · Grundlage für den Lead-Radar (`treuhand/index.html`)

Fünfzehn Agenten haben parallel gesucht: vier haben die Quellenlandschaft
kartiert, sieben haben Stelleninserate geerntet, drei haben Markt, Recht und
Zielkundenprofil bearbeitet, einer hat am Schluss nach Lücken gesucht.
Ergebnis: 248 Rohtreffer, nach Bereinigung **130 Firmen**, davon **89 mit
einer aktuell ausgeschriebenen Stelle**, und **159 Quellen**. Die eigentliche
Arbeitsliste sind **36 Firmen** mit offener Stelle, ohne Vermittler dazwischen
und mit Score 70 oder höher.

---

## 0 Zur Belastbarkeit — bitte zuerst lesen

Drei Einschränkungen, die bestimmen, was mit diesen Daten geht und was nicht.

**Erstens: keine einzige Firma ist verifiziert.** Der Egress-Proxy dieser
Umgebung hat `WebFetch` auf praktisch jeder Zieldomain blockiert — getestet und
bestätigt für jobs.ch, job-room.ch, linkedin.com, treuhandsuisse.ch, veb.ch,
bfs.admin.ch, zefix.ch und selbst example.com. Das ist eine Netzwerkrichtlinie,
kein Bot-Schutz der Zielseiten. Die Firmen unten stammen deshalb **aus der
Suchindexierung**, nicht aus geladenen Inseratsseiten: Firmenname und Stelle
stehen im Suchtreffer, die Inseratsseite hat niemand geöffnet. Jeder Eintrag
trägt darum den Status *indiziert*. Praktische Folge: **Vor der ersten Mail das
Inserat aufrufen und prüfen, ob es noch läuft.** Ein Inserat, das längst besetzt
ist, macht aus einer guten Mail eine peinliche.

**Zweitens: es gibt in diesem Dokument keine Marktzahlen.** Der dafür zuständige
Agent hatte zusätzlich sein Suchbudget aufgebraucht (200 von 200 Aufrufen) und
hat sich bewusst geweigert, plausibel klingende Zahlen aus dem Gedächtnis zu
liefern. Das war die richtige Entscheidung: Treuhänder prüfen Zahlen
berufsmässig nach, und eine Quelle, die die genannte Zahl nicht hergibt,
disqualifiziert Flusswerk beim Empfänger sofort und dauerhaft. Was fehlt und wo
es zu holen ist, steht in Abschnitt 6.

**Drittens: die Rechtsauskunft in Abschnitt 5 ist Modellwissen, kein
Gesetzestext.** Auch dort war kein Primärtext ladbar. Die Artikelnummern und
Wortlaute sind aus dem Gedächtnis wiedergegeben und gehören vor dem Echtbetrieb
an `fedlex.admin.ch` gegengelesen — Aufwand etwa eine halbe Stunde, die URLs
stehen dabei.

Was davon unberührt bleibt: die Quellenlandschaft (Abschnitt 1–2), die beiden
API-Funde (Abschnitt 3) und das Zielkundenprofil (Abschnitt 4). Das sind
Struktur- und Analyseergebnisse, keine Statistik.

---

## 1 Die Quellenlandschaft in fünf Ebenen

Die naheliegende Antwort auf «wo finde ich Treuhandfirmen mit offenen Stellen»
ist jobs.ch. Die ist nicht falsch, aber sie ist die teuerste und am dichtesten
bearbeitete. Interessanter sind die Ebenen darunter.

### Ebene 1 — Generalisten

`jobs.ch` ist Marktführer und hat die meisten Treffer, ist aber für ein
Treuhandbüro mit zwölf Leuten teuer. Wer dort inseriert, hat Budget und meint es
ernst — gutes Signal, aber auch der grösste Wettbewerb um Aufmerksamkeit.
`jobscout24.ch` und `jobup.ch` gehören zum selben Konzern (JobCloud) und zeigen
zu grossen Teilen dieselben Inserate.

Die Entdeckung dieser Ebene ist **`jobwinner.ch`**: die Inseratstitel enthalten
dort Firmenname *und* vollständige Strassenadresse. Für eine Besuchsliste ist
das Gold — man bekommt die Adresse, ohne je die Seite zu öffnen.

### Ebene 2 — Regionale Kanäle, die eigentliche Fundgrube

`zentraljob.ch` (Jobchannel AG) deckt exakt unser Prio-Gebiet ab: Luzern, Zug,
Schwyz, Nidwalden, Obwalden, Uri. Wer dort und nicht auf jobs.ch inseriert, ist
tendenziell genau unsere Grösse. Dazu die Regionalpresse (Luzerner Zeitung,
zentralplus, Rontaler, Seetaler Bote, Willisauer Bote, Entlebucher Anzeiger) und
die Gewerbevereine.

### Ebene 3 — Amtlich und gratis

`job-room.ch` (SECO) ist die offizielle Stellenplattform und für Arbeitgeber
kostenlos. Genau darum inserieren dort kleine Büros, die sich jobs.ch sparen.
Dazu kommt die **Stellenmeldepflicht**: Berufsarten mit hoher Arbeitslosigkeit
müssen zuerst dort gemeldet werden — wo Treuhandberufe aktuell stehen, ist zu
prüfen, aber es macht diese Quelle strukturell vollständiger als jede private.

`zefix.ch` (Handelsregister) liefert kein Inserat, aber das **Firmenuniversum**:
alle Treuhandgesellschaften eines Kantons mit Rechtsform, Adresse und Organen.

### Ebene 4 — Verzeichnisse als Zielgruppen-Universum

Diese Ebene liefert keine Vakanzen, sondern die Grundgesamtheit, gegen die man
alles andere abgleicht:

- **TREUHAND|SUISSE** Mitgliederverzeichnis — KMU-orientierte Treuhänder, also
  genau unsere Zielgruppe. Mitgliedschaft ist ein *positives* Passungssignal.
- **EXPERTsuisse** — revisionslastiger. Schwerpunkt dort plus RAB-Zulassung ist
  ein *negatives* Signal.
- **bexio-Treuhänderverzeichnis, Abacus-Partnerliste, Klara- und
  Sage-Partnerlisten** — das sind Firmenlisten *inklusive Software-Stack*.
  Für unser Muster die wertvollste Verzeichnisart überhaupt, weil sie die
  Passungsfrage schon halb beantwortet.
- **OpenStreetMap Overpass** (`office=accountant` / `tax_advisor`) — die
  technisch einfachste Firmenliste: kein Login, kein Bot-Schutz.

### Ebene 5 — Indirekte Signale

Kleine Büros mit zwei bis fünfzehn Leuten schalten oft gar kein bezahltes
Inserat, sondern setzen einen LinkedIn-Post ab («wir suchen Verstärkung»). Diese
Ebene ist nur eingeloggt durchsuchbar und darum kaum bearbeitet — entsprechend
ergiebig. Ebenfalls hierher gehören Lehrstellenportale (`yousty.ch`: wer
KV-Lernende sucht, hat Nachwuchsprobleme) und SHAB-Handelsregistermutationen
(neue Firmen, vollzogene Nachfolgen).

---

## 2 Was tatsächlich funktioniert hat

| Quelle | Rolle in dieser Recherche |
|---|---|
| jobwinner.ch | beste Ausbeute; Firmenname **und Strassenadresse** im Titel |
| zentraljob.ch | höchste regionale Trefferdichte, deckt LU/ZG/SZ/NW/OW/UR |
| jobs.ch / jobscout24.ch | grösste Menge, stärkster Überschneidungsgrad |
| jobagent.ch | guter Aggregator, Job-Mail als Daueralarm einrichtbar |
| treuhand-job.ch | kleines Nischenboard, dafür fast nur echte Treuhandbüros |
| Firmen-Karriereseiten | beste Lead-Qualität, aber nur einzeln abzuarbeiten |
| job-room.ch, LinkedIn, Verbandsbörsen | strukturell am wertvollsten, hier technisch nicht erreichbar |

Alle 159 Quellen stehen mit fertiger Such-URL im Reiter **Quellen** des Tools.
Die grün markierten haben eine API oder einen Feed.

---

## 3 Die zwei Funde, mit denen sich das automatisieren lässt

Das war der eigentliche Auftrag — nicht eine Liste, sondern ein Wasserhahn.

### Job-Room: eine öffentliche Such-API ohne Schlüssel

```
POST https://www.job-room.ch/jobadservice/api/jobAdvertisements/_search
     ?page=0&size=100&sort=date_desc
Content-Type: application/json

{"keywords":["Treuhand"],
 "cantonCodes":["LU","ZG","SZ","NW","OW","UR"],
 "onlineSince":30}
```

Ohne API-Key, ohne Login. Belegte Felder: `keywords`, `cantonCodes`,
`communalCodes`, `professionCodes` (AVAM-Berufscodes), `workloadPercentageMin`
und `-Max`, `companyName`, `onlineSince` (Tage), `permanent`.

Zwei Einschränkungen, die man kennen muss. Der Endpoint ist **inoffiziell** — er
ist aus Quellcode-Analyse dokumentiert, nicht aus SECO-Doku, und in über zehn
unabhängigen öffentlichen Repositories identisch im Einsatz. Er kann sich ohne
Ankündigung ändern. Und er ist nicht dieselbe Schnittstelle wie die *offizielle*
Job-Room-API (`api.job-room.ch/jobAdvertisements/v1`): die ist ein reiner
Publikationskanal für Arbeitgeber und hat gar keine Suche.

`onlineSince` ist für uns der wichtigste Parameter überhaupt, weil das
Inseratsalter unser stärkstes Kaufsignal ist (Abschnitt 4).

### Zefix: die offizielle REST-API des Handelsregisters

```
https://www.zefix.admin.ch/ZefixPublicREST/api/v1
Swagger: https://www.zefix.admin.ch/ZefixPublicREST/swagger-ui/index.html
```

Öffentlich, ohne Login, sauberes JSON, zusätzlich als Open Data publiziert. Die
Webanwendung ist eine JavaScript-Oberfläche und fürs Auslesen ungeeignet — die
API dagegen ist der saubere Weg an Rechtsform, Adresse, Organe und Gründungs-
beziehungsweise Mutationsdatum. Damit lässt sich das Firmenuniversum aufbauen,
gegen das die Inseratstreffer abgeglichen werden.

**Als dritter Kanal** bietet `adzuna.ch` als einziger der Aggregatoren eine
offizielle, kostenlose Self-Service-REST-API (`developer.adzuna.com`).
Indeed hat seine Publisher-API 2023 eingestellt, jobs.ch hat nur eine
Inbound-XML-Schnittstelle für Arbeitgeber, Google Jobs hat gar keine.

**Der realistische Aufbau** ist damit: Job-Room-API und Adzuna-API täglich
abfragen, Zefix zur Anreicherung, für jobwinner/zentraljob/jobagent
E-Mail-Alerts einrichten, und LinkedIn von Hand einmal pro Woche.

---

## 4 Das Muster: wer ein guter erster Kunde ist

> Der ideale Kunde ist ein **inhaber- oder partnergeführtes, konzernunabhängiges
> Treuhandbüro mit 8 bis 35 Vollzeitstellen** — Kernzone 10 bis 25 —, das viele
> kleine, gleichförmige KMU-Mandate betreut, eine gängige Schweizer
> Treuhandsoftware einsetzt, kein nennenswertes Revisionsgeschäft hat, keine
> eigene IT besitzt, und **seit über dreissig Tagen erfolglos** eine
> Sachbearbeiter-Stelle sucht.

Das Fenster ist die Schnittmenge von drei Kurven, die in verschiedene Richtungen
laufen:

- **Volumen steigt mit der Grösse.** Unter etwa 100 gleichartigen Mandaten trägt
  sich kein automatisierter Prozess. Das entspricht ungefähr 8 Vollzeitstellen.
- **Entscheidungsgeschwindigkeit fällt mit der Grösse.** Bei ein bis drei
  Partnern unterschreibt der geschäftsführende Partner im Termin — es ist sein
  Geld, seine Firma, sein Problem. Ab etwa 35 Köpfen gibt es eine
  Geschäftsleitung, ein Budgetjahr und ein Vieraugenprinzip.
- **Interne Konkurrenz steigt mit der Grösse.** Ab 40 bis 50 Mitarbeitenden gibt
  es eine echte IT-Rolle — und damit jemanden, dessen Job es wäre, das selber zu
  bauen, und der ein Eigeninteresse hat, uns abzuwehren.

**Das Ein- bis Dreipersonenbüro ist der falsche Kunde**, obwohl es zahlenmässig
der grösste Teilmarkt ist und am lautesten klagt. Der Inhaber ist dort selbst
der Produzent: jede Projektstunde ist eine nicht fakturierte Stunde. Solche
Büros lösen Überlast durch Mandatsablehnung statt durch Investition — das ist
betriebswirtschaftlich richtig und nicht wegzuargumentieren. Und ein Prozess im
Kopf einer einzigen Person hat keine Wiederholung, also keinen Hebel.
**Überlast ist nicht dasselbe wie Kaufbereitschaft.**

**Bester einzelner Passungs-Indikator: Mandate pro Kopf.** Über 25 bis 30 heisst
viele kleine, uniforme Mandate — idealer Fit. Unter 10 heisst grosse Einzelfälle
mit Konsolidierungen und hohem Urteilsanteil — nichts zu wiederholen, nichts zu
automatisieren.

### Software als Reifezeichen

**Grün:** Abacus mit AbaWeb (der Mandant erfasst selbst in der Cloud, es gibt
also bereits digitale Belegflüsse und ein Portal-Denkmodell), bexio, Topal,
Klara, Dr. Tax. **Rot:** Sage 50 lokal auf dem Server im Keller, Buchhaltung
faktisch in Excel, ein heterogener Mandatsstamm in dem jeder Kunde sein eigenes
System behalten hat, ein bestehender IT-Rahmenvertrag.

Ein Vorbehalt bei Abacus: dort gibt es fast immer einen Vertriebspartner. Der
ist Türsteher und möglicher Konkurrent zugleich und gehört früh identifiziert —
entweder einbinden oder gezielt umgehen.

### Die fünf Prozesse mit der höchsten Wiederholrate

Absteigend nach Wiederholung mal Schmerz:

1. **Belege beim Mandanten nachfordern** — der meistgehasste, technisch
   simpelste und am häufigsten komplett unautomatisierte Prozess der Branche.
   Reines Hinterherjagen, das kein Treuhänder verteidigen wird.
2. Belegverarbeitung und Kreditorenerfassung — höchstes Stückvolumen.
3. MWST-Abrechnung vorbereiten und abstimmen — vier Mal pro Jahr pro Mandat,
   fristgetrieben und damit stressbehaftet.
4. Lohnlauf, Lohnausweise, Quellensteuer-Abrechnungen.
5. Abschlussvorbereitung.

Beurteilung und Beratung bleiben beim Menschen. Das ist nicht nur ehrlich,
sondern auch das bessere Verkaufsargument.

### Kaufsignale, in fünf Minuten prüfbar

**Aus dem Inserat:** Das Inseratsalter ist das stärkste Signal, und es läuft
anders herum als bei den meisten Lead-Modellen — **älter ist besser**. Über 30
Tage heisst, der normale Arbeitsmarkt hat versagt. Über 60 Tage heisst, der
Inhaber erlebt das Problem bereits als strukturell statt als temporär, und genau
dann ist er offen für eine andere Art von Lösung. Weiter: mindestens zwei
gleichzeitig offene Fachstellen bei unter 35 Köpfen; dieselbe Stelle innert
zwölf Monaten erneut ausgeschrieben.

**Aus Website und Register:** Digitalisierungs-Anspruch auf der Website (die
Firma hat die Prämisse schon gekauft, wir verkaufen nur noch die Umsetzung);
Kundenportal oder Login-Knopf (sie haben bereits in kundenseitige Technik
investiert und wissen, was so ein Projekt kostet); eine **in den letzten drei
Jahren vollzogene Nachfolge** — der neue Inhaber hat ein Mandat für Veränderung
und will einen sichtbaren eigenen Erfolg.

### Harte Ausschlusskriterien

Unter 4 oder über 50 Vollzeitstellen · Teil einer nationalen Gruppe oder eines
Prüfnetzwerks · Schwerpunkt Revision mit RAB-Zulassung · ungeklärte Nachfolge
bei einem Inhaber über 62.

### Timing

Januar bis April ist Hochsaison — der Schmerz ist maximal spürbar, aber niemand
hat 45 Minuten. Die realistischen Verkaufsfenster sind **Mai bis Juli und
September bis Oktober**: der letzte Abschlussstress ist noch frisch in
Erinnerung, der nächste noch nicht da, und ein Projekt kann bis Januar produktiv
sein. Mitte September liegt genau in einem dieser Fenster.

### Wie das Tool rechnet

Sieben Kriterien ergeben einen **Fit-Score von 0 bis 100**; der **Regionsbonus**
kommt obendrauf und ist bei 100 gedeckelt.

| Kriterium | Standard |
|---|---:|
| Offene Stelle ausgeschrieben (zwei gleichzeitig = voller Wert) | 30 |
| Grösse im Zielfenster (10–25 voll, 8–35 fast voll, 4–50 halb) | 22 |
| Stelle trifft den Kern (Lehrstelle und Praktikum zählen null) | 15 |
| Arbeitgeber inseriert selbst | 12 |
| Bekannter Software-Stack | 11 |
| Ansprechperson bekannt | 6 |
| Angaben verifiziert | 4 |
| *Regionsbonus: Luzern und Agglo 8 · übrige Zentralschweiz 5 · Nachbarkantone 2* | *+8* |

Die Region steckt bewusst **nicht** im Fit-Score. Ein Büro in Zürich mit 90
Fit-Punkten ist ein hervorragender Kunde — es braucht nur eine andere
Verkaufsbewegung. Der Bonus steuert die Reihenfolge der Bearbeitung, nicht die
Qualität des Leads.

**Zwei Dinge, die das Tool noch nicht kann.** Das Inseratsalter fehlt als
Kriterium, weil in den Rohdaten fast nirgends ein Publikationsdatum stand —
obwohl es laut Analyse das stärkste Einzelsignal wäre. Es ist das erste Feld,
das von Hand nachgetragen gehört (die Job-Room-API liefert es mit
`onlineSince`). Und Mandate pro Kopf lässt sich von aussen nicht messen — das
ist eine Frage für den ersten Termin.

**Und eine Warnung zu den Grössenangaben:** nur 15 der 130 Firmen haben eine im
Text belegte Mitarbeiterzahl. Bei 28 weiteren ist sie aus Umschreibungen wie
«kleines Büro» oder «KMU» geschätzt; diese sind im Tool als *geschätzt*
markiert und lösen bewusst **keinen** harten Ausschluss aus. Bei 87 Firmen ist
die Grösse schlicht unbekannt und bekommt den halben Wert — wir wissen es
nicht, also raten wir auch nicht dagegen.

---

## 5 Recht: Kaltakquise in der Schweiz

**Keine Rechtsberatung, und in dieser Session war kein Gesetzestext ladbar.**
Alles Folgende ist Modellwissen und gehört vor dem Echtbetrieb an den
Primärquellen geprüft: UWG unter `fedlex.admin.ch/eli/cc/1988/223_223_223/de`,
revDSG unter `fedlex.admin.ch/eli/cc/2022/491/de`.

### Der zentrale Irrtum

**Es gibt in der Schweiz keine B2B-Ausnahme.** Die verbreitete Annahme «Firmen
darf man immer anschreiben» ist falsch; wer das behauptet, verwechselt meist die
deutsche DSGVO-Diskussion mit dem Schweizer UWG. Art. 3 Abs. 1 lit. o UWG
verbietet Massenwerbung per E-Mail, wenn eine von drei Pflichten verletzt ist:
vorherige Einwilligung, korrekte Absenderangabe, Hinweis auf eine problemlose
und kostenlose Ablehnungsmöglichkeit. Es genügt, **eine** davon zu verletzen.

### Der Hebel, der uns trägt

Die Norm verbietet nicht «Werbemails», sondern **Massenwerbung**. Eine echte
individuelle Einzelnachricht erfüllt das Tatbestandsmerkmal gar nicht — dann
greift lit. o nicht, und es braucht auch keine Einwilligung. Das Gesetz nennt
keinen Schwellenwert, und es ist kein Bundesgerichtsentscheid mit einer Zahl
bekannt. Die Lehre stellt nicht auf Stückzahl ab, sondern auf den Charakter:
gleichförmiger Inhalt an einen grossen unbestimmten Empfängerkreis,
technisch-automatisiert versandt = Massenwerbung. Individuell recherchiert,
individuell formuliert, an einen konkret ausgewählten Adressaten mit konkretem
Bezug = keine Massenwerbung.

**Gefährlich ist der Graubereich.** Ein Serienmail mit Platzhaltern —
«Guten Tag {{Vorname}}, ich habe Ihr Inserat für {{Stelle}} gesehen» — an 300
Firmen ist mit hoher Wahrscheinlichkeit Massenwerbung, auch wenn es persönlich
aussieht. Genau deshalb ist der Rat «zwanzig von Hand angefasste Mails pro Tag»
keine Höflichkeitsfloskel, sondern die rechtliche Konstruktion des ganzen
Vorgehens.

### Was in jede Mail gehört

1. **Korrekte, vollständige Absenderangabe:** echter Firmenname, Rechtsform,
   vollständige Postadresse, funktionierende Antwortadresse, Telefon, Website.
   Kein `no-reply@`, keine Fantasienamen, und kein «Re:» oder «Fwd:» auf ein
   Mail, das es nie gab — das wäre zusätzlich täuschend nach lit. b.
2. **Problemlose und kostenlose Ablehnungsmöglichkeit.** Bei Einzelmails genügt
   ein Satz am Schluss. Kein Tracking-Link-Zwang, kein Login, keine Begründung.
3. **Ein Satz, woher die Angaben stammen.** Damit ist die Informationspflicht
   nach Art. 19 revDSG erledigt, und es wirkt ausserdem souverän statt
   ertappt.

Alle vier Mailvorlagen im Tool enthalten diese drei Elemente bereits. Die
Absenderadresse ist im Code als Pflichtfeld angelegt: fehlt sie, schreibt die
Signatur sichtbar `[ADRESSE EINTRAGEN]` ins Mail, statt sie stillschweigend
wegzulassen.

### Datenschutz ist der entspanntere Teil

Das revidierte DSG schützt seit dem 1. September 2023 **juristische Personen
nicht mehr**. Firmenname, Geschäftsadresse, Handelsregisternummer und eine
`info@`-Adresse einer Treuhand AG sind damit keine Personendaten — unsere
Firmenliste ist datenschutzrechtlich unproblematischer als die meisten denken.
Es kippt, sobald `vorname.name@` oder eine benannte Kontaktperson gespeichert
wird; dann greift das DSG voll. Vorsicht bei Einzelfirmen: dort identifiziert
auch `info@treuhand-meier.ch` faktisch eine bestimmte Person, und im
Treuhandmarkt mit vielen Kleinstkanzleien ist das häufig.

Das Schweizer DSG kennt kein Verbot mit Erlaubnisvorbehalt — es braucht **keine
Einwilligung**. Daten aus einem publizierten Stelleninserat sind über den
Rechtfertigungsgrund «allgemein zugänglich gemacht» gut abgedeckt. Ein
kritischer Jurist kann bei der Zweckbindung ansetzen: ein Inserat wird zur
Bewerbersuche veröffentlicht, nicht zur Anbahnung von Softwareverkäufen.

**Die eine Pflicht mit echtem Risiko ist die Sperrliste.** Wer widerspricht,
muss dauerhaft und zuverlässig raus — auf eine permanente Do-not-contact-Liste,
die bei jedem künftigen Durchgang gegengeprüft wird. Wer den Datensatz einfach
löscht, importiert ihn beim nächsten Erntelauf wieder, und der zweite Kontakt
nach einem ausdrücklichen Nein ist eine Persönlichkeitsverletzung nach Art. 30
revDSG *und* ein Verstoss gegen lit. o. Rechnen Sie damit, dass genau ein
verärgerter Treuhänder ein Auskunftsbegehren nach Art. 25 stellt — und dass ein
Treuhänder beruflich weiss, wie man formell korrekt nervt.

### Telefon: die Falle mit dem Sterneintrag

Art. 3 Abs. 1 lit. u UWG: Wer im Telefonbuch einen Stern hat, darf nicht zu
Werbezwecken angerufen werden. Die Falle, die fast alle übersehen: **Wer gar
keinen Telefonbucheintrag hat, ist jemandem mit Stern gleichgestellt.**
Direktdurchwahlen aus Inseraten also nicht anrufen. Prüfen lässt sich das auf
`local.ch`.

### Realistisches Risiko

Strafrechtlich ist das ein Antragsdelikt — ohne Strafantrag passiert nichts.
Zivilrechtlich drohen Unterlassungsansprüche und Anwaltskosten, keine Millionen.
Das SECO führt Verfahren vor allem gegen Serientäter. DSG-Bussen setzen Vorsatz
voraus und richten sich gegen die verantwortliche natürliche Person, nicht gegen
die Firma. Bei zwanzig individuellen Mails pro Tag mit sauberer Absenderangabe
und funktionierender Sperrliste ist das Risiko gering — bei fünfhundert
Serienmails ist es real.

### Zustellbarkeit

Vor der ersten Kampagne SPF, DKIM und DMARC einrichten. Für Outreach eine eigene
Domain oder Subdomain verwenden, nicht die Hauptdomain — wenn die Reputation
kippt, soll nicht die Geschäftskorrespondenz mitgehen. Neue Domains langsam
hochfahren. Und: eine Gmail-Adresse als Absender für B2B-Kaltakquise
unterläuft sowohl die Zustellbarkeit als auch die Glaubwürdigkeit.

---

## 6 Was als Nächstes zu tun ist

**Vor der ersten Mail:**

1. Die zwanzig Firmen mit dem höchsten Score im Tool durchgehen, Inserat
   aufrufen, prüfen ob es noch läuft, Status auf *verifiziert* heben.
2. Ansprechperson und Mailadresse von der Firmenwebsite holen — nur zehn der
   130 Firmen haben derzeit eine Adresse hinterlegt. Das ist der grösste
   handwerkliche Posten.
3. Im Code den Block `ABSENDER` vollständig ausfüllen, Postadresse inklusive.
4. Sperrliste anlegen, bevor die erste Mail rausgeht — nicht danach.

**Um aus der Momentaufnahme einen Wasserhahn zu machen:**

5. Job-Room-API mit `onlineSince: 30` täglich abfragen. Das liefert genau die
   Inserate, die schon einen Monat erfolglos laufen — unser stärkstes Signal.
6. Adzuna-API-Schlüssel holen (gratis) als zweiten Kanal.
7. E-Mail-Alerts auf jobwinner.ch, zentraljob.ch und jobagent.ch einrichten.
8. Zefix-API nutzen, um das Firmenuniversum Kanton Luzern und Zug aufzubauen und
   die Treffer anzureichern.

**Was noch zu belegen ist**, bevor eine Zahl in eine Mail oder ein Deck darf:

| Offen | Wo zu holen |
|---|---|
| Fachkräftemangel-Index, Rang der Treuhandberufe | Adecco Group Schweiz / Stellenmarkt-Monitor Uni Zürich |
| Anzahl Treuhandbetriebe, Grössenverteilung | BFS STATENT, NOGA 69.20 (`pxweb.bfs.admin.ch`) |
| Mitgliederzahlen, Anteil Büros mit unbesetzten Stellen | TREUHAND\|SUISSE, EXPERTsuisse, veb.ch |
| Lohnband Sachbearbeiter Treuhand | BFS Lohnstrukturerhebung |
| Kosten eines Inserats, Vermittlerprovision | jobs.ch Preisliste, Vermittler direkt |

Solange diese Zeilen leer sind, argumentiert die Mail mit dem, was der Empfänger
ohnehin weiss: dass sein Inserat seit Wochen läuft. Das ist stark genug und hat
den Vorteil, dass es niemand nachprüfen muss.
