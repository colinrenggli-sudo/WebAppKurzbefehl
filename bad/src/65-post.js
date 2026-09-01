/* ==================================================================
   65 · Konsole: Postausgang
   Jede Mail der App – von Hand oder aus einer Automation – liegt hier.
   Entwuerfe (Kundenverzug, Mahnungen, Nachfassen) werden gelesen,
   angepasst und freigegeben; Gesendetes ist der Nachweis. Links zu
   den Portalen im Text lassen sich direkt oeffnen – so laesst sich
   jede Gegenseite in der Vorfuehrung zeigen.
   ================================================================== */
const Post = {
  eintrag(m, aktiv) {
    return `<button class="mail-i" data-act="post.oeffnen" data-id="${m.id}" aria-current="${!!aktiv}"><span class="ic ${m.ki ? 'ki' : m.automatisch ? 'auto' : ''}">${ic(m.ki ? 'i-ki' : m.automatisch ? 'i-blitz' : 'i-mail')}</span><span class="bd"><b>${h(m.betreff)}</b><small>${h(m.anName || m.an)} · ${h(Mail.artText(m.art))}${m.status === 'entwurf' ? ' · <span style="color:var(--warn-txt);font-weight:600">Entwurf</span>' : ''}</small></span><span class="rt">${Fmt.datum(m.zeit.slice(0, 10))}<br>${m.zeit.slice(11, 16)}</span></button>`;
  },
  /** Links im Text klickbar machen (Portale, Zahlungslink). */
  textHtml(t) {
    return h(t).replace(/(https?:\/\/[^\s<]+|file:\/\/[^\s<]+)/g, u => `<a href="${u}" target="_blank" rel="noopener" style="word-break:break-all">${u}</a>`);
  },
  FILTER: [['alle', 'Alle'], ['entwurf', 'Entwürfe'], ['auto', 'Automatisch'], ['kunde', 'Kunden'], ['lieferant', 'Lieferanten'], ['partner', 'Partner']],
  passt(m, f) {
    if (f === 'alle') return true; if (f === 'entwurf') return m.status === 'entwurf'; if (f === 'auto') return m.automatisch;
    if (f === 'kunde') return /^kunde|rechnung|bewertung|offerte/.test(m.art); if (f === 'lieferant') return /bestellung|mahnung|ab-erinnerung|eskalation|schaden/.test(m.art); if (f === 'partner') return /monteur|partner|showroom/.test(m.art);
    return true;
  }
};

Desk.seiten.post = rest => {
  const f = S.ui.pf || (S.ui.pf = { filter: 'alle', suche: '' });
  const liste = DB.post.filter(m => Post.passt(m, f.filter)).filter(m => !f.suche || esc(m.betreff + ' ' + m.anName + ' ' + m.an).includes(esc(f.suche)));
  const id = rest[0] || (liste[0] || {}).id;
  const m = Q.mail(id);
  const entw = DB.post.filter(x => x.status === 'entwurf').length;
  Desk.tools(`<button class="btn" data-act="post.neu">${ic('i-plus')} Neue E-Mail</button>`);
  return `<div class="pg">
    <div class="row wrap"><div class="seg">${Post.FILTER.map(x => `<button data-act="post.filter" data-v="${x[0]}" aria-selected="${f.filter === x[0]}">${x[1]}${x[0] === 'entwurf' && entw ? ' (' + entw + ')' : ''}</button>`).join('')}</div><div class="tb-sp"></div><div class="search">${ic('i-suche')}<input class="inp" placeholder="Betreff, Empfänger" value="${h(f.suche)}" data-input="post.suche"></div></div>
    <div class="banner"><span class="ic">${ic('i-info')}</span><div><b>Demo ohne Mailserver.</b> Jede Mail landet hier statt beim Empfänger. «Im Mailprogramm öffnen» übergibt sie an Apple Mail oder Outlook; die Links im Text öffnen die Portale der Gegenseite.</div></div>
    <div class="mail-split">
      <div class="mail-l">${liste.length ? liste.slice(0, 60).map(x => Post.eintrag(x, x.id === id)).join('') : '<div class="empty"><b>Keine Mails</b><p>In dieser Ansicht gibt es nichts.</p></div>'}</div>
      ${m ? Post.ansicht(m) : ''}
    </div></div>`;
};
Desk.titel.post = 'Postausgang';

