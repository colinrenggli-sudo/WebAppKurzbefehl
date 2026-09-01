/* ==================================================================
   85 · Portale — Kunde, Lieferant, Monteur, Partnerbetrieb
   Alle ueber Links mit Token, ohne Anmeldung. Sie benutzen dieselbe
   Fachlogik wie die Konsole; jede Handlung erscheint dort sofort.
   ================================================================== */
const Portale = {
  schritte(a) {
    const s = ['bestellt', 'teilgeliefert', 'bereit', 'terminiert', 'abgeschlossen', 'verrechnet', 'archiviert'];
    const t = { bestellt: 'Bestellt', teilgeliefert: 'Lieferung', bereit: 'Terminwahl', terminiert: 'Montage', abgeschlossen: 'Abnahme', verrechnet: 'Rechnung', archiviert: 'Abgeschlossen' };
    const i = s.indexOf(a.status);
    return `<div class="po-steps">${s.filter(x => x !== 'teilgeliefert').map(x => { const j = s.indexOf(x); return `<span class="st ${j < i ? 'done' : j === i || (x === 'bestellt' && a.status === 'teilgeliefert') ? 'now' : ''}">${j < i ? '✓ ' : ''}${t[x]}</span>`; }).join('')}</div>`;
  },
  fuss(k) { const b = DB.betrieb; return `${h(b.name)} · ${h(b.strasse)}, ${h(b.plz)} ${h(b.ort)} · ${h(b.telefon)} · ${h(b.email)}<br>${k ? 'Diese Seite ist persönlich für ' + h(Dom.kundeName(k)) + '. ' : ''}Ihre Daten verwenden wir nur zur Abwicklung Ihres Auftrags (revDSG).` }
};

