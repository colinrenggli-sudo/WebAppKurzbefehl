/* ==================================================================
   90 · Doc — A4-Dokumente
   Offerte, Auftragsblatt, Rechnung mit Schweizer QR-Zahlteil, QR-Bogen
   fuer das Lager. Geoeffnet in einem eigenen Fenster mit eigener
   Druckformatierung; «Drucken» dort ergibt das PDF.
   ================================================================== */
const Doc = {
  CSS: `*{box-sizing:border-box}body{margin:0;background:#e9ecf1;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif;color:#111}
.bar{position:sticky;top:0;background:#fff;border-bottom:1px solid #ddd;padding:10px 16px;display:flex;gap:10px;align-items:center;font-size:14px}
.bar button{font:inherit;font-weight:600;padding:8px 16px;border-radius:10px;border:1px solid #0F7C8C;background:#0F7C8C;color:#fff;cursor:pointer}
.bar span{color:#666}
.a4{background:#fff;width:210mm;min-height:297mm;margin:16px auto;padding:18mm 18mm 16mm;box-shadow:0 8px 30px rgba(0,0,0,.15);font-size:10.5pt;line-height:1.45;position:relative;page-break-after:always}
.a4:last-child{page-break-after:auto}
h1{font-size:20pt;font-weight:760;letter-spacing:-.02em;margin:0 0 2mm}
.kopf{display:flex;justify-content:space-between;gap:10mm;margin-bottom:10mm}
.kopf .firma b{font-size:12pt;display:block}.kopf .firma small{display:block;color:#555;font-size:9pt;line-height:1.4}
.logo{width:14mm;height:14mm;border-radius:4mm;background:#0F7C8C;display:inline-block;vertical-align:middle;margin-right:3mm}
.adr{margin:14mm 0 8mm;line-height:1.4}
.meta{display:grid;grid-template-columns:auto auto;gap:1mm 6mm;font-size:9pt;color:#444;justify-content:end;text-align:right}.meta b{color:#111}
table{width:100%;border-collapse:collapse;margin:4mm 0}
th{text-align:left;font-size:8.5pt;text-transform:uppercase;letter-spacing:.04em;color:#555;border-bottom:1.5px solid #111;padding:2mm 1.5mm}
td{padding:1.6mm 1.5mm;border-bottom:1px solid #ddd;vertical-align:top}
td.r,th.r{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
tr.sub td{color:#555;font-size:9.5pt;padding-left:6mm}tr.grp td{font-weight:700;border-bottom:0;padding-top:4mm}
.tot td{border-bottom:0;padding:1mm 1.5mm}.tot.end td{font-weight:760;font-size:12pt;border-top:2px solid #111;padding-top:2.5mm}
.fuss{position:absolute;left:18mm;right:18mm;bottom:10mm;font-size:8.5pt;color:#666;border-top:1px solid #ddd;padding-top:2mm;display:flex;justify-content:space-between}
.sig{display:grid;grid-template-columns:1fr 1fr;gap:10mm;margin-top:12mm}.sig .l{border-top:1px solid #111;padding-top:2mm;font-size:9pt;color:#555}.sig img{height:16mm;display:block;margin-bottom:-2mm}
.bem{font-size:9pt;color:#333;margin-top:6mm;white-space:pre-line;line-height:1.45}
.box{border:1px solid #ccc;border-radius:3mm;padding:4mm;margin:3mm 0;font-size:9.5pt}
.zahlteil{width:210mm;height:105mm;margin:8mm 0 0 -18mm;border-top:1px dashed #111;display:grid;grid-template-columns:62mm 148mm;font-size:8pt;line-height:1.35;background:#fff;page-break-inside:avoid}
.zahlteil .emp{padding:5mm;border-right:1px dashed #111;display:flex;flex-direction:column}.zahlteil .zt{padding:5mm;display:grid;grid-template-columns:51mm 1fr;gap:5mm}
.zahlteil h4{font-size:11pt;font-weight:700;margin:0 0 3mm}.zahlteil .l{font-size:6pt;font-weight:700;margin-top:2.2mm;letter-spacing:.02em}.zahlteil .v{font-size:8pt}
.zahlteil .betrag{display:flex;gap:8mm;margin-top:2.5mm}.zahlteil .betrag .l{margin-top:0}.zahlteil .qr svg{width:46mm;height:46mm;display:block;margin:2mm 0}.zahlteil .pf{font-size:7pt;margin-top:auto;padding-top:2mm;text-align:right}
.qr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6mm}.qr-card{border:1px solid #999;border-radius:3mm;padding:4mm;text-align:center;break-inside:avoid}.qr-card svg{width:40mm;height:40mm}.qr-card b{display:block;font-size:9.5pt;line-height:1.25;margin-top:2mm}.qr-card small{display:block;font-size:8pt;color:#555;font-family:ui-monospace,Menlo,monospace;margin-top:1mm}
@media print{body{background:#fff}.bar{display:none}.a4{box-shadow:none;margin:0;width:auto;min-height:auto;padding:14mm 16mm}.zahlteil{margin-left:-16mm}@page{size:A4;margin:0}}`,

  zeigen(html, titel) {
    const doc = `<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><title>${h(titel)}</title><style>${Doc.CSS}</style></head><body><div class="bar"><button onclick="window.print()">Drucken / als PDF sichern</button><span>${h(titel)} · ${h(DB.betrieb.name)}</span></div>${html}</body></html>`;
    const w = window.open('', '_blank');
    if (!w) { UI.dialog({ titel, weite: 'wide', inhalt: `<div style="background:#e9ecf1;padding:10px;border-radius:12px;overflow:auto"><style>${Doc.CSS.replace(/body\{[^}]*\}/, '')}</style>${html}</div>`, aktionen: [{ text: 'Schliessen', art: 'primary' }] }); return; }
    w.document.open(); w.document.write(doc); w.document.close();
  },

  kopf(titel, meta) {
    const b = DB.betrieb;
    return `<div class="kopf"><div class="firma"><span class="logo"></span><b style="display:inline-block;vertical-align:middle">${h(b.name)}</b><small>${h(b.strasse)} · ${h(b.plz)} ${h(b.ort)} · ${h(b.telefon)} · ${h(b.email)}<br>${h(b.uid)}</small></div><div class="meta">${meta.map(x => `<span>${h(x[0])}</span><b>${h(x[1])}</b>`).join('')}</div></div>`;
  },
  anschrift(k, ob) { return `<div class="adr">${k ? (k.firma ? h(k.firma) + '<br>' : '') + h([k.anrede, k.vorname, k.name].filter(Boolean).join(' ')) + '<br>' + h(k.strasse) + '<br>' + h(k.plz + ' ' + k.ort) : ''}${ob && ob.strasse && k && ob.strasse !== k.strasse ? '<br><small style="color:#555">Objekt: ' + h(ob.strasse + ', ' + ob.plz + ' ' + ob.ort) + '</small>' : ''}</div>`; },
  fuss(text) { const b = DB.betrieb; return `<div class="fuss"><span>${h(b.name)} · ${h(b.uid)} · ${h(b.bank || '')} ${h(BWQR.formatIban(b.iban))}</span><span>${h(text || '')}</span></div>`; },

  positionen(o, s) {
    const produkte = o.positionen.filter(p => p.art === 'produkt'); const extras = o.positionen.filter(p => ['leistung', 'paket'].includes(p.art));
    const z = (p, sub) => `<tr class="${sub ? 'sub' : ''}"><td>${h(p.name)}${!sub && p.stornierbar === false ? ' <small>(Sonderanfertigung, nicht stornierbar)</small>' : ''}${sub && p.art === 'material' ? ' <small>(Installationsmaterial)</small>' : ''}</td><td class="r">${p.menge} ${h(p.einheit)}</td><td class="r">${Fmt.chf(p.vk, false)}</td><td class="r">${Fmt.chf(p.menge * p.vk, false)}</td></tr>`;
    return `<table><thead><tr><th>Position</th><th class="r">Menge</th><th class="r">Einzel CHF</th><th class="r">Total CHF</th></tr></thead><tbody>
      <tr class="grp"><td colspan="4">A · Produkte, Installationsmaterial, Optionen</td></tr>${produkte.map(p => z(p) + o.positionen.filter(x => x.elternId === p.id).map(x => z(x, true)).join('')).join('')}
      ${extras.length ? `<tr class="grp"><td colspan="4">Zusatzleistungen ${h(DB.betrieb.name)}</td></tr>${extras.map(p => z(p)).join('')}` : ''}
      ${s.rabatt ? `<tr class="tot"><td colspan="3" class="r">Rabatt ${o.rabattProzent} %</td><td class="r">−${Fmt.chf(s.rabatt, false)}</td></tr>` : ''}
      <tr class="tot"><td colspan="3" class="r">Netto</td><td class="r">${Fmt.chf(s.netto, false)}</td></tr><tr class="tot"><td colspan="3" class="r">MWST ${Fmt.prozent(Dom.MWST)}</td><td class="r">${Fmt.chf(s.mwst, false)}</td></tr><tr class="tot end"><td colspan="3" class="r">Total inkl. MWST</td><td class="r">${Fmt.chf(s.total, false)}</td></tr>
    </tbody></table>
    ${o.montage && o.montage.length ? `<table><thead><tr><th>B · Montage durch Partnerbetrieb${o.partnerId && Q.partner(o.partnerId) ? ' – ' + h(Q.partner(o.partnerId).name) : ''} (Richtpreis)</th><th class="r">Dauer</th><th class="r">CHF</th></tr></thead><tbody>${o.montage.map(m => `<tr><td>${h(m.name)}</td><td class="r">${m.tage} ${m.tage === 1 ? 'Tag' : 'Tage'}</td><td class="r">${Fmt.chf(m.vk, false)}</td></tr>`).join('')}<tr class="tot"><td colspan="2" class="r">Richtpreis Montage (Werkvertrag mit Partnerbetrieb, separate Rechnung)</td><td class="r"><b>${Fmt.chf(s.montage, false)}</b></td></tr></tbody></table>` : ''}`;
  },

  offerte(o) {
    const k = Q.kunde(o.kundeId); const ob = Q.objekt(o.objektId); const s = Dom.summe(o); const b = DB.betrieb; const a = o.auftragId ? Q.auftrag(o.auftragId) : null;
    const kp = Dom.kritischerPfad(DB, o.positionen);
    return `<div class="a4">${Doc.kopf('Offerte', [['Offerte', o.nr], ['Datum', Fmt.datum(o.datum)], ['Gültig bis', Fmt.datum(o.gueltigBis)], ['Beratung', (Q.benutzer(o.beraterId) || {}).name || '']])}${Doc.anschrift(k, ob)}
      <h1>Offerte ${h(o.nr)}${a ? ' – Auftragsbestätigung ' + h(a.nr) : ''}</h1><p style="color:#555;margin:0 0 4mm">${h(Dom.objektText(ob))}${ob && ob.zugang ? ' · Zugang: ' + h(ob.zugang) : ''}</p>
      ${Doc.positionen(o, s)}
      <div class="box"><b>Zahlung:</b> Anzahlung ${s.anzahlungProzent} % = ${Fmt.chf(s.anzahlung)} bei Auftragserteilung (TWINT, Karte, Apple Pay oder Überweisung); Rest ${Fmt.chf(s.rest)} per QR-Rechnung, ${b.zahlungsfristTage} Tage netto nach Montage. ${kp ? '<b>Lieferung:</b> längste Lieferfrist ' + h(kp.name) + ' (' + kp.tage + ' Werktage); Montage voraussichtlich ab ' + Fmt.datum(D.plusWerktage(o.datum, kp.tage + 3)) + ', Termin nach Wareneingang online wählbar.' : ''}</div>
      <div class="bem">${h(b.agb)}</div>
      <div class="sig"><div><div class="l">${h(b.name)}, ${h((Q.benutzer(o.beraterId) || {}).name || '')}</div></div><div>${o.unterschrift && o.unterschrift.dataUrl ? `<img src="${o.unterschrift.dataUrl}" alt="Unterschrift">` : '<div style="height:16mm"></div>'}<div class="l">${o.unterschrift ? 'Auftrag erteilt: ' + h(o.unterschrift.name) + ', ' + Fmt.datum(o.unterschrift.zeit.slice(0, 10)) + ' ' + o.unterschrift.zeit.slice(11, 16) + ' Uhr, ' + h(o.unterschrift.geraet) + ', Hash ' + h(o.unterschrift.hash) : 'Ort, Datum, Unterschrift Auftraggeber'}</div></div></div>
      ${Doc.fuss('Seite 1')}</div>`;
  },

  auftragsblatt(a) {
    const k = Q.kunde(a.kundeId); const ob = Q.objekt(a.objektId); const p = Q.partner(a.partnerId); const t = Q.termin(a.terminId); const lps = Q.lagerpositionenVon(a.id);
    return `<div class="a4">${Doc.kopf('Auftragsblatt', [['Auftrag', a.nr], ['Kommission', 'K-' + a.nr.slice(-4)], ['Montage', t ? Fmt.datum(t.datum) + ' ' + t.von : 'offen'], ['Partnerbetrieb', p ? p.name : '–']])}
      <h1>Auftragsblatt Montage ${h(a.nr)}</h1>
      <div class="box"><b>Kunde:</b> ${h(Dom.kundeName(k))} · ${h(k ? k.telefon : '')} · ${h(k ? k.email : '')}<br><b>Objekt:</b> ${h(ob ? ob.strasse + ', ' + ob.plz + ' ' + ob.ort : '')} · ${h(Dom.objektText(ob))}<br><b>Zugang:</b> ${h((ob && ob.zugang) || 'gemäss Absprache')}${a.freigabeVerwaltung ? '<br><b>Verwaltung:</b> ' + h((ob && ob.verwaltung) || '') + ' – Freigabe ' + (a.freigabeVerwaltung === 'erteilt' ? 'erteilt' : 'ausstehend') : ''}<br><b>Termin:</b> ${t ? Fmt.wochentag(t.datum, true) + ', ' + Fmt.datum(t.datum) + ' ab ' + t.von + ' Uhr, ca. ' + t.dauerTage + ' ' + (t.dauerTage === 1 ? 'Tag' : 'Tage') + (t.monteur ? ' · Monteur ' + h(t.monteur) : '') : 'noch offen'}</div>
      <table><thead><tr><th>Material (Kommission K-${h(a.nr.slice(-4))})</th><th class="r">Menge</th><th>Lagerplatz</th><th>Status</th></tr></thead><tbody>${lps.map(x => `<tr><td>${h(x.name)}</td><td class="r">${x.menge}</td><td>${h(x.lagerplatz || '–')}</td><td>${Dom.statusText(x.status)}</td></tr>`).join('')}</tbody></table>
      ${a.montage.length ? `<table><thead><tr><th>Montagepositionen (Werkvertrag Kunde – Partnerbetrieb)</th><th class="r">Dauer</th><th class="r">Richtpreis CHF</th></tr></thead><tbody>${a.montage.map(m => `<tr><td>${h(m.name)}</td><td class="r">${m.tage}</td><td class="r">${Fmt.chf(m.vk, false)}</td></tr>`).join('')}</tbody></table>` : ''}
      <div class="bem">Hinweise: Wasser abstellen und Kunden informieren. Altmaterial gemäss Auftrag entsorgen${a.positionen.some(x => x.artikelId === 'Z-02') ? ' (Entsorgung ist im Auftrag enthalten)' : ' (nicht enthalten)'}. Fertigmeldung und Abnahme-Unterschrift im Monteurportal – damit wird die Schlussrechnung ausgelöst. Gewährleistung Montage: Partnerbetrieb, 2 Jahre nach SIA 118.</div>
      <div class="sig"><div><div class="l">Monteur, Datum</div></div><div>${a.abnahme && a.abnahme.dataUrl ? `<img src="${a.abnahme.dataUrl}" alt="Abnahme">` : '<div style="height:16mm"></div>'}<div class="l">${a.abnahme ? 'Abnahme: ' + h(a.abnahme.name) + ', ' + Fmt.datum(a.abnahme.zeit.slice(0, 10)) : 'Abnahme Kunde, Datum'}</div></div></div>
      ${Doc.fuss('Auftragsblatt')}</div>`;
  },

  zahlteilHtml(r) {
    const b = DB.betrieb; const k = Q.kunde(r.kundeId);
    const daten = { konto: b.iban, zahlbarAn: { name: b.name, strasse: b.strasse.replace(/\s+\d.*$/, ''), nr: (b.strasse.match(/\d.*$/) || [''])[0], plz: b.plz, ort: b.ort, land: 'CH' }, betrag: r.betrag + (r.mahngebuehr || 0), waehrung: 'CHF', zahlbarDurch: k ? { name: (k.firma || [k.vorname, k.name].filter(Boolean).join(' ')).slice(0, 70), strasse: k.strasse.replace(/\s+\d.*$/, ''), nr: (k.strasse.match(/\d.*$/) || [''])[0], plz: k.plz, ort: k.ort, land: 'CH' } : null, referenzTyp: 'QRR', referenz: r.referenz, mitteilung: 'Rechnung ' + r.nr, rechnungsinfo: '' };
    const fehler = BWQR.validateBill(daten);
    const payload = BWQR.billPayload(daten);
    const svg = BWQR.svg(payload, { ecc: 'M', swissCross: true, margin: 0, size: 174, label: 'Swiss QR Code' });
    const betrag = Fmt.chf(daten.betrag, false);
    const adr = a => a ? h(a.name) + '<br>' + h((a.strasse + ' ' + a.nr).trim()) + '<br>' + h(a.plz + ' ' + a.ort) : '';
    return `<div class="zahlteil"><div class="emp"><h4>Empfangsschein</h4><div class="l">Konto / Zahlbar an</div><div class="v">${h(BWQR.formatIban(b.iban))}<br>${adr(daten.zahlbarAn)}</div><div class="l">Referenz</div><div class="v">${h(BWQR.formatRef(r.referenz))}</div><div class="l">Zahlbar durch</div><div class="v">${adr(daten.zahlbarDurch)}</div><div class="betrag"><div><div class="l">Währung</div><div class="v">CHF</div></div><div><div class="l">Betrag</div><div class="v">${betrag}</div></div></div><div class="pf">Annahmestelle</div></div>
      <div class="zt"><div><h4>Zahlteil</h4><div class="qr">${svg}</div><div class="betrag"><div><div class="l">Währung</div><div class="v">CHF</div></div><div><div class="l">Betrag</div><div class="v">${betrag}</div></div></div></div><div><div class="l">Konto / Zahlbar an</div><div class="v">${h(BWQR.formatIban(b.iban))}<br>${adr(daten.zahlbarAn)}</div><div class="l">Referenz</div><div class="v">${h(BWQR.formatRef(r.referenz))}</div><div class="l">Zusätzliche Informationen</div><div class="v">Rechnung ${h(r.nr)}</div><div class="l">Zahlbar durch</div><div class="v">${adr(daten.zahlbarDurch)}</div>${fehler.length ? `<div class="l" style="color:#b00">Hinweis</div><div class="v" style="color:#b00">${fehler.map(h).join('<br>')}</div>` : ''}</div></div></div>`;
  },

  rechnung(r) {
    const a = Q.auftrag(r.auftragId); const k = Q.kunde(r.kundeId); const ob = Q.objekt(a.objektId); const o = Q.offerte(a.offerteId); const b = DB.betrieb;
    if (r.art === 'anzahlung') {
      return `<div class="a4">${Doc.kopf('Anzahlungsbeleg', [['Beleg', r.nr], ['Datum', Fmt.datum(r.datum)], ['Auftrag', a.nr], ['Zahlung', Dom.methodeText(r.methode) + ' · ' + (r.referenz || '')]])}${Doc.anschrift(k, ob)}<h1>Anzahlungsbeleg ${h(r.nr)}</h1>
        <table><thead><tr><th>Leistung</th><th class="r">CHF</th></tr></thead><tbody><tr><td>Anzahlung ${o ? Dom.summe(o).anzahlungProzent : 40} % auf Auftrag ${h(a.nr)} (Total ${Fmt.chf(a.total)}) gemäss Offerte ${h(o ? o.nr : '')}</td><td class="r">${Fmt.chf(r.betrag, false)}</td></tr><tr class="tot"><td class="r">davon MWST ${Fmt.prozent(Dom.MWST)}</td><td class="r">${Fmt.chf(Dom.mwstAnteil(r.betrag), false)}</td></tr><tr class="tot end"><td class="r">Bezahlt am ${Fmt.datum(r.bezahltAm.slice(0, 10))}</td><td class="r">${Fmt.chf(r.betrag, false)}</td></tr></tbody></table>
        <div class="bem">Vielen Dank. Die Schlussrechnung über den Restbetrag folgt nach der Montage.</div>${Doc.fuss('Beleg')}</div>`;
    }
    const s = o ? Dom.summe(o) : { total: r.total, netto: r.netto, mwst: r.mwst, bloecke: {}, rabatt: 0 };
    return `<div class="a4" style="padding-bottom:0">${Doc.kopf('Rechnung', [['Rechnung', r.nr], ['Datum', Fmt.datum(r.datum)], ['Leistungsdatum', Fmt.datum(r.leistungsdatum)], ['Fällig', Fmt.datum(r.faellig)], ['Auftrag', a.nr]])}${Doc.anschrift(k, ob)}<h1>Schlussrechnung ${h(r.nr)}</h1><p style="color:#555;margin:0 0 3mm">Auftrag ${h(a.nr)} · ${h(Dom.objektText(ob))} · Montage abgeschlossen am ${Fmt.datum(r.leistungsdatum)}</p>
      <table><thead><tr><th>Position</th><th class="r">CHF</th></tr></thead><tbody>
        ${o ? o.positionen.filter(p => p.art === 'produkt').map(p => `<tr><td>${p.menge > 1 ? p.menge + '× ' : ''}${h(p.name)} inkl. Installationsmaterial${o.positionen.some(x => x.elternId === p.id && x.art === 'option') ? ' und Optionen' : ''}</td><td class="r">${Fmt.chf(sum(o.positionen.filter(x => x.id === p.id || x.elternId === p.id), x => x.menge * x.vk), false)}</td></tr>`).join('') + o.positionen.filter(p => ['leistung', 'paket'].includes(p.art)).map(p => `<tr><td>${h(p.name)}</td><td class="r">${Fmt.chf(p.menge * p.vk, false)}</td></tr>`).join('') : ''}
        ${s.rabatt ? `<tr class="tot"><td class="r">Rabatt</td><td class="r">−${Fmt.chf(s.rabatt, false)}</td></tr>` : ''}
        <tr class="tot"><td class="r">Netto</td><td class="r">${Fmt.chf(s.netto, false)}</td></tr><tr class="tot"><td class="r">MWST ${Fmt.prozent(Dom.MWST)} (${h(b.uid)})</td><td class="r">${Fmt.chf(s.mwst, false)}</td></tr><tr class="tot"><td class="r">Total inkl. MWST</td><td class="r">${Fmt.chf(s.total, false)}</td></tr>
        <tr class="tot"><td class="r">Abzüglich Anzahlung vom ${Fmt.datum((a.anzahlung || {}).zeit ? a.anzahlung.zeit.slice(0, 10) : '')}</td><td class="r">−${Fmt.chf(r.anzahlungVerrechnet, false)}</td></tr>${r.mahngebuehr ? `<tr class="tot"><td class="r">Mahngebühren</td><td class="r">${Fmt.chf(r.mahngebuehr, false)}</td></tr>` : ''}<tr class="tot end"><td class="r">Zu zahlen bis ${Fmt.datum(r.faellig)}</td><td class="r">${Fmt.chf(r.betrag + (r.mahngebuehr || 0), false)}</td></tr></tbody></table>
      <div class="bem">Zahlbar innert ${b.zahlungsfristTage} Tagen netto per QR-Zahlteil. Garantie 2 Jahre auf Produkte ab Lieferung; Montagegewährleistung durch ${h((Q.partner(a.partnerId) || {}).name || 'Partnerbetrieb')} (SIA 118). ${h((b.agb.match(/Bei Zahlungsverzug[^.]*\.[^.]*\./) || [''])[0])}</div>
      ${Doc.zahlteilHtml(r)}</div>`;
  },

  qrbogen(a) {
    const k = Q.kunde(a.kundeId); const lps = Q.lagerpositionenVon(a.id);
    return `<div class="a4">${Doc.kopf('QR-Bogen', [['Auftrag', a.nr], ['Kommission', 'K-' + a.nr.slice(-4)], ['Kunde', Dom.kundeName(k)], ['Positionen', String(lps.length)]])}<h1>QR-Bogen Wareneingang · ${h(a.nr)}</h1><p style="color:#555;margin:0 0 5mm">Je Bestellposition ein Code. Mit der Lager-App (Code 98765) oder der Handy-Kamera scannen – die Position wird dem Auftrag zugebucht und erscheint am PC.</p>
      <div class="qr-grid">${lps.map(x => { const b = Q.bestellung(x.bestellungId); return `<div class="qr-card">${BWQR.svg(Mail.link('scan', x.code), { size: 150, margin: 1, ecc: 'M' })}<b>${x.menge > 1 ? x.menge + '× ' : ''}${h(x.name)}</b><small>${h(x.code)} · ${h((Q.lieferant((b || {}).lieferantId) || {}).kuerzel || '')}</small></div>`; }).join('')}</div>${Doc.fuss('QR-Bogen')}</div>`;
  }
};

Act.doc = {
  offerte(el) { const o = Q.offerte(el.dataset.id); if (o) Doc.zeigen(Doc.offerte(o), 'Offerte ' + o.nr); },
  auftragsblatt(el) { const a = Q.auftrag(el.dataset.id); if (a) Doc.zeigen(Doc.auftragsblatt(a), 'Auftragsblatt ' + a.nr); },
  rechnung(el) { const r = Q.rechnung(el.dataset.id); if (r) Doc.zeigen(Doc.rechnung(r), (r.art === 'anzahlung' ? 'Anzahlungsbeleg ' : 'Rechnung ') + r.nr); },
  qrbogen(el) { const a = Q.auftrag(el.dataset.id); if (a) Doc.zeigen(Doc.qrbogen(a), 'QR-Bogen ' + a.nr); }
};