Post.ansicht = m => {
  const a = Q.auftrag(m.auftragId); const b = Q.bestellung(m.bestellungId);
  const entwurf = m.status === 'entwurf';
  return `<div class="mail-v">
    <div class="row wrap" style="gap:8px">${m.ki ? `<span class="ki-hinweis">${ic('i-ki')} KI-Entwurf – bitte vor dem Senden prüfen</span>` : ''}${m.automatisch && !m.ki ? '<span class="chip lila">automatisch</span>' : ''}<span class="chip st st-${entwurf ? 'entwurf' : 'gesendet'}">${entwurf ? 'Entwurf' : 'gesendet ' + Fmt.datum((m.gesendetAm || m.zeit).slice(0, 10)) + ' ' + (m.gesendetAm || m.zeit).slice(11, 16)}</span><span class="chip">${h(Mail.artText(m.art))}</span></div>
    <h3>${h(m.betreff)}</h3>
    <div class="hd"><b>An</b><span>${h(m.anName || '')} ${m.an ? '&lt;' + h(m.an) + '&gt;' : ''}</span><b>Von</b><span>${h(DB.betrieb.name)} &lt;${h(m.von)}&gt;</span>${a ? `<b>Auftrag</b><span><a href="#/auftrag/${a.id}">${h(a.nr)}</a> · ${h(Dom.kundeName(Q.kunde(a.kundeId)))}</span>` : ''}${b ? `<b>Bestellung</b><span>${h(b.nr)} · ${h((Q.lieferant(b.lieferantId) || {}).name || '')}</span>` : ''}${m.anhaenge && m.anhaenge.length ? `<b>Anhänge</b><span>${m.anhaenge.map(x => '📎 ' + h(x)).join(' · ')}</span>` : ''}</div>
    ${entwurf ? `<textarea class="inp" id="mailText" data-change="post.bearbeiten" data-id="${m.id}">${h(m.text)}</textarea>` : `<pre>${Post.textHtml(m.text)}</pre>`}
    <div class="row wrap" style="gap:8px">
      ${entwurf ? `<button class="btn primary" data-act="post.senden" data-id="${m.id}">${ic('i-check')} Freigeben und senden</button><button class="btn ghost danger" data-act="post.verwerfen" data-id="${m.id}">Verwerfen</button>` : ''}
      <a class="btn" href="${h(Mail.mailto(m))}">${ic('i-mail')} Im Mailprogramm öffnen</a>
      ${b && b.token ? `<a class="btn ghost" href="${h(Mail.link('l', b.token))}" target="_blank" rel="noopener">${ic('i-link')} Lieferantenportal</a>` : ''}
      ${a && /^kunde|rechnung|bewertung/.test(m.art) ? `<a class="btn ghost" href="${h(Mail.link('k', a.token))}" target="_blank" rel="noopener">${ic('i-link')} Kundenportal</a>` : ''}
      ${m.art === 'monteur' && a && Q.termin(a.terminId) ? `<a class="btn ghost" href="${h(Mail.link('m', Q.termin(a.terminId).token))}" target="_blank" rel="noopener">${ic('i-link')} Monteurportal</a>` : ''}
    </div></div>`;
};

Act.post = {
  filter(el) { S.ui.pf.filter = el.dataset.v; Nav.gehe('post'); Nav.zeichnen(); },
  suche(el) { S.ui.pf.suche = el.value; const l = $('.mail-l'); if (!l) return; const f = S.ui.pf; const liste = DB.post.filter(m => Post.passt(m, f.filter)).filter(m => !f.suche || esc(m.betreff + ' ' + m.anName + ' ' + m.an).includes(esc(f.suche))); l.innerHTML = liste.slice(0, 60).map(x => Post.eintrag(x, false)).join('') || '<div class="empty"><b>Keine Treffer</b></div>'; },
  oeffnen(el) { Nav.gehe('post/' + el.dataset.id); },
  bearbeiten(el) { Store.aendern('', db => { const m = db.post.find(x => x.id === el.dataset.id); if (m) m.text = el.value; }, false); },
  senden(el) { const t = $('#mailText'); if (t) Store.aendern('', db => { const m = db.post.find(x => x.id === el.dataset.id); if (m) m.text = t.value; }, false); Mail.senden(el.dataset.id); Nav.zeichnen(); },
  async verwerfen(el) { if (!await UI.bestaetigen('Entwurf verwerfen', 'Der Entwurf wird gelöscht. Die Automation erzeugt ihn nicht erneut.', 'Verwerfen', 'danger')) return; Store.aendern('Entwurf verworfen', db => { db.post = db.post.filter(x => x.id !== el.dataset.id); }); Nav.gehe('post'); Nav.zeichnen(); },
  async neu() {
    const w = await UI.formular('Neue E-Mail', [{ k: 'an', label: 'An (E-Mail)', pflicht: true }, { k: 'anName', label: 'Name' }, { k: 'betreff', label: 'Betreff', pflicht: true, breit: true }, { k: 'text', label: 'Text', typ: 'textarea', breit: true }], 'Als Entwurf speichern');
    if (!w) return; let id; Store.aendern('Entwurf gespeichert', db => { id = Mail.anlegen(db, Object.assign({ art: 'sonstiges', status: 'entwurf' }, w)).id; }); Nav.gehe('post/' + id);
  }
};