/* ---------------------------------------------------------- Kunde */
Portal.seiten.kunde = token => {
  const o = Q.offerteMitToken(token); if (!o) return null;
  const k = Q.kunde(o.kundeId); const a = o.auftragId ? Q.auftrag(o.auftragId) : null; const s = Dom.summe(o); const p = a ? Q.partner(a.partnerId) : null;
  S.ui.offerteId = o.id;
  const fuss = Portale.fuss(k);
  if (!a) {
    if (o.status === 'abgelaufen' || o.status === 'abgelehnt') return { html: `<div class="po-hero"><div class="eyebrow">Offerte ${h(o.nr)}</div><h1>Diese Offerte ist ${o.status === 'abgelaufen' ? 'abgelaufen' : 'nicht mehr gültig'}.</h1><p>Gerne erneuern wir sie – rufen Sie uns an unter ${h(DB.betrieb.telefon)}.</p></div>`, fuss };
    const schritt = S.ui.schritt || (o.status === 'unterschrieben' ? 6 : 4);
    if (schritt === 5) return { html: `<div class="po-steps"><span class="st done">✓ Offerte</span><span class="st now">Unterschrift</span><span class="st">Anzahlung</span></div>` + Tablet.s5(o, true), fuss };
    if (schritt === 6) return { html: `<div class="po-steps"><span class="st done">✓ Offerte</span><span class="st done">✓ Unterschrift</span><span class="st now">Anzahlung</span></div>` + Tablet.s6(o, true), fuss };
    return { html: `<div class="po-steps"><span class="st now">Offerte</span><span class="st">Unterschrift</span><span class="st">Anzahlung</span></div>` + Tablet.s4(o, true) + `<div class="po-cta"><button class="btn primary" data-act="portal.schritt" data-n="5">${ic('i-unterschrift')} Auftrag erteilen und unterschreiben</button><button class="btn ghost" data-act="doc.offerte" data-id="${o.id}">${ic('i-drucken')} Offerte als PDF</button></div>`, fuss };
  }
  // Auftrag laeuft
  const lps = Q.lagerpositionenVon(a.id); const da = lps.filter(x => x.status !== 'erwartet').length;
  const t = Q.termin(a.terminId); const r = Q.rechnung(a.rechnungId);
  let hero, body = '';
  if (['bestellt', 'teilgeliefert'].includes(a.status)) {
    const bs = Q.bestellungenVon(a.id).filter(b => !['geliefert', 'storniert'].includes(b.status));
    const spaet = bs.map(b => Dom.terminVon(b)).sort().pop();
    hero = `<div class="eyebrow">Auftrag ${h(a.nr)} · Anzahlung erhalten</div><h1>Ihre Produkte sind bestellt.</h1><p>${da} von ${lps.length} Positionen sind bereits bei uns eingetroffen. ${bs.length ? 'Die letzte Lieferung erwarten wir voraussichtlich am ' + Fmt.datum(spaet) + '.' : ''} Sobald alles da ist, wählen Sie hier Ihren Montagetermin – Sie erhalten dann eine E-Mail.</p>`;
    body = `<div class="card pad"><div class="po-lines">${Q.bestellungenVon(a.id).map(b => `<div class="po-line"><span><b>${h((Q.lieferant(b.lieferantId) || {}).name || '')}</b><small>${b.positionen.map(x => x.name).join(', ')}</small></span><span class="chip st st-${b.status}">${b.status === 'geliefert' ? 'eingetroffen' : 'voraussichtlich ' + Fmt.datum(Dom.terminVon(b))}</span></div>`).join('')}</div></div>`;
  } else if (a.status === 'bereit') {
    const partnerId = a.partnerId || (DB.partner[0] || {}).id; const pp = Q.partner(partnerId);
    const slots = Kal.freieSlots(D.plusWerktage(D.heute(), 2), 8, pp ? pp.belegt : []);
    const cal = Kal.calendly(k, a);
    hero = `<div class="eyebrow">Auftrag ${h(a.nr)} · alles eingetroffen</div><h1>Wählen Sie Ihren Montagetermin.</h1><p>Alle Produkte sind bei uns im Lager und geprüft. Die Montage${pp ? ' durch ' + h(pp.name) : ''} dauert ca. ${a.montageTage} ${a.montageTage === 1 ? 'Tag' : 'Tage'}. Wählen Sie den Starttermin:</p>`;
    body = `<div class="card pad stack">${cal ? `<a class="btn primary lg" href="${h(cal)}" target="_blank" rel="noopener">${ic('i-kalender')} Termin über Calendly wählen</a><div style="text-align:center;color:var(--txt-3);font-size:13px">oder direkt hier</div>` : ''}<div class="po-slots">${slots.map(sl => `<button class="po-slot" data-act="portal.termin" data-datum="${sl.datum}" data-von="${sl.von}" data-bis="${sl.bis}" data-partner="${h(partnerId || '')}"><b>${Fmt.wochentag(sl.datum)} ${Fmt.datumKurz(sl.datum)}</b><small>${sl.von} – ${sl.bis}</small></button>`).join('')}</div><p style="font-size:12.5px;color:var(--txt-3)">Lieber telefonisch? ${h(DB.betrieb.telefon)} – wir tragen den Termin für Sie ein.</p></div>`;
  } else if (a.status === 'terminiert') {
    const ob = Q.objekt(a.objektId);
    const ev = { titel: 'Badmontage ' + DB.betrieb.name, text: 'Auftrag ' + a.nr + (p ? ' · ' + p.name : ''), ort: ob ? ob.strasse + ', ' + ob.plz + ' ' + ob.ort : '', datum: t.datum, von: t.von, bis: t.bis, uid: t.id };
    hero = `<div class="eyebrow">Auftrag ${h(a.nr)} · Termin</div><h1>${Fmt.wochentag(t.datum, true)}, ${Fmt.datum(t.datum)}</h1><p>Ab ${h(t.von)} Uhr${p ? ', ' + h(p.name) : ''}${t.monteur ? ' (Monteur ' + h(t.monteur) + ')' : ''}. Dauer ca. ${t.dauerTage} ${t.dauerTage === 1 ? 'Tag' : 'Tage'}. Bitte räumen Sie das Bad frei; das Wasser wird zeitweise abgestellt.</p>`;
    body = `<div class="po-cta"><a class="btn" href="${h(Kal.google(ev))}" target="_blank" rel="noopener">${ic('i-kalender')} In Google Kalender eintragen</a><button class="btn" data-act="portal.ics">${ic('i-herunterladen')} Kalenderdatei (.ics)</button><button class="btn ghost" data-act="portal.verschieben">Termin verschieben (Anruf)</button></div>`;
  } else if (a.status === 'abgeschlossen') {
    hero = `<div class="eyebrow">Auftrag ${h(a.nr)}</div><h1>Montage abgeschlossen.</h1><p>Vielen Dank für die Abnahme. Die Schlussrechnung folgt in Kürze.</p>`;
  } else if (a.status === 'verrechnet' && r) {
    hero = `<div class="eyebrow">Auftrag ${h(a.nr)} · Schlussrechnung ${h(r.nr)}</div><h1>${Fmt.chf(r.betrag + (r.mahngebuehr || 0))}</h1><p>Gesamtbetrag ${Fmt.chf(r.total)} abzüglich Anzahlung ${Fmt.chf(r.anzahlungVerrechnet)}${r.mahngebuehr ? ' zuzüglich Mahngebühren ' + Fmt.chf(r.mahngebuehr) : ''}. Zahlbar bis ${Fmt.datum(r.faellig)}. Scannen Sie den Zahlteil mit Ihrer Banking-App.</p>`;
    body = `<div class="card pad"><div class="a4-wrap" style="overflow:auto">${Doc.zahlteilHtml(r)}</div><div class="po-cta" style="margin-top:12px"><button class="btn" data-act="doc.rechnung" data-id="${r.id}">${ic('i-drucken')} Rechnung als PDF</button><button class="btn ghost" data-act="portal.bezahltDemo" data-id="${r.id}">Zahlung simulieren (Demo)</button></div></div>`;
  } else if (a.status === 'archiviert') {
    hero = `<div class="eyebrow">Auftrag ${h(a.nr)} · abgeschlossen</div><h1>Vielen Dank – geniessen Sie Ihr Bad.</h1><p>Alles ist bezahlt und archiviert. Ihre Unterlagen bleiben hier abrufbar: Offerte, Auftragsbestätigung, Abnahme, Rechnung. Garantie auf die Produkte: 2 Jahre ab Lieferung${o.positionen.some(x => x.artikelId === 'Z-05') ? ' – verlängert auf 5 Jahre' : ''}.</p>`;
    body = `<div class="card pad stack"><div><b>Wie zufrieden sind Sie?</b><div class="row" style="gap:6px;margin-top:6px">${[1, 2, 3, 4, 5].map(n => `<button class="btn ${a.bewertung >= n ? 'primary' : 'ghost'} icon" data-act="portal.bewertung" data-n="${n}">★</button>`).join('')}</div></div><div class="po-cta"><button class="btn" data-act="doc.offerte" data-id="${o.id}">${ic('i-doc')} Offerte</button>${r ? `<button class="btn" data-act="doc.rechnung" data-id="${r.id}">${ic('i-doc')} Rechnung</button>` : ''}</div></div>`;
  } else if (a.status === 'storniert') {
    hero = `<div class="eyebrow">Auftrag ${h(a.nr)}</div><h1>Dieser Auftrag wurde storniert.</h1><p>Bei Fragen erreichen Sie uns unter ${h(DB.betrieb.telefon)}.</p>`;
  }
  return { html: `<div class="po-hero">${Portale.schritte(a)}<div style="height:10px"></div>${hero}</div>${body}
    <div class="card pad"><b style="font-size:14px">Ihr Auftrag im Überblick</b><div class="po-lines" style="margin-top:6px">${o.positionen.filter(x => x.art === 'produkt').map(x => `<div class="po-line"><span>${x.menge > 1 ? x.menge + '× ' : ''}${h(x.name)}<small>${o.positionen.filter(y => y.elternId === x.id).length ? 'inkl. Installationsmaterial' + (o.positionen.filter(y => y.elternId === x.id && y.art === 'option').length ? ' und Optionen' : '') : ''}</small></span><span class="amt">${Fmt.chf(sum(o.positionen.filter(y => y.id === x.id || y.elternId === x.id), y => y.menge * y.vk), false)}</span></div>`).join('')}${o.positionen.filter(x => ['leistung', 'paket'].includes(x.art)).map(x => `<div class="po-line"><span>${h(x.name)}</span><span class="amt">${Fmt.chf(x.menge * x.vk, false)}</span></div>`).join('')}<div class="po-line total"><span>Total inkl. MWST</span><span class="amt">${Fmt.chf(s.total)}</span></div><div class="po-line"><span>Anzahlung ${Fmt.datum((a.anzahlung || {}).zeit ? a.anzahlung.zeit.slice(0, 10) : '')}</span><span class="amt">− ${Fmt.chf(a.anzahlung ? a.anzahlung.betrag : 0, false)}</span></div><div class="po-line"><span><b>Rest nach Montage</b></span><span class="amt"><b>${Fmt.chf(a.total - (a.anzahlung ? a.anzahlung.betrag : 0))}</b></span></div></div></div>`, fuss };
};
Portal.nachZeichnen.kunde = () => { if ((S.ui.schritt || 0) === 5) Tablet.sigStart(); };

