#!/usr/bin/env python3
"""
fitbit-sync – holt Schlafdaten von Fitbit und legt sie neben die App.

Warum: Der Browser-Weg (OAuth in SCHLAFWERK) funktioniert, muss aber auf
jedem Gerät einzeln gemacht werden, und die Daten liegen dann nur in
diesem einen Browser. Läuft der Abgleich stattdessen auf dem Server,
liegt eine gemeinsame Datei bereit, die jedes Gerät beim Öffnen liest –
und du hast deine Schlafdaten archiviert, falls Fitbit die
Schnittstelle irgendwann dichtmacht.

Nur Standardbibliothek, keine Abhängigkeiten.

    python3 sync.py setup    einmalig: Fitbit-Konto verknüpfen
    python3 sync.py          einmal abgleichen
    python3 sync.py loop     dauerhaft, alle INTERVAL Sekunden

Einstellungen über Umgebungsvariablen:
    FITBIT_CLIENT_ID   OAuth-2.0-Client-ID der eigenen Fitbit-App
    FITBIT_REDIRECT    registrierte Redirect-URL, z. B.
                       https://schlaf.colin-renggli.ch/schlaf/sync/
    DAYS               wie weit zurück je Lauf (Standard 90)
    INTERVAL           Sekunden zwischen zwei Läufen (Standard 21600)
    TOKEN_FILE         wo das Token liegt (Standard /daten/token.json)
    OUT_FILE           wohin die Daten geschrieben werden
                       (Standard /daten/schlaf.json)
"""

import base64
import hashlib
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta

CLIENT_ID = os.environ.get("FITBIT_CLIENT_ID", "").strip()
REDIRECT = os.environ.get("FITBIT_REDIRECT", "").strip()
TOKEN_FILE = os.environ.get("TOKEN_FILE", "/daten/token.json")
OUT_FILE = os.environ.get("OUT_FILE", "/daten/schlaf.json")
DAYS = int(os.environ.get("DAYS", "90"))
INTERVAL = int(os.environ.get("INTERVAL", "21600"))

API = os.environ.get("FITBIT_API", "https://api.fitbit.com").rstrip("/")
AUTH_URL = os.environ.get("FITBIT_AUTH", "https://www.fitbit.com/oauth2/authorize")
SCOPE = "sleep profile"


def log(msg):
    print(f"{time.strftime('%d.%m. %H:%M:%S')}  {msg}", flush=True)


def die(msg, code=1):
    log(f"Abbruch: {msg}")
    sys.exit(code)


# ------------------------------------------------------------------ HTTP

def _request(req):
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            return json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        try:
            j = json.loads(body)
            errs = j.get("errors") or []
            detail = errs[0].get("message") if errs else (
                j.get("error_description") or j.get("error") or body[:300])
        except ValueError:
            detail = body[:300]
        if e.code == 401:
            detail += "  (Zugriff abgelaufen – 'setup' erneut ausführen)"
        elif e.code == 429:
            detail += "  (Fitbit erlaubt 150 Abfragen pro Stunde)"
        raise RuntimeError(f"HTTP {e.code}: {detail}") from None
    except urllib.error.URLError as e:
        raise RuntimeError(f"Netzwerkfehler: {e.reason}") from None


def post_form(url, data):
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
    })
    return _request(req)


def get_json(path, token):
    req = urllib.request.Request(API + path, headers={
        "Authorization": "Bearer " + token,
        "Accept": "application/json",
        "Accept-Language": "de_DE",
    })
    return _request(req)


# ----------------------------------------------------------------- Token

