# Recherche: Woher die Zahlen kommen

Diese Datei hält fest, worauf die Rechnungen in SCHLAFWERK beruhen, wie
sicher die jeweilige Grundlage ist und wo bewusst vereinfacht wurde.

---

## 1 · Fitbit Web API

**Anmeldung.** Fitbit empfiehlt für Anwendungen ohne Server den
Authorization Code Grant Flow mit PKCE (RFC 7636). Eine Anwendung vom Typ
*Client* kommt ohne Client-Secret aus und muss dafür PKCE benutzen: ein
zufälliger `code_verifier` (43–128 Zeichen), daraus der SHA-256-Hash als
`code_challenge` (base64url, ohne Padding). Gegen CSRF wird zusätzlich ein
`state`-Parameter mitgegeben und beim Rücksprung geprüft.

* Autorisierung: `https://www.fitbit.com/oauth2/authorize`
* Token: `https://api.fitbit.com/oauth2/token` mit `client_id`,
  `grant_type=authorization_code`, `code`, `redirect_uri`, `code_verifier`
* Erneuern: `grant_type=refresh_token`
* Quelle: <https://dev.fitbit.com/build/reference/web-api/developer-guide/authorization/>

**Schlafdaten.** `GET /1.2/user/-/sleep/date/{von}/{bis}.json` liefert die
Protokolle eines Zeitraums (maximal 100 Tage). Wichtig für die Auswertung:

* `dateOfSleep` ist das Datum des **Aufwachens** – eine Nacht beginnt in der
  Regel am Vortag.
* `levels.summary` enthält Minuten je Phase (`deep`, `light`, `rem`, `wake`)
  bei Protokollen vom Typ `stages`; ältere oder sehr kurze Aufzeichnungen
  kommen als `classic` mit `asleep`/`restless`/`awake`.
* `levels.data` ist die Abfolge der Phasen mit Zeitstempel und Dauer. Daraus
  liest die App die REM-Beginnzeitpunkte.
* `minutesToFallAsleep` ist bei automatisch erkannten Nächten meist 0 –
  Fitbit misst die Einschlafdauer nicht wirklich. Die App behandelt 0
  deshalb als «unbekannt» statt als Messwert.
* Verarbeitung läuft teils asynchron; kurz nach dem Aufwachen kann eine
  Nacht noch fehlen.
* Limit: 150 Abfragen pro Stunde und Nutzer.
* Quellen: <https://dev.fitbit.com/build/reference/web-api/sleep/get-sleep-log-by-date-range/>,
  <https://dev.fitbit.com/build/reference/web-api/sleep/get-sleep-log-by-date/>

**Warum eine eigene Client-ID nötig ist.** Fitbit vergibt Zugriff pro
registrierter Anwendung. Eine mitgelieferte ID wäre öffentlich sichtbar und
würde das Kontingent aller Nutzer teilen. Deshalb registriert jede Person
einmalig eine eigene App – das ist kostenlos und dauert zwei Minuten.

---

## 2 · Schlafzyklen und Weckzeitpunkt

Ein Schlafzyklus dauert im Mittel etwa 90 Minuten, individuell und über die
Nacht schwankend zwischen rund 70 und 120 Minuten; die ersten Zyklen sind
tiefschlafreich, die späteren REM-reich. Die verbreiteten Wecker-Rechner
(«1,5 – 3 – 4,5 – 6 – 7,5 Stunden») setzen 90 Minuten für alle an.

**Was die App anders macht:** Wo Schlafphasen vorliegen, misst sie die
Abstände zwischen aufeinanderfolgenden REM-Beginnzeitpunkten und nimmt deren
Median als persönliche Zykluslänge (nur Abstände zwischen 55 und 135 Minuten
werden gewertet, um Fehlklassifikationen auszuschliessen). Erst ab sechs
gemessenen Abständen ersetzt dieser Wert die 90 Minuten, und die App schreibt
dazu, worauf der Wert beruht.

**Grenze:** Ein Wecker im Browser kennt den aktuellen Schlafzustand nicht.
Die Fitbit-API liefert Schlafphasen erst nach dem Aufwachen. Das «sanfte
Fenster» ist deshalb eine Vorwärtsrechnung ab dem geschätzten
Einschlafzeitpunkt, keine Messung. Der Nutzen von Zyklus-Weckern ist
wissenschaftlich ohnehin schwächer belegt, als die Popularität vermuten
lässt – gut belegt ist dagegen, dass Aufwachen aus Tiefschlaf ausgeprägte
Schlafträgheit (sleep inertia) erzeugt.

---

## 3 · Chronotyp und sozialer Jetlag

Die Methodik stammt aus dem *Munich ChronoType Questionnaire* (Roenneberg
u. a.): Als Kennzahl dient die **Schlafmitte an freien Tagen** (MSF). Weil an
freien Tagen Schlaf nachgeholt wird, korrigiert man um die Differenz zwischen
freier und wöchentlicher durchschnittlicher Schlafdauer:

```
MSFsc = MSF − (SD_frei − SD_woche) / 2      falls SD_frei > SD_arbeit
```

**Sozialer Jetlag** ist der Betrag der Differenz zwischen der Schlafmitte an
Arbeits- und an freien Tagen. Über eine Stunde gilt als deutlich; die
Belastung entspricht dem regelmässigen Wechsel über eine Zeitzone.

Die App bildet beides direkt aus den Schlafprotokollen statt aus einem
Fragebogen – die Rechenwege sind dieselben. Welche Tage «frei» sind, ist in
den Einstellungen wählbar (Standard: Samstag und Sonntag); für Schichtarbeit
ist das entscheidend.