/* ------------------------------------------------------ Lieferant */
Portal.seiten.lieferant = token => {
  const b = Q.bestellungMitToken(token); if (!b) return null;
  const a = Q.auftrag(b.auftragId); const l = Q.lieferant(b.lieferantId); const k = Q.kunde(a.kundeId); const kpi = Dom.lieferantKpi(DB, b.lieferantId);
  const fuss = `${h(DB.betrieb.name)} · Einkauf · ${h(DB.betrieb.telefon)} · ${h(DB.betrieb.email)}<br>Lieferantenportal: Bestätigen, avisieren, melden – ohne Anruf.`;
  const st = b.status;
  const zustand = st === 'geliefert' ? `<div class="pay-ok">${ic('i-haken-kreis')}<span>Vollständig geliefert am ${Fmt.datum((b.geliefertAm || '').slice(0, 10))}. Vielen Dank!</span></div>`
    : st === 'avisiert' ? `<div class="pay-ok">${ic('i-lkw')}<span>Avisiert: Sendung ${h(b.avis.sendung || '–')}, Ankunft ${Fmt.datum(b.avis.datum)}.</span></div>`
    : st === 'bestaetigt' || st === 'teilgeliefert' ? `<div class="pay-ok">${ic('i-check')}<span>Bestätigt am ${Fmt.datum((b.abEingang || '').slice(0, 10))} mit Liefertermin ${Fmt.datum(b.abTermin)}${b.bemerkung ? ' – ' + h(b.bemerkung) : ''}.</span></div>` : '';
  const f = S.ui.lf || {};
  return { html: `<div class="po-hero"><div class="eyebrow">Bestellung ${h(b.nr)} · Kommission ${h(a.nr)} ${h(k ? k.name : '')}</div><h1>Guten Tag ${h(l ? l.kontakt : '')}</h1><p>${h(DB.betrieb.name)} hat am ${Fmt.datum(b.gesendet.slice(0, 10))} bestellt. Gewünschter Liefertermin: <b>${Fmt.datum(b.planTermin)}</b>. Lieferort: ${h(DB.betrieb.strasse)}, ${h(DB.betrieb.plz)} ${h(DB.betrieb.ort)}, werktags 07:30–16:30. Bitte Kommission auf Lieferschein und Etikett.</p>${b.mahnstufe ? `<p style="color:var(--warn-txt);font-weight:600;margin-top:6px">Offene Nachfrage: ${['', 'Statusanfrage', 'Liefermahnung', 'Eskalation'][b.mahnstufe]} vom ${Fmt.datum((b.mahnungen[b.mahnungen.length - 1] || {}).zeit.slice(0, 10))}. Eine Rückmeldung hier stoppt weitere Erinnerungen.</p>` : ''}</div>
    <div class="card pad"><div class="po-lines">${b.positionen.map(p => `<div class="po-line"><span><b>${h(p.name)}</b><small>${h((Q.artikel(p.artikelId) || {}).nr || '')}${p.stornierbar === false ? ' · Sonderanfertigung' : ''}</small></span><span class="amt">${p.menge} Stk${p.offen < p.menge ? ' · offen ' + p.offen : ''}</span></div>`).join('')}</div></div>
    ${zustand}
    ${st !== 'geliefert' ? `<div class="card pad stack">
      ${st === 'gesendet' ? `<div><b>Auftragsbestätigung</b><div class="grid g2" style="margin-top:6px"><div class="field"><label>Liefertermin</label><input class="inp" type="date" id="lfTermin" value="${h(b.planTermin)}"></div><div class="field"><label>Bemerkung</label><input class="inp" id="lfBem" placeholder="z. B. Produktion KW 38"></div></div><button class="btn primary lg wide" data-act="portal.ab" data-id="${b.id}">${ic('i-check')} Bestellung bestätigen</button></div>` : ''}
      ${!b.avis ? `<div><b>Lieferavis</b><div class="grid g2" style="margin-top:6px"><div class="field"><label>Sendungsnummer</label><input class="inp" id="lfSendung" placeholder="z. B. Planzer 77 120 336"></div><div class="field"><label>Ankunft</label><input class="inp" type="date" id="lfDatum" value="${h(Dom.terminVon(b))}"></div></div><button class="btn lg wide" data-act="portal.avis" data-id="${b.id}">${ic('i-lkw')} Sendung ist unterwegs</button></div>` : ''}
      <div><b>Verzögerung melden</b><div class="grid g2" style="margin-top:6px"><div class="field"><label>Neuer verbindlicher Termin</label><input class="inp" type="date" id="lfNeu" value="${h(D.plusWerktage(Dom.terminVon(b), 5))}"></div><div class="field"><label>Grund</label><input class="inp" id="lfGrund" placeholder="z. B. Materialengpass"></div></div><button class="btn soft lg wide" data-act="portal.verzug" data-id="${b.id}">${ic('i-sanduhr')} Neuen Termin melden</button></div>
    </div>` : ''}
    <div class="card pad" style="font-size:13px;color:var(--txt-2)"><b style="color:var(--txt)">Ihre Termintreue bei uns:</b> ${kpi.otif != null ? kpi.otif + ' %' : '–'} (Toleranz ±2 Werktage) · ${kpi.bestellungen} Bestellungen · ${kpi.mahnungen} Nachfragen. Lieferanten mit einer Termintreue über 95 % erhalten bei uns Vorrang.</div>`, fuss };
};

