/* ==================================================================
   61 · Konsole: Auftraege — Liste und Detailakte
   Die Akte ist die einzige Wahrheit je Auftrag: Positionen, Bestellungen
   mit AB und Mahnstufen, Lagerpositionen mit Scan, Termin, Dokumente,
   Verlauf und alle Mails. Jede Aktion der Lieferanten, des Lagers und
   der Partner laesst sich hier auch von Hand ausloesen (Telefon).
   ================================================================== */
const Auftraege = {
  chip(status) { return `<span class="chip st dot st-${h(status)}">${h(Dom.statusText(status))}</span>`; },
  lieferStand(a) { const lps = Q.lagerpositionenVon(a.id); const da = lps.filter(x => x.status === 'eingetroffen' || x.status === 'ausgeliefert').length; return { da, alle: lps.length, schaden: lps.filter(x => x.status === 'beschaedigt').length }; },
  naechster(a) {
    const heute = D.heute();
    if (a.status === 'bestellt' || a.status === 'teilgeliefert') { const bs = Q.bestellungenVon(a.id).filter(b => !['geliefert', 'storniert'].includes(b.status)); const ueb = bs.filter(b => Dom.terminVon(b) < heute); if (ueb.length) return { t: ueb.length + ' Lieferung' + (ueb.length > 1 ? 'en' : '') + ' überfällig', art: 'err' }; const ohneAb = bs.filter(b => b.status === 'gesendet'); if (ohneAb.length) return { t: 'AB fehlt: ' + ohneAb.map(b => (Q.lieferant(b.lieferantId) || {}).kuerzel).join(', '), art: 'warn' }; const n = bs.map(b => Dom.terminVon(b)).sort()[0]; return { t: 'Nächste Lieferung ' + Fmt.relativ(n), art: '' }; }
    if (a.status === 'bereit') return { t: 'Kunde wählt Termin', art: 'warn' };
    if (a.status === 'terminiert') { const t = Q.termin(a.terminId); return t ? { t: 'Montage ' + Fmt.relativ(t.datum) + (t.status === 'bestaetigt' ? '' : ' · Partner offen'), art: t.status === 'bestaetigt' ? '' : 'warn' } : { t: '', art: '' }; }
    if (a.status === 'abgeschlossen') return { t: 'Rechnung erstellen', art: 'warn' };
    if (a.status === 'verrechnet') { const r = Q.rechnung(a.rechnungId); return r ? { t: (r.faellig < heute ? 'Überfällig seit ' : 'Fällig ') + Fmt.datum(r.faellig), art: r.faellig < heute ? 'err' : '' } : { t: '', art: '' }; }
    return { t: '', art: '' };
  }
};

Desk.seiten.auftraege = () => {
  const f = S.ui.af || (S.ui.af = { status: 'aktiv', suche: '' });
  const alle = DB.auftraege;
  const liste = alle.filter(a => f.status === 'alle' ? true : f.status === 'aktiv' ? !['archiviert', 'storniert'].includes(a.status) : a.status === f.status)
    .filter(a => !f.suche || esc(a.nr + ' ' + Dom.kundeName(Q.kunde(a.kundeId)) + ' ' + (Q.objekt(a.objektId) || {}).ort).includes(esc(f.suche)));
  const chips = [['aktiv', 'In Arbeit'], ['bestellt', 'Bestellt'], ['teilgeliefert', 'Teilweise geliefert'], ['bereit', 'Montagebereit'], ['terminiert', 'Termin'], ['verrechnet', 'Verrechnet'], ['archiviert', 'Archiv'], ['alle', 'Alle']];
  Desk.tools(`<button class="btn primary" data-act="nav.gehe" data-r="offerte">${ic('i-tablet')} Neue Offerte</button>`);
  return `<div class="pg">
    <div class="tbl-wrap"><div class="tbl-tools"><div class="seg">${chips.map(c => `<button data-act="auftrag.filter" data-v="${c[0]}" aria-selected="${f.status === c[0]}">${c[1]}${c[0] !== 'alle' && c[0] !== 'aktiv' ? ' (' + alle.filter(a => a.status === c[0]).length + ')' : ''}</button>`).join('')}</div><div class="tb-sp"></div><div class="search">${ic('i-suche')}<input class="inp" placeholder="Auftrag, Kunde, Ort" value="${h(f.suche)}" data-input="auftrag.suche"></div></div>
    <div class="tbl-scroll"><table class="tbl"><thead><tr><th>Auftrag</th><th>Kunde und Objekt</th><th>Status</th><th class="r">Total</th><th>Lieferung</th><th>Montage</th><th>Nächster Schritt</th></tr></thead><tbody>
    ${liste.length ? liste.map(a => { const k = Q.kunde(a.kundeId); const ob = Q.objekt(a.objektId); const ls = Auftraege.lieferStand(a); const t = Q.termin(a.terminId); const p = Q.partner(a.partnerId); const nx = Auftraege.naechster(a); return `<tr class="click" data-act="nav.gehe" data-r="auftrag/${a.id}"><td><b>${h(a.nr)}</b><br><small style="color:var(--txt-3)">${Fmt.datum(a.erstellt.slice(0, 10))}</small></td><td><b>${h(Dom.kundeName(k))}</b><br><small style="color:var(--txt-3)">${h(ob ? ob.ort + ' · ' + Dom.objektText(ob).split(' · ').slice(0, 2).join(' · ') : '')}</small></td><td>${Auftraege.chip(a.status)}</td><td class="r num">${Fmt.chf(a.total, false)}</td><td>${ls.alle ? `<div class="bar ${ls.da === ls.alle ? 'ok' : ''}" style="width:90px"><i style="width:${Math.round(ls.da / ls.alle * 100)}%"></i></div><small>${ls.da}/${ls.alle} Pos.${ls.schaden ? ' · <span style="color:var(--err-txt)">' + ls.schaden + ' Schaden</span>' : ''}</small>` : '–'}</td><td>${t ? Fmt.datum(t.datum) + '<br><small style="color:var(--txt-3)">' + h(p ? p.name : '') + '</small>' : a.status === 'bereit' ? '<small>offen · frühestens ' + Fmt.datumKurz(a.fruehesterMontage) + '</small>' : ['bestellt', 'teilgeliefert'].includes(a.status) ? '<small style="color:var(--txt-3)">frühestens ' + Fmt.datum(a.fruehesterMontage) + '</small>' : '–'}</td><td><span class="${nx.art === 'err' ? 'chip err' : nx.art === 'warn' ? 'chip warn' : ''}">${h(nx.t)}</span></td></tr>`; }).join('')
      : `<tr><td colspan="7"><div class="empty"><b>Keine Aufträge</b><p>In dieser Ansicht gibt es nichts.</p></div></td></tr>`}
    </tbody></table></div></div></div>`;
};
Desk.titel.auftraege = 'Aufträge';

