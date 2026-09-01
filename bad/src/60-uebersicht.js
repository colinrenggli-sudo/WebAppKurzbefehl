/* ==================================================================
   60 · Konsole: Übersicht
   Drei Fragen: Was zaehlt heute? Wo steht jeder Auftrag? Wie laeuft
   das Geschaeft? Dazu die Demo-Uhr, die auf jeder Seite oben rechts
   sitzt und die Automationen sichtbar ausloest.
   ================================================================== */
const Uebersicht = {
  uhrWidget() {
    const off = Uhr.offsetTage();
    return `<div class="uhr ${off ? 'aktiv' : ''}" title="Demo-Uhr: Zeitsprung löst Lieferfrist-Mahnungen, Erinnerungen und Zahlungsfristen aus">
      ${ic('i-zurueck-uhr')}<span>${off ? 'Demo-Uhr: ' + Fmt.datum(D.heute()) + ' (+' + off + ')' : 'Heute ' + Fmt.datum(D.heute())}</span>
      <button class="btn sm ghost" data-act="uhr.springen" data-n="1" title="+1 Tag">+1</button>
      <button class="btn sm ghost" data-act="uhr.springen" data-n="7" title="+7 Tage">+7</button>
      <button class="btn sm ghost" data-act="uhr.springen" data-n="30" title="+30 Tage">+30</button>
      ${off ? `<button class="btn sm ghost" data-act="uhr.springen" data-n="0" title="Zurück auf heute">${ic('i-x')}</button>` : ''}
    </div>`;
  },

  kpi(lbl, val, dt, r, hot) {
    return `<button class="kpi ${hot ? 'hot' : ''}" data-act="nav.gehe" data-r="${r}"><span class="lbl">${lbl}</span><span class="val">${val}</span>${dt ? `<span class="dt">${dt}</span>` : ''}</button>`;
  }
};

