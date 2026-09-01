/* ==================================================================
   80 · Lager-App (Handy, Code 98765)
   Ein Grundsatz: scannen, bestaetigen, fertig. Der QR-Code enthaelt
   einen Link in diese App (?scan=CODE); das Handy oeffnet ihn mit der
   normalen Kamera, oder der Scanner in der App liest ihn. Danach zwei
   Wege: OK oder Beschaedigt – unter Vorbehalt (mit Foto).
   Was hier gebucht wird, erscheint am PC im Auftrag – bei aktiver
   Live-Verbindung innert Sekunden.
   ================================================================== */
const Lager = {
  codeAus(text) {
    const s = String(text || '').trim();
    const m = s.match(/[?&]scan=([^&#]+)/); if (m) return decodeURIComponent(m[1]);
    return s;
  },
  erwartet() {
    const heute = D.heute();
    return DB.lagerpositionen.filter(lp => lp.status === 'erwartet').map(lp => { const b = Q.bestellung(lp.bestellungId); const a = Q.auftrag(lp.auftragId); return { lp, b, a, termin: b ? Dom.terminVon(b) : heute, l: b && Q.lieferant(b.lieferantId) }; }).filter(x => x.a && !['storniert', 'archiviert'].includes(x.a.status)).sort((x, y) => x.termin.localeCompare(y.termin));
  },
  karte(x) {
    const heute = D.heute(); const spaet = x.termin < heute;
    return `<button class="ftask" data-act="lager.oeffnen" data-code="${h(x.lp.code)}"><div class="top"><span class="tm ${spaet ? 'err' : ''}" style="${spaet ? 'color:var(--err-txt)' : ''}">${spaet ? 'überfällig · ' : ''}${Fmt.relativ(x.termin)}</span><span class="chip st st-${x.b ? x.b.status : 'erwartet'}" style="font-size:11px">${x.b ? Dom.statusText(x.b.status) : ''}</span></div><div class="bd"><b>${x.lp.menge > 1 ? x.lp.menge + '× ' : ''}${h(x.lp.name)}</b></div><div class="adr">${ic('i-paket')}${h(x.a.nr)} · ${h(Dom.kundeName(Q.kunde(x.a.kundeId)))} · ${h(x.l ? x.l.kuerzel : '')}</div></button>`;
  }
};

Fld.seiten.scan = (rest, ich) => {
  const code = rest[0] ? Lager.codeAus(rest[0]) : null;
  if (code) return Lager.buchung(code, ich);
  if (S.ui.gebucht) { const g = S.ui.gebucht; S.ui.gebucht = null; return Lager.fertig(g); }
  Fld.kopf('Wareneingang', ich.name + ' · ' + DB.betrieb.name, `<div class="sync-slot">${Sync.anzeige()}</div>`);
  const erw = Lager.erwartet(); const heute = D.heute();
  const faellig = erw.filter(x => x.termin <= D.plus(heute, 1));
  return `<div class="fld-inner">
    <button class="btn primary lg wide" style="height:64px;font-size:18px" data-act="lager.scan">${ic('i-qr')} QR-Code scannen</button>
    <div class="fcard pad"><div class="row"><input class="inp" id="lagerCode" placeholder="Code eintippen, z. B. A2026-0142-01-01" inputmode="text" autocapitalize="characters"><button class="btn" data-act="lager.code">Öffnen</button></div><p style="font-size:12px;color:var(--txt-3);margin-top:6px">Ohne Kamera: Code vom Etikett abtippen. Der QR-Code enthält denselben Link – die normale Handy-Kamera öffnet ihn direkt.</p></div>
    <div class="fcard"><div class="fcard-h"><h3>Heute und morgen erwartet</h3><span class="chip">${faellig.length}</span></div>${faellig.length ? faellig.map(Lager.karte).join('') : '<p style="padding:12px 14px;color:var(--txt-3);font-size:13.5px">Nichts angekündigt.</p>'}</div>
    ${erw.length > faellig.length ? `<a class="btn wide" href="#/l/erwartet">Alle ${erw.length} erwarteten Positionen</a>` : ''}
  </div>`;
};

Lager.buchung = (code, ich) => {
  const lp = Q.lagerpositionMitCode(code);
  Fld.kopf('Position buchen', code, `<a class="btn ghost icon" href="#/l/scan" aria-label="Abbrechen">${ic('i-x')}</a>`);
  if (!lp) return `<div class="fld-inner"><div class="fcard pad"><div class="empty"><span class="ic">${ic('i-warn')}</span><b>Code unbekannt</b><p>${h(code)} gehört zu keinem Auftrag auf diesem Gerät. Ist die Live-Verbindung aktiv?</p></div><a class="btn wide" href="#/l/scan">Zurück</a></div></div>`;
  const a = Q.auftrag(lp.auftragId); const b = Q.bestellung(lp.bestellungId); const l = b && Q.lieferant(b.lieferantId); const k = a && Q.kunde(a.kundeId);
  if (lp.status !== 'erwartet') return `<div class="fld-inner"><div class="fcard pad"><div class="empty"><span class="ic">${ic('i-haken-kreis')}</span><b>Schon gebucht</b><p>${h(lp.name)} wurde am ${Fmt.datum((lp.gescanntAm || '').slice(0, 10))} von ${h((Q.benutzer(lp.gescanntVon) || {}).name || 'Lager')} als «${Dom.statusText(lp.status)}» gebucht. Lagerplatz ${h(lp.lagerplatz || '–')}.</p></div><a class="btn primary wide" href="#/l/scan">Weiter scannen</a></div></div>`;
  const platz = Dom.lagerplatzVorschlag(DB, lp);
  const f = S.ui.schaden || {};
  return `<div class="fld-inner">
    <div class="fcard pad"><div class="row" style="gap:12px;align-items:flex-start"><span class="ic" style="width:44px;height:44px;border-radius:12px;background:var(--tint-soft);color:var(--tint-txt);display:grid;place-items:center;flex:none">${ic((Q.artikel(lp.artikelId) || {}).icon || 'i-paket')}</span><div style="flex:1;min-width:0"><b style="font-size:17px;line-height:1.25;display:block">${lp.menge > 1 ? lp.menge + '× ' : ''}${h(lp.name)}</b><small style="color:var(--txt-2)">${h(l ? l.name : '')} · ${h(b ? b.nr : '')}</small></div></div>
      <div class="dl" style="margin-top:12px"><dt>Kommission</dt><dd><b>${h(a.nr)}</b> · ${h(Dom.kundeName(k))}</dd><dt>Erwartet</dt><dd>${b ? Fmt.datum(Dom.terminVon(b)) + (b.avis ? ' · Avis ' + h(b.avis.sendung) : '') : '–'}</dd><dt>Lagerplatz</dt><dd class="mono">${h(platz)}</dd><dt>Stand Auftrag</dt><dd>${Q.lagerpositionenVon(a.id).filter(x => x.status !== 'erwartet').length + 1} von ${Q.lagerpositionenVon(a.id).length} Positionen nach dieser Buchung</dd></div></div>
    ${f.offen ? `<div class="fcard pad stack"><b>Beschädigt – unter Vorbehalt annehmen</b><div class="field"><label>Befund</label><input class="inp" id="schadenNotiz" placeholder="z. B. Karton eingedrückt, Emaille abgeplatzt" value="${h(f.notiz || '')}"></div><div class="photos">${f.foto ? `<div class="photo"><img src="${f.foto}" alt="Schaden"></div>` : ''}<button class="photo-add" data-act="lager.foto">${ic('i-kamera')}<span>Foto</span></button></div><p style="font-size:12px;color:var(--txt-3)">Die Schadensmeldung geht automatisch an ${h(l ? l.name : 'den Lieferanten')} – Rügefrist ${l && l.ruegefristTage === 1 ? '1 Tag' : '8 Tage'}.</p><button class="btn danger lg wide" data-act="lager.schaden" data-id="${lp.id}">${ic('i-warn')} Unter Vorbehalt buchen</button><button class="btn ghost wide" data-act="lager.schadenAb">Doch in Ordnung</button></div>`
    : `<div class="fld-act" style="position:static;display:flex;flex-direction:column;gap:10px"><button class="btn ok lg wide" style="height:60px;font-size:17px" data-act="lager.ok" data-id="${lp.id}">${ic('i-check')} In Ordnung – eingetroffen</button><button class="btn danger soft lg wide" data-act="lager.schadenAuf">${ic('i-warn')} Beschädigt – unter Vorbehalt</button></div>`}
  </div>`;
};

Lager.fertig = g => {
  const lp = Q.lagerposition(g.lpId); const a = Q.auftrag(lp.auftragId);
  const rest = Q.lagerpositionenVon(a.id).filter(x => x.status === 'erwartet');
  Fld.kopf('Gebucht', a.nr);
  return `<div class="fld-inner"><div class="fcard pad"><div class="po-ok"><span class="ic" style="${lp.status === 'beschaedigt' ? 'background:var(--err-soft);color:var(--err)' : ''}">${ic(lp.status === 'beschaedigt' ? 'i-warn' : 'i-check')}</span><h2>${lp.status === 'beschaedigt' ? 'Unter Vorbehalt gebucht' : 'Eingetroffen'}</h2><p><b>${h(lp.name)}</b><br>Lagerplatz <b class="mono">${h(lp.lagerplatz)}</b><br>${rest.length ? rest.length + ' Position' + (rest.length > 1 ? 'en' : '') + ' für ' + h(a.nr) + ' noch offen' : 'Auftrag ' + h(a.nr) + ' ist vollständig – der Kunde wird zur Terminwahl eingeladen.'}</p></div>
    <a class="btn primary lg wide" href="#/l/scan">${ic('i-qr')} Weiter scannen</a></div>
    ${rest.length ? `<div class="fcard"><div class="fcard-h"><h3>Noch offen für ${h(a.nr)}</h3></div>${rest.map(x => { const b = Q.bestellung(x.bestellungId); return `<div class="ftask" style="cursor:default"><div class="bd"><b>${x.menge > 1 ? x.menge + '× ' : ''}${h(x.name)}</b></div><div class="adr">${ic('i-lkw')}${h((Q.lieferant((b || {}).lieferantId) || {}).name || '')} · ${b ? Fmt.relativ(Dom.terminVon(b)) : ''}</div></div>`; }).join('')}</div>` : ''}</div>`;
};

Fld.seiten.erwartet = (rest, ich) => {
  Fld.kopf('Erwartet', 'nach Liefertermin');
  const erw = Lager.erwartet();
  const grp2 = grp(erw, x => x.termin);
  return `<div class="fld-inner">${Object.keys(grp2).sort().map(d => `<div class="fcard"><div class="fcard-h"><h3>${Fmt.wochentag(d, true)}, ${Fmt.datum(d)}${d < D.heute() ? ' <span class="chip err" style="font-size:10.5px">überfällig</span>' : ''}</h3><span class="chip">${grp2[d].length}</span></div>${grp2[d].map(Lager.karte).join('')}</div>`).join('') || `<div class="empty"><span class="ic">${ic('i-haken-kreis')}</span><b>Nichts offen</b></div>`}</div>`;
};

Fld.seiten.auftraege = (rest, ich) => {
  Fld.kopf('Aufträge', 'Kommissionen im Lager');
  const list = DB.auftraege.filter(a => !['archiviert', 'storniert'].includes(a.status) && Q.lagerpositionenVon(a.id).length);
  return `<div class="fld-inner">${list.map(a => { const lps = Q.lagerpositionenVon(a.id); const da = lps.filter(x => x.status !== 'erwartet').length; const t = Q.termin(a.terminId); const offen = S.ui.lagerAuftrag === a.id; return `<div class="fcard"><button class="ftask ${a.status === 'terminiert' ? 'now' : ''}" data-act="lager.auftrag" data-id="${a.id}"><div class="top"><span class="tm">K-${h(a.nr.slice(-4))}</span><span class="chip st st-${a.status}" style="font-size:11px">${Dom.statusText(a.status)}</span></div><div class="bd"><b>${h(a.nr)} · ${h(Dom.kundeName(Q.kunde(a.kundeId)))}</b></div><div class="bar ${da === lps.length ? 'ok' : ''}"><i style="width:${Math.round(da / lps.length * 100)}%"></i></div><div class="adr">${ic('i-paket')}${da}/${lps.length} Positionen da${t ? ' · Montage ' + Fmt.datum(t.datum) + ' – bereit zur Auslieferung' : ''}</div></button>
    ${offen ? lps.map(x => `<div class="ftask" style="cursor:default;padding-left:20px"><div class="bd"><b style="font-weight:600">${x.menge > 1 ? x.menge + '× ' : ''}${h(x.name)}</b></div><div class="adr"><span class="chip st st-${x.status}" style="font-size:10.5px">${Dom.statusText(x.status)}</span>${x.lagerplatz ? ' <span class="mono">' + h(x.lagerplatz) + '</span>' : ''}${x.status === 'erwartet' ? ` <a class="btn sm ghost" href="#/l/scan/${encodeURIComponent(x.code)}">Buchen</a>` : ''}</div></div>`).join('') : ''}</div>`; }).join('')}</div>`;
};

Fld.seiten.mehr = (rest, ich) => {
  Fld.kopf('Mehr', ich.name);
  return `<div class="fld-inner">
    <div class="fcard pad stack"><div class="row" style="gap:10px"><span class="ava lg" style="background:${h(ich.farbe)}">${h(ich.kuerzel)}</span><div><b>${h(ich.name)}</b><br><small style="color:var(--txt-3)">${h(ich.funktion)} · ${h(DB.betrieb.name)}</small></div></div><div class="sync-slot">${Sync.anzeige()}</div><p style="font-size:12.5px;color:var(--txt-3)">${Sync.status === 'an' ? 'Jede Buchung erscheint am PC im Auftrag.' : 'Live-Verbindung am PC in den Einstellungen einschalten, dann sieht der Manager jeden Scan sofort.'}</p></div>
    <div class="fcard pad stack"><b>Demo</b><p style="font-size:13px;color:var(--txt-2)">Am grossen Bildschirm ohne Kamera: eine erwartete Position antippen und buchen. Die QR-Codes stehen am PC unter Lager und QR-Codes.</p><a class="btn wide" href="#/l/erwartet">${ic('i-lkw')} Erwartete Positionen</a></div>
    <div class="fcard pad stack"><div class="row" style="gap:8px"><span class="lbl">Farbschema</span><div class="seg">${[['auto', 'System'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([v, t]) => `<button data-act="menu.thema" data-v="${v}" ${(localStorage.getItem('badwerk.thema') || 'auto') === v ? 'aria-selected="true"' : ''}>${t}</button>`).join('')}</div></div><button class="btn danger soft wide" data-act="lager.abmelden">${ic('i-abmelden')} Abmelden</button></div>
  </div>`;
};

Fld.erklaerung = {
  scan: { titel: 'Wareneingang in drei Sekunden', text: 'Der Lagermitarbeiter scannt den QR-Code auf dem Bogen oder Etikett. Die App weiss, zu welchem Auftrag und welcher Bestellung die Position gehört, schlägt den Lagerplatz vor und bucht. Am PC steht die Position sofort auf «eingetroffen».', schritte: [['QR-Code scannen', 'oder Code eintippen'], ['In Ordnung oder beschädigt', 'Schaden mit Foto, Meldung geht automatisch an den Lieferanten'], ['Letzte Position', 'Auftrag ist montagebereit, Kunde erhält den Terminlink']] },
  erwartet: { titel: 'Was heute kommt', text: 'Alle offenen Bestellpositionen nach Liefertermin. Überfällige stehen rot – für die hat die Konsole bereits die Nachfrage beim Lieferanten ausgelöst.', schritte: [['Antippen', 'öffnet die Buchung wie ein Scan']] },
  auftraege: { titel: 'Kommissionen', text: 'Jeder Auftrag hat ein Kommissionsfach (K-Nummer). Der Balken zeigt, wie viel schon da ist. Bei terminierten Aufträgen holt der Monteur die Kommission ab.', schritte: [['Auftrag antippen', 'zeigt alle Positionen mit Lagerplatz']] },
  mehr: { titel: 'Einstellungen', text: 'Verbindung, Farbschema, Abmelden.', schritte: [] }
};

Act.lager = {
  async scan() {
    if (!BWCap.scanVerfuegbar()) { UI.toast('Kein Kamera-Scanner in diesem Browser – Code eintippen oder Handy-Kamera nutzen', 'warn'); const i = $('#lagerCode'); if (i) i.focus(); return; }
    await BWCap.scan({ formats: ['qr_code', 'code_128', 'ean_13'], onCode: code => { Nav.gehe('l/scan/' + encodeURIComponent(Lager.codeAus(code))); } });
  },
  code() { const v = ($('#lagerCode') || {}).value; if (!v) return; Nav.gehe('l/scan/' + encodeURIComponent(Lager.codeAus(v))); },
  oeffnen(el) { Nav.gehe('l/scan/' + encodeURIComponent(el.dataset.code)); },
  ok(el) { const lp = Q.lagerposition(el.dataset.id); Store.aendern('', db => Dom.wareneingang(db, db.lagerpositionen.find(x => x.id === lp.id), { benutzerId: S.benutzerId }), false); if (navigator.vibrate) navigator.vibrate(60); S.ui.gebucht = { lpId: lp.id }; S.ui.schaden = null; Nav.gehe('l/scan'); if (location.hash === '#/l/scan') Nav.zeichnen(); },
  schadenAuf() { S.ui.schaden = { offen: true }; Nav.zeichnen(); },
  schadenAb() { S.ui.schaden = null; Nav.zeichnen(); },
  async foto() { const f = await BWCap.photo({ compressTo: 900 }); if (!f) return; S.ui.schaden = Object.assign(S.ui.schaden || { offen: true }, { foto: f.dataUrl, notiz: ($('#schadenNotiz') || {}).value || '' }); Nav.zeichnen(); },
  schaden(el) { const lp = Q.lagerposition(el.dataset.id); const notiz = ($('#schadenNotiz') || {}).value || ''; const foto = (S.ui.schaden || {}).foto || null; Store.aendern('', db => Dom.wareneingang(db, db.lagerpositionen.find(x => x.id === lp.id), { benutzerId: S.benutzerId, zustand: 'beschaedigt', notiz, foto }), false); S.ui.gebucht = { lpId: lp.id }; S.ui.schaden = null; Nav.gehe('l/scan'); if (location.hash === '#/l/scan') Nav.zeichnen(); },
  auftrag(el) { S.ui.lagerAuftrag = S.ui.lagerAuftrag === el.dataset.id ? null : el.dataset.id; Nav.zeichnen(); },
  abmelden() { S.abmelden(); }
};
