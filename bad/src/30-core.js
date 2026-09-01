/* ==================================================================
   30 · Grundlagen — Werkzeuge, Formate, Datum
   D.heute() und D.jetztIso() laufen ueber die Demo-Uhr (Uhr.jetzt()),
   damit ein Zeitsprung ueberall gleich wirkt.
   ================================================================== */
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

/** HTML-Escape. Jeder Wert aus den Daten laeuft hier durch. */
const h = v => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Symbol aus dem Vorrat. Nimmt "i-haus" wie "haus" entgegen. */
const ic = (name, cls) => {
  const id = String(name).indexOf('i-') === 0 ? name : 'i-' + name;
  return `<svg class="i ${cls || ''}" aria-hidden="true"><use href="#${id}"/></svg>`;
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = p => p + '-' + Math.random().toString(36).slice(2, 9);
const sum = (a, f) => a.reduce((t, x) => t + (f ? f(x) : x), 0);
const by = (a, k) => a.reduce((m, x) => (m[x[k]] = x, m), {});
const grp = (a, f) => a.reduce((m, x) => { const k = f(x); (m[k] = m[k] || []).push(x); return m; }, {});
const uniq = a => Array.from(new Set(a));
const esc = s => String(s || '').toLowerCase();

/* — Zahlen und Betraege — */
const Fmt = {
  chf(v, mitZeichen) {
    const n = Math.round((Number(v) || 0) * 100) / 100;
    const s = n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/’/g, "'");
    return mitZeichen === false ? s : 'CHF ' + s;
  },
  chfKurz(v) {
    const n = Number(v) || 0;
    if (Math.abs(n) >= 1000) return "CHF " + (n / 1000).toLocaleString('de-CH', { maximumFractionDigits: 1 }) + "k";
    return Fmt.chf(n);
  },
  num(v, d) { return (Number(v) || 0).toLocaleString('de-CH', { minimumFractionDigits: d || 0, maximumFractionDigits: d == null ? 2 : d }).replace(/’/g, "'"); },
  std(min) {
    const m = Math.round(Number(min) || 0);
    return (m < 0 ? '-' : '') + Math.floor(Math.abs(m) / 60) + ':' + String(Math.abs(m) % 60).padStart(2, '0');
  },
  stdDez(min) { return Fmt.num((Number(min) || 0) / 60, 2) + ' h'; },
  datum(iso) {
    if (!iso) return '';
    const d = D.parse(iso); if (!d) return String(iso);
    return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
  },
  datumKurz(iso) {
    const d = D.parse(iso); if (!d) return '';
    return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.';
  },
  wochentag(iso, lang) {
    const d = D.parse(iso); if (!d) return '';
    const k = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], l = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return (lang ? l : k)[d.getDay()];
  },
  monat(iso) {
    const d = D.parse(iso); if (!d) return '';
    return ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][d.getMonth()];
  },
  /** "heute", "morgen", "vor 3 Tagen" — im Alltag lesbarer als ein Datum. */
  relativ(iso) {
    const t = D.diffTage(D.heute(), iso);
    if (t === 0) return 'heute';
    if (t === 1) return 'morgen';
    if (t === -1) return 'gestern';
    if (t === 2) return 'übermorgen';
    if (t > 1 && t < 7) return 'in ' + t + ' Tagen';
    if (t < -1 && t > -7) return 'vor ' + (-t) + ' Tagen';
    return Fmt.datum(iso);
  },
  seit(ts) {
    const ms = (typeof Uhr !== 'undefined' ? Uhr.jetzt().getTime() : Date.now()) - new Date(ts).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return 'gerade eben';
    if (m < 60) return 'vor ' + m + ' Min.';
    const st = Math.floor(m / 60);
    if (st < 24) return 'vor ' + st + ' Std.';
    const t = Math.floor(st / 24);
    if (t < 7) return 'vor ' + t + (t === 1 ? ' Tag' : ' Tagen');
    return Fmt.datum(String(ts).slice(0, 10));
  },
  tel(t) { return String(t || '').replace(/\s+/g, ' ').trim(); },
  adresse(o) { return o ? [o.strasse, [o.plz, o.ort].filter(Boolean).join(' ')].filter(Boolean).join(', ') : ''; },
  bytes(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB'; }
};

/* — Datum. Alles ISO "JJJJ-MM-TT", Zeiten "HH:MM". — */
const D = {
  parse(iso) {
    if (!iso) return null;
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) { const d = new Date(iso); return isNaN(d) ? null : d; }
    return new Date(+m[1], +m[2] - 1, +m[3]);
  },
  iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  heute() { return D.iso(typeof Uhr !== 'undefined' ? Uhr.jetzt() : new Date()); },
  jetztIso() { return (typeof Uhr !== 'undefined' ? Uhr.jetzt() : new Date()).toISOString(); },
  jetzt() { const d = typeof Uhr !== 'undefined' ? Uhr.jetzt() : new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); },
  plus(iso, tage) { const d = D.parse(iso); d.setDate(d.getDate() + tage); return D.iso(d); },
  plusMonate(iso, m) { const d = D.parse(iso); d.setMonth(d.getMonth() + m); return D.iso(d); },
  diffTage(a, b) { return Math.round((D.parse(b) - D.parse(a)) / 864e5); },
  /** Montag der Woche, in der das Datum liegt. */
  montag(iso) { const d = D.parse(iso); const w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return D.iso(d); },
  woche(iso) {
    const d = D.parse(iso); const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
    const j1 = new Date(t.getFullYear(), 0, 4);
    return 1 + Math.round(((t - j1) / 864e5 - 3 + ((j1.getDay() + 6) % 7)) / 7);
  },
  minuten(hhmm) { const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : 0; },
  hhmm(min) { const m = Math.max(0, Math.round(min)); return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); },
  istWochenende(iso) { const d = D.parse(iso).getDay(); return d === 0 || d === 6; }
};

/* — Kleine Ergaenzungen fuer BADWERK — */
/** Rappenrundung auf 5 Rappen, wie auf Schweizer Rechnungen ueblich. */
Fmt.rappen = v => Math.round((Number(v) || 0) * 20) / 20;
/** Prozent, z. B. 8.1 -> "8.1 %" */
Fmt.prozent = v => Fmt.num(v, 1).replace(/\.0$/, '') + ' %';
/** Kurzer, gut lesbarer Token fuer Links (Kunde, Lieferant, Monteur). */
const token = () => Math.random().toString(36).slice(2, 8).toUpperCase();
/** Text kuerzen. */
const kuerz = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
/** Anrede aus Vorname/Name. */
const anrede = k => k ? ('Guten Tag ' + [k.vorname, k.name].filter(Boolean).join(' ')).trim() : 'Guten Tag';
/** Naechster Werktag (Mo–Fr) ab iso, n Werktage weiter. */
D.plusWerktage = (iso, n) => { let d = iso, i = 0; while (i < n) { d = D.plus(d, 1); if (!D.istWochenende(d)) i++; } return d; };
D.werktageBis = (a, b) => { let n = 0, d = a; while (d < b) { d = D.plus(d, 1); if (!D.istWochenende(d)) n++; } return n; };