/* -------------------------------------------------------- Monteur */
Portal.seiten.monteur = token => {
  const t = Q.terminMitToken(token); if (!t) return null;
  const a = Q.auftrag(t.auftragId); const p = Q.partner(t.partnerId); const k = Q.kunde(a.kundeId); const ob = Q.objekt(a.objektId);
  const lps = Q.lagerpositionenVon(a.id);
  const fuss = `${h(DB.betrieb.name)} · ${h(DB.betrieb.telefon)}<br>Monteurportal für ${h(p ? p.name : 'Partnerbetrieb')} · Werkvertrag zwischen Kunde und Partnerbetrieb, Gewährleistung SIA 118.`;
  const fertig = a.status === 'abgeschlossen' || a.status === 'verrechnet' || a.status === 'archiviert';
  return { html: `<div class="po-hero"><div class="eyebrow">Montageauftrag ${h(a.nr)} · ${h(p ? p.name : '')}</div><h1>${Fmt.wochentag(t.datum, true)}, ${Fmt.datum(t.datum)} ab ${h(t.von)} Uhr</h1><p>${h(Dom.kundeName(k))} · ${h(ob ? ob.strasse + ', ' + ob.plz + ' ' + ob.ort : '')}${k && k.telefon ? ' · ' + h(k.telefon) : ''}<br>${h(Dom.objektText(ob))}${ob && ob.zugang ? '<br><b>Zugang:</b> ' + h(ob.zugang) : ''}<br>Dauer ca. ${t.dauerTage} ${t.dauerTage === 1 ? 'Tag' : 'Tage'} · Material im Showroom-Lager, Kommission <b>K-${h(a.nr.slice(-4))}</b></p>
    ${t.status === 'bestaetigt' ? `<div class="pay-ok" style="margin-top:10px">${ic('i-check')}<span>Termin bestätigt${t.monteur ? ' · ' + h(t.monteur) : ''}</span></div>` : t.status === 'erledigt' ? `<div class="pay-ok" style="margin-top:10px">${ic('i-check')}<span>Fertig gemeldet, Abnahme ${Fmt.datum((a.abnahme || {}).zeit ? a.abnahme.zeit.slice(0, 10) : '')}</span></div>` : ''}</div>
    ${t.status === 'vorgeschlagen' ? `<div class="card pad stack"><b>Termin bestätigen</b><div class="field"><label>Monteur</label><select class="inp" id="moMonteur">${(p ? p.monteure : ['Monteur']).map(m => `<option ${t.monteur === m ? 'selected' : ''}>${h(m)}</option>`).join('')}</select></div><button class="btn primary lg wide" data-act="portal.terminOk" data-id="${t.id}">${ic('i-check')} Termin bestätigen</button><p style="font-size:12.5px;color:var(--txt-3)">Passt der Termin nicht? ${h(DB.betrieb.telefon)}</p></div>` : ''}
    <div class="card pad"><b style="font-size:14px">Stückliste und Lagerplätze</b><div class="po-lines" style="margin-top:6px">${lps.map(x => `<div class="po-line"><span>${x.menge > 1 ? x.menge + '× ' : ''}${h(x.name)}</span><span class="mono" style="font-size:12.5px">${h(x.lagerplatz || '–')}</span></div>`).join('')}</div>${a.montage.length ? `<div class="po-lines" style="margin-top:10px"><div class="po-line" style="border-top:2px solid var(--txt)"><b>Ihre Montagepositionen (Richtpreis)</b><span class="amt"></span></div>${a.montage.map(m => `<div class="po-line"><span>${h(m.name)}</span><span class="amt">${Fmt.chf(m.vk, false)}</span></div>`).join('')}</div>` : ''}<div class="po-cta" style="margin-top:10px"><button class="btn" data-act="doc.auftragsblatt" data-id="${a.id}">${ic('i-drucken')} Auftragsblatt</button></div></div>
    ${!fertig && t.status !== 'vorgeschlagen' ? `<div class="card pad stack"><b>Fertigmeldung mit Abnahme</b><div class="field"><label>Abnahme durch (Kunde)</label><input class="inp" id="moName" value="${h(Dom.kundeName(k))}"></div><div class="field"><label>Bemerkung</label><input class="inp" id="moNotiz" placeholder="z. B. alles dicht, Kunde zufrieden"></div><div><div class="lbl" style="margin-bottom:6px">Unterschrift des Kunden</div><div class="sig-box" id="sigBox"><canvas id="sigCanvas"></canvas><span class="hint">Kunde unterschreibt hier</span><button class="btn ghost sm x" data-act="offerte.sigClear">Löschen</button></div></div><button class="btn primary lg wide" data-act="portal.fertig" data-id="${a.id}">${ic('i-check')} Montage fertig – Abnahme senden</button><p style="font-size:12.5px;color:var(--txt-3)">Mit der Abnahme geht die Schlussrechnung an den Kunden.</p></div>` : ''}`, fuss };
};
Portal.nachZeichnen.monteur = () => { if ($('#sigCanvas')) Tablet.sigStart(); };

