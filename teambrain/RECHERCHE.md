# Marktrecherche: AI-Wissensassistent für Projektteams

**Stand:** August 2026 · Erstellt als Grundlage für den TeamBrain-Prototyp

## 1. Ausgangslage / Problem

- Wissen ist im Betrieb vorhanden (v.a. in Confluence), aber Personen **finden es nicht**.
- Typische Fragen wie «Welche Umsysteme gibt es?» oder «Welche Daten senden wir wohin?»
  sind dokumentiert, aber schwer auffindbar.
- AI wird im Betrieb generell zu wenig genutzt → Projekte laufen schlechter als nötig.

## 2. Bestehende Produkte am Markt

### Enterprise-Wissenssuche / «Ask your company anything»

| Produkt | Stärken | Schwächen / Lücken | Preis (ca.) |
|---|---|---|---|
| **Atlassian Rovo** | Nativ in Confluence/Jira, «Teamwork Graph», Agents | Stark nur *innerhalb* Atlassian; Cross-Tool-Antworten schwächer | Teil von Atlassian-Lizenzen |
| **Glean** | 100+ Konnektoren (Slack, Drive, Salesforce, GitHub, Confluence), bestes Berechtigungsmodell, Enterprise Graph | Teuer, auf Grossunternehmen ausgelegt | Enterprise-Pricing |
| **Microsoft 365 Copilot** | Tief in Word/Teams/SharePoint integriert | Confluence nur über Umwege; MS-zentriert | ~30 $/User/Monat |
| **Notion AI** | Gutes Q&A, günstig | Nur sinnvoll, wenn Wissen in Notion liegt | ab 10 $/Seat/Monat |
| **Guru** | Verifiziertes Wissen, **rollenbasierte Personalisierung** | Eher Support-/Sales-fokussiert | 25–40 $/User/Monat |
| **Onyx (ex-Danswer)** | **Open Source**, selbst hostbar, Confluence-/Jira-/Slack-Konnektoren, RBAC, permission-aware Retrieval, freie LLM-Wahl | Betrieb/Wartung selbst; UI generisch | Gratis (Self-Hosting) |

### AI-Meeting-Assistenten

| Produkt | Stärken | Schwächen |
|---|---|---|
| **Fathom** | Beste Summaries (Key Points, Decisions, Action Items), gratis Einstieg | Zoom-fokussiert |
| **Fireflies** | CRM-Integrationen (Salesforce, HubSpot), Auto-Join | Sales-lastig |
| **Otter.ai** | ~95 % Transkriptionsgenauigkeit, Multi-Plattform | Summaries flacher |

### Erkenntnisse

1. **Kein Produkt kombiniert beides**: rollenbasiertes Wissens-Q&A über Confluence
   *und* Meeting-Vorbereitung/Protokolle in einem System. Das ist unsere Lücke.
2. **Rollenbasierte Personalisierung** ist selten (nur Guru macht das ernsthaft) —
   genau unsere Kernidee «das System erkennt, was du bist».
3. **Modularität ist der richtige Ansatz**: Statt alles selbst zu bauen, bestehende
   Best-of-Breed-Module andocken — z.B. **Onyx** als RAG-/Such-Engine (Open Source,
   Confluence-Konnektor, permission-aware) und einen Meeting-Bot à la Fathom.
4. **Berechtigungen sind kritisch**: Die AI darf nur zeigen, was die Rolle sehen darf
   (z.B. Finanzzahlen nur für PM/Stakeholder). Glean und Onyx machen das vor.

## 3. Empfohlene Architektur (Zielbild)

```
Login/SSO → Rollenerkennung (Onboarding-Wizard + Verzeichnis-Sync)
   │
   ├── Chat-UI (dieser Prototyp)
   │      └── RAG-Engine (Modul, z.B. Onyx self-hosted oder Rovo API)
   │             └── Konnektoren: Confluence, Jira, Kalender, SharePoint …
   │
   └── Meeting-Modul
          ├── Kalender-Integration (Google/Outlook)
          ├── Agenda/«Was ist mir wichtig» bei Meeting-Erstellung
          ├── Live-Checkliste + Anwesenheit im Meeting
          └── Auto-Protokoll + Sprint-Report an Manager
```