Desk.seiten.auftrag = rest => {
  const a = Q.auftrag(rest[0]); if (!a) return `<div class="pg"><div class="empty"><b>Auftrag nicht gefunden</b></div></div>`;
  const tab = rest[1] || 'uebersicht';
  const k = Q.kunde(a.kundeId); const ob = Q.objekt(a.objektId); const o = Q.offerte(a.offerteId); const p = Q.partner(a.partnerId); const s = o ? Dom.summe(o) : null;
  const ls = Auftraege.lieferStand(a); const t = Q.termin(a.terminId); const heute = D.heute();
  Desk.titelSetzen('Auftrag ' + a.nr, Dom.kundeName(k));
  Desk.tools(`<a class="btn ghost" href="${h(Mail.link('k', a.token))}" target="_blank" rel="noopener">${ic('i-link')} Kundenportal</a>${!['archiviert', 'storniert'].includes(a.status) ? `<button class="btn ghost" data-act="auftrag.stornieren" data-id="${a.id}">Stornieren</button>` : ''}`);
  const tabs = [['uebersicht', 'Übersicht'], ['lieferung', 'Lieferanten', Q.bestellungenVon(a.id).length], ['lager', 'Lager und QR', ls.da + '/' + ls.alle], ['termin', 'Termin und Montage'], ['dokumente', 'Dokumente'], ['post', 'Mails', Q.postVon(a.id).length], ['verlauf', 'Verlauf', (a.verlauf || []).length]];
  return `<div class="pg">
    <div class="card pad"><div class="row wrap" style="gap:18px;align-items:flex-start">
      <div style="flex:1;min-width:260px"><div class="row" style="gap:8px;margin-bottom:6px"><h2 style="font-size:20px;font-weight:760">${h(a.nr)}</h2>${Auftraege.chip(a.status)}${a.freigabeVerwaltung === 'ausstehend' ? '<span class="chip warn dot">Freigabe Verwaltung offen</span>' : ''}</div>
        <div class="dl"><dt>Kunde</dt><dd><b>${h(Dom.kundeName(k))}</b> · ${h(k ? k.telefon : '')} · ${h(k ? k.email : '')}</dd><dt>Objekt</dt><dd>${h(ob ? ob.strasse + ', ' + ob.plz + ' ' + ob.ort : '')}<br>${h(Dom.objektText(ob))}${ob && ob.zugang ? '<br>Zugang: ' + h(ob.zugang) : ''}</dd><dt>Montage</dt><dd>${p ? h(p.name) + ' · ' + h(p.kontakt) + ' · ' + h(p.telefon) : '<span style="color:var(--txt-3)">Partnerbetrieb noch offen</span>'}</dd></div></div>
      <div style="min-width:220px"><div class="dl"><dt>Total</dt><dd class="num"><b>${Fmt.chf(a.total)}</b></dd><dt>Anzahlung</dt><dd class="num">${a.anzahlung ? Fmt.chf(a.anzahlung.betrag) + ' · ' + Dom.methodeText(a.anzahlung.methode) + ' · ' + Fmt.datum(a.anzahlung.zeit.slice(0, 10)) : '–'}</dd><dt>Rest</dt><dd class="num">${Fmt.chf(a.total - (a.anzahlung ? a.anzahlung.betrag : 0))}${a.rechnungId ? ' · ' + Dom.statusText((Q.rechnung(a.rechnungId) || {}).status) : ' · nach Montage'}</dd>${s ? `<dt>Marge</dt><dd class="num" style="color:var(--ok-txt)">${Fmt.chf(s.marge)} · ${s.margeProzent} %</dd>` : ''}<dt>Erstellt</dt><dd>${Fmt.datum(a.erstellt.slice(0, 10))} · ${h((Q.benutzer(a.beraterId) || {}).name || '')}</dd></div></div>
    </div>
    <div class="flow" style="margin-top:14px">${Dom.auftragFluss(a).map(f => `<div class="f ${f.done ? 'done' : f.now ? 'now' : ''}">${h(f.text)}${f.status === 'terminiert' && t ? '<small>' + Fmt.datumKurz(t.datum) + '</small>' : f.status === 'bereit' && a.montagebereitAm ? '<small>' + Fmt.datumKurz(a.montagebereitAm.slice(0, 10)) + '</small>' : f.status === 'bestellt' ? '<small>' + Fmt.datumKurz(a.erstellt.slice(0, 10)) + '</small>' : f.status === 'teilgeliefert' && ls.alle ? '<small>' + ls.da + '/' + ls.alle + '</small>' : ''}</div>`).join('')}</div></div>
    <div class="tabs">${tabs.map(x => `<button aria-selected="${tab === x[0]}" data-act="nav.gehe" data-r="auftrag/${a.id}/${x[0]}">${x[1]}${x[2] != null ? `<span class="cnt">${x[2]}</span>` : ''}</button>`).join('')}</div>
    ${tab === 'uebersicht' ? Auftraege.tabUebersicht(a, o, s) : tab === 'lieferung' ? Auftraege.tabLieferung(a) : tab === 'lager' ? Auftraege.tabLager(a) : tab === 'termin' ? Auftraege.tabTermin(a, t, p) : tab === 'dokumente' ? Auftraege.tabDokumente(a) : tab === 'post' ? Auftraege.tabPost(a) : Auftraege.tabVerlauf(a)}
  </div>`;
};

