# 🧠 TeamBrain – AI-Wissensassistent (Prototyp)

Klickbarer Prototyp eines rollenbasierten AI-Wissensassistenten für Projektteams.

**Starten:** `teambrain/index.html` einfach im Browser öffnen – kein Server, kein Build.
Alle Daten liegen lokal im Browser (localStorage). «Abmelden» setzt alles zurück.

## Was der Prototyp zeigt

1. **Login & Rollenerkennung** – Anmelden, dann Rolle wählen (im Zielsystem: automatisch via SSO/Azure AD). 15 Rollen von Administrativ bis Management.
2. **Assistent (Chat)** – Fragen wie «Welche Umsysteme haben wir?» oder «Welche Daten senden wir wohin?» werden aus einer simulierten Confluence-Wissensbasis beantwortet – **immer mit Quellenangabe** (klickbar) und **rollenbasiert**: z.B. sieht nur PM/PO/Management Budgetdetails, andere Rollen bekommen eine geschützte Kurzfassung.
3. **Wissensbasis** – Durchsuchbare Sicht auf die (simulierten) Confluence-Seiten, gesperrte Seiten sind als 🔒 markiert mit Freigabe-Anfrage.
4. **Meetings** – Meeting erstellen mit «Was ist mir wichtig»-Punkten → wird zur Agenda-Checkliste im Meeting (inkl. Anwesenheit) → «Meeting beenden» erzeugt automatisch das Protokoll (besprochen/offen) → Sprint-Report an Manager per Knopfdruck.
5. **Integrationen** – Modulares Konzept: Confluence, Jira, Kalender, Meeting-Bot, RAG-Engine (Onyx), Slack/Teams, SAP, SSO als zu-/abschaltbare Module.
6. **Team & Rollen** – Übersicht aller Rollen mit Antwort-Fokus und Berechtigungen.

## Wichtig (Prototyp-Grenzen)

- Die «AI» ist ein regelbasierter Mock, der das Antwortverhalten (Quellen, Rollenlogik, Wissenslücken-Radar) demonstriert. Im Zielsystem übernimmt eine RAG-Engine (z.B. Onyx self-hosted mit Confluence-Konnektor) plus ein LLM diese Aufgabe.
- Login/Integrationen/Versand sind simuliert.

## Nächste Schritte Richtung MVP

1. Onyx (Open Source) mit echtem Confluence-Konnektor aufsetzen → Chat-Backend anbinden.
2. SSO (Azure AD) + automatische Rollenzuordnung aus Verzeichnisgruppen.
3. Kalender-Anbindung (Google/Microsoft Graph) für echte Meetings.
4. Meeting-Bot-Modul evaluieren (Fathom/Fireflies API oder Whisper self-hosted).

Marktrecherche & Architektur-Zielbild: siehe [RECHERCHE.md](RECHERCHE.md).
