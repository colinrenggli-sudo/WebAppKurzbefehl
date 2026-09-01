/* ==================================================================
   44 · Kalender — ICS, Google-Kalender-Link, Calendly
   Ohne OAuth: eine ICS-Datei zum Herunterladen, ein Vorlagen-Link fuer
   den Google-Kalender und – wenn eingerichtet – die Calendly-Seite des
   Betriebs fuer die Terminwahl des Kunden.
   ================================================================== */
const Kal = {
  _ics(dt) { return dt.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z'); },
  /** Lokale Zeit (Europe/Zurich) in UTC-ICS-Zeichenkette. */
  utc(isoDatum, hhmm) {
    const [j, m, t] = isoDatum.split('-').map(Number); const [hh, mm] = (hhmm || '08:00').split(':').map(Number);
    return Kal._ics(new Date(j, m - 1, t, hh, mm).toISOString());
  },
  ics(o) {
    const z = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BADWERK//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT', 'UID:' + (o.uid || uid('ev')) + '@badwerk', 'DTSTAMP:' + Kal._ics(new Date().toISOString()),
      'DTSTART:' + Kal.utc(o.datum, o.von), 'DTEND:' + Kal.utc(o.datum, o.bis),
      'SUMMARY:' + Kal.esc(o.titel), 'DESCRIPTION:' + Kal.esc(o.text || ''), 'LOCATION:' + Kal.esc(o.ort || ''),
      'END:VEVENT', 'END:VCALENDAR'];
    return z.join('\r\n');
  },
  esc(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;'); },
  icsHerunterladen(o, dateiname) {
    const blob = new Blob([Kal.ics(o)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = dateiname || 'termin.ics';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  },
  google(o) {
    const p = new URLSearchParams({
      action: 'TEMPLATE', text: o.titel, details: o.text || '', location: o.ort || '',
      dates: Kal.utc(o.datum, o.von) + '/' + Kal.utc(o.datum, o.bis)
    });
    return 'https://calendar.google.com/calendar/render?' + p.toString();
  },
  /** Calendly-Seite des Betriebs, mit vorausgefuellten Angaben. */
  calendly(kunde, auftrag) {
    const u = (DB.betrieb.calendlyUrl || '').trim();
    if (!u) return '';
    const p = new URLSearchParams();
    if (kunde) { p.set('name', [kunde.vorname, kunde.name].filter(Boolean).join(' ')); if (kunde.email) p.set('email', kunde.email); }
    if (auftrag) p.set('a1', auftrag.nr || auftrag.id);
    return u + (u.includes('?') ? '&' : '?') + p.toString();
  },
  /** Freie Halbtage fuer die Terminwahl: Werktage ab Start, ohne bereits belegte. */
  freieSlots(abIso, tage, belegt) {
    const out = []; let d = abIso;
    while (out.length < tage * 2 && out.length < 40) {
      d = D.plus(d, 1);
      if (D.istWochenende(d)) continue;
      ['08:00', '13:00'].forEach(von => {
        const bis = von === '08:00' ? '12:00' : '17:00';
        const key = d + ' ' + von;
        if (!(belegt || []).includes(key)) out.push({ datum: d, von, bis, key });
      });
    }
    return out;
  }
};