Desk.seiten.uebersicht = () => {
  const k = Dom.kpis(DB);
  const aufgaben = Dom.aufgaben(DB);
  const ich = Q.ich();
  const stunde = Uhr.jetzt().getHours();
  const gruss = stunde < 11 ? 'Guten Morgen' : stunde < 17 ? 'Guten Tag' : 'Guten Abend';
  const spalten = ['bestellt', 'teilgeliefert', 'bereit', 'terminiert', 'abgeschlossen', 'verrechnet'];
  const auftr = DB.auftraege.filter(a => spalten.includes(a.status));
  const heute = D.heute();
  const showroomHeute = DB.showroomTermine.filter(t => t.datum === heute && t.status !== 'abgesagt').sort((a, b) => a.von.localeCompare(b.von));
  return `<div class="pg">
    <div class="row" style="align-items:flex-end;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:240px"><h2 style="font-size:22px;font-weight:760;letter-spacing:-.02em">${gruss}, ${h(ich.name.split(' ')[0])}</h2>
      <p style="color:var(--txt-2);font-size:14px">${aufgaben.length ? aufgaben.length + ' Dinge brauchen heute Aufmerksamkeit.' : 'Nichts Dringendes – alles läuft.'} ${k.bereit ? k.bereit + (k.bereit === 1 ? ' Auftrag wartet' : ' Aufträge warten') + ' auf den Kundentermin.' : ''}</p></div>
      <button class="btn primary lg" data-act="nav.gehe" data-r="offerte">${ic('i-tablet')} Neue Offerte am Tablet</button>
    </div>

    <div class="kpis">
      ${Uebersicht.kpi('Offene Offerten', k.offeneOfferten, Fmt.chfKurz(k.offeneOfferteWert) + ' · Abschlussquote ' + k.conversion + ' %', 'offerten')}
      ${Uebersicht.kpi('Aufträge in Arbeit', k.aktiveAuftraege, (k.bereit ? k.bereit + ' montagebereit' : 'alle in Beschaffung oder Montage'), 'auftraege')}
      ${Uebersicht.kpi('Umsatz 30 Tage', Fmt.chfKurz(k.umsatzMonat), 'Ø ' + Fmt.chfKurz(k.avgAuftrag) + ' je Auftrag · Marge ' + k.marge + ' %', 'auftraege')}
      ${Uebersicht.kpi('Upsell-Anteil', k.upsell + ' %', 'Optionen und Zusatzleistungen am Auftragswert', 'artikel')}
      ${Uebersicht.kpi('Lieferungen überfällig', k.ueberfaellig, k.ueberfaellig ? 'Mahnstufen laufen automatisch' : 'alle Lieferanten im Plan', 'bestellungen', k.ueberfaellig > 0)}
      ${Uebersicht.kpi('Offene Forderungen', Fmt.chfKurz(k.forderungen), k.forderungenAnzahl + (k.forderungenAnzahl === 1 ? ' Rechnung' : ' Rechnungen') + ' offen', 'rechnungen', k.forderungen > 0)}
    </div>

    <div class="split" style="grid-template-columns:minmax(0,1.2fr) minmax(0,1fr)">
      <div class="card">
        <div class="card-h"><h3>Was heute zählt</h3><span class="chip ${aufgaben.some(a => a.art === 'err') ? 'err' : 'ok'}">${aufgaben.length} offen</span></div>
        <div class="card-b"><div class="todo">${aufgaben.length ? aufgaben.map(t => `
          <button class="todo-i ${t.art}" data-act="nav.gehe" data-r="${h(t.r)}"><span class="ic">${ic(t.ic)}</span><span class="bd"><b>${h(t.titel)}</b><small>${h(t.text)}</small></span>${ic('i-weiter')}</button>`).join('')
          : `<div class="empty"><span class="ic">${ic('i-haken-kreis')}</span><b>Alles erledigt</b><p>Keine offenen Aufgaben.</p></div>`}</div></div>
      </div>
      <div class="stack">
        <div class="card">
          <div class="card-h"><h3>Showroom heute</h3><a class="more" href="#/showroom">Alle Termine</a></div>
          <div class="card-b">${showroomHeute.length ? `<div class="todo">${showroomHeute.map(t => { const p = Q.partner(t.partnerId); return `<div class="todo-i ${t.status === 'angefragt' ? 'warn' : 'info'}"><span class="ic">${ic('i-showroom')}</span><span class="bd"><b>${h(t.von)} – ${h(t.bis)} · ${h(t.kundeName || 'Kunde')}</b><small>${h(t.thema || 'Beratung')}${p ? ' · mit ' + h(p.name) : ''}${t.hospitality ? ' · Kaffee und Gipfeli' : ''}</small></span>${t.kundeId ? `<button class="btn sm primary" data-act="offerte.start" data-kunde="${h(t.kundeId)}">Offerte</button>` : ''}</div>`; }).join('')}</div>` : `<p style="color:var(--txt-3);font-size:13.5px">Heute keine Showroom-Termine.</p>`}</div>
        </div>
        <div class="card">
          <div class="card-h"><h3>Zuletzt passiert</h3><span class="chip">${Sync.status === 'an' ? 'live' : 'dieses Gerät'}</span></div>
          <div class="card-b"><div class="tl">${DB.ereignisse.slice(0, 8).map(e => `<div class="tl-i"><span class="dot">${h(e.icon)}</span><div class="bd">${h(e.text)}<small>${Fmt.seit(e.zeit)}${e.benutzerId ? ' · ' + h((Q.benutzer(e.benutzerId) || {}).name || '') : ''}${e.auftragId ? ' · <a href="#/auftrag/' + h(e.auftragId) + '">' + h((Q.auftrag(e.auftragId) || {}).nr || '') + '</a>' : ''}</small></div></div>`).join('')}</div></div>
        </div>
      </div>
    </div>

    <div class="sec-h"><h3>Pipeline – wo jeder Auftrag steht</h3><a class="more" href="#/auftraege">Alle Aufträge</a></div>
    <div class="pipe">${spalten.map(s => { const list = auftr.filter(a => a.status === s); return `<div class="pipe-col st-${s}"><div class="h"><span class="dot"></span>${Dom.statusText(s)}<span class="cnt">${list.length}</span></div>${list.map(a => {
      const k2 = Q.kunde(a.kundeId); const bs = Q.bestellungenVon(a.id); const ueb = bs.filter(b => !['geliefert', 'storniert'].includes(b.status) && Dom.terminVon(b) < heute);
      const lps = Q.lagerpositionenVon(a.id); const da = lps.filter(x => x.status !== 'erwartet').length;
      const t = Q.termin(a.terminId);
      return `<button class="pipe-card" data-act="nav.gehe" data-r="auftrag/${h(a.id)}"><b>${h(a.nr)} · ${h(k2 ? k2.name : '')}</b><small>${h(Dom.objektText(Q.objekt(a.objektId)).split(' · ').slice(0, 2).join(' · '))}</small>
        <span class="amt">${Fmt.chf(a.total)}</span>
        ${ueb.length ? `<small class="err">${ueb.length} Lieferung${ueb.length > 1 ? 'en' : ''} überfällig</small>` : s === 'bestellt' || s === 'teilgeliefert' ? `<small>${da}/${lps.length} Positionen da · Montage frühestens ${Fmt.datumKurz(a.fruehesterMontage)}</small>` : ''}
        ${t && s === 'terminiert' ? `<small>Montage ${Fmt.datum(t.datum)} · ${t.status === 'bestaetigt' ? 'bestätigt' : '<span class="warn">Partner offen</span>'}</small>` : ''}
        ${s === 'bereit' ? `<small class="warn">wartet auf Kundentermin</small>` : ''}
        ${s === 'verrechnet' ? (() => { const r = Q.rechnung(a.rechnungId); return r ? `<small class="${r.faellig < heute ? 'err' : ''}">${Fmt.chf(r.betrag)} ${r.faellig < heute ? 'überfällig' : 'fällig ' + Fmt.datumKurz(r.faellig)}</small>` : ''; })() : ''}
      </button>`; }).join('')}</div>`; }).join('')}</div>
  </div>`;
};
Desk.titel.uebersicht = 'Übersicht';

Act.uhr = {
  springen(el) { const n = +el.dataset.n; Uhr.springen(n === 0 ? 0 : n); }
};
Act.offerte = Act.offerte || {};