/* -------------------------------------------------------- Partner */
Portal.seiten.partner = token => {
  const p = Q.partnerMitToken(token); if (!p) return null;
  const tab = S.ui.ptab || 'showroom';
  const auftr = DB.auftraege.filter(a => a.partnerId === p.id || (Q.kunde(a.kundeId) || {}).partnerId === p.id);
  const termine = DB.termine.filter(t => t.partnerId === p.id && t.status !== 'abgesagt');
  const st = DB.showroomTermine.filter(t => t.partnerId === p.id);
  const heute = D.heute();
  const tabs = [['showroom', 'Showroom-Termin buchen'], ['kunden', 'Meine Kunden'], ['montage', 'Montageaufträge'], ['abrechnung', 'Abrechnung']];
  let inhalt = '';
  if (tab === 'showroom') {
    const tage = []; let d = heute; while (tage.length < 8) { d = D.plus(d, 1); const wd = D.parse(d).getDay(); if (wd >= 2 && wd <= 6) tage.push(d); }
    const slots = tage.flatMap(d => (D.parse(d).getDay() === 6 ? ['09:00', '10:30', '13:00', '14:30'] : ['09:00', '10:30', '14:00', '15:30', '17:00']).map(von => ({ datum: d, von, prime: D.parse(d).getDay() === 6 && von < '12:00', belegt: DB.showroomTermine.some(t => t.datum === d && t.von === von && t.status !== 'abgesagt') })));
    const f = S.ui.pform || {};
    inhalt = `<div class="card pad stack"><p style="font-size:14px;color:var(--txt-2);line-height:1.5">Bringen Sie Ihren Kunden in unseren Showroom: 60 Minuten Beratung, wir offerieren das Material, Sie montieren. ${p.modell === 'plus' ? 'Als <b>Partner Plus</b> haben Sie Zugang zu den Samstag-Vormittagen mit Kaffee und Gipfeli.' : 'Samstag-Vormittage (Kaffee und Gipfeli) sind <b>Partner Plus</b> vorbehalten.'}</p>
      <div class="grid g2"><div class="field"><label>Kunde</label><input class="inp" id="psKunde" value="${h(f.kunde || '')}" placeholder="Name des Kunden"></div><div class="field"><label>Thema</label><input class="inp" id="psThema" value="${h(f.thema || '')}" placeholder="z. B. Komplettbad Sanierung"></div></div>
      <div class="po-slots">${slots.map(sl => `<button class="po-slot" data-act="portal.showroom" data-datum="${sl.datum}" data-von="${sl.von}" data-prime="${sl.prime}" ${sl.belegt || (sl.prime && p.modell !== 'plus') ? 'disabled style="opacity:.4"' : ''}><b>${Fmt.wochentag(sl.datum)} ${Fmt.datumKurz(sl.datum)}</b><small>${sl.von}${sl.prime ? ' · ☕ Gipfeli' : ''}${sl.belegt ? ' · belegt' : ''}</small></button>`).join('')}</div></div>
      ${st.length ? `<div class="card pad"><b>Ihre Anfragen</b><div class="po-lines" style="margin-top:6px">${st.map(t => `<div class="po-line"><span>${Fmt.datum(t.datum)} ${h(t.von)} · ${h(t.kundeName)}<small>${h(t.thema || '')}</small></span><span class="chip st st-${t.status}">${Dom.statusText(t.status)}</span></div>`).join('')}</div></div>` : ''}`;
  } else if (tab === 'kunden') {
    inhalt = `<div class="card pad"><div class="po-lines">${auftr.length ? auftr.map(a => { const lps = Q.lagerpositionenVon(a.id); const da = lps.filter(x => x.status !== 'erwartet').length; return `<div class="po-line"><span><b>${h(Dom.kundeName(Q.kunde(a.kundeId)))}</b> · ${h(a.nr)}<small>${da}/${lps.length} Positionen eingetroffen${a.fruehesterMontage && ['bestellt', 'teilgeliefert'].includes(a.status) ? ' · Montage frühestens ' + Fmt.datum(a.fruehesterMontage) : ''}</small></span><span class="chip st st-${a.status}">${Dom.statusText(a.status)}</span></div>`; }).join('') : '<p style="color:var(--txt-3)">Noch keine Aufträge.</p>'}</div></div>`;
  } else if (tab === 'montage') {
    inhalt = `<div class="card pad"><div class="po-lines">${termine.length ? termine.map(t => { const a = Q.auftrag(t.auftragId); return `<div class="po-line"><span><b>${Fmt.datum(t.datum)} ${h(t.von)}</b> · ${h(Dom.kundeName(Q.kunde(a.kundeId)))}<small>${h(a.nr)} · ${h((Q.objekt(a.objektId) || {}).ort || '')} · ${t.dauerTage} ${t.dauerTage === 1 ? 'Tag' : 'Tage'}</small></span><span class="row"><span class="chip st st-${t.status}">${Dom.statusText(t.status)}</span><a class="btn sm" href="${h(Mail.link('m', t.token))}">Öffnen</a></span></div>`; }).join('') : '<p style="color:var(--txt-3)">Keine Montageaufträge.</p>'}</div></div>`;
  } else {
    const tipp = auftr.filter(a => (Q.kunde(a.kundeId) || {}).partnerId === p.id && a.status !== 'storniert');
    const verm = auftr.filter(a => a.partnerId === p.id && a.status !== 'storniert' && a.montage.length);
    const tippSum = sum(tipp, a => a.total * (p.provisionTipp || 0) / 100);
    const vermSum = p.modell === 'plus' ? 0 : sum(verm, a => sum(a.montage, m => m.vk) * (p.provisionVermittlung || 0) / 100);
    inhalt = `<div class="card pad stack"><div class="po-lines">
      <div class="po-line"><span><b>Modell</b><small>${p.modell === 'plus' ? 'Partner Plus · CHF ' + p.aboChf + ' pro Monat · Prime-Slots, keine Vermittlungsprovision, Vorrang bei Montageaufträgen' : 'Partner Basis · gratis · ' + p.provisionVermittlung + ' % Vermittlungsprovision auf vermittelte Montagen'}</small></span><span class="chip ${p.modell === 'plus' ? 'tint' : ''}">${p.modell === 'plus' ? 'Plus' : 'Basis'}</span></div>
      <div class="po-line"><span><b>Tippgeberprovision an Sie</b><small>${p.provisionTipp} % auf den Materialumsatz von ${tipp.length} Kunden, die Sie gebracht haben (${Fmt.chf(sum(tipp, a => a.total))})</small></span><span class="amt" style="color:var(--ok-txt)">+ ${Fmt.chf(tippSum, false)}</span></div>
      <div class="po-line"><span><b>Vermittlungsprovision an ${h(DB.betrieb.name)}</b><small>${p.modell === 'plus' ? 'entfällt bei Partner Plus' : p.provisionVermittlung + ' % auf ' + verm.length + ' vermittelte Montagen (' + Fmt.chf(sum(verm, a => sum(a.montage, m => m.vk))) + ')'}</small></span><span class="amt" style="color:var(--err-txt)">− ${Fmt.chf(vermSum, false)}</span></div>
      ${p.modell === 'plus' ? `<div class="po-line"><span><b>Abo Partner Plus</b><small>monatlich</small></span><span class="amt" style="color:var(--err-txt)">− ${Fmt.chf(p.aboChf, false)}</span></div>` : ''}
      <div class="po-line total"><span>Saldo zu Ihren Gunsten</span><span class="amt">${Fmt.chf(tippSum - vermSum - (p.modell === 'plus' ? p.aboChf : 0))}</span></div></div>
      ${p.modell !== 'plus' ? `<div class="banner"><span class="ic">${ic('i-kaffee')}</span><div><b>Partner Plus für CHF 149 pro Monat:</b> Samstag-Vormittage mit Kaffee und Gipfeli, keine Vermittlungsprovision, Vorrang bei Montageaufträgen, Ihr Logo auf der Offerte. <button class="btn sm primary" data-act="portal.plus" data-id="${p.id}">Upgrade (Demo)</button></div></div>` : ''}</div>`;
  }
  return { html: `<div class="po-hero"><div class="eyebrow">Partnerportal · ${p.modell === 'plus' ? 'Partner Plus' : 'Partner Basis'}</div><h1>${h(p.name)}</h1><p>Guten Tag ${h(p.kontakt)}. ${auftr.length} Aufträge, ${termine.filter(t => t.status !== 'erledigt').length} offene Montagen, ${st.filter(t => t.status === 'angefragt').length} Showroom-Anfragen.</p></div>
    <div class="tabs">${tabs.map(x => `<button aria-selected="${tab === x[0]}" data-act="portal.tab" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>${inhalt}`, fuss: `${h(DB.betrieb.name)} · Partnernetzwerk · ${h(DB.betrieb.telefon)}<br>Provisionen werden transparent ausgewiesen. Keine Preisabsprachen, keine Exklusivität – Ihr Kunde bleibt frei.` };
};

Act.portal = {
  schritt(el) { S.ui.schritt = +el.dataset.n; Nav.zeichnen(); },
  termin(el) { const o = Tablet.aktuelle(); const a = Q.auftrag(o.auftragId); Store.aendern('', db => Dom.terminSetzen(db, db.auftraege.find(x => x.id === a.id), { datum: el.dataset.datum, von: el.dataset.von, bis: el.dataset.bis, partnerId: el.dataset.partner, quelle: 'kunde-online' }), false); UI.toast('Termin eingetragen – Bestätigung folgt per E-Mail', 'ok', { undo: false }); Nav.zeichnen(); },
  ics() { const o = Tablet.aktuelle(); const a = Q.auftrag(o.auftragId); Act.auftrag.ics({ dataset: { id: a.id } }); },
  verschieben() { UI.dialog({ titel: 'Termin verschieben', weite: 'slim', inhalt: `<p style="font-size:14px;color:var(--txt-2)">Bitte rufen Sie uns an: <b>${h(DB.betrieb.telefon)}</b>. Wir stimmen den neuen Termin mit dem Partnerbetrieb ab.</p>`, aktionen: [{ text: 'Schliessen', art: 'primary' }] }); },
  bezahltDemo(el) { Store.aendern('', db => Dom.rechnungBezahlt(db, db.rechnungen.find(x => x.id === el.dataset.id), { methode: 'ueberweisung' }), false); UI.toast('Zahlung eingegangen – Auftrag archiviert', 'ok', { undo: false }); Nav.zeichnen(); },
  bewertung(el) { const o = Tablet.aktuelle(); Store.aendern('', db => { const a = db.auftraege.find(x => x.id === o.auftragId); a.bewertung = +el.dataset.n; Store.log('bewertung', 'Kunde bewertet mit ' + a.bewertung + ' von 5 Sternen', a.id, '⭐'); }, false); UI.toast('Danke für Ihre Bewertung!', 'ok', { undo: false }); Nav.zeichnen(); },
  ab(el) { const t = $('#lfTermin').value; if (!t) return; Store.aendern('', db => Dom.abBestaetigen(db, db.bestellungen.find(x => x.id === el.dataset.id), { termin: t, bemerkung: $('#lfBem').value, quelle: 'portal' }), false); UI.toast('Bestätigung übermittelt – vielen Dank', 'ok', { undo: false }); Nav.zeichnen(); },
  avis(el) { Store.aendern('', db => Dom.avisMelden(db, db.bestellungen.find(x => x.id === el.dataset.id), { sendung: $('#lfSendung').value, datum: $('#lfDatum').value }), false); UI.toast('Avis übermittelt', 'ok', { undo: false }); Nav.zeichnen(); },
  verzug(el) { const t = $('#lfNeu').value; if (!t) return; Store.aendern('', db => Dom.verzugMelden(db, db.bestellungen.find(x => x.id === el.dataset.id), { neuerTermin: t, grund: $('#lfGrund').value }), false); UI.toast('Neuer Termin übermittelt', 'ok', { undo: false }); Nav.zeichnen(); },
  terminOk(el) { Store.aendern('', db => Dom.terminBestaetigenPartner(db, db.termine.find(x => x.id === el.dataset.id), ($('#moMonteur') || {}).value), false); UI.toast('Termin bestätigt', 'ok', { undo: false }); Nav.zeichnen(); },
  fertig(el) { if (!Tablet._sig || Tablet._sig.leer()) { UI.toast('Bitte den Kunden unterschreiben lassen', 'warn'); return; } const dataUrl = Tablet._sig.toDataURL(); Store.aendern('', db => Dom.fertigmelden(db, db.auftraege.find(x => x.id === el.dataset.id), { name: $('#moName').value, notiz: $('#moNotiz').value, dataUrl, monteur: (Q.termin((Q.auftrag(el.dataset.id) || {}).terminId) || {}).monteur }), false); UI.toast('Fertigmeldung gesendet – Schlussrechnung geht an den Kunden', 'ok', { undo: false }); Nav.zeichnen(); },
  tab(el) { S.ui.ptab = el.dataset.v; Nav.zeichnen(); },
  showroom(el) { const p = Q.partnerMitToken(S.portal.token); const kunde = ($('#psKunde') || {}).value || ''; if (!kunde) { UI.toast('Bitte den Kunden eintragen', 'warn'); $('#psKunde').focus(); return; } Store.aendern('', db => Dom.showroomTerminAnfragen(db, { datum: el.dataset.datum, von: el.dataset.von, kundeName: kunde, thema: ($('#psThema') || {}).value, partnerId: p.id, hospitality: el.dataset.prime === 'true' }), false); S.ui.pform = null; UI.toast('Anfrage gesendet – wir bestätigen in Kürze', 'ok', { undo: false }); Nav.zeichnen(); },
  plus(el) { Store.aendern('', db => { const p = db.partner.find(x => x.id === el.dataset.id); p.modell = 'plus'; p.aboChf = 149; p.provisionVermittlung = 0; Store.log('partner', p.name + ' ist jetzt Partner Plus', null, '☕'); }, false); UI.toast('Willkommen bei Partner Plus!', 'ok', { undo: false }); Nav.zeichnen(); }
};
