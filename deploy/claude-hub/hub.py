#!/usr/bin/env python3
"""
claude-hub – der Serverteil von CODEWERK.

Drei Aufgaben, mehr nicht:

  POST /api/boost   löst deine Boost-Routine aus und gibt den Link zur
                    frisch gestarteten Session zurück. Der Routinen-Token
                    bleibt dabei hier auf dem Server und muss nicht aufs
                    Handy.
  POST /api/feed    nimmt die Übersicht entgegen, die die Sammel-Routine
                    stündlich schickt.
  GET  /api/feed    liefert sie der App aus.

Warum überhaupt ein Server? Zwei Gründe. Erstens darf ein Browser eine
fremde Schnittstelle nur ansprechen, wenn diese es per CORS erlaubt –
tut sie das nicht, kommt die App direkt nicht durch, über den Umweg
hier aber schon. Zweitens liegt der Routinen-Token dann nicht auf
einem Gerät, das man liegen lassen kann.

Nur Standardbibliothek, keine Abhängigkeiten.

    python3 hub.py

Einstellungen über Umgebungsvariablen:
    ROUTINE_FIRE_URL  URL der Boost-Routine, endet auf /fire
    ROUTINE_TOKEN     zugehöriger Token (sk-ant-oat01-…)
    HUB_TOKEN         Token, das die App mitschicken muss – frei
                      gewählt, aber bitte lang. Leer = jeder im Netz
                      darf boosten; nur im abgeschotteten Heimnetz
                      vertretbar.
    INGEST_TOKEN      Token für das Einliefern des Feeds
                      (Standard: derselbe wie HUB_TOKEN)
    FEED_FILE         wo die Übersicht liegt (Standard /daten/claude-feed.json)
    ALLOW_ORIGIN      erlaubte Herkunft für CORS. Standard "*".
                      Schärfer ist z. B.
                      https://colinrenggli-sudo.github.io
    PORT              Standard 8090
"""

import hmac
import json
import os
import sys
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

FIRE_URL     = os.environ.get("ROUTINE_FIRE_URL", "").strip()
FIRE_TOKEN   = os.environ.get("ROUTINE_TOKEN", "").strip()
HUB_TOKEN    = os.environ.get("HUB_TOKEN", "").strip()
INGEST_TOKEN = os.environ.get("INGEST_TOKEN", "").strip() or HUB_TOKEN
FEED_FILE    = os.environ.get("FEED_FILE", "/daten/claude-feed.json")
ALLOW_ORIGIN = os.environ.get("ALLOW_ORIGIN", "*").strip()
PORT         = int(os.environ.get("PORT", "8090"))

BETA     = "experimental-cc-routine-2026-04-01"
MAX_BODY = 1_000_000          # 1 MB reicht für jede Übersicht
MAX_TEXT = 65_536             # Grenze der Schnittstelle für "text"


def log(msg):
    print(f"{time.strftime('%d.%m. %H:%M:%S')}  {msg}", flush=True)


def token_ok(given, expected):
    """Leeres Soll heisst: keine Prüfung. Sonst Vergleich ohne Zeitverrat."""
    if not expected:
        return True
    return hmac.compare_digest(str(given or ""), expected)


