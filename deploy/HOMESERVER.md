# Dein Heimserver: was da steht, was er kann, was als Nächstes kommt

Geschrieben für einen Server, der eingerichtet übergeben wurde – mit dem
Ziel, dass du danach selbst weisst, was da läuft und warum.

---

## 1 · Erst mal herausfinden, was du eigentlich hast

Im Repo liegt dafür ein Skript, das nichts verändert und nur abfragt.
Im Unraid-Terminal (Symbol oben rechts):

```bash
bash /mnt/user/appdata/webapps/repo/deploy/serverinfo.sh
```

Noch kein Repo auf dem Server? Dann direkt:

```bash
curl -fsSL https://raw.githubusercontent.com/colinrenggli-sudo/WebAppKurzbefehl/main/deploy/serverinfo.sh | bash
```

Es zeigt Modell und Mainboard, CPU, RAM samt Bänken und Ausbaugrenze,
alle Platten, Array-Zustand, SMART-Gesundheit, jeden Container mit
seinem Speicherverbrauch, VMs, offene Ports, Tailscale- und
Tunnel-Status. Seriennummern lässt es bewusst weg, die Ausgabe kannst
du also gefahrlos jemandem schicken.

Dieselben Angaben stehen verstreut auch in der Weboberfläche:

| Wo | Was du dort siehst |
| --- | --- |
| **Dashboard** | CPU-, RAM- und Plattenauslastung in Echtzeit |
| **Main** | Array, Parität, Pools, jede Platte einzeln mit Temperatur |
| **Main → Flash** | der USB-Stick, von dem Unraid startet |
| **Docker** | alle Container, ihre Ports und Update-Stände |
| **VMs** | virtuelle Maschinen |
| **Tools → System Profiler** | Mainboard, CPU, Speicherriegel, Steckkarten |
| **Tools → System Devices** | was in den PCIe-Slots steckt |
| **Settings → Notifications** | wohin Warnungen gehen (wichtig, siehe unten) |

**30 Kilo und 16 GB RAM** sprechen für ein Gehäuse mit vielen
Einschüben – entweder ein gebrauchter Markenserver (Dell PowerEdge
T-Serie, HP ProLiant ML, Fujitsu Primergy) oder ein Eigenbau in einem
Vollturm mit Platten-Käfigen. Welches davon, sagt dir der Abschnitt
„Gerät und Mainboard“ im Skript, und ob noch Riegel-Bänke frei sind,
steht gleich darunter.

---

## 2 · Die vier Bausteine, die du schon hast

**Unraid** ist das Betriebssystem. Sein Kniff: Platten
unterschiedlicher Grösse in einem Verbund, wobei eine (oder zwei) als
Paritätsplatte den Ausfall einer anderen auffangen. Jede Datenplatte
bleibt für sich lesbar – fällt mehr aus, als die Parität abdeckt,
verlierst du nur, was auf der kaputten Platte lag, nicht alles. Unraid
startet von einem **USB-Stick**; der ist der einzige wirklich
unersetzliche Teil im Gehäuse.

**Docker** ist der Grund, warum du hier überhaupt etwas installieren
kannst: jede Anwendung läuft in ihrer eigenen Kiste, ohne sich mit den
anderen ins Gehege zu kommen. Über **Apps** (das Plugin *Community
Applications*) installierst du sie mit zwei Klicks. Die Daten der
Container liegen unter `/mnt/user/appdata/<name>` – dieses Verzeichnis
ist das, was du sichern musst, alles andere ist neu installierbar.

**Cloudflare Tunnel** holt Dienste von aussen erreichbar, ohne dass du
im Router einen Port öffnest. Der Server baut die Verbindung von innen
nach aussen auf, Cloudflare nimmt Anfragen entgegen und schiebt sie
durch diesen Kanal. Nebenbei kommt HTTPS gratis mit.

**Tailscale** spannt ein privates Netz über deine Geräte – Handy,
Laptop, Server –, egal wo sie stehen. Nichts davon ist öffentlich
sichtbar.

> **Die Faustregel, die dir viel Ärger spart:**
> Was auch Fremde sehen dürfen (eine Web-App, eine Rezeptsammlung, ein
> Foto-Link) → **Cloudflare Tunnel**.
> Was nur dich etwas angeht (Unraid-Oberfläche, Datenbanken, alles mit
> Anmeldung) → **Tailscale**.
> Die Unraid-Weboberfläche gehört unter keinen Umständen ins offene
> Internet.