def load_token():
    try:
        with open(TOKEN_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except ValueError:
        die(f"{TOKEN_FILE} ist beschädigt – Datei löschen und 'setup' erneut ausführen")


def save_token(tok):
    """Atomar schreiben: Fitbit tauscht das Refresh-Token bei jedem
    Erneuern aus. Ein halb geschriebener Stand kostet den Zugang."""
    os.makedirs(os.path.dirname(TOKEN_FILE) or ".", exist_ok=True)
    tmp = TOKEN_FILE + ".neu"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(tok, f, indent=1)
    os.chmod(tmp, 0o600)
    os.replace(tmp, TOKEN_FILE)


def access_token():
    tok = load_token()
    if not tok:
        die(f"Noch nicht verknüpft. Einmalig ausführen:  python3 {os.path.basename(__file__)} setup")
    if tok.get("expires_at", 0) > time.time() + 120:
        return tok["access_token"]
    log("Zugriffstoken erneuern …")
    new = post_form(API + "/oauth2/token", {
        "grant_type": "refresh_token",
        "refresh_token": tok["refresh_token"],
        "client_id": tok.get("client_id") or CLIENT_ID,
    })
    tok.update({
        "access_token": new["access_token"],
        "refresh_token": new.get("refresh_token", tok["refresh_token"]),
        "expires_at": time.time() + int(new.get("expires_in", 28800)),
    })
    save_token(tok)
    return tok["access_token"]


# ----------------------------------------------------------------- Setup

def setup():
    if not CLIENT_ID:
        die("FITBIT_CLIENT_ID ist nicht gesetzt")
    if not REDIRECT:
        die("FITBIT_REDIRECT ist nicht gesetzt (muss exakt einer bei Fitbit "
            "hinterlegten Redirect-URL entsprechen)")

    verifier = base64.urlsafe_b64encode(secrets.token_bytes(64)).decode().rstrip("=")
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode()).digest()).decode().rstrip("=")
    state = secrets.token_urlsafe(16)

    url = AUTH_URL + "?" + urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "response_type": "code",
        "code_challenge": challenge,
        "code_challenge_method": "S256",
        "scope": SCOPE,
        "redirect_uri": REDIRECT,
        "state": state,
        "expires_in": "31536000",
    })

    print("\n1. Diese Adresse im Browser öffnen und den Zugriff bestätigen:\n")
    print("   " + url + "\n")
    print("2. Du landest auf einer Seite, die dir einen Code anzeigt.")
    print("   Diesen Code (oder die ganze Adresse aus der Adresszeile) hier einfügen.\n")
    raw = input("Code: ").strip()

    code = raw
    if "://" in raw or raw.startswith("?") or "code=" in raw:
        q = urllib.parse.urlparse(raw).query or raw.lstrip("?")
        params = urllib.parse.parse_qs(q)
        if params.get("state") and params["state"][0] != state:
            die("Der 'state' passt nicht zur Anfrage – bitte von vorne")
        code = (params.get("code") or [""])[0]
    code = code.split("#")[0].strip()
    if not code:
        die("Kein Code erkannt")

    log("Code gegen Token tauschen …")
    new = post_form(API + "/oauth2/token", {
        "client_id": CLIENT_ID,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT,
        "code": code,
        "code_verifier": verifier,
    })
    save_token({
        "client_id": CLIENT_ID,
        "access_token": new["access_token"],
        "refresh_token": new["refresh_token"],
        "expires_at": time.time() + int(new.get("expires_in", 28800)),
        "user_id": new.get("user_id", ""),
        "scope": new.get("scope", ""),
    })
    log(f"Verknüpft. Token liegt in {TOKEN_FILE} (nur für dich lesbar).")
    sync()


# ------------------------------------------------------------------ Sync

def fetch_sleep(token, days):
    """Fitbit erlaubt höchstens 100 Tage je Abfrage."""
    logs, end, rest = [], date.today(), max(1, days)
    while rest > 0:
        span = min(100, rest)
        start = end - timedelta(days=span - 1)
        data = get_json(f"/1.2/user/-/sleep/date/{start}/{end}.json", token)
        got = data.get("sleep") or []
        logs.extend(got)
        log(f"  {start} bis {end}: {len(got)} Einträge")
        rest -= span
        end = start - timedelta(days=1)
    return logs


def merge(new_logs):
    """Vorhandenes bleibt erhalten – so wächst ein Archiv, das über die
    90 Tage hinausreicht, die Fitbit selbst bequem herausgibt."""
    old = []
    try:
        with open(OUT_FILE, "r", encoding="utf-8") as f:
            prev = json.load(f)
        old = prev.get("sleep", prev if isinstance(prev, list) else [])
    except (FileNotFoundError, ValueError):
        pass

    by_id = {}
    for entry in list(old) + list(new_logs):
        key = str(entry.get("logId") or entry.get("startTime"))
        by_id[key] = entry
    merged = sorted(by_id.values(), key=lambda e: e.get("startTime", ""))
    return merged, len(merged) - len(old)


def write_out(merged):
    payload = {
        "quelle": "fitbit",
        "aktualisiert": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "anzahl": len(merged),
        "sleep": merged,
    }
    os.makedirs(os.path.dirname(OUT_FILE) or ".", exist_ok=True)
    tmp = OUT_FILE + ".neu"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, OUT_FILE)   # nie eine halb geschriebene Datei ausliefern
    os.chmod(OUT_FILE, 0o644)


def sync():
    token = access_token()
    log(f"Hole Schlafdaten der letzten {DAYS} Tage …")
    logs = fetch_sleep(token, DAYS)
    merged, added = merge(logs)
    write_out(merged)
    neu = f"{added} neu" if added else "nichts Neues"
    log(f"{len(merged)} Einträge in {OUT_FILE} ({neu})")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "sync"
    if cmd == "setup":
        setup()
    elif cmd == "loop":
        while True:
            try:
                sync()
            except RuntimeError as e:
                log(f"Fehler: {e}")     # alte Datei bleibt unangetastet
            except Exception as e:      # noqa: BLE001 – Dienst darf nicht sterben
                log(f"Unerwarteter Fehler: {e}")
            log(f"Nächster Lauf in {INTERVAL // 3600} h {INTERVAL % 3600 // 60} min")
            time.sleep(INTERVAL)
    elif cmd in ("sync", "once"):
        try:
            sync()
        except RuntimeError as e:
            die(str(e))
    else:
        print(__doc__)
        sys.exit(2)


if __name__ == "__main__":
    main()