Object.assign(Auftraege, {
  tabUebersicht(a, o, s) {
    const heute = D.heute();
    const aufgaben = Dom.aufgaben(DB).filter(x => x.r.includes(a.id));
    const produkte = a.positionen.filter(p => p.art === 'produkt'); const extras = a.positionen.filter(p => ['leistung', 'paket'].includes(p.art));
    const lpVon = pos => Q.lagerposition(pos.lagerpositionId);
    const st = pos => { const lp = lpVon(pos); return lp ? `<span class="chip st st-${lp.status}" style="font-size:11px">${Dom.statusText(lp.status)}</span>` : ''; };
    const zeile = (p, sub) => `<tr class="${sub ? 'sub' : ''}"><td style="${sub ? 'padding-left:28px;color:var(--txt-2)' : ''}">${p.menge > 1 ? p.menge + ' ' + h(p.einheit) + ' ' : ''}${h(p.name)}${sub && p.art === 'material' ? ' <small style="color:var(--txt-3)">immer benötigt</small>' : ''}${p.stornierbar === false ? ' <small style="color:var(--warn-txt)">nicht stornierbar</small>' : ''}</td><td><small>${h((Q.lieferant(p.lieferantId) || {}).kuerzel || '')}</small></td><td>${st(p)}</td><td class="r num">${Fmt.chf(p.menge * p.vk, false)}</td></tr>`;
    return `<div class="split">
      <div class="stack">
        ${aufgaben.length ? `<div class="card"><div class="card-h"><h3>Offen bei diesem Auftrag</h3></div><div class="card-b"><div class="todo">${aufgaben.map(x => `<button class="todo-i ${x.art}" data-act="nav.gehe" data-r="${h(x.r)}"><span class="ic">${ic(x.ic)}</span><span class="bd"><b>${h(x.titel)}</b><small>${h(x.text)}</small></span></button>`).join('')}</div></div></div>` : ''}
        <div class="tbl-wrap"><div class="tbl-tools"><h3 style="font-size:14px;font-weight:700">Positionen</h3><div class="tb-sp"></div>${s ? `<span class="chip">Upsell ${Fmt.chf(s.upsell, false)}</span>` : ''}</div><div class="tbl-scroll"><table class="tbl"><thead><tr><th>Position</th><th>Lief.</th><th>Lager</th><th class="r">CHF</th></tr></thead><tbody>
          ${produkte.map(p => zeile(p) + a.positionen.filter(x => x.elternId === p.id).map(x => zeile(x, true)).join('')).join('')}
          ${extras.length ? `<tr class="grp"><td colspan="4"><b>Zusatzleistungen</b></td></tr>` + extras.map(p => zeile(p)).join('') : ''}
          ${s ? `<tr class="tot"><td colspan="3" class="r">Netto</td><td class="r num">${Fmt.chf(s.netto, false)}</td></tr><tr class="tot"><td colspan="3" class="r">MWST ${Fmt.prozent(Dom.MWST)}</td><td class="r num">${Fmt.chf(s.mwst, false)}</td></tr><tr class="tot"><td colspan="3" class="r"><b>Total</b></td><td class="r num"><b>${Fmt.chf(s.total, false)}</b></td></tr>` : ''}
        </tbody></table></div></div>
        ${a.montage && a.montage.length ? `<div class="card pad"><b>Montage durch Partnerbetrieb (Block B, separate Rechnung)</b><div class="po-lines" style="margin-top:6px">${a.montage.map(m => `<div class="po-line"><span>${h(m.name)}<small>${m.tage} ${m.tage === 1 ? 'Tag' : 'Tage'}</small></span><span class="amt">${Fmt.chf(m.vk, false)}</span></div>`).join('')}</div></div>` : ''}
      </div>
      <div class="stack">
        <div class="card"><div class="card-h"><h3>Lieferung</h3><a class="more" href="#/auftrag/${a.id}/lieferung">Details</a></div><div class="card-b">${Q.bestellungenVon(a.id).map(b => { const l = Q.lieferant(b.lieferantId) || {}; const term = Dom.terminVon(b); const spaet = !['geliefert', 'storniert'].includes(b.status) && term < heute; return `<div class="po-line"><span><b>${h(l.name)}</b><small>${h(b.nr)} · ${b.positionen.length} Pos. · ${b.status === 'geliefert' ? 'geliefert ' + Fmt.datum(b.geliefertAm.slice(0, 10)) : (b.abTermin ? 'AB: ' : 'Soll: ') + Fmt.datum(term) + (b.mahnstufe ? ' · Mahnstufe ' + b.mahnstufe : '')}</small></span><span class="chip st st-${spaet ? 'eskaliert' : b.status}">${spaet ? 'überfällig' : Dom.statusText(b.status)}</span></div>`; }).join('')}
          <p style="font-size:12.5px;color:var(--txt-2);margin-top:8px">${a.kritischerPfad ? 'Kritischer Pfad: ' + h(a.kritischerPfad.name) + ' · ' : ''}Montage frühestens ${Fmt.datum(a.fruehesterMontage)}</p></div></div>
        <div class="card"><div class="card-h"><h3>Termin</h3><a class="more" href="#/auftrag/${a.id}/termin">Details</a></div><div class="card-b">${(() => { const t = Q.termin(a.terminId); const p = Q.partner(a.partnerId); if (t) return `<b>${Fmt.wochentag(t.datum, true)}, ${Fmt.datum(t.datum)} ab ${h(t.von)}</b><br><small>${h(p ? p.name : '')} · ${t.status === 'bestaetigt' ? 'vom Partner bestätigt' + (t.monteur ? ' · ' + h(t.monteur) : '') : t.status === 'erledigt' ? 'erledigt' : '<span style="color:var(--warn-txt)">Bestätigung des Partners ausstehend</span>'}</small>`; if (a.status === 'bereit') return `<span style="color:var(--warn-txt);font-weight:600">Kunde zur Terminwahl eingeladen ${Fmt.relativ((a.montagebereitAm || '').slice(0, 10))}</span><br><small>Anruf? <a href="#/auftrag/${a.id}/termin">Termin eintragen</a></small>`; return `<small style="color:var(--txt-3)">Wird freigegeben, sobald alle Positionen eingetroffen sind.</small>`; })()}</div></div>
        ${a.abnahme ? `<div class="card"><div class="card-h"><h3>Abnahme</h3></div><div class="card-b"><b>${Fmt.datum(a.abnahme.zeit.slice(0, 10))}</b> · unterschrieben von ${h(a.abnahme.name)}${a.abnahme.monteur ? ' · Monteur ' + h(a.abnahme.monteur) : ''}${a.abnahme.notiz ? '<br><small>' + h(a.abnahme.notiz) + '</small>' : ''}${a.abnahme.dataUrl ? `<img src="${a.abnahme.dataUrl}" alt="Unterschrift" style="height:48px;margin-top:6px">` : ''}</div></div>` : ''}
        <div class="card"><div class="card-h"><h3>Notizen</h3></div><div class="card-b"><textarea class="inp" rows="3" placeholder="Interne Notiz zum Auftrag" data-change="auftrag.notiz" data-id="${a.id}">${h(a.notizen || '')}</textarea></div></div>
      </div></div>`;
  },

  tabLieferung(a) {
    const heute = D.heute();
    return `<div class="stack">${Q.bestellungenVon(a.id).map(b => {
      const l = Q.lieferant(b.lieferantId) || {}; const term = Dom.terminVon(b); const spaet = !['geliefert', 'storniert'].includes(b.status) && term < heute; const kpi = Dom.lieferantKpi(DB, b.lieferantId);
      return `<div class="card"><div class="card-h"><h3>${h(l.name)} <small style="font-weight:500;color:var(--txt-3)">${h(b.nr)}</small></h3><div class="row"><span class="chip">Termintreue ${kpi.otif != null ? kpi.otif + ' %' : '–'}</span><span class="chip st st-${spaet ? 'eskaliert' : b.status}">${spaet ? 'überfällig ' + b.verzugTage + ' WT' : Dom.statusText(b.status)}</span></div></div>
        <div class="card-b"><div class="split" style="grid-template-columns:1fr 1fr">
          <div class="dl"><dt>Gesendet</dt><dd>${Fmt.datum(b.gesendet.slice(0, 10))} ${b.gesendet.slice(11, 16)} · an ${h(l.email || '')}</dd><dt>Soll-Termin</dt><dd>${Fmt.datum(b.planTermin)} <small>(Standardfrist)</small></dd><dt>Auftragsbestätigung</dt><dd>${b.abEingang ? Fmt.datum(b.abEingang.slice(0, 10)) + ' · Liefertermin <b>' + Fmt.datum(b.abTermin) + '</b>' + (b.bemerkung ? '<br><small>' + h(b.bemerkung) + '</small>' : '') : '<span style="color:var(--warn-txt);font-weight:600">ausstehend' + (b.abErinnertAm ? ' · erinnert ' + Fmt.datum(b.abErinnertAm) : '') + '</span>'}</dd><dt>Lieferavis</dt><dd>${b.avis ? 'Sendung ' + h(b.avis.sendung || '–') + ' · Ankunft ' + Fmt.datum(b.avis.datum) : '–'}</dd><dt>Mahnstufe</dt><dd>${b.mahnstufe ? ['', 'Statusanfrage', 'Liefermahnung', 'Eskalation'][b.mahnstufe] + ' (' + b.mahnungen.map(m => Fmt.datum(m.zeit.slice(0, 10))).join(', ') + ')' : 'keine'}${b.pausiertBis && b.pausiertBis > heute ? ' · pausiert bis ' + Fmt.datum(b.pausiertBis) : ''}</dd></div>
          <div><table class="tbl"><thead><tr><th>Position</th><th class="r">Bestellt</th><th class="r">Offen</th></tr></thead><tbody>${b.positionen.map(p => { const lp = Q.lagerposition(p.lagerpositionId); return `<tr><td>${h(p.name)}${lp && lp.status === 'beschaedigt' ? ' <span class="chip err" style="font-size:10.5px">Schaden</span>' : ''}</td><td class="r">${p.menge}</td><td class="r">${p.offen}</td></tr>`; }).join('')}</tbody></table></div>
        </div>
        ${!['geliefert', 'storniert'].includes(b.status) ? `<div class="row wrap" style="margin-top:12px;gap:8px"><button class="btn" data-act="auftrag.ab" data-id="${b.id}">${ic('i-check')} AB erfassen (Telefon/Mail)</button><button class="btn" data-act="auftrag.avis" data-id="${b.id}">${ic('i-lkw')} Lieferavis erfassen</button><button class="btn" data-act="auftrag.verzug" data-id="${b.id}">${ic('i-sanduhr')} Neuer Termin gemeldet</button><button class="btn ghost" data-act="auftrag.pausieren" data-id="${b.id}">Mahnstufen 5 Tage pausieren</button><a class="btn ghost" href="${h(Mail.link('l', b.token))}" target="_blank" rel="noopener">${ic('i-link')} Lieferantenportal</a></div>` : ''}
        </div></div>`; }).join('')}</div>`;
  },

  tabLager(a) {
    const lps = Q.lagerpositionenVon(a.id);
    return `<div class="stack">
      <div class="row wrap" style="gap:8px"><button class="btn primary" data-act="doc.qrbogen" data-id="${a.id}">${ic('i-qr')} QR-Bogen anzeigen und drucken</button><span style="font-size:13px;color:var(--txt-2)">Ein QR-Code je Bestellposition. Das Lager scannt mit dem Handy (Code 98765); der Stand erscheint hier live.</span></div>
      <div class="tbl-wrap"><div class="tbl-scroll"><table class="tbl"><thead><tr><th>Code</th><th>Position</th><th>Lieferant</th><th>Status</th><th>Lagerplatz</th><th>Gescannt</th><th></th></tr></thead><tbody>${lps.map(lp => { const b = Q.bestellung(lp.bestellungId); const l = b && Q.lieferant(b.lieferantId); return `<tr><td class="mono">${h(lp.code)}</td><td>${lp.menge > 1 ? lp.menge + '× ' : ''}${h(lp.name)}${lp.notiz ? '<br><small style="color:var(--err-txt)">' + h(lp.notiz) + '</small>' : ''}</td><td><small>${h(l ? l.name : '')}</small></td><td><span class="chip st dot st-${lp.status}">${Dom.statusText(lp.status)}</span></td><td class="mono">${h(lp.lagerplatz || '–')}</td><td><small>${lp.gescanntAm ? Fmt.datum(lp.gescanntAm.slice(0, 10)) + ' ' + lp.gescanntAm.slice(11, 16) + ' · ' + h((Q.benutzer(lp.gescanntVon) || {}).name || '') : '–'}</small></td><td class="r">${lp.status === 'erwartet' ? `<button class="btn sm ghost" data-act="auftrag.scanSim" data-id="${lp.id}" title="Wareneingang ohne Handy buchen">Eingang buchen</button>` : lp.status === 'beschaedigt' ? `<button class="btn sm ghost" data-act="auftrag.ersatz" data-id="${lp.id}">Ersatz eingetroffen</button>` : ''}</td></tr>`; }).join('')}</tbody></table></div></div></div>`;
  },

  tabTermin(a, t, p) {
    const k = Q.kunde(a.kundeId); const ob = Q.objekt(a.objektId);
    if (t) {
      const ev = { titel: 'Montage ' + a.nr + ' · ' + Dom.kundeName(k), text: 'Auftrag ' + a.nr + ' · ' + (p ? p.name : '') + ' · ' + Dom.objektText(ob), ort: ob ? ob.strasse + ', ' + ob.plz + ' ' + ob.ort : '', datum: t.datum, von: t.von, bis: t.bis, uid: t.id };
      return `<div class="split"><div class="card pad stack">
        <div><div class="eyebrow" style="font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--tint-txt)">Montagetermin</div><h2 style="font-size:22px;font-weight:760">${Fmt.wochentag(t.datum, true)}, ${Fmt.datum(t.datum)}</h2><p style="color:var(--txt-2)">${h(t.von)} – ${h(t.bis)} Uhr · Dauer ca. ${t.dauerTage} ${t.dauerTage === 1 ? 'Tag' : 'Tage'} · ${t.quelle === 'kunde-online' ? 'online durch den Kunden gewählt' : t.quelle === 'partner' ? 'durch den Partner gesetzt' : 'nach Anruf eingetragen'}</p></div>
        <div class="dl"><dt>Partnerbetrieb</dt><dd>${p ? h(p.name) + ' · ' + h(p.kontakt) + ' · ' + h(p.telefon) : '–'}</dd><dt>Bestätigung</dt><dd>${t.status === 'bestaetigt' ? '<span class="chip ok dot">bestätigt ' + Fmt.datum((t.bestaetigtVonPartner || '').slice(0, 10)) + (t.monteur ? ' · Monteur ' + h(t.monteur) : '') + '</span>' : t.status === 'erledigt' ? '<span class="chip ok dot">erledigt</span>' : '<span class="chip warn dot">ausstehend</span>'}</dd><dt>Kunde</dt><dd>${h(Dom.kundeName(k))} · ${h(k ? k.telefon : '')}</dd><dt>Zugang</dt><dd>${h(ob && ob.zugang || '–')}</dd></div>
        <div class="row wrap" style="gap:8px"><a class="btn" href="${h(Kal.google(ev))}" target="_blank" rel="noopener">${ic('i-kalender')} Google Kalender</a><button class="btn" data-act="auftrag.ics" data-id="${a.id}">${ic('i-herunterladen')} ICS-Datei</button><a class="btn ghost" href="${h(Mail.link('m', t.token))}" target="_blank" rel="noopener">${ic('i-link')} Monteurportal</a>
          ${t.status === 'vorgeschlagen' ? `<button class="btn soft" data-act="auftrag.terminBestaetigen" data-id="${t.id}">Partner hat telefonisch bestätigt</button>` : ''}${a.status === 'terminiert' ? `<button class="btn primary" data-act="auftrag.fertig" data-id="${a.id}">${ic('i-check')} Fertigmeldung und Abnahme erfassen</button><button class="btn ghost" data-act="auftrag.terminLoeschen" data-id="${a.id}">Termin verschieben</button>` : ''}</div>
      </div><div class="card pad"><h3 style="font-size:14px;font-weight:700;margin-bottom:8px">Auftragsblatt für den Monteur</h3><p style="font-size:13.5px;color:var(--txt-2);line-height:1.5">Kunde, Adresse, Zugang, Objektkontext, Stückliste mit Lagerplätzen, Termin. Der Partnerbetrieb erhält es mit dem Montageauftrag per Mail und im Monteurportal.</p><button class="btn" style="margin-top:10px" data-act="doc.auftragsblatt" data-id="${a.id}">${ic('i-drucken')} Auftragsblatt anzeigen</button></div></div>`;
    }
    if (!['bereit', 'bestellt', 'teilgeliefert'].includes(a.status)) return `<div class="card pad"><p style="color:var(--txt-2)">Kein Termin hinterlegt.</p></div>`;
    const bereit = a.status === 'bereit';
    const partnerId = S.ui.terminPartner || a.partnerId || (DB.partner[0] || {}).id;
    const pp = Q.partner(partnerId);
    const slots = Kal.freieSlots(D.plusWerktage(D.heute(), 2), 8, pp ? pp.belegt : []);
    return `<div class="split"><div class="card pad stack">
      ${bereit ? `<div class="banner ok"><span class="ic">${ic('i-haken-kreis')}</span><div><b>Montagebereit.</b> Der Kunde wurde ${Fmt.relativ((a.montagebereitAm || '').slice(0, 10))} eingeladen, online einen Termin zu wählen (Kundenportal). Ruft er an, tragen Sie den Termin hier ein.</div></div>` : `<div class="banner warn"><span class="ic">${ic('i-sanduhr')}</span><div><b>Noch nicht montagebereit.</b> Montage frühestens ${Fmt.datum(a.fruehesterMontage)}${a.kritischerPfad ? ' – wartet auf ' + h(a.kritischerPfad.name) : ''}. Ein Termin lässt sich trotzdem vormerken.</div></div>`}
      <div class="field" style="max-width:420px"><label>Partnerbetrieb</label><select class="inp" data-change="auftrag.terminPartner"><option value="">– wählen –</option>${DB.partner.map(x => `<option value="${x.id}" ${partnerId === x.id ? 'selected' : ''}>${h(x.name)}, ${h(x.ort)}${x.modell === 'plus' ? ' · Partner Plus' : ''}</option>`).join('')}</select></div>
      <div><div class="lbl" style="margin-bottom:6px">Freie Halbtage${pp ? ' von ' + h(pp.name) : ''} (Mindestvorlauf 3 Werktage)</div><div class="po-slots">${slots.map(sl => `<button class="po-slot" data-act="auftrag.termin" data-id="${a.id}" data-partner="${h(partnerId || '')}" data-datum="${sl.datum}" data-von="${sl.von}" data-bis="${sl.bis}"><b>${Fmt.wochentag(sl.datum)} ${Fmt.datumKurz(sl.datum)}</b><small>${sl.von} – ${sl.bis}</small></button>`).join('')}</div></div>
      <p style="font-size:12.5px;color:var(--txt-3)">Mit dem Eintrag gehen automatisch der Montageauftrag an den Partnerbetrieb (mit Portal-Link) und die Bestätigung an den Kunden (mit Kalenderdatei).</p>
    </div><div class="card pad"><h3 style="font-size:14px;font-weight:700;margin-bottom:8px">Calendly</h3><p style="font-size:13.5px;color:var(--txt-2);line-height:1.5">${DB.betrieb.calendlyUrl ? 'Der Kunde bucht über ' + h(DB.betrieb.calendlyUrl) + ' – der Link steckt in der Einladung.' : 'In den Einstellungen lässt sich eine Calendly-Adresse hinterlegen; dann bucht der Kunde direkt dort. Ohne Calendly wählt er im Kundenportal aus den freien Halbtagen des Partnerbetriebs.'}</p></div></div>`;
  },

  tabDokumente(a) {
    const o = Q.offerte(a.offerteId); const rs = Q.rechnungenVon(a.id);
    const doc = (titel, text, act, id, ok) => `<div class="po-line"><span><b>${titel}</b><small>${text}</small></span><span class="row">${ok ? '<span class="chip ok dot">vorhanden</span>' : '<span class="chip">offen</span>'}${act ? `<button class="btn sm" data-act="${act}" data-id="${id}">${ic('i-drucken')} Anzeigen</button>` : ''}</span></div>`;
    return `<div class="card pad"><div class="po-lines">
      ${doc('Offerte ' + (o ? o.nr : ''), o && o.unterschrift ? 'unterschrieben ' + Fmt.datum(o.unterschrift.zeit.slice(0, 10)) + ' von ' + h(o.unterschrift.name) + ' · Hash ' + h(o.unterschrift.hash) : 'ohne Unterschrift', 'doc.offerte', o ? o.id : '', !!(o && o.unterschrift))}
      ${doc('Anzahlungsbeleg', a.anzahlung ? Fmt.chf(a.anzahlung.betrag) + ' · ' + Dom.methodeText(a.anzahlung.methode) + ' · ' + Fmt.datum(a.anzahlung.zeit.slice(0, 10)) : '–', 'doc.rechnung', a.anzahlung ? a.anzahlung.rechnungId : '', !!a.anzahlung)}
      ${doc('Auftragsbestätigung', 'per E-Mail an den Kunden ' + Fmt.datum(a.erstellt.slice(0, 10)), 'doc.offerte', o ? o.id : '', true)}
      ${doc('Bestellungen und Auftragsbestätigungen', Q.bestellungenVon(a.id).length + ' Bestellungen · ' + Q.bestellungenVon(a.id).filter(b => b.abEingang).length + ' AB eingegangen', null, '', true)}
      ${doc('Wareneingangs-Protokoll', Auftraege.lieferStand(a).da + ' von ' + Auftraege.lieferStand(a).alle + ' Positionen gescannt', 'doc.qrbogen', a.id, Auftraege.lieferStand(a).da > 0)}
      ${doc('Auftragsblatt Montage', a.terminId ? 'an ' + h((Q.partner(a.partnerId) || {}).name || 'Partner') : 'nach Terminvereinbarung', 'doc.auftragsblatt', a.id, !!a.terminId)}
      ${doc('Abnahmeprotokoll', a.abnahme ? Fmt.datum(a.abnahme.zeit.slice(0, 10)) + ' · ' + h(a.abnahme.name) : 'nach der Montage', null, '', !!a.abnahme)}
      ${rs.filter(r => r.art === 'schluss').map(r => doc('Schlussrechnung ' + r.nr, Fmt.chf(r.betrag) + ' · ' + Dom.statusText(r.status) + ' · fällig ' + Fmt.datum(r.faellig), 'doc.rechnung', r.id, true)).join('')}
      ${a.archiviertAm ? doc('Archiv', 'abgeschlossen ' + Fmt.datum(a.archiviertAm.slice(0, 10)) + ' · ' + (a.dokumente || []).length + ' Dokumente, 10 Jahre aufbewahrt', null, '', true) : ''}
    </div></div>`;
  },

  tabPost(a) {
    const ms = Q.postVon(a.id);
    return `<div class="mail-l">${ms.length ? ms.map(m => Post.eintrag(m, false)).join('') : '<div class="empty"><b>Keine Mails</b></div>'}</div>`;
  },

  tabVerlauf(a) {
    return `<div class="card pad"><div class="tl">${(a.verlauf || []).map(e => `<div class="tl-i"><span class="dot ${['mahnung', 'eskalation', 'schaden', 'storno'].includes(e.typ) ? 'err' : ['wareneingang', 'ab', 'zahlung', 'bereit', 'abnahme', 'archiv'].includes(e.typ) ? 'ok' : 'tint'}">${h(e.icon)}</span><div class="bd">${h(e.text)}<small>${Fmt.datum(e.zeit.slice(0, 10))} ${e.zeit.slice(11, 16)}${e.benutzerId ? ' · ' + h((Q.benutzer(e.benutzerId) || {}).name || '') : ' · automatisch'}</small></div></div>`).join('')}</div></div>`;
  }
});