Und **colin-renggli.ch** ist die Adresse, unter der das Ganze
zusammenläuft: `schlaf.colin-renggli.ch`, `fotos.colin-renggli.ch`,
`notizen.colin-renggli.ch` – pro Dienst eine Subdomain im Tunnel.

---

## 3 · Was du mit dem Ding anstellen kannst

Nach Nutzen sortiert, nicht nach Beliebtheit. Der Speicherbedarf ist
grob geschätzt, damit du bei 16 GB abschätzen kannst, was zusammen
passt.

### Der Anfang – klein, sofort nützlich

| Dienst | Wofür | RAM |
| --- | --- | --- |
| **Vaultwarden** | eigener Passwort-Tresor, Bitwarden-Apps funktionieren damit | ~150 MB |
| **Uptime Kuma** | überwacht deine Dienste und meldet sich, wenn etwas ausfällt | ~150 MB |
| **Homepage** oder **Homarr** | eine Startseite mit allen Kacheln – sonst vergisst man die Hälfte | ~150 MB |
| **AdGuard Home** | filtert Werbung und Tracker für jedes Gerät im Haus, per DNS | ~200 MB |
| **Stirling PDF** | PDFs zusammenfügen, teilen, unterschreiben, komprimieren | ~400 MB |

### Deine Daten zurückholen

| Dienst | Wofür | RAM |
| --- | --- | --- |
| **Immich** | Ersatz für Google Fotos: App fürs Handy, Zeitleiste, Gesichts- und Objektsuche | 2–4 GB |
| **Paperless-ngx** | Rechnungen und Briefe scannen, automatisch verschlagworten, durchsuchbar ablegen | ~1 GB |
| **Nextcloud** | Dateien, Kalender und Kontakte am Stück (Ersatz für iCloud/Google Drive) | 1–2 GB |
| **Syncthing** | schlanker: gleicht nur Ordner zwischen Geräten ab, ohne Weboberfläche | ~200 MB |
| **Actual Budget** | Haushaltsbudget, alles lokal | ~200 MB |

### Medien

| Dienst | Wofür | RAM |
| --- | --- | --- |
| **Jellyfin** | eigener Streaming-Dienst für Filme und Serien; mit Intel-Grafik im Prozessor auch transkodiert | 0,5–2 GB |
| **Audiobookshelf** | Hörbücher und Podcasts mit eigener App | ~300 MB |
| **Navidrome** | Musiksammlung streamen | ~200 MB |
| **Kavita** / **Calibre-Web** | Comics, Bücher | ~300 MB |

Jellyfin nicht über den Cloudflare Tunnel streamen – längeres Video
über den Cloudflare-Proxy verstösst gegen deren Nutzungsbedingungen.
Für unterwegs ist Tailscale hier der richtige Weg.

### Haus und Technik

| Dienst | Wofür | RAM |
| --- | --- | --- |
| **Home Assistant** | Licht, Heizung, Rollläden, Sensoren – die Schaltzentrale fürs Haus | 1–2 GB |
| **Zigbee2MQTT** + **Mosquitto** | bindet Zigbee-Geräte ein, ohne Hersteller-Cloud | ~300 MB |
| **ESPHome** | eigene Sensoren aus 5-Franken-Chips bauen | ~300 MB |
| **Frigate** | Kamerabilder mit Personen- statt Bewegungserkennung (mag eine Coral-TPU) | 1–2 GB |

### Selber bauen

| Dienst | Wofür | RAM |
| --- | --- | --- |
| **Forgejo** / **Gitea** | dein eigenes GitHub, für Dinge, die nicht raus sollen | ~300 MB |
| **code-server** | VS Code im Browser, auch vom iPad aus | ~500 MB |
| **n8n** | Automatisierungen zusammenklicken: „jede Nacht X holen und Y damit tun“ | ~400 MB |
| **nginx (dieses Repo)** | deine Web-Apps unter eigener Adresse | ~20 MB |
| **Ollama** + **Open WebUI** | KI-Modelle lokal. Ohne Grafikkarte laufen 7–8B-Modelle mit wenigen Wörtern pro Sekunde – zum Ausprobieren gut, zum Arbeiten zäh | 6–10 GB |