def fire_routine(text):
    """Boost-Routine auslösen. Gibt (status, daten) zurück."""
    if not FIRE_URL or not FIRE_TOKEN:
        return 503, {"error": {"type": "not_configured",
                               "message": "ROUTINE_FIRE_URL oder ROUTINE_TOKEN fehlt auf dem Server."}}
    body = json.dumps({"text": text[:MAX_TEXT]}).encode("utf-8")
    req = urllib.request.Request(FIRE_URL, data=body, method="POST", headers={
        "Authorization":     "Bearer " + FIRE_TOKEN,
        "anthropic-version": "2023-06-01",
        "anthropic-beta":    BETA,
        "Content-Type":      "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            return res.status, json.loads(res.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")
        try:
            return e.code, json.loads(raw)
        except ValueError:
            return e.code, {"error": {"type": "http_error", "message": raw[:400] or e.reason}}
    except Exception as e:                                    # Netz, DNS, TLS
        return 502, {"error": {"type": "upstream_error", "message": str(e)}}


def read_feed():
    try:
        with open(FEED_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"updated": None, "items": []}
    except Exception as e:
        log(f"Feed unlesbar: {e}")
        return {"updated": None, "items": [], "error": "Datei unlesbar"}


def write_feed(data):
    """Erst danebenlegen, dann umbenennen – so liest niemand einen halben Feed."""
    items = data.get("items") if isinstance(data, dict) else data
    if not isinstance(items, list):
        raise ValueError('erwartet wird {"items": [...]} oder eine Liste')
    clean = {"updated": (data.get("updated") if isinstance(data, dict) else None)
                        or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
             "items": items[:100]}
    os.makedirs(os.path.dirname(FEED_FILE) or ".", exist_ok=True)
    tmp = FEED_FILE + ".neu"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(clean, f, ensure_ascii=False, indent=1)
    os.replace(tmp, FEED_FILE)
    return len(clean["items"])


class Handler(BaseHTTPRequestHandler):
    server_version = "claude-hub"
    protocol_version = "HTTP/1.1"

    # ---- Werkzeug ---------------------------------------------------
    def cors(self):
        self.send_header("Access-Control-Allow-Origin", ALLOW_ORIGIN)
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Max-Age", "86400")
        if ALLOW_ORIGIN != "*":
            self.send_header("Vary", "Origin")

    def reply(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.cors()
        self.end_headers()
        self.wfile.write(body)

    def bearer(self):
        head = self.headers.get("Authorization", "")
        return head[7:].strip() if head.startswith("Bearer ") else ""

    def body_json(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0:
            return {}
        if n > MAX_BODY:
            raise ValueError("Anfrage zu gross")
        return json.loads(self.rfile.read(n).decode("utf-8") or "{}")

    def log_message(self, fmt, *args):
        pass                                                   # eigenes Log unten

    # ---- Routen -----------------------------------------------------
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Content-Length", "0")
        self.cors()
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?", 1)[0].rstrip("/") or "/"
        if path == "/api/health":
            return self.reply(200, {"ok": True,
                                    "boost": bool(FIRE_URL and FIRE_TOKEN),
                                    "feed": os.path.exists(FEED_FILE)})
        if path == "/api/feed":
            if not token_ok(self.bearer(), HUB_TOKEN):
                return self.reply(401, {"error": {"type": "authentication_error",
                                                  "message": "Token fehlt oder passt nicht."}})
            return self.reply(200, read_feed())
        return self.reply(404, {"error": {"type": "not_found_error", "message": "Unbekannter Pfad."}})

    def do_POST(self):
        path = self.path.split("?", 1)[0].rstrip("/") or "/"

        if path == "/api/boost":
            if not token_ok(self.bearer(), HUB_TOKEN):
                return self.reply(401, {"error": {"type": "authentication_error",
                                                  "message": "Token fehlt oder passt nicht."}})
            try:
                data = self.body_json()
            except Exception as e:
                return self.reply(400, {"error": {"type": "invalid_request_error", "message": str(e)}})
            text = str(data.get("text") or "")
            status, out = fire_routine(text)
            if status == 200:
                log(f"Boost → {out.get('claude_code_session_id', '?')}")
            else:
                log(f"Boost gescheitert ({status}): "
                    f"{(out.get('error') or {}).get('message', '')[:160]}")
            return self.reply(status, out)

        if path == "/api/feed":
            if not token_ok(self.bearer(), INGEST_TOKEN):
                return self.reply(401, {"error": {"type": "authentication_error",
                                                  "message": "Token fehlt oder passt nicht."}})
            try:
                n = write_feed(self.body_json())
            except Exception as e:
                return self.reply(400, {"error": {"type": "invalid_request_error", "message": str(e)}})
            log(f"Feed erneuert: {n} Einträge")
            return self.reply(200, {"ok": True, "items": n})

        return self.reply(404, {"error": {"type": "not_found_error", "message": "Unbekannter Pfad."}})


def main():
    if not FIRE_URL or not FIRE_TOKEN:
        log("Hinweis: ROUTINE_FIRE_URL/ROUTINE_TOKEN fehlen – /api/boost antwortet mit 503.")
    if not HUB_TOKEN:
        log("WARNUNG: HUB_TOKEN ist leer. Jeder, der den Port erreicht, darf boosten.")
    if ALLOW_ORIGIN == "*":
        log("Hinweis: ALLOW_ORIGIN ist \"*\". Enger ist besser, sobald die Adresse öffentlich ist.")
    log(f"claude-hub lauscht auf Port {PORT}, Feed unter {FEED_FILE}")
    try:
        ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
    except KeyboardInterrupt:
        log("beendet")
        sys.exit(0)


if __name__ == "__main__":
    main()