## 4. Rollen / Stakeholder (erweiterte Liste)

Vom Product Owner genannt: Administrative Mitarbeiter:in, Softwareentwickler:in,
Projektmanager:in, Stakeholder (Finanz-Updates).

Ergänzt:

- **Product Owner** – Backlog, Priorisierung, Business Value
- **Scrum Master / Agile Coach** – Prozess, Impediments, Sprint-Metriken
- **Business Analyst** – Anforderungen, Prozesse, Schnittstellen
- **UX/UI Designer** – Styleguides, Personas, Research-Ergebnisse
- **QA / Tester:in** – Testkonzepte, Testdaten, bekannte Bugs
- **Betrieb / Support (Ops)** – Runbooks, Incidents, Deployments
- **IT-Architekt:in** – Systemlandschaft, Umsysteme, Schnittstellen
- **Compliance / Datenschutz (DPO)** – Datenflüsse, AVV, Löschkonzepte
- **HR / Onboarding** – Team, Zuständigkeiten, Einarbeitung
- **Sales / Kundenberatung** – Produktstand, Roadmap, Referenzen
- **Externe Partner / Lieferanten** – eingeschränkte Sicht auf definierte Bereiche
- **Management / Geschäftsleitung** – Finanz-Updates, Statusberichte, Risiken

## 5. Zusätzliche Funktionsideen (Potenzial)

1. **Proaktive Briefings**: Vor jedem Meeting schickt die AI ein Kurz-Briefing
   (relevante Confluence-Seiten, offene Punkte aus letztem Protokoll).
2. **Wissenslücken-Radar**: AI erkennt Fragen, die niemand beantworten konnte →
   Vorschlag, welche Doku fehlt («Diese Frage wurde 4× gestellt, es gibt keine Seite dazu»).
3. **Onboarding-Modus**: Neue Mitarbeitende bekommen einen geführten 30-Tage-Pfad
   durch das relevante Wissen ihrer Rolle.
4. **Entscheidungs-Log**: Jede in Meetings getroffene Entscheidung wird automatisch
   extrahiert und durchsuchbar abgelegt («Warum haben wir X entschieden? → Protokoll vom …»).
5. **Sprint-Report-Automatik**: Nach jedem Sprint automatisch Zusammenfassung an
   Manager/Stakeholder (aus Protokollen + Jira-Daten).
6. **Veraltetes-Wissen-Warnung**: Seiten, die lange nicht aktualisiert wurden, aber
   oft als Quelle dienen, werden dem Owner zur Prüfung gemeldet.
7. **Frage-Weiterleitung an Menschen**: Wenn die AI keine Quelle findet, schlägt sie
   die richtige Ansprechperson vor (aus Zuständigkeits-Doku).

## Quellen

- [Atlassian Rovo vs. Glean (Seibert Group)](https://us.seibert.group/blog/atlassian-rovo-vs-glean-ai-how-do-they-compare)
- [Atlassians AI-Assistent für Jira und Confluence – Review (eesel)](https://www.eesel.ai/blog/atlassian-brings-an-ai-assistant-to-jira-and-confluence)
- [Best Atlassian Rovo Alternatives (GoSearch)](https://www.gosearch.ai/blog/the-best-atlassian-rovo-alternatives-in-2026/)
- [Glean vs Notion AI vs Guru vs Rovo vs Copilot (Bizz)](https://www.bizz.ai/blog/glean-vs-notion-ai-vs-guru-vs-atlassian-rovo-vs-microsoft-copilot/)
- [Onyx – Open Source Enterprise AI (GitHub)](https://github.com/onyx-dot-app/onyx)
- [Onyx AI: Enterprise Search & AI Assistant (Seaflux)](https://www.seaflux.tech/blogs/onyx-ai-enterprise-search-assistant/)
- [Otter vs Fireflies vs Fathom (index.dev)](https://www.index.dev/blog/otter-vs-fireflies-vs-fathom-ai-meeting-notes-comparison)
- [AI Meeting Transcription Tools Comparison (ticnote)](https://ticnote.com/en/blog/ai-meeting-transcription-tools-comparison)
