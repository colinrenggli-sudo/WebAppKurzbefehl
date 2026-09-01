/* ==================================================================
   70 · Tablet-Offerte
   Sechs Schritte, ein Bildschirm pro Schritt, der Preis immer rechts:
     1 Kunde und Objekt · 2 Produkte · 3 Extras · 4 Offerte
     5 Unterschrift · 6 Anzahlung
   Die Bausteine 4–6 verwendet auch das Kundenportal (85-portale.js).
   Der Entwurf liegt in DB.offerten (status entwurf) und ueberlebt
   Neuladen und Geraetewechsel.
   ================================================================== */
const Tablet = {
  SCHRITTE: [['Kunde', 'Kunde und Objekt'], ['Produkte', 'Produkte wählen'], ['Extras', 'Optionen und Zusatzleistungen'], ['Offerte', 'Zusammenfassung'], ['Unterschrift', 'Unterschrift'], ['Anzahlung', 'Zahlung']],

  aktuelle() { return S.ui.offerteId ? Q.offerte(S.ui.offerteId) : null; },

  /** Einstieg: neue Offerte, bestehender Entwurf oder Offerte per ID. */
  render(rest) {
    if (rest[0]) { const o = Q.offerte(rest[0]); if (o) { S.ui.offerteId = o.id; S.ui.schritt = S.ui.schritt || Math.min(o.schritt || 1, 6); } }
    const o = Tablet.aktuelle();
    if (!o) return Tablet.startseite();
    const s = S.ui.schritt || o.schritt || 1;
    const inhalt = s === 1 ? Tablet.s1(o) : s === 2 ? Tablet.s2(o) : s === 3 ? Tablet.s3(o) : s === 4 ? Tablet.s4(o) : s === 5 ? Tablet.s5(o) : Tablet.s6(o);
    const k = Q.kunde(o.kundeId);
    const sum = Dom.summe(o);
    const gesperrt = ['angezahlt', 'unterschrieben'].includes(o.status);
    return `<div class="tab-wrap">
      <div class="tab-main">
        <div class="tab-head">
          <button class="btn ghost icon" data-act="offerte.verlassen" aria-label="Zur Konsole">${ic('i-zurueck')}</button>
          <div style="min-width:0;flex:1"><h1>${h(o.nr)}${k ? ' · ' + h(Dom.kundeName(k)) : ' · Neue Offerte'}</h1><div class="sub">${h(Tablet.SCHRITTE[s - 1][1])} · ${Dom.statusText(o.status)}</div></div>
          <div class="steps">${Tablet.SCHRITTE.map((x, i) => `<button class="step ${i + 1 < s ? 'done' : i + 1 === s ? 'now' : ''}" data-act="offerte.schritt" data-n="${i + 1}" ${(i + 1 > 4 && !gesperrt && s < 4) || (gesperrt && i + 1 < 4) ? 'disabled' : ''}><span class="n">${i + 1 < s ? '✓' : i + 1}</span>${x[0]}</button>`).join('')}</div>
          <button class="btn ghost icon" data-act="offerte.cart" aria-label="Warenkorb" style="display:none" id="cartBtn">${ic('i-liste')}</button>
        </div>
        <div class="tab-body" id="tabBody">${inhalt}</div>
        <div class="tab-foot">
          ${s > 1 && !gesperrt ? `<button class="btn ghost" data-act="offerte.zurueck">${ic('i-zurueck')} Zurück</button>` : ''}
          <div style="flex:1"></div>
          <div style="text-align:right;margin-right:8px"><div style="font-size:12px;color:var(--txt-3)">Total inkl. MWST</div><div class="num" style="font-weight:760;font-size:18px">${Fmt.chf(sum.total)}</div></div>
          ${s < 4 ? `<button class="btn primary" data-act="offerte.weiter" ${s === 1 && !o.kundeId && !S.ui.form ? '' : ''}>Weiter ${ic('i-weiter')}</button>` : ''}
          ${s === 4 && o.status !== 'angezahlt' ? `<button class="btn soft" data-act="offerte.senden">${ic('i-mail')} Per E-Mail senden</button><button class="btn primary" data-act="offerte.schritt" data-n="5">${ic('i-unterschrift')} Unterschreiben</button>` : ''}
          ${s === 4 && o.status === 'angezahlt' ? `<button class="btn primary" data-act="nav.gehe" data-r="auftrag/${h(o.auftragId)}">Auftrag öffnen ${ic('i-weiter')}</button>` : ''}
        </div>
      </div>
      <aside class="tab-cart ${S.ui.cartOffen ? 'offen' : ''}">${Tablet.cart(o)}</aside>
    </div>`;
  },

  startseite() {
    const entwuerfe = DB.offerten.filter(o => o.status === 'entwurf');
    const heute = D.heute();
    const termine = DB.showroomTermine.filter(t => t.datum === heute && t.status !== 'abgesagt');
    return `<div class="tab-wrap" style="grid-template-columns:1fr"><div class="tab-main">
      <div class="tab-head"><button class="btn ghost icon" data-act="offerte.verlassen">${ic('i-zurueck')}</button><div><h1>Neue Offerte</h1><div class="sub">Tablet-Modus · ${h(DB.betrieb.name)}</div></div></div>
      <div class="tab-body"><div class="pg" style="max-width:900px">
        <button class="pcard" style="min-height:auto;flex-direction:row;align-items:center;gap:16px" data-act="offerte.start"><span class="ic">${ic('i-plus')}</span><span><span class="ttl">Neue Offerte beginnen</span><span class="sub" style="display:block">Kunde erfassen oder wählen, Objekt beschreiben, Produkte tippen.</span></span></button>
        ${termine.length ? `<div class="sec-h"><h3>Showroom-Termine heute</h3></div><div class="pgrid two">${termine.map(t => `<button class="pcard small" data-act="offerte.start" data-kunde="${h(t.kundeId || '')}" data-name="${h(t.kundeName)}"><span class="ic">${ic('i-showroom')}</span><span class="ttl">${h(t.von)} · ${h(t.kundeName)}</span><span class="sub">${h(t.thema || '')}</span></button>`).join('')}</div>` : ''}
        ${entwuerfe.length ? `<div class="sec-h"><h3>Entwürfe fortsetzen</h3></div><div class="pgrid two">${entwuerfe.map(o => { const k = Q.kunde(o.kundeId); return `<button class="pcard small" data-act="offerte.oeffnen" data-id="${h(o.id)}"><span class="ic">${ic('i-doc')}</span><span class="ttl">${h(o.nr)} · ${h(k ? Dom.kundeName(k) : 'ohne Kunde')}</span><span class="sub">Schritt ${o.schritt || 1} · ${Fmt.chf(Dom.summe(o).total)} · ${Fmt.relativ(o.datum)}</span></button>`; }).join('')}</div>` : ''}
      </div></div></div></div>`;
  },

  /* ------------------------------------------------ Warenkorb rechts */
  cart(o) {
    const s = Dom.summe(o);
    const ich = Q.ich(); const marge = ich && ich.rolle === 'inhaber';
    const produkte = o.positionen.filter(p => p.art === 'produkt');
    const extras = o.positionen.filter(p => p.art === 'leistung' || p.art === 'paket');
    const zeile = (p, sub) => `<div class="cart-i ${sub ? 'sub' : ''}">${sub ? '' : `<span class="ic">${ic((Q.artikel(p.artikelId) || {}).icon || 'i-paket')}</span>`}<span class="bd"><b>${p.menge > 1 ? p.menge + '× ' : ''}${h(p.name)}</b><small>${sub ? (p.art === 'material' ? 'immer benötigt' : p.art === 'option' ? 'Option' : '') : (Dom.LIEFERART[p.lieferart] || '') + (p.stornierbar === false ? ' · nicht stornierbar' : '')}${p.vorschlag && p.grund ? ' · ' + h(p.grund) : ''}</small></span><span class="amt">${Fmt.chf(p.menge * p.vk, false)}</span>${!sub && (S.ui.schritt || 1) < 4 ? `<button class="btn ghost icon sm" data-act="offerte.entfernen" data-id="${p.id}" aria-label="Entfernen">${ic('i-x')}</button>` : ''}</div>`;
    return `<div class="cart-h"><h3>Offerte ${h(o.nr)}</h3><small>${produkte.length} Produkte · ${o.positionen.length} Positionen</small></div>
      <div class="cart-b">${o.positionen.length ? produkte.map(p => zeile(p) + o.positionen.filter(x => x.elternId === p.id).map(x => zeile(x, true)).join('')).join('') + extras.map(p => zeile(p)).join('') : `<div class="empty" style="padding:30px 10px"><span class="ic">${ic('i-badewanne')}</span><b>Noch leer</b><p>Produkte antippen – das Installationsmaterial hängt sich automatisch an.</p></div>`}
      ${o.montage.length ? `<div class="cart-i"><span class="ic">${ic('i-werkzeug')}</span><span class="bd"><b>Montage durch Partnerbetrieb</b><small>Richtpreis, Werkvertrag mit Betrieb – separate Rechnung</small></span><span class="amt" style="color:var(--txt-3)">${Fmt.chf(s.montage, false)}</span></div>` : ''}</div>
      <div class="cart-f">
        <div class="cart-tot"><span>Produkte</span><span class="amt">${Fmt.chf(s.bloecke.produkte, false)}</span></div>
        <div class="cart-tot"><span>Installationsmaterial</span><span class="amt">${Fmt.chf(s.bloecke.material, false)}</span></div>
        <div class="cart-tot"><span>Optionen und Extras</span><span class="amt">${Fmt.chf(s.bloecke.optionen + s.bloecke.leistungen, false)}</span></div>
        ${s.rabatt ? `<div class="cart-tot"><span>Rabatt ${o.rabattProzent} %</span><span class="amt">−${Fmt.chf(s.rabatt, false)}</span></div>` : ''}
        <div class="cart-tot"><span>davon MWST ${Fmt.prozent(Dom.MWST)}</span><span class="amt">${Fmt.chf(s.mwst, false)}</span></div>
        <div class="cart-tot big"><span>Total</span><span class="amt">${Fmt.chf(s.total)}</span></div>
        <div class="cart-tot"><span>Anzahlung ${s.anzahlungProzent} %</span><span class="amt">${Fmt.chf(s.anzahlung, false)}</span></div>
        ${marge ? `<div class="cart-tot" style="color:var(--ok-txt)"><span>Marge (nur Inhaber)</span><span class="amt">${Fmt.chf(s.marge, false)} · ${s.margeProzent} %</span></div>` : ''}
      </div>`;
  },

  /* ------------------------------------------ Schritt 1: Kunde, Objekt */
  s1(o) {
    const f = S.ui.form || Tablet.formAus(o);
    S.ui.form = f;
    const kunden = DB.kunden.slice().sort((a, b) => (b.erstellt || '').localeCompare(a.erstellt || ''));
    const oc = (k, v, t, sub, icon) => `<button class="ocard" data-act="offerte.feld" data-k="${k}" data-v="${h(v)}" aria-pressed="${String(f[k]) === String(v)}"><span class="ic">${ic(icon || 'i-haus')}</span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</button>`;
    return `<div class="pg" style="max-width:1100px">
      <div class="card"><div class="card-h"><h3>Kunde</h3><div class="seg"><button data-act="offerte.kundeModus" data-v="wahl" aria-selected="${f.modus !== 'neu'}">Bestehend</button><button data-act="offerte.kundeModus" data-v="neu" aria-selected="${f.modus === 'neu'}">Neu erfassen</button></div></div>
      <div class="card-b">${f.modus === 'neu' ? `<div class="grid g3">
          <div class="field"><label>Anrede</label><select class="inp" data-change="offerte.feld" data-k="anrede">${['Frau', 'Herr', 'Familie', 'Herr und Frau', ''].map(x => `<option ${f.anrede === x ? 'selected' : ''} value="${x}">${x || '–'}</option>`).join('')}</select></div>
          <div class="field"><label>Vorname</label><input class="inp" data-input="offerte.feld" data-k="vorname" value="${h(f.vorname)}"></div>
          <div class="field"><label>Name <span class="req">*</span></label><input class="inp" data-input="offerte.feld" data-k="name" value="${h(f.name)}"></div>
          <div class="field"><label>Firma / Verwaltung</label><input class="inp" data-input="offerte.feld" data-k="firma" value="${h(f.firma)}"></div>
          <div class="field"><label>Kundentyp</label><select class="inp" data-change="offerte.feld" data-k="typ">${[['privat', 'Privat'], ['stwe', 'Stockwerkeigentum'], ['geschaeft', 'Geschäft / Verwaltung']].map(x => `<option value="${x[0]}" ${f.typ === x[0] ? 'selected' : ''}>${x[1]}</option>`).join('')}</select></div>
          <div class="field"><label>Herkunft</label><select class="inp" data-change="offerte.feld" data-k="partnerId"><option value="">Showroom direkt</option>${DB.partner.map(p => `<option value="${p.id}" ${f.partnerId === p.id ? 'selected' : ''}>Partner: ${h(p.name)}</option>`).join('')}<option value="web" ${f.partnerId === 'web' ? 'selected' : ''}>Website</option><option value="empfehlung" ${f.partnerId === 'empfehlung' ? 'selected' : ''}>Empfehlung</option></select></div>
          <div class="field"><label>Strasse</label><input class="inp" data-input="offerte.feld" data-k="strasse" value="${h(f.strasse)}"></div>
          <div class="field"><label>PLZ / Ort</label><div class="row"><input class="inp" style="width:90px" data-input="offerte.feld" data-k="plz" value="${h(f.plz)}"><input class="inp" style="flex:1" data-input="offerte.feld" data-k="ort" value="${h(f.ort)}"></div></div>
          <div class="field"><label>E-Mail</label><input class="inp" type="email" data-input="offerte.feld" data-k="email" value="${h(f.email)}"></div>
          <div class="field"><label>Telefon</label><input class="inp" data-input="offerte.feld" data-k="telefon" value="${h(f.telefon)}"></div>
        </div>` : `<div class="row" style="margin-bottom:10px"><div class="search" style="flex:1;max-width:360px">${ic('i-suche')}<input class="inp" placeholder="Kunde suchen" data-input="offerte.suche" value="${h(f.suche || '')}"></div></div>
        <div class="pgrid">${kunden.filter(k => !f.suche || esc(Dom.kundeName(k) + ' ' + k.ort).includes(esc(f.suche))).slice(0, 12).map(k => `<button class="pcard small" data-act="offerte.kunde" data-id="${k.id}" aria-pressed="${f.kundeId === k.id}"><span class="chk">${ic('i-check')}</span><span class="ic">${ic(k.firma ? 'i-fabrik' : 'i-mann')}</span><span class="ttl">${h(Dom.kundeName(k))}</span><span class="sub">${h(k.strasse)}, ${h(k.plz)} ${h(k.ort)}${k.partnerId && Q.partner(k.partnerId) ? '<br>via ' + h(Q.partner(k.partnerId).name) : ''}</span></button>`).join('')}</div>`}</div></div>

      <div class="card"><div class="card-h"><h3>Objekt – sechs Angaben, die etwas auslösen</h3></div><div class="card-b stack">
        <div><div class="lbl" style="margin-bottom:8px">Gebäudetyp</div><div class="ogrid">${oc('gebaeudetyp', 'efh', 'Einfamilienhaus', 'auch Reihen-EFH', 'i-haus')}${oc('gebaeudetyp', 'mfh', 'Wohnung im MFH', 'Miete oder Eigentum', 'i-wohnung')}${oc('gebaeudetyp', 'stwe', 'Stockwerkeigentum', 'Eigentümergemeinschaft', 'i-wohnung')}${oc('gebaeudetyp', 'gewerbe', 'Gewerbe', 'Praxis, Büro, Hotel', 'i-fabrik')}</div></div>
        <div class="grid g2">
          <div><div class="lbl" style="margin-bottom:8px">Stockwerk und Lift</div><div class="row"><div class="stepnum"><button class="btn icon" data-act="offerte.stockwerk" data-n="-1">−</button><span class="val"><b>${f.stockwerk === 0 ? 'EG' : f.stockwerk + '. OG'}</b></span><button class="btn icon" data-act="offerte.stockwerk" data-n="1">+</button></div>
            <div class="seg"><button data-act="offerte.feld" data-k="lift" data-v="true" aria-selected="${f.lift === true || f.lift === 'true'}">Lift</button><button data-act="offerte.feld" data-k="lift" data-v="false" aria-selected="${!(f.lift === true || f.lift === 'true')}">Kein Lift</button></div></div>
            ${(f.stockwerk >= 1 && !(f.lift === true || f.lift === 'true')) ? `<span class="hint" style="color:var(--warn-txt)">→ Etagenlieferung wird vorgeschlagen</span>` : ''}</div>
          <div><div class="lbl" style="margin-bottom:8px">Neubau oder Sanierung</div><div class="ogrid">${oc('art', 'sanierung', 'Sanierung', 'Altmaterial fällt an', 'i-werkzeug')}${oc('art', 'neubau', 'Neubau', 'Rohbau-Variante', 'i-plus')}</div></div>
          <div><div class="lbl" style="margin-bottom:8px">Baujahr</div><div class="ogrid">${oc('baujahrVor1990', 'true', 'vor 1990', 'Anschlussmasse prüfen', 'i-zurueck-uhr')}${oc('baujahrVor1990', 'false', 'ab 1990', 'Standardmasse', 'i-check')}</div></div>
          <div><div class="lbl" style="margin-bottom:8px">Eigentum oder Miete</div><div class="ogrid">${oc('eigentum', 'eigentum', 'Eigentum', '', 'i-schluessel')}${oc('eigentum', 'miete', 'Miete', 'Freigabe der Verwaltung nötig', 'i-wohnung')}</div>
            ${f.eigentum === 'miete' ? `<div class="field" style="margin-top:8px"><label>Verwaltung</label><input class="inp" data-input="offerte.feld" data-k="verwaltung" value="${h(f.verwaltung || '')}" placeholder="Name der Verwaltung"></div>` : ''}</div>
        </div>
        <div class="grid g2"><div class="field"><label>Zugang, Parkplatz, Schlüssel</label><input class="inp" data-input="offerte.feld" data-k="zugang" value="${h(f.zugang || '')}" placeholder="z. B. Parkplatz blaue Zone, Schlüssel bei Nachbarin"></div>
          <div class="field"><label>Montage durch Partnerbetrieb</label><select class="inp" data-change="offerte.feld" data-k="montagePartnerId"><option value="">noch offen</option>${DB.partner.map(p => `<option value="${p.id}" ${f.montagePartnerId === p.id ? 'selected' : ''}>${h(p.name)}, ${h(p.ort)}${p.modell === 'plus' ? ' · Partner Plus' : ''}</option>`).join('')}</select></div></div>
      </div></div>
    </div>`;
  },

  formAus(o) {
    const k = Q.kunde(o.kundeId); const ob = Q.objekt(o.objektId) || (k ? Q.objekt(k.objektId) : null);
    return Object.assign({ modus: k ? 'wahl' : (DB.kunden.length ? 'wahl' : 'neu'), kundeId: k ? k.id : null, anrede: 'Frau', vorname: '', name: '', firma: '', typ: 'privat', strasse: '', plz: '', ort: '', email: '', telefon: '', partnerId: '', suche: '',
      gebaeudetyp: 'efh', stockwerk: 0, lift: false, art: 'sanierung', baujahrVor1990: 'false', eigentum: 'eigentum', verwaltung: '', zugang: '', montagePartnerId: o.partnerId || '' },
      ob ? { gebaeudetyp: ob.gebaeudetyp, stockwerk: ob.stockwerk || 0, lift: !!ob.lift, art: ob.art, baujahrVor1990: String(!!ob.baujahrVor1990), eigentum: ob.eigentum || 'eigentum', verwaltung: ob.verwaltung || '', zugang: ob.zugang || '' } : {});
  },

  /** Schritt 1 sichern: Kunde und Objekt anlegen oder nachfuehren. */
  s1Sichern(o) {
    const f = S.ui.form; if (!f) return true;
    if (f.modus === 'neu' && !f.name.trim()) { UI.toast('Bitte mindestens den Namen erfassen', 'warn'); return false; }
    if (f.modus !== 'neu' && !f.kundeId) { UI.toast('Bitte einen Kunden wählen oder neu erfassen', 'warn'); return false; }
    Store.aendern('', db => {
      let k;
      if (f.modus === 'neu') {
        k = { id: uid('k'), nr: Dom.nrNeu(db, 'kunde'), anrede: f.anrede, vorname: f.vorname.trim(), name: f.name.trim(), firma: f.firma.trim(), typ: f.typ, strasse: f.strasse.trim(), plz: f.plz.trim(), ort: f.ort.trim(), email: f.email.trim(), telefon: f.telefon.trim(), herkunft: f.partnerId && f.partnerId.startsWith('P-') ? 'partner' : (f.partnerId || 'showroom'), partnerId: f.partnerId && f.partnerId.startsWith('P-') ? f.partnerId : null, notiz: '', erstellt: D.jetztIso() };
        db.kunden.push(k);
        Store.log('kunde', 'Kunde ' + Dom.kundeName(k) + ' erfasst', null, '👤');
      } else k = db.kunden.find(x => x.id === f.kundeId);
      let ob = db.objekte.find(x => x.id === o.objektId) || db.objekte.find(x => x.id === k.objektId);
      if (!ob) { ob = { id: uid('ob'), kundeId: k.id, bezeichnung: 'Bad', strasse: k.strasse, plz: k.plz, ort: k.ort }; db.objekte.push(ob); k.objektId = ob.id; }
      Object.assign(ob, { gebaeudetyp: f.gebaeudetyp, stockwerk: +f.stockwerk || 0, lift: f.lift === true || f.lift === 'true', art: f.art, baujahrVor1990: f.baujahrVor1990 === 'true', eigentum: f.eigentum, verwaltung: f.verwaltung || '', zugang: f.zugang || '' });
      const of = db.offerten.find(x => x.id === o.id);
      of.kundeId = k.id; of.objektId = ob.id; of.partnerId = f.montagePartnerId || (k.partnerId || null); of.herkunft = k.herkunft; of.schritt = Math.max(of.schritt || 1, 2);
    }, false);
    return true;
  },

  /* --------------------------------------------- Schritt 2: Produkte */
  s2(o) {
    const kat = S.ui.kat || 'badewanne';
    const liste = DB.artikel.filter(a => a.kategorie === kat);
    const imKorb = id => o.positionen.filter(p => p.art === 'produkt' && p.artikelId === id);
    return `<div class="stack">
      <div class="steps" style="gap:6px">${Dom.KATEGORIEN.map(c => { const n = o.positionen.filter(p => p.art === 'produkt' && (Q.artikel(p.artikelId) || {}).kategorie === c.k).length; return `<button class="step ${kat === c.k ? 'now' : ''}" data-act="offerte.kat" data-k="${c.k}"><span class="n">${ic(c.i)}</span>${c.t}${n ? ' · ' + n : ''}</button>`; }).join('')}</div>
      <div class="pgrid">${liste.map(a => { const pos = imKorb(a.id); const l = Q.lieferant(a.lieferantId); const frist = Dom.lieferfrist(DB, a); return `
        <button class="pcard ${a.top ? 'empf' : ''}" data-act="offerte.produkt" data-id="${a.id}" aria-pressed="${pos.length > 0}">
          <span class="chk">${ic('i-check')}</span>${a.top ? '<span class="tag top">Beliebt</span>' : a.stornierbar === false ? '<span class="tag">nach Mass</span>' : ''}
          <span class="ic" style="margin-top:${a.top || a.stornierbar === false ? '18px' : '0'}">${ic(a.icon || 'i-paket')}</span>
          <span class="ttl">${h(a.name)}</span>
          <span class="sub">${h(a.text || '')}<br>${l ? h(l.name) + ' · ' : ''}${frist} Werktage${(a.stueckliste || []).length ? ' · ' + a.stueckliste.length + ' Teile Material inkl.' : ''}</span>
          <span class="prc">${Fmt.chf(a.vk)}${(a.stueckliste || []).length ? `<small>+ Material ${Fmt.chf(sum(a.stueckliste, s => (Q.artikel(s.artikelId) || {}).vk || 0), false)}</small>` : ''}</span>
          ${pos.length ? `<span class="qty" data-stop><button class="btn soft" data-act="offerte.menge" data-id="${pos[0].id}" data-n="-1">−</button><b>${pos[0].menge}</b><button class="btn soft" data-act="offerte.menge" data-id="${pos[0].id}" data-n="1">+</button></span>` : ''}
        </button>`; }).join('')}</div>
    </div>`;
  },

  /* ---------------------------------------------- Schritt 3: Extras */
  s3(o) {
    const ich = Q.ich(); const marge = ich && ich.rolle === 'inhaber';
    const produkte = o.positionen.filter(p => p.art === 'produkt');
    const vorschlaege = Dom.vorschlaege(DB, o);
    const hat = id => o.positionen.some(p => p.artikelId === id && (p.art === 'leistung' || p.art === 'paket'));
    const inPaket = id => o.positionen.some(p => p.art === 'paket' && ((Q.artikel(p.artikelId) || {}).enthaelt || []).includes(id));
    const mg = (vk, ek) => marge && vk ? `<span class="marge">${Math.round((vk - ek) / vk * 100)} % Marge</span>` : '';
    const row = (o2) => `<button class="opt-row" data-act="${o2.act}" ${o2.data} aria-pressed="${o2.an}"><span class="bx">${ic('i-check')}</span><span class="bd"><b>${h(o2.name)}${o2.top ? ' <span class="chip tint" style="font-size:10.5px;padding:1px 7px">Beliebt</span>' : ''}</b><small>${h(o2.text || '')}${o2.grund ? ' · <span style="color:var(--tint-txt);font-weight:600">' + h(o2.grund) + '</span>' : ''}</small></span>${mg(o2.vk, o2.ek)}<span class="amt">${o2.vk ? '+ ' + Fmt.chf(o2.vk, false) : ''}</span></button>`;
    return `<div class="pg" style="max-width:1000px">
      ${produkte.length ? produkte.map(p => { const a = Q.artikel(p.artikelId) || {}; const opts = a.optionen || []; if (!opts.length) return ''; return `<div class="card"><div class="card-h"><h3>${ic(a.icon || 'i-paket')} ${h(p.name)}</h3><span class="chip">Optionen</span></div><div class="card-b">${opts.map(op => row({ act: 'offerte.option', data: `data-pos="${p.id}" data-opt="${op.id}"`, an: o.positionen.some(x => x.elternId === p.id && x.optionId === op.id), name: op.name, text: (op.text || '') + (op.lieferart === 'manufaktur' ? ' · Manufaktur' : ''), vk: op.aufpreis, ek: op.ek || op.aufpreis * 0.55, top: op.top })).join('')}</div></div>`; }).join('') : `<div class="banner warn"><span class="ic">${ic('i-info')}</span><div><b>Noch keine Produkte</b> – im Schritt «Produkte» antippen.</div></div>`}
      ${vorschlaege.length ? `<div class="card"><div class="card-h"><h3>${ic('i-funken')} Vorschläge aus dem Objektkontext</h3><span class="chip tint">${h(Dom.objektText(Q.objekt(o.objektId)))}</span></div><div class="card-b">${vorschlaege.map(v => { const a = Q.artikel(v.artikelId); return row({ act: 'offerte.vorschlag', data: `data-id="${a.id}" data-menge="${v.menge}" data-grund="${h(v.grund)}"`, an: hat(a.id) || o.positionen.some(p => p.artikelId === a.id), name: a.name + (v.menge > 1 ? ' × ' + v.menge : ''), text: a.text, grund: v.grund, vk: a.vk * v.menge, ek: (a.ek || 0) * v.menge }); }).join('')}</div></div>` : ''}
      <div class="card"><div class="card-h"><h3>${ic('i-stern')} Pakete</h3><span class="chip ok">sparen gegenüber Einzelpreis</span></div><div class="card-b"><div class="pakete">${DB.artikel.filter(a => a.kategorie === 'paket').map(a => `<button class="paket ${a.top ? 'empf' : ''}" data-act="offerte.leistung" data-id="${a.id}" aria-pressed="${hat(a.id)}"><b>${h(a.name)}</b><span class="p">${Fmt.chf(a.vk)} <small style="font-size:12px;color:var(--txt-3);text-decoration:line-through">${Fmt.chf(a.einzelpreis, false)}</small></span><ul>${(a.enthaelt || []).map(id => `<li>${h((Q.artikel(id) || {}).name || id)}</li>`).join('')}</ul>${mg(a.vk, a.ek)}</button>`).join('')}</div></div></div>
      <div class="card"><div class="card-h"><h3>${ic('i-funken')} Zusatzleistungen</h3><span class="chip">Showroom-Leistungen</span></div><div class="card-b">${DB.artikel.filter(a => a.kategorie === 'leistung' && !vorschlaege.some(v => v.artikelId === a.id)).map(a => row({ act: 'offerte.leistung', data: `data-id="${a.id}"`, an: hat(a.id), name: a.name, text: a.text + (inPaket(a.id) ? ' · im gewählten Paket enthalten' : ''), vk: a.vk, ek: a.ek, top: a.top })).join('')}</div></div>
      <div class="card"><div class="card-h"><h3>${ic('i-werkzeug')} Montage durch Partnerbetrieb</h3><span class="chip">Block B · separate Rechnung</span></div><div class="card-b">
        <div class="field" style="max-width:420px;margin-bottom:10px"><label>Partnerbetrieb</label><select class="inp" data-change="offerte.partner"><option value="">noch offen</option>${DB.partner.map(p => `<option value="${p.id}" ${o.partnerId === p.id ? 'selected' : ''}>${h(p.name)}, ${h(p.ort)}${p.modell === 'plus' ? ' · Partner Plus' : ''}</option>`).join('')}</select></div>
        ${o.montage.length ? `<div class="po-lines">${o.montage.map(m => `<div class="po-line"><span><b>${h(m.name)}</b><small>Richtpreis · ${m.tage} ${m.tage === 1 ? 'Tag' : 'Tage'}</small></span><span class="amt">${Fmt.chf(m.vk)}</span></div>`).join('')}<div class="po-line"><span><b>Richtpreis Montage total</b><small>Werkvertrag zwischen Kunde und Partnerbetrieb, Gewährleistung SIA 118 · nicht in unserer Offerte enthalten</small></span><span class="amt"><b>${Fmt.chf(sum(o.montage, m => m.vk))}</b></span></div></div>` : '<p style="color:var(--txt-3);font-size:13.5px">Richtpreise erscheinen, sobald Produkte gewählt sind.</p>'}
      </div></div>
    </div>`;
  },

  /* ---------------------------------- Schritt 4: Zusammenfassung */
  s4(o, portal) {
    const k = Q.kunde(o.kundeId); const ob = Q.objekt(o.objektId); const s = Dom.summe(o); const b = DB.betrieb;
    const produkte = o.positionen.filter(p => p.art === 'produkt');
    const extras = o.positionen.filter(p => p.art === 'leistung' || p.art === 'paket');
    const li = (p, sub) => `<div class="po-line" style="${sub ? 'padding-left:18px;color:var(--txt-2)' : ''}"><span><b style="${sub ? 'font-weight:500' : ''}">${p.menge > 1 ? p.menge + ' ' + h(p.einheit) + ' ' : ''}${h(p.name)}</b>${!sub && p.stornierbar === false ? '<small>Sonderanfertigung, nicht stornierbar</small>' : ''}${sub && p.art === 'material' ? '<small>Installationsmaterial, immer benötigt</small>' : ''}${p.vorschlag && p.grund ? '<small>' + h(p.grund) + '</small>' : ''}</span><span class="amt">${Fmt.chf(p.menge * p.vk, false)}</span></div>`;
    const kp = Dom.kritischerPfad(DB, o.positionen);
    return `<div class="pg" style="max-width:900px">
      <div class="po-hero"><div class="eyebrow">Offerte ${h(o.nr)} · ${Fmt.datum(o.datum)} · gültig bis ${Fmt.datum(o.gueltigBis)}</div><h1>${h(Dom.kundeName(k))}</h1><p>${h(k ? k.strasse + ', ' + k.plz + ' ' + k.ort : '')}<br>${h(Dom.objektText(ob))}${ob && ob.zugang ? '<br>Zugang: ' + h(ob.zugang) : ''}</p></div>
      <div class="card pad"><div class="po-lines">
        <div class="po-line" style="border-bottom:2px solid var(--txt)"><b>A · Produkte, Installationsmaterial, Optionen</b><span class="amt"></span></div>
        ${produkte.map(p => li(p) + o.positionen.filter(x => x.elternId === p.id).map(x => li(x, true)).join('')).join('')}
        ${extras.length ? `<div class="po-line" style="border-bottom:2px solid var(--txt);margin-top:10px"><b>Zusatzleistungen ${h(b.name)}</b><span class="amt"></span></div>${extras.map(p => li(p)).join('')}` : ''}
        ${s.rabatt ? `<div class="po-line"><span>Rabatt ${o.rabattProzent} %</span><span class="amt">−${Fmt.chf(s.rabatt, false)}</span></div>` : ''}
        <div class="po-line"><span>Netto</span><span class="amt">${Fmt.chf(s.netto, false)}</span></div>
        <div class="po-line"><span>MWST ${Fmt.prozent(Dom.MWST)}</span><span class="amt">${Fmt.chf(s.mwst, false)}</span></div>
        <div class="po-line total"><span>Total inkl. MWST</span><span class="amt">${Fmt.chf(s.total)}</span></div>
        <div class="po-line" style="color:var(--tint-txt)"><span><b>Anzahlung ${s.anzahlungProzent} % bei Auftragserteilung</b><small>Rest ${Fmt.chf(s.rest)} per QR-Rechnung, ${b.zahlungsfristTage} Tage netto nach Montage</small></span><span class="amt"><b>${Fmt.chf(s.anzahlung)}</b></span></div>
        ${o.montage.length ? `<div class="po-line" style="border-bottom:2px solid var(--txt);margin-top:14px"><b>B · Montage durch Partnerbetrieb${o.partnerId && Q.partner(o.partnerId) ? ' – ' + h(Q.partner(o.partnerId).name) : ''}</b><span class="amt"></span></div>${o.montage.map(m => `<div class="po-line"><span><b style="font-weight:500">${h(m.name)}</b></span><span class="amt">${Fmt.chf(m.vk, false)}</span></div>`).join('')}<div class="po-line"><span><b>Richtpreis Montage</b><small>Werkvertrag mit dem Partnerbetrieb, separate Rechnung, Gewährleistung 2 Jahre nach SIA 118</small></span><span class="amt"><b>${Fmt.chf(s.montage)}</b></span></div>` : ''}
      </div></div>
      <div class="card pad" style="font-size:13px;color:var(--txt-2);line-height:1.55">
        <b style="color:var(--txt)">Lieferung und Termin.</b> ${kp ? 'Längste Lieferfrist: ' + h(kp.name) + ' (' + kp.tage + ' Werktage). Frühester Montagetermin voraussichtlich ab ' + Fmt.datum(D.plusWerktage(D.heute(), kp.tage + 3)) + '.' : ''} Sobald alle Positionen bei uns eingetroffen sind, wählen Sie Ihren Montagetermin online.<br>
        <b style="color:var(--txt)">Bedingungen.</b> ${h(b.agb)}<br>
        <b style="color:var(--txt)">Datenschutz.</b> Ihre Angaben verwenden wir ausschliesslich zur Abwicklung dieses Auftrags (revDSG).
      </div>
      ${o.unterschrift ? `<div class="pay-ok">${ic('i-haken-kreis')}<span>Unterschrieben am ${Fmt.datum(o.unterschrift.zeit.slice(0, 10))} um ${o.unterschrift.zeit.slice(11, 16)} Uhr von ${h(o.unterschrift.name)} · Dokument-Hash ${h(o.unterschrift.hash)}</span></div>` : ''}
      ${o.zahlung ? `<div class="pay-ok">${ic('i-haken-kreis')}<span>Anzahlung ${Fmt.chf(o.zahlung.betrag)} per ${Dom.methodeText(o.zahlung.methode)} eingegangen · Auftrag ${h((Q.auftrag(o.auftragId) || {}).nr || '')}</span></div>` : ''}
      ${!portal && (S.ui.schritt || 1) === 4 && o.status === 'entwurf' ? `<div class="row" style="justify-content:flex-end"><label class="lbl">Rabatt %</label><input class="inp" style="width:80px" type="number" min="0" max="20" value="${o.rabattProzent || 0}" data-change="offerte.rabatt"><button class="btn ghost" data-act="doc.offerte" data-id="${o.id}">${ic('i-drucken')} Drucken / PDF</button></div>` : ''}
    </div>`;
  },

  /* ------------------------------------------ Schritt 5: Unterschrift */
  s5(o, portal) {
    const k = Q.kunde(o.kundeId); const s = Dom.summe(o);
    if (o.unterschrift) return `<div class="pg" style="max-width:720px"><div class="po-ok"><span class="ic">${ic('i-check')}</span><h2>Unterschrieben</h2><p>${h(o.unterschrift.name)} hat die Offerte ${h(o.nr)} am ${Fmt.datum(o.unterschrift.zeit.slice(0, 10))} unterschrieben.</p><button class="btn primary lg" data-act="offerte.schritt" data-n="6">Weiter zur Anzahlung ${ic('i-weiter')}</button></div></div>`;
    return `<div class="pg" style="max-width:720px">
      <div class="po-hero"><div class="eyebrow">Offerte ${h(o.nr)}</div><h1>Auftrag erteilen</h1><p>Total ${Fmt.chf(s.total)} inkl. MWST · Anzahlung ${Fmt.chf(s.anzahlung)} jetzt, Rest nach der Montage.</p></div>
      <div class="card pad stack">
        <label class="opt-row" style="cursor:pointer"><input type="checkbox" id="sigAgb" style="width:22px;height:22px"><span class="bd"><b>Ich habe Offerte, Zahlungsbedingungen und Garantiehinweise gelesen und erteile den Auftrag.</b><small>Kein gesetzliches Widerrufsrecht bei Bestellung im Showroom. Sonderanfertigungen sind nicht stornierbar.</small></span></label>
        <div class="field"><label>Name der unterzeichnenden Person</label><input class="inp" id="sigName" value="${h(Dom.kundeName(k))}"></div>
        <div><div class="lbl" style="margin-bottom:6px">Unterschrift</div><div class="sig-box" id="sigBox"><canvas id="sigCanvas"></canvas><span class="hint">Mit dem Finger oder Stift unterschreiben</span><button class="btn ghost sm x" data-act="offerte.sigClear">Löschen</button></div></div>
        <div class="row" style="justify-content:flex-end"><button class="btn primary lg" data-act="offerte.unterschreiben">${ic('i-unterschrift')} Unterschreiben und weiter</button></div>
        <p style="font-size:12px;color:var(--txt-3)">Die Unterschrift wird mit Zeitstempel, Gerät und Dokument-Hash gespeichert (einfache elektronische Signatur, OR 11: Kauf- und Werkverträge sind formfrei). Sie erhalten die unterschriebene Offerte als PDF per E-Mail.</p>
      </div></div>`;
  },
  sigStart() {
    const c = $('#sigCanvas'); if (!c) return;
    Tablet._sig = BWCap.signature(c, { farbe: '#1a2a6c' });
    c.addEventListener('pointerdown', () => $('#sigBox').classList.add('filled'), { once: true });
  },

  /* --------------------------------------------- Schritt 6: Zahlung */
  s6(o, portal) {
    const s = Dom.summe(o); const b = DB.betrieb;
    if (o.zahlung) {
      const a = Q.auftrag(o.auftragId); const bs = a ? Q.bestellungenVon(a.id) : [];
      return `<div class="pg" style="max-width:720px"><div class="po-ok"><span class="ic">${ic('i-check')}</span><h2>Anzahlung eingegangen – vielen Dank!</h2><p>${Fmt.chf(o.zahlung.betrag)} per ${Dom.methodeText(o.zahlung.methode)}. ${a ? 'Der Auftrag ' + h(a.nr) + ' ist angelegt, ' + bs.length + ' Bestellungen sind an die Lieferanten unterwegs, die QR-Codes fürs Lager sind erzeugt.' : ''}</p>
        ${a && !portal ? `<div class="row"><button class="btn primary lg" data-act="nav.gehe" data-r="auftrag/${h(a.id)}">Auftrag öffnen</button><button class="btn lg" data-act="nav.gehe" data-r="post">Postausgang</button><button class="btn ghost lg" data-act="offerte.neu">Neue Offerte</button></div>` : ''}
        ${portal ? `<p>Sie erhalten die Auftragsbestätigung per E-Mail. Sobald alles eingetroffen ist, wählen Sie hier Ihren Montagetermin.</p>` : ''}</div></div>`;
    }
    const art = S.ui.zahlart || 'twint';
    const twintOk = s.anzahlung <= 5000;
    const payload = b.stripeLink ? b.stripeLink + (b.stripeLink.includes('?') ? '&' : '?') + 'client_reference_id=' + encodeURIComponent(o.nr) : 'twint://pay?amount=' + s.anzahlung.toFixed(2) + '&currency=CHF&ref=' + encodeURIComponent(o.nr) + '&merchant=' + encodeURIComponent(b.name);
    return `<div class="pg" style="max-width:720px">
      <div class="po-hero"><div class="eyebrow">Anzahlung ${s.anzahlungProzent} %</div><h1>${Fmt.chf(s.anzahlung)}</h1><p>Rest ${Fmt.chf(s.rest)} per QR-Rechnung nach der Montage. ${b.stripeLink ? 'Zahlung über Stripe.' : 'Demo-Zahlung: nichts wird belastet.'}</p></div>
      <div class="pay-tabs">${[['twint', 'TWINT'], ['karte', 'Karte / Apple Pay'], ['spaeter', 'Später per Link']].map(x => `<button class="pay-tab" data-act="offerte.zahlart" data-v="${x[0]}" aria-selected="${art === x[0]}">${x[0] === 'twint' ? ic('i-twint') : x[0] === 'karte' ? ic('i-karte-kredit') : ic('i-mail')} ${x[1]}</button>`).join('')}</div>
      <div class="card pad stack">
        ${art === 'twint' ? (twintOk ? `<div class="twint-box">${BWQR.svg(payload, { size: 180, margin: 2 })}<b>Mit der TWINT-App scannen</b><small>${Fmt.chf(s.anzahlung)} an ${h(b.name)} · Referenz ${h(o.nr)}<br>Gebühr für den Showroom: ${Fmt.chf(Dom.gebuehr('twint', s.anzahlung))} (1.9 % + 0.30)</small></div>
          <button class="btn primary lg wide" data-act="offerte.zahlen" data-m="twint">${ic('i-check')} Zahlung bestätigen (Demo)</button>`
          : `<div class="banner warn"><span class="ic">${ic('i-warn')}</span><div><b>TWINT ist auf CHF 5'000 pro Zahlung begrenzt.</b> Anzahlung ${Fmt.chf(s.anzahlung)}: bitte Karte wählen oder aufteilen (TWINT CHF 5'000 + Karte ${Fmt.chf(s.anzahlung - 5000)}).</div></div><button class="btn primary lg wide" data-act="offerte.zahlen" data-m="split">${ic('i-check')} Aufteilen und bezahlen (Demo)</button>`)
        : art === 'karte' ? `<button class="btn lg wide" style="background:#000;color:#fff;border-color:#000" data-act="offerte.zahlen" data-m="applepay"> Pay</button>
          <div class="pay-card"><div class="field wide"><label>Kartennummer</label><input class="inp" id="payNr" inputmode="numeric" placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242"></div><div class="field"><label>Gültig bis</label><input class="inp" id="payExp" placeholder="12/34" value="12/34"></div><div class="field"><label>CVC</label><input class="inp" id="payCvc" placeholder="123" value="123"></div><div class="field wide"><label>Name auf der Karte</label><input class="inp" id="payName" value="${h(Dom.kundeName(Q.kunde(o.kundeId)))}"></div></div>
          <button class="btn primary lg wide" data-act="offerte.zahlen" data-m="karte">${ic('i-karte-kredit')} ${Fmt.chf(s.anzahlung)} bezahlen</button>
          <p style="font-size:12px;color:var(--txt-3)">Testkarten: 4242 4242 4242 4242 gelingt · 4000 0000 0000 0002 wird abgelehnt. Gebühr für den Showroom: ${Fmt.chf(Dom.gebuehr('karte', s.anzahlung))} (2.9 % + 0.30).</p>`
        : `<p style="font-size:14px;color:var(--txt-2);line-height:1.5">Der Kunde erhält einen Link per E-Mail und bezahlt die Anzahlung zu Hause per TWINT oder Karte – oder überweist. Die Bestellungen gehen erst nach Zahlungseingang raus.</p><button class="btn primary lg wide" data-act="offerte.zahlungslink">${ic('i-mail')} Zahlungslink senden</button><button class="btn lg wide" data-act="offerte.zahlen" data-m="ueberweisung">${ic('i-franken')} Überweisung eingegangen (manuell)</button>`}
      </div></div>`;
  }
};

