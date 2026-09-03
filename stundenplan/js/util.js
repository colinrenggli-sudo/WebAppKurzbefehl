/* STUNDENWERK · util.js — kleine Helfer, DOM-Builder, Icons, Zufall, Datum.
   Alles hängt am globalen Namensraum SW (funktioniert im Browser und in Node-Tests). */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});

  // ---------- IDs, Kopien, Sammlungen ----------
  let _seq = 0;
  SW.uid = (p = 'id') => p + '_' + Date.now().toString(36) + (_seq++).toString(36) + Math.random().toString(36).slice(2, 6);
  SW.clone = (o) => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
  SW.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  SW.sum = (arr, f = (x) => x) => arr.reduce((s, x) => s + f(x), 0);
  SW.uniq = (arr) => [...new Set(arr)];
  SW.groupBy = (arr, f) => arr.reduce((m, x) => { const k = f(x); (m[k] = m[k] || []).push(x); return m; }, {});
  SW.sortBy = (arr, ...fs) => [...arr].sort((a, b) => { for (const f of fs) { const x = f(a), y = f(b); if (x < y) return -1; if (x > y) return 1; } return 0; });
  SW.range = (n, from = 0) => Array.from({ length: n }, (_, i) => i + from);
  SW.plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  SW.debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  SW.yieldToUI = () => new Promise((r) => (typeof requestAnimationFrame === 'function' ? setTimeout(r, 0) : setImmediate ? setImmediate(r) : setTimeout(r, 0)));
  SW.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- Zufall mit Seed (deterministische Läufe) ----------
  SW.rng = function (seed) {
    let a = (seed >>> 0) || 1;
    const next = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    next.int = (n) => Math.floor(next() * n);
    next.pick = (arr) => arr[Math.floor(next() * arr.length)];
    next.shuffle = (arr) => { const r = [...arr]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
    return next;
  };
  SW.hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  // ---------- Text & Format ----------
  SW.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  SW.fmtNum = (n, d = 0) => (n == null || isNaN(n) ? '–' : Number(n).toLocaleString('de-CH', { minimumFractionDigits: d, maximumFractionDigits: d }));
  SW.fmtCHF = (n) => 'CHF ' + Number(n || 0).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, "'");
  SW.fmtPct = (x) => Math.round((x || 0) * 100) + ' %';
  SW.fmtHours = (min) => { const h = Math.floor(Math.abs(min) / 60), m = Math.round(Math.abs(min) % 60); return (min < 0 ? '−' : '') + h + ':' + String(m).padStart(2, '0') + ' h'; };
  SW.cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

  // ---------- Datum (de-CH) ----------
  const pad = (n) => String(n).padStart(2, '0');
  SW.isoDate = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  SW.parseDate = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
  SW.fmtDate = (s, opts) => { const d = typeof s === 'string' ? SW.parseDate(s) : s; return d.toLocaleDateString('de-CH', opts || { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  SW.fmtDateLong = (s) => SW.fmtDate(s, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  SW.fmtDateShort = (s) => SW.fmtDate(s, { weekday: 'short', day: 'numeric', month: 'short' });
  SW.fmtTime = (d) => pad(d.getHours()) + ':' + pad(d.getMinutes());
  SW.fmtTs = (ts) => { const d = new Date(ts); const today = SW.isoDate() === SW.isoDate(d); return (today ? '' : SW.fmtDate(d, { day: 'numeric', month: 'short' }) + ', ') + SW.fmtTime(d); };
  SW.addDays = (s, n) => { const d = typeof s === 'string' ? SW.parseDate(s) : new Date(s); d.setDate(d.getDate() + n); return SW.isoDate(d); };
  SW.weekday = (s) => { const d = typeof s === 'string' ? SW.parseDate(s) : s; return ((d.getDay() + 6) % 7) + 1; }; // 1=Mo … 7=So
  SW.startOfWeek = (s) => SW.addDays(s, 1 - SW.weekday(s));
  SW.isoWeek = (s) => { const d = typeof s === 'string' ? SW.parseDate(s) : new Date(s); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 86400000 + 1) / 7); };
  SW.minutes = (hhmm) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + (m || 0); };
  SW.hhmm = (min) => pad(Math.floor(min / 60)) + ':' + pad(min % 60);

  // ---------- DOM-Builder ----------
  // h('div.card.pad', {onclick, style:{}, dataset:{}, html:'…'}, 'text', el, [els], null)
  SW.h = function (tag, attrs, ...children) {
    if (attrs && (attrs instanceof Node || typeof attrs === 'string' || Array.isArray(attrs))) { children.unshift(attrs); attrs = null; }
    const m = tag.match(/^([a-z0-9-]*)(.*)$/i);
    const el = document.createElement(m[1] || 'div');
    const rest = m[2] || '';
    const id = rest.match(/#([\w-]+)/); if (id) el.id = id[1];
    const cls = [...rest.matchAll(/\.([\w-]+)/g)].map((x) => x[1]); if (cls.length) el.className = cls.join(' ');
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class' || k === 'className') el.className = (el.className ? el.className + ' ' : '') + v;
      else if (k === 'style' && typeof v === 'object') { for (const [sk, sv] of Object.entries(v)) { if (sv === null || sv === undefined || sv === false) continue; if (sk.startsWith('--')) el.style.setProperty(sk, String(sv)); else el.style[sk] = sv; } }
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'value' || k === 'checked' || k === 'disabled' || k === 'selected' || k === 'indeterminate' || k === 'readOnly') el[k] = v;
      else if (k === 'ref' && typeof v === 'function') v(el);
      else el.setAttribute(k, v === true ? '' : v);
    }
    const add = (c) => { if (c === null || c === undefined || c === false) return; if (Array.isArray(c)) return c.forEach(add); el.appendChild(c instanceof Node ? c : document.createTextNode(String(c))); };
    children.forEach(add);
    return el;
  };
  SW.frag = (...children) => { const f = document.createDocumentFragment(); children.flat(Infinity).forEach((c) => { if (c != null && c !== false) f.appendChild(c instanceof Node ? c : document.createTextNode(String(c))); }); return f; };
  SW.clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
  SW.mount = (el, ...children) => { SW.clear(el); children.flat(Infinity).forEach((c) => { if (c != null && c !== false) el.appendChild(c instanceof Node ? c : document.createTextNode(String(c))); }); return el; };
  SW.$ = (sel, root = document) => root.querySelector(sel);
  SW.$$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ---------- Icons (Lucide-ähnlich, Strich 1.9) ----------
  const P = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 13.5a6 6 0 0 1 3.5 6.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    door: '<path d="M4 21h16"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><circle cx="14.5" cy="12" r="1" fill="currentColor"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 5 9-5"/>',
    sparkles: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/>',
    wand: '<path d="m15 4 5 5L7 22l-5-5z"/><path d="m14 5 3 3"/><path d="M9 2v2M4 7h2M20 2l-1 1M18 10h2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chat: '<path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-4.5A8 8 0 1 1 21 12z"/>',
    broom: '<path d="m13 11 7-7"/><path d="M6.5 21c-1.5 0-3-.5-3.5-2 2-1 3-3.5 3.5-6l4.5 4.5c-1 2.5-2.5 3.5-4.5 3.5z"/><path d="m10 10 4 4"/>',
    swap: '<path d="M16 3l4 4-4 4"/><path d="M20 7H8"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h12"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    edit: '<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m13.5 6.5 3 3"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    more: '<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    chevronLeft: '<path d="m15 6-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
    play: '<path d="M6 4v16l14-8z"/>',
    stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
    download: '<path d="M12 3v12M6 9l6 6 6-6"/><path d="M4 21h16"/>',
    upload: '<path d="M12 21V9M6 15l6-6 6 6"/><path d="M4 3h16"/>',
    print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="9" rx="2"/><path d="M6 15h12v6H6z"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 5-5"/>',
    warnc: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    move: '<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    send: '<path d="m3 11 18-8-8 18-2-8z"/>',
    pin: '<path d="M12 21v-6"/><path d="M8 15h8l-1-4V5h1V3H8v2h1v6z"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    heart: '<path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/>',
    flag: '<path d="M5 21V4h12l-2 4 2 4H5"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M13 3h6v18h-6"/>',
    grip: '<circle cx="9" cy="6" r="1.2" fill="currentColor"/><circle cx="15" cy="6" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="18" r="1.2" fill="currentColor"/><circle cx="15" cy="18" r="1.2" fill="currentColor"/>',
  };
  SW.iconSvg = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[name] || P.info}</svg>`;
  SW.icon = (name, cls) => { const t = document.createElement('template'); t.innerHTML = SW.iconSvg(name); const s = t.content.firstChild; if (cls) s.classList.add(...cls.split(' ')); return s; };
  SW.iconNames = Object.keys(P);

  // ---------- Browser-Helfer ----------
  SW.download = (name, text, mime = 'text/plain') => { const b = new Blob([text], { type: mime + ';charset=utf-8' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); };
  SW.copyText = async (t) => { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } };
  SW.lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  SW.lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
  SW.lsDel = (k) => { try { localStorage.removeItem(k); } catch {} };
})();