**Der naheliegende nächste Schritt für SCHLAFWERK:** ein kleiner Dienst
(n8n oder ein Skript mit Cron), der nachts die Fitbit-Daten abholt und
als JSON neben die App legt. Dann muss die App beim Öffnen nichts mehr
laden, und du hast deine Schlafdaten unabhängig von Fitbit archiviert –
falls die API mal dichtmacht.

---

## 4 · Was ich an deiner Stelle als Nächstes machen würde

In dieser Reihenfolge. Die ersten drei Punkte sind das, was zwischen
„Bastelprojekt“ und „darauf kann ich mich verlassen“ steht.

**1. Sicherung – Parität ist kein Backup.** Sie fängt eine kaputte
Platte auf, nicht ein versehentliches Löschen, nicht Verschlüsselung
durch Schadsoftware, nicht Wasser im Keller. Was du brauchst:

* Plugin **Appdata Backup** – sichert die Konfiguration aller Container
  regelmässig und automatisch.
* **Kopia** oder **Duplicati** als Container – verschlüsselt und
  ausser Haus, etwa zu Backblaze B2 (rund 6 $ pro Terabyte im Monat)
  oder auf eine Platte bei deinem Kumpel.
* Faustregel 3-2-1: drei Kopien, zwei Medien, eine ausser Haus.
* Wiederherstellung einmal testen. Ein Backup, aus dem nie jemand etwas
  zurückgeholt hat, ist eine Vermutung.

**2. Den USB-Stick sichern.** Unraid startet davon, und darauf liegt
deine gesamte Konfiguration. Main → Flash → *Flash Backup*, oder den
Ordner `/boot` kopieren. Ohne dieses Backup wird ein defekter Stick zu
einem sehr langen Abend.

**3. Zugriff aufräumen.** Unraid-Oberfläche nur über Tailscale, nie
über den Tunnel. Starkes Root-Passwort, Zwei-Faktor unter Settings →
Management Access. Alles Administrative, das trotzdem öffentlich sein
soll, hinter **Cloudflare Access** (Zero Trust → Access → Applications)
mit Anmeldung per E-Mail-Code. Und: schau im Skript unter „offene
Ports“ nach, was da eigentlich lauscht.

**4. Merken, wenn etwas schiefgeht.** Settings → Notifications auf
E-Mail, Telegram oder Pushover stellen, sonst laufen Warnungen ins
Leere. Dazu die Plugins **Fix Common Problems** und **Dynamix System
Temperature**, Paritätsprüfung monatlich planen, und Uptime Kuma für
die Dienste selbst.

**5. Eine USV.** Bei einem Gehäuse dieser Grösse hängen mehrere Platten
dran; ein Stromausfall mitten im Schreiben ist der klassische Weg zu
kaputten Dateisystemen. Unraid spricht mit APC- und ähnlichen Geräten
direkt und fährt bei Stromausfall sauber herunter. Rund 150–250 Franken
für ein Modell, das den Server ein paar Minuten trägt.

**6. Mehr RAM.** 16 GB reichen für ein Dutzend kleiner Container. Sobald
Immich, Nextcloud, Home Assistant und eine VM zusammenkommen, wird es
eng, und Unraid nutzt freien Speicher sonst als Lesecache. Das Skript
sagt dir, wie viele Bänke frei sind und was das Board maximal kann –
gebrauchter Serverspeicher ist oft erstaunlich billig.

**7. Schnelle Ablage für Container.** Läuft `appdata` auf dem
SSD-Pool und nicht auf dem Array? Auf drehenden Platten ist jeder
Container träge, und die Platten laufen dauernd. Prüfen unter Shares →
appdata → *Primary storage*.

**8. Aufschreiben, was läuft.** Eine einzige Datei – welcher Container
wozu, unter welcher Adresse, wo seine Daten liegen. In einem halben
Jahr ist das Gold wert, und dein Kumpel muss nicht jedes Mal ran.

---

## 5 · Was ich dir nicht sagen kann

Ich sehe deinen Server von hier aus nicht – diese Sitzung läuft in
einer abgeschotteten Cloud-Umgebung, ohne Weg in dein Netz. Alles oben
ist deshalb allgemein gehalten.

Schick mir die Ausgabe von `serverinfo.sh`, dann wird es konkret: welches
Gerät genau, wie viel Luft nach oben beim Speicher, welche Platten wie
alt sind und wie lange sie noch halten dürften, was von deinen
Containern Speicher frisst, ohne benutzt zu werden, und was in deinem
Aufbau als Nächstes wirklich lohnt.