Desk.seiten.offerte = rest => Tablet.render(rest);
Desk.titel.offerte = 'Neue Offerte';
Desk.nachZeichnen.offerte = () => {
  if ((S.ui.schritt || 1) === 5) Tablet.sigStart();
  const body = $('#tabBody'); if (body && S.ui.scroll) { body.scrollTop = S.ui.scroll; S.ui.scroll = 0; }
};

Object.assign(Act.offerte, {
  start(el) {
    const kundeId = el && el.dataset.kunde;
    let id;
    Store.aendern('', db => {
      const ich = Q.ich();
      const k = kundeId ? db.kunden.find(x => x.id === kundeId) : null;
      const o = Dom.offerteNeu(db, { kundeId: k ? k.id : null, objektId: k ? k.objektId : null, beraterId: ich ? ich.id : null, partnerId: k ? k.partnerId : null, herkunft: k ? k.herkunft : 'showroom' });
      id = o.id;
      Store.log('offerte', 'Offerte ' + o.nr + ' begonnen' + (k ? ' für ' + Dom.kundeName(k) : ''), null, '📝');
    }, false);
    S.ui = { offerteId: id, schritt: 1 };
    Nav.gehe('offerte/' + id);
    if (location.hash === '#/offerte/' + id) Nav.zeichnen();
  },
  oeffnen(el) { S.ui = { offerteId: el.dataset.id, schritt: null }; Nav.gehe('offerte/' + el.dataset.id); },
  neu() { S.ui = {}; Nav.gehe('offerte'); if (location.hash === '#/offerte') Nav.zeichnen(); },
  verlassen() { S.ui = {}; Nav.gehe('offerten'); },
  schritt(el) { const n = +el.dataset.n; const o = Tablet.aktuelle(); if (!o) return; if ((S.ui.schritt || 1) === 1 && n > 1 && !Tablet.s1Sichern(o)) return; S.ui.schritt = n; S.ui.form = null; Store.aendern('', db => { const x = db.offerten.find(y => y.id === o.id); if (x && x.status === 'entwurf') x.schritt = Math.max(x.schritt || 1, Math.min(n, 4)); }, false); Nav.zeichnen(); },
  weiter() { const o = Tablet.aktuelle(); const s = S.ui.schritt || 1; if (s === 1 && !Tablet.s1Sichern(o)) return; if (s === 2 && !o.positionen.some(p => p.art === 'produkt')) { UI.toast('Bitte mindestens ein Produkt wählen', 'warn'); return; } Act.offerte.schritt({ dataset: { n: s + 1 } }); },
  zurueck() { const s = S.ui.schritt || 1; if (s > 1) Act.offerte.schritt({ dataset: { n: s - 1 } }); },
  cart() { S.ui.cartOffen = !S.ui.cartOffen; Nav.zeichnen(); },
  kundeModus(el) { S.ui.form.modus = el.dataset.v; Nav.zeichnen(); },
  kunde(el) { S.ui.form.kundeId = el.dataset.id; const k = Q.kunde(el.dataset.id); const ob = k && Q.objekt(k.objektId); if (ob) Object.assign(S.ui.form, { gebaeudetyp: ob.gebaeudetyp, stockwerk: ob.stockwerk || 0, lift: !!ob.lift, art: ob.art, baujahrVor1990: String(!!ob.baujahrVor1990), eigentum: ob.eigentum || 'eigentum', verwaltung: ob.verwaltung || '', zugang: ob.zugang || '' }); if (k && k.partnerId && !S.ui.form.montagePartnerId) S.ui.form.montagePartnerId = k.partnerId; Nav.zeichnen(); },
  suche(el) { S.ui.form.suche = el.value; const liste = el.closest('.card-b').querySelector('.pgrid'); if (liste) { const f = S.ui.form; liste.innerHTML = DB.kunden.filter(k => !f.suche || esc(Dom.kundeName(k) + ' ' + k.ort).includes(esc(f.suche))).slice(0, 12).map(k => `<button class="pcard small" data-act="offerte.kunde" data-id="${k.id}" aria-pressed="${f.kundeId === k.id}"><span class="chk">${ic('i-check')}</span><span class="ic">${ic(k.firma ? 'i-fabrik' : 'i-mann')}</span><span class="ttl">${h(Dom.kundeName(k))}</span><span class="sub">${h(k.strasse)}, ${h(k.plz)} ${h(k.ort)}</span></button>`).join(''); } },
  feld(el) { const k = el.dataset.k; const v = el.dataset.v != null ? el.dataset.v : el.value; S.ui.form[k] = v; if (el.dataset.v != null || el.tagName === 'SELECT' || k === 'eigentum') Nav.zeichnen(); },
  stockwerk(el) { S.ui.form.stockwerk = clamp((+S.ui.form.stockwerk || 0) + (+el.dataset.n), 0, 8); Nav.zeichnen(); },
  kat(el) { S.ui.kat = el.dataset.k; Nav.zeichnen(); },
  produkt(el, ev) {
    if (ev && ev.target.closest('[data-stop]')) return;
    const o = Tablet.aktuelle(); const id = el.dataset.id; S.ui.scroll = $('#tabBody').scrollTop;
    const vorhanden = o.positionen.find(p => p.art === 'produkt' && p.artikelId === id);
    Store.aendern('', db => { const x = db.offerten.find(y => y.id === o.id); if (vorhanden) Dom.produktEntfernen(x, vorhanden.id); else Dom.produktHinzufuegen(db, x, id, 1); }, false);
    Nav.zeichnen();
  },
  menge(el, ev) { ev.stopPropagation(); const o = Tablet.aktuelle(); S.ui.scroll = $('#tabBody').scrollTop; Store.aendern('', db => { const x = db.offerten.find(y => y.id === o.id); const p = x.positionen.find(y => y.id === el.dataset.id); if (!p) return; const n = p.menge + (+el.dataset.n); if (n <= 0) Dom.produktEntfernen(x, p.id); else Dom.mengeSetzen(x, p.id, n); }, false); Nav.zeichnen(); },
  entfernen(el) { const o = Tablet.aktuelle(); Store.aendern('', db => { const x = db.offerten.find(y => y.id === o.id); const p = x.positionen.find(y => y.id === el.dataset.id); if (!p) return; if (p.art === 'produkt') Dom.produktEntfernen(x, p.id); else x.positionen = x.positionen.filter(y => y.id !== p.id); }, false); Nav.zeichnen(); },
  option(el) { const o = Tablet.aktuelle(); S.ui.scroll = $('#tabBody').scrollTop; const an = el.getAttribute('aria-pressed') !== 'true'; Store.aendern('', db => { Dom.optionSetzen(db, db.offerten.find(y => y.id === o.id), el.dataset.pos, el.dataset.opt, an); }, false); Nav.zeichnen(); },
  leistung(el) { const o = Tablet.aktuelle(); S.ui.scroll = $('#tabBody').scrollTop; const an = el.getAttribute('aria-pressed') !== 'true'; Store.aendern('', db => { Dom.leistungSetzen(db, db.offerten.find(y => y.id === o.id), el.dataset.id, an, 1); }, false); Nav.zeichnen(); },
  vorschlag(el) { const o = Tablet.aktuelle(); S.ui.scroll = $('#tabBody').scrollTop; const an = el.getAttribute('aria-pressed') !== 'true'; Store.aendern('', db => { const x = db.offerten.find(y => y.id === o.id); const a = db.artikel.find(y => y.id === el.dataset.id); if (a.kategorie === 'material') { const v = x.positionen.find(p => p.artikelId === a.id); if (an && !v) x.positionen.push(Dom.posAusArtikel(a, +el.dataset.menge || 1, { art: 'leistung', vorschlag: true, grund: el.dataset.grund })); else if (!an && v) x.positionen = x.positionen.filter(p => p !== v); } else Dom.leistungSetzen(db, x, a.id, an, +el.dataset.menge || 1, el.dataset.grund); }, false); Nav.zeichnen(); },
  partner(el) { const o = Tablet.aktuelle(); Store.aendern('', db => { db.offerten.find(y => y.id === o.id).partnerId = el.value || null; }, false); },
  rabatt(el) { const o = Tablet.aktuelle(); Store.aendern('', db => { db.offerten.find(y => y.id === o.id).rabattProzent = clamp(+el.value || 0, 0, 20); }, false); Nav.zeichnen(); },
  senden() { const o = Tablet.aktuelle(); const k = Q.kunde(o.kundeId); if (!k || !k.email) { UI.toast('Kunde hat keine E-Mail-Adresse', 'warn'); return; } Store.aendern('Offerte per E-Mail gesendet', db => { Dom.offerteSenden(db, db.offerten.find(y => y.id === o.id)); }); Nav.zeichnen(); },
  sigClear() { if (Tablet._sig) Tablet._sig.clear(); $('#sigBox').classList.remove('filled'); },
  unterschreiben() {
    const o = Tablet.aktuelle();
    if (!$('#sigAgb').checked) { UI.toast('Bitte die Bedingungen bestätigen', 'warn'); $('#sigAgb').focus(); return; }
    if (!Tablet._sig || Tablet._sig.leer()) { UI.toast('Bitte unterschreiben', 'warn'); return; }
    const name = $('#sigName').value.trim() || Dom.kundeName(Q.kunde(o.kundeId));
    const dataUrl = Tablet._sig.toDataURL();
    Store.aendern('Offerte unterschrieben', db => { const x = db.offerten.find(y => y.id === o.id); if (x.status === 'entwurf') Dom.offerteSenden(db, x); Dom.unterschreiben(db, x, { name, dataUrl, geraet: S.shell === 'portal' ? 'Kundenportal' : 'Tablet Showroom' }); });
    S.ui.schritt = 6; Nav.zeichnen();
  },
  zahlart(el) { S.ui.zahlart = el.dataset.v; Nav.zeichnen(); },
  zahlen(el) {
    const o = Tablet.aktuelle(); const m = el.dataset.m; const s = Dom.summe(o);
    if (m === 'karte') { const nr = ($('#payNr').value || '').replace(/\s/g, ''); if (nr === '4000000000000002') { UI.toast('Karte abgelehnt – bitte andere Karte verwenden', 'err'); return; } if (nr.length < 12) { UI.toast('Kartennummer prüfen', 'warn'); return; } }
    UI.toast(m === 'ueberweisung' ? 'Zahlungseingang erfasst' : 'Zahlung wird verarbeitet …', 'ok', { undo: false });
    setTimeout(() => {
      Store.aendern('Anzahlung eingegangen – Auftrag angelegt', db => { const x = db.offerten.find(y => y.id === o.id); if (!x.unterschrift) Dom.unterschreiben(db, x, { name: Dom.kundeName(db.kunden.find(k => k.id === x.kundeId)), geraet: 'Zahlung ohne Unterschrift' }); Dom.anzahlungBezahlt(db, x, { methode: m === 'split' ? 'twint' : m, betrag: s.anzahlung }); });
      S.ui.schritt = 6; Nav.zeichnen();
    }, 700);
  },
  zahlungslink() { const o = Tablet.aktuelle(); const k = Q.kunde(o.kundeId); Store.aendern('Zahlungslink gesendet', db => { const x = db.offerten.find(y => y.id === o.id); Mail.anlegen(db, { an: k && k.email, anName: Dom.kundeName(k), art: 'kunde-offerte', betreff: 'Anzahlung für Ihren Auftrag ' + x.nr, text: Mail.brief(anrede(k), ['vielen Dank für Ihre Unterschrift. Bitte begleichen Sie die Anzahlung von ' + Fmt.chf(Dom.summe(x).anzahlung) + ' bequem per TWINT oder Karte:\n' + Mail.link('k', x.token), 'Sobald die Zahlung eingegangen ist, bestellen wir Ihre Produkte.']) }); Store.log('offerte', 'Zahlungslink an ' + Dom.kundeName(k) + ' gesendet', null, '🔗'); }); Nav.gehe('offerten'); }
});
