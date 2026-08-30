# fitbit-sync

Holt die Schlafdaten von Fitbit und legt sie als `daten/schlaf.json`
neben die Apps. SCHLAFWERK liest die Datei beim Öffnen automatisch –
damit muss sich kein einzelnes Gerät mehr mit Fitbit verbinden, und du
hast deine Daten archiviert, unabhängig davon, was Fitbit mit der
Schnittstelle noch anstellt.

Ein Python-Skript ohne Abhängigkeiten, gedacht für den Container aus
`../docker-compose.yml`. Die vollständige Einrichtung steht in
[../README.md](../README.md#schritt-5--daten-vom-server-holen-lassen).

```
python3 sync.py setup    einmalig mit dem Fitbit-Konto verknüpfen
python3 sync.py          einmal abgleichen
python3 sync.py loop     dauerhaft, alle INTERVAL Sekunden
```

| Variable | Standard | Bedeutung |
| --- | --- | --- |
| `FITBIT_CLIENT_ID` | – | Client-ID der eigenen Fitbit-App |
| `FITBIT_REDIRECT` | – | registrierte Redirect-URL, exakt gleich |
| `DAYS` | `90` | wie weit je Lauf zurückgeholt wird |
| `INTERVAL` | `21600` | Sekunden zwischen zwei Läufen (6 h) |
| `TOKEN_FILE` | `/daten/token.json` | Ablage des Tokens, Rechte 600 |
| `OUT_FILE` | `/daten/schlaf.json` | Ausgabedatei für die App |

Details, die in der Praxis zählen:

* **Bestehendes bleibt erhalten.** Jeder Lauf führt neue Einträge mit den
  alten zusammen, erkannt an der `logId`. So wächst ein Archiv weit über
  die 90 Tage hinaus, die Fitbit bequem herausgibt.
* **Token rotiert.** Fitbit tauscht das Refresh-Token bei jedem Erneuern
  aus; das Skript schreibt es atomar zurück. Geht ein Lauf schief,
  bleibt die letzte gute Datei unangetastet.
* **Fehler beenden den Dienst nicht.** Im `loop`-Modus wird ein Fehler
  protokolliert, danach läuft es beim nächsten Durchgang weiter.
* **150 Abfragen pro Stunde** erlaubt Fitbit. Ein Lauf über 90 Tage
  braucht eine, über ein Jahr vier.
