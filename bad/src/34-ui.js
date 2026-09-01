/* ==================================================================
   13 · Oberflaechenbausteine — Hinweise, Dialoge, Blaetter
   ================================================================== */
const UI = {
  _toasts: [],
  toast(text, art, opt) {
    opt = opt || {};
    const host = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + (art || '');
    const sym = art === 'err' ? 'i-warn' : art === 'warn' ? 'i-warn' : art === 'ok' ? 'i-check' : 'i-info';
    el.innerHTML = `<span class="ic">${ic(sym)}</span><span>${h(text)}</span>` +
      (opt.undo ? '<button class="un" data-act="store.undo">Rückgängig</button>' : '');
    host.appendChild(el);
    const weg = () => { el.classList.add('out'); setTimeout(() => el.remove(), 240); };
    setTimeout(weg, opt.undo ? 4200 : 2600);
    el.addEventListener('click', e => { if (e.target.closest('[data-act]')) weg(); });
    while (host.children.length > 3) host.firstChild.remove();
  },

  /**
   * Dialog. inhalt ist HTML, aktionen ein Array von
   * {text, art, act, schliesst}. Gibt ein Handle mit .zu() zurueck.
   */
  dialog(o) {
    const host = $('#ovlHost');
    const w = document.createElement('div');
    w.className = 'ovl';
    w.innerHTML = `
      <div class="dlg ${o.weite || ''}" role="dialog" aria-modal="true" aria-label="${h(o.titel || '')}">
        <div class="sheet-grab"></div>
        <div class="dlg-h">
          <div style="flex:1;min-width:0">
            <h3>${h(o.titel || '')}</h3>
            ${o.unter ? `<div class="sub">${h(o.unter)}</div>` : ''}
          </div>
          <button class="btn ghost icon" data-zu aria-label="Schliessen">${ic('i-x')}</button>
        </div>
        <div class="dlg-b">${o.inhalt || ''}</div>
        ${(o.aktionen && o.aktionen.length) ? `<div class="dlg-f">${o.aktionen.map((a, i) =>
      `<button class="btn ${a.art || ''}" data-i="${i}">${h(a.text)}</button>`).join('')}</div>` : ''}
      </div>`;
    host.appendChild(w);
    const zu = () => { w.remove(); document.removeEventListener('keydown', tast); if (o.beimSchliessen) o.beimSchliessen(); };
    const tast = e => { if (e.key === 'Escape') zu(); };
    document.addEventListener('keydown', tast);
    w.addEventListener('click', e => {
      if (e.target === w || e.target.closest('[data-zu]')) return zu();
      const b = e.target.closest('.dlg-f [data-i]');
      if (b) {
        const a = o.aktionen[+b.dataset.i];
        if (a.fn) { if (a.fn(w) === false) return; }
        if (a.schliesst !== false) zu();
      }
    });
    setTimeout(() => { const f = w.querySelector('[autofocus],input,select,textarea,button'); if (f) f.focus(); }, 60);
    if (o.beimOeffnen) o.beimOeffnen(w);
    return { el: w, zu };
  },

  bestaetigen(titel, text, okText, art) {
    return new Promise(res => {
      UI.dialog({
        titel, weite: 'slim',
        inhalt: `<p style="font-size:14.5px;line-height:1.5;color:var(--txt-2)">${h(text)}</p>`,
        aktionen: [
          { text: 'Abbrechen', fn: () => res(false) },
          { text: okText || 'Ja, weiter', art: art || 'primary', fn: () => res(true) }
        ],
        beimSchliessen: () => res(false)
      });
    });
  },

  /** Kleines Formular als Dialog. felder: [{k, label, typ, wert, optionen, pflicht, hint, breit}] */
  formular(titel, felder, okText) {
    return new Promise(res => {
      const inhalt = '<div class="grid g2">' + felder.map(f => {
        const id = 'ff-' + f.k;
        let ein;
        if (f.typ === 'select') ein = `<select class="inp" id="${id}">${(f.optionen || []).map(o =>
          `<option value="${h(o.v != null ? o.v : o)}"${(f.wert == (o.v != null ? o.v : o)) ? ' selected' : ''}>${h(o.t || o)}</option>`).join('')}</select>`;
        else if (f.typ === 'textarea') ein = `<textarea class="inp" id="${id}" placeholder="${h(f.platzhalter || '')}">${h(f.wert || '')}</textarea>`;
        else if (f.typ === 'schalter') ein = `<label class="sw"><input type="checkbox" id="${id}"${f.wert ? ' checked' : ''}><i></i></label>`;
        else ein = `<input class="inp" id="${id}" type="${f.typ || 'text'}" value="${h(f.wert != null ? f.wert : '')}" placeholder="${h(f.platzhalter || '')}"${f.schritt ? ` step="${f.schritt}"` : ''}>`;
        return `<div class="field" style="${f.breit ? 'grid-column:1/-1' : ''}">
          <label for="${id}">${h(f.label)}${f.pflicht ? ' <span class="req">*</span>' : ''}</label>
          ${ein}${f.hint ? `<span class="hint">${h(f.hint)}</span>` : ''}</div>`;
      }).join('') + '</div>';
      UI.dialog({
        titel, inhalt,
        aktionen: [
          { text: 'Abbrechen', fn: () => res(null) },
          {
            text: okText || 'Speichern', art: 'primary', fn: w => {
              const out = {}; let fehlt = null;
              felder.forEach(f => {
                const e = w.querySelector('#ff-' + f.k);
                let v = f.typ === 'schalter' ? e.checked : e.value;
                if (f.typ === 'number') v = v === '' ? null : Number(v);
                if (f.pflicht && (v === '' || v == null)) { fehlt = fehlt || e; e.classList.add('err'); }
                out[f.k] = v;
              });
              if (fehlt) { fehlt.focus(); UI.toast('Bitte die markierten Felder ausfüllen', 'warn'); return false; }
              res(out);
            }
          }
        ],
        beimSchliessen: () => res(null)
      });
    });
  }
};