*Literatur: Roenneberg u. a., «Life between clocks», J Biol Rhythms 2003;
Roenneberg u. a., «Social jetlag and obesity», Current Biology 2012.*

---

## 4 · Regelmässigkeit (Sleep Regularity Index)

Der SRI misst, wie wahrscheinlich es ist, zur selben Uhrzeit an zwei
aufeinanderfolgenden Tagen im selben Zustand zu sein (schlafend oder wach).
100 bedeutet einen völlig identischen Takt, 0 reinen Zufall. Er ist
aussagekräftiger als die blosse Streuung der Zubettgehzeit, weil er die
gesamte Schlaf-Wach-Verteilung eines Tages berücksichtigt.

Die App rechnet über die letzten 28 Tage in Fünf-Minuten-Schritten – eine
feinere Auflösung ändert das Ergebnis kaum, kostet aber Rechenzeit auf dem
Handy.

*Literatur: Phillips u. a., «Irregular sleep/wake patterns are associated
with poorer academic performance …», Scientific Reports 2017.*

---

## 5 · Schlafbedarf und Schlafschuld

Für gesunde Erwachsene gilt der Konsens von AASM und Sleep Research Society:
regelmässig **mindestens sieben Stunden**, üblicherweise sieben bis neun.
Individuell schwankt der Bedarf erheblich.

Statt eine Zahl vorzugeben, schätzt die App den persönlichen Bedarf aus der
**Mitte der Nächte an freien Tagen** – dort schläft man ohne Wecker so lang,
wie man mag. Bewusst nicht das obere Ende: die längsten freien Nächte
enthalten Nachholschlaf und würden den Bedarf überschätzen. Ohne genügend
freie Nächte greift ein Näherungswert, und die App sagt das dazu. Von Hand
setzen geht immer.

**Schlafschuld** ist die Summe von Bedarf minus tatsächlichem Schlaf über die
letzten 14 Tage. Sie lässt sich nicht in einer langen Nacht abbauen – die
App schlägt deshalb höchstens 60 Minuten früheres Zubettgehen über zwei
Wochen vor, statt eine unrealistische Zahl zu nennen.

*Literatur: Watson u. a., «Recommended Amount of Sleep for a Healthy Adult»,
Sleep 2015.*

---

## 6 · Nickerchen: Länge und Zeitpunkt

**Länge.** Zwei Fenster sind sinnvoll:

* **10–20 Minuten** – man bleibt im leichten Schlaf, wacht klar auf. In
  einer Untersuchung von Brooks & Lack (Sleep 2006) war das kurze Nickerchen
  über den Nachmittag hinweg die wirksamste Variante.
* **ein ganzer Zyklus** – man wacht wieder aus leichtem Schlaf auf.

Dazwischen (etwa 30–60 Minuten) landet man häufig im Tiefschlaf und wacht
mit Schlafträgheit auf. Die App bietet deshalb genau diese zwei Längen an
und warnt, wenn die erfassten Nickerchen im Zwischenbereich liegen.

**Zeitpunkt.** Die Wachheit sinkt körperlich am frühen Nachmittag ab, meist
zwischen 13 und 15 Uhr – etwa sieben Stunden nach dem Aufstehen. Genau so
rechnet die App das persönliche Tief: Aufstehzeit plus sieben Stunden,
begrenzt auf das Fenster 12:30 bis 16:00. Spätere Nickerchen verzögern das
abendliche Einschlafen.

Eine Untersuchung zu 25- gegenüber 90-minütigen Nachmittagsnickerchen und
deren Wirkung auf den folgenden Nachtschlaf:
<https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12856117/>

Die App misst diesen Zusammenhang zusätzlich in den eigenen Daten: Sie
vergleicht Nächte nach einem längeren Nickerchen mit Nächten ohne und meldet
die Differenz in Schlafdauer und Einschlafdauer – wenn genug Fälle vorliegen.

---

## 7 · Weitere verwendete Schwellen

| Wert | Schwelle | Herkunft |
| --- | --- | --- |
| Einschlafdauer | bis ~20 min normal | klinische Konvention (Schlaflatenz) |
| Schlafeffizienz | ≥ 85 % gut | Konvention aus der Insomnie-Diagnostik |
| Tiefschlafanteil | ~13–23 % | übliche Spannen bei Erwachsenen |
| REM-Anteil | ~20–25 % | dito |
| Sozialer Jetlag | > 1 h auffällig | Roenneberg u. a. |
| SRI | > 80 sehr regelmässig | Phillips u. a. |

Alle Anteile schwanken zwischen einzelnen Nächten stark und werden von
Consumer-Uhren nur geschätzt; die App zeigt deshalb Mediane über viele
Nächte und keine Einzelnacht-Bewertungen.

---

## 8 · Was die App bewusst nicht tut

* **Keine Einzelnacht-Noten.** Ein «Schlaf-Score» von 71 sagt niemandem
  etwas und erzeugt vor allem schlechtes Gewissen.
* **Keine Dauerbenachrichtigungen.** Standard ist ein Hinweis pro Tag, und
  jeder lässt sich abschalten. Der wichtigste Hinweis gewinnt, der Rest
  entfällt – statt alle nacheinander zu senden.
* **Keine Diagnosen.** Auffälligkeiten werden benannt, nicht gedeutet, und
  mit dem Hinweis versehen, wann eine fachliche Abklärung angebracht ist.
* **Keine geschönten Zahlen.** Steht zu wenig Datenmaterial zur Verfügung,
  sagt die App das an der Stelle, an der der Wert steht.
