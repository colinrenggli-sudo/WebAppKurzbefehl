#!/bin/bash
# ==================================================================
# serverinfo.sh – Bestandsaufnahme eines Unraid-/Linux-Servers
#
# Fragt nur ab, ändert nichts. Ausgabe ist so gebaut, dass man sie
# vollständig kopieren und jemandem schicken kann.
#
#   Aufruf auf dem Server (Unraid: Terminal-Symbol oben rechts):
#     bash serverinfo.sh
#     bash serverinfo.sh > /boot/serverinfo.txt   # auf den USB-Stick
#
# Seriennummern werden bewusst nicht ausgegeben.
# ==================================================================
set -u

sec() { printf '\n\n========== %s ==========\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }
try() { if have "$1"; then "$@" 2>/dev/null; else echo "($1 nicht vorhanden)"; fi; }

printf 'Bestandsaufnahme vom %s auf %s\n' "$(date '+%d.%m.%Y %H:%M')" "$(hostname)"

sec "Betriebssystem"
if [ -f /etc/unraid-version ]; then
  echo "Unraid $(sed 's/version=//; s/"//g' /etc/unraid-version)"
else
  try cat /etc/os-release | grep -E '^(NAME|VERSION)='
fi
echo "Kernel: $(uname -r)  ·  Architektur: $(uname -m)"
echo "Läuft seit: $(uptime -p 2>/dev/null || uptime)"

sec "Gerät und Mainboard"
if have dmidecode; then
  echo "Hersteller:  $(dmidecode -s system-manufacturer 2>/dev/null)"
  echo "Modell:      $(dmidecode -s system-product-name 2>/dev/null)"
  echo "Mainboard:   $(dmidecode -s baseboard-manufacturer 2>/dev/null) $(dmidecode -s baseboard-product-name 2>/dev/null)"
  echo "BIOS:        $(dmidecode -s bios-version 2>/dev/null) vom $(dmidecode -s bios-release-date 2>/dev/null)"
  echo "Gehäuse:     $(dmidecode -s chassis-type 2>/dev/null)"
else
  echo "(dmidecode nicht vorhanden – Modell steht sonst im BIOS oder auf dem Typenschild)"
fi

sec "Prozessor"
if have lscpu; then
  lscpu | grep -E 'Model name|Socket|Thread|Core|CPU\(s\)|MHz|Virtualisierung|Virtualization|Flags' | grep -vi flags
else
  grep -m1 'model name' /proc/cpuinfo; echo "Kerne: $(nproc)"
fi
echo -n "Hardware-Transcoding (Intel Quick Sync): "
[ -e /dev/dri/renderD128 ] && echo "vorhanden (/dev/dri)" || echo "nicht vorhanden"

sec "Arbeitsspeicher"
free -h
if have dmidecode; then
  echo; echo "Bestückung der Bänke:"
  dmidecode -t memory 2>/dev/null | awk '
    /Memory Device/{d=1}
    d && /^\tSize:/{s=$2" "$3}
    d && /^\tType:/{t=$2}
    d && /^\tSpeed:/{sp=$2" "$3}
    d && /^\tLocator:/ && $0 !~ /Bank/{l=$2}
    d && /^$/{if(s!="" && s!~/No/){printf "  %-12s %-10s %-6s %s\n", l, s, t, sp}; s="";t="";sp="";l="";d=0}'
  echo "Maximal möglich: $(dmidecode -t memory 2>/dev/null | grep -m1 'Maximum Capacity' | cut -d: -f2)"
fi

sec "Datenträger"
try lsblk -o NAME,SIZE,ROTA,TRAN,MODEL --nodeps
echo
echo "Belegung:"
df -h 2>/dev/null | grep -E 'Filesystem|/mnt/|/boot' | head -25

sec "Unraid-Array und Pools"
if have mdcmd; then
  mdcmd status 2>/dev/null | grep -E '^(mdState|mdNumDisks|mdNumInvalid|mdNumDisabled|sbSynced2|sbSyncErrs|mdResync)' || echo "(keine Array-Infos)"
else
  echo "(mdcmd nicht vorhanden – kein Unraid?)"
fi
if have zpool; then echo; zpool list 2>/dev/null; fi

sec "Festplatten-Gesundheit (SMART, Kurzfassung)"
if have smartctl; then
  for d in /dev/sd? /dev/nvme?n1; do
    [ -e "$d" ] || continue
    printf '%-14s %s\n' "$d" "$(smartctl -H "$d" 2>/dev/null | grep -Ei 'overall-health|SMART Health' | cut -d: -f2- | xargs)"
  done
else echo "(smartctl nicht vorhanden)"; fi

sec "Docker-Container"
if have docker; then
  docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || echo "(Docker-Dienst antwortet nicht)"
  echo; echo "Speicherverbrauch der laufenden Container:"
  timeout 15 docker stats --no-stream --format 'table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}' 2>/dev/null
else echo "(Docker nicht vorhanden)"; fi

sec "Virtuelle Maschinen"
if have virsh; then virsh list --all 2>/dev/null; else echo "(libvirt/virsh nicht vorhanden)"; fi

sec "Netzwerk"
try ip -brief addr
echo; echo "Offene Ports auf diesem Host:"
try ss -tulpnH | awk '{print $1, $5, $7}' | sort -u | head -40

sec "Tailscale"
if have tailscale; then
  tailscale status 2>/dev/null | head -20
elif have docker && docker ps --format '{{.Names}}' 2>/dev/null | grep -qi tailscale; then
  c=$(docker ps --format '{{.Names}}' | grep -i tailscale | head -1)
  echo "läuft im Container '$c':"
  docker exec "$c" tailscale status 2>/dev/null | head -20
else echo "(kein Tailscale gefunden)"; fi

sec "Cloudflare Tunnel"
if have docker && docker ps --format '{{.Names}} {{.Image}}' 2>/dev/null | grep -qi cloudflared; then
  docker ps --format '{{.Names}} {{.Image}} {{.Status}}' | grep -i cloudflared
  echo "Aktive Verbindungen laut Log:"
  docker logs --tail 40 "$(docker ps --format '{{.Names}}' | grep -i cloudflared | head -1)" 2>&1 | grep -Ei 'registered tunnel|connection|hostname' | tail -6
elif have cloudflared; then cloudflared tunnel list 2>/dev/null
else echo "(cloudflared nicht gefunden)"; fi

sec "Unraid-Plugins"
if [ -d /boot/config/plugins ]; then ls /boot/config/plugins | sed 's/\.plg$//' | sort | tr '\n' ' '; echo; fi

sec "Freigaben (Shares)"
[ -d /mnt/user ] && ls -1 /mnt/user 2>/dev/null | tr '\n' ' ' && echo

sec "Temperatur und Lüfter"
try sensors | grep -E 'Core|temp|fan|Package' | head -20

printf '\n\nFertig. Diese Ausgabe komplett kopieren.\n'