Act.auftrag = {
  filter(el) { S.ui.af.status = el.dataset.v; Nav.zeichnen(); },
  suche(el) { S.ui.af.suche = el.value; const tb = $('table.tbl tbody'); Nav.zeichnen(); const i = $('.search .inp'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } },
  notiz(el) { Store.aendern('Notiz gespeichert', db => { db.auftraege.find(x => x.id === el.dataset.id).notizen = el.value; }); },
  async ab(el) {
    const b = Q.bestellung(el.dataset.id); const l = Q.lieferant(b.lieferantId);
    const w = await UI.formular('Auftragsbestätigung ' + (l ? l.name : '') + ' erfassen', [{ k: 'termin', label: 'Bestätigter Liefertermin', typ: 'date', wert: Dom.terminVon(b), pflicht: true }, { k: 'bemerkung', label: 'Bemerkung', platzhalter: 'z. B. Produktion KW 38', breit: true }], 'AB erfassen');
    if (!w) return; Store.aendern('Auftragsbestätigung erfasst', db => Dom.abBestaetigen(db, db.bestellungen.find(x => x.id === b.id), { termin: w.termin, bemerkung: w.bemerkung })); Nav.zeichnen();
  },
  async avis(el) {
    const b = Q.bestellung(el.dataset.id);
    const w = await UI.formular('Lieferavis erfassen', [{ k: 'sendung', label: 'Sendungsnummer', platzhalter: 'z. B. Planzer 77 120 336' }, { k: 'datum', label: 'Voraussichtliche Ankunft', typ: 'date', wert: Dom.terminVon(b), pflicht: true }], 'Avis erfassen');
    if (!w) return; Store.aendern('Lieferavis erfasst', db => Dom.avisMelden(db, db.bestellungen.find(x => x.id === b.id), w)); Nav.zeichnen();
  },
  async verzug(el) {
    const b = Q.bestellung(el.dataset.id);
    const w = await UI.formular('Neuer Liefertermin', [{ k: 'neuerTermin', label: 'Neuer verbindlicher Termin', typ: 'date', wert: D.plusWerktage(Dom.terminVon(b), 5), pflicht: true }, { k: 'grund', label: 'Grund', platzhalter: 'z. B. Produktionsengpass', breit: true }], 'Termin übernehmen');
    if (!w) return; Store.aendern('Neuer Liefertermin erfasst', db => Dom.verzugMelden(db, db.bestellungen.find(x => x.id === b.id), w)); Nav.zeichnen();
  },
  pausieren(el) { Store.aendern('Mahnstufen 5 Tage pausiert', db => { const b = db.bestellungen.find(x => x.id === el.dataset.id); b.pausiertBis = D.plus(D.heute(), 5); Store.log('mahnung', 'Mahnstufen für ' + b.nr + ' bis ' + Fmt.datum(b.pausiertBis) + ' pausiert', b.auftragId, '⏸'); }); Nav.zeichnen(); },
  scanSim(el) { const lp = Q.lagerposition(el.dataset.id); Store.aendern('Wareneingang gebucht: ' + lp.name, db => Dom.wareneingang(db, db.lagerpositionen.find(x => x.id === lp.id), { benutzerId: S.benutzerId })); Nav.zeichnen(); },
  ersatz(el) { Store.aendern('Ersatzlieferung gebucht', db => { const lp = db.lagerpositionen.find(x => x.id === el.dataset.id); lp.status = 'erwartet'; lp.notiz = ''; Dom.wareneingang(db, lp, { benutzerId: S.benutzerId, notiz: 'Ersatzlieferung' }); }); Nav.zeichnen(); },
  terminPartner(el) { S.ui.terminPartner = el.value; Nav.zeichnen(); },
  async termin(el) {
    const a = Q.auftrag(el.dataset.id); const p = Q.partner(el.dataset.partner);
    if (!p) { UI.toast('Bitte zuerst den Partnerbetrieb wählen', 'warn'); return; }
    const ok = await UI.bestaetigen('Termin eintragen', Fmt.wochentag(el.dataset.datum, true) + ', ' + Fmt.datum(el.dataset.datum) + ' ' + el.dataset.von + ' Uhr mit ' + p.name + '. Montageauftrag und Kundenbestätigung gehen automatisch raus.', 'Eintragen');
    if (!ok) return;
    Store.aendern('Montagetermin eingetragen', db => Dom.terminSetzen(db, db.auftraege.find(x => x.id === a.id), { datum: el.dataset.datum, von: el.dataset.von, bis: el.dataset.bis, partnerId: p.id, quelle: 'telefon' }));
    S.ui.terminPartner = null; Nav.zeichnen();
  },
  terminBestaetigen(el) { Store.aendern('Termin bestätigt', db => Dom.terminBestaetigenPartner(db, db.termine.find(x => x.id === el.dataset.id))); Nav.zeichnen(); },
  terminLoeschen(el) { Store.aendern('Termin zurückgesetzt', db => { const a = db.auftraege.find(x => x.id === el.dataset.id); const t = db.termine.find(x => x.id === a.terminId); if (t) { t.status = 'abgesagt'; const p = db.partner.find(x => x.id === t.partnerId); if (p) p.belegt = (p.belegt || []).filter(x => x !== t.datum + ' ' + t.von); } a.terminId = null; a.status = 'bereit'; Store.log('termin', 'Termin ' + (t ? Fmt.datum(t.datum) : '') + ' abgesagt – neuer Termin nötig', a.id, '↩️'); }); Nav.zeichnen(); },
  ics(el) { const a = Q.auftrag(el.dataset.id); const t = Q.termin(a.terminId); const ob = Q.objekt(a.objektId); const p = Q.partner(a.partnerId); Kal.icsHerunterladen({ titel: 'Montage ' + a.nr + ' · ' + Dom.kundeName(Q.kunde(a.kundeId)), text: (p ? p.name + ' · ' : '') + Dom.objektText(ob), ort: ob ? ob.strasse + ', ' + ob.plz + ' ' + ob.ort : '', datum: t.datum, von: t.von, bis: t.bis, uid: t.id }, 'Montage-' + a.nr + '.ics'); },
  async fertig(el) {
    const a = Q.auftrag(el.dataset.id); const t = Q.termin(a.terminId);
    const w = await UI.formular('Fertigmeldung und Abnahme', [{ k: 'name', label: 'Abnahme unterschrieben von', wert: Dom.kundeName(Q.kunde(a.kundeId)), pflicht: true }, { k: 'monteur', label: 'Monteur', wert: (t && t.monteur) || '' }, { k: 'notiz', label: 'Bemerkung', typ: 'textarea', breit: true, platzhalter: 'z. B. alles dicht, Kunde zufrieden' }], 'Abschliessen und Rechnung erstellen');
    if (!w) return; Store.aendern('Montage abgeschlossen – Schlussrechnung erstellt', db => Dom.fertigmelden(db, db.auftraege.find(x => x.id === a.id), w)); Nav.gehe('auftrag/' + a.id + '/dokumente');
  },
  async stornieren(el) {
    const a = Q.auftrag(el.dataset.id);
    const w = await UI.formular('Auftrag ' + a.nr + ' stornieren', [{ k: 'grund', label: 'Grund', pflicht: true, breit: true }], 'Stornieren');
    if (!w) return; Store.aendern('Auftrag storniert', db => Dom.stornieren(db, db.auftraege.find(x => x.id === a.id), w.grund)); Nav.zeichnen();
  },
  freigabe(el) { Store.aendern('Freigabe der Verwaltung erfasst', db => { const a = db.auftraege.find(x => x.id === el.dataset.id); a.freigabeVerwaltung = 'erteilt'; Store.log('hinweis', 'Verwaltung hat die Sanierung freigegeben', a.id, '✅'); }); Nav.zeichnen(); }
};
