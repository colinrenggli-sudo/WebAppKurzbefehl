/* ==================================================================
   40 · BWQR — QR-Codes und Swiss QR-Rechnung
   Vollstaendiger Encoder nach ISO/IEC 18004 und der Zahlteil nach
   Schweizer Vorgabe 0200. Von Hand gebaut, ohne Fremdbibliothek.
   Uebernommen aus DACHWERK (dach/index.html), dort gegen das
   offizielle Musterbeispiel geprueft. Setzt genau ein globales
   Objekt: window.BWQR
   ================================================================== */
(function (global) {
  'use strict';

  /* ================================================================ Teil A
     QR-Encoder: Byte-Modus, Versionen 1..25, Stufen L/M/Q/H
     ====================================================================== */

  const MAX_VERSION = 25;

  // Bitmuster der Fehlerkorrekturstufe in der Format-Information
  const STUFEN_BITS = { L: 1, M: 0, Q: 3, H: 2 };

  // Fehlerkorrektur-Codewoerter je Block, Index = Version
  const ECC_PRO_BLOCK = {
    L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26],
    M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28],
    Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30],
    H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30]
  };

  // Anzahl Fehlerkorrekturbloecke, Index = Version
  const ECC_BLOECKE = {
    L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12],
    M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21],
    Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29],
    H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35]
  };

  // Die acht Maskenmuster; dunkel, wenn die Bedingung zutrifft
  const MASKEN = [
    (r, c) => (r + c) % 2 === 0,
    (r, c) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
  ];

  let letzterFehler = '';

  function fehler(text) {
    letzterFehler = text;
    return null;
  }

  /* ------------------------------------------------- Galoisfeld GF(256) */

  const GF_EXP = new Uint8Array(512);
  const GF_LOG = new Uint8Array(256);
  (function () {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x = (x << 1) ^ (x & 0x80 ? 0x11d : 0);   // Primpolynom x^8+x^4+x^3+x^2+1
      x &= 0xff;
    }
    for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  const generatorCache = {};

  // Generatorpolynom (x-a^0)(x-a^1)... in absteigender Ordnung, fuehrende 1
  function generator(grad) {
    if (generatorCache[grad]) return generatorCache[grad];
    let poly = new Uint8Array([1]);
    for (let i = 0; i < grad; i++) {
      const naechste = new Uint8Array(poly.length + 1);
      for (let j = 0; j < poly.length; j++) {
        naechste[j] ^= poly[j];
        naechste[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
      }
      poly = naechste;
    }
    generatorCache[grad] = poly;
    return poly;
  }

  // Reed-Solomon-Rest: Division der um eccLen Stellen geschobenen Daten
  function reedSolomon(daten, eccLen) {
    const gen = generator(eccLen);
    const rest = new Uint8Array(eccLen);
    for (let i = 0; i < daten.length; i++) {
      const faktor = daten[i] ^ rest[0];
      rest.copyWithin(0, 1);
      rest[eccLen - 1] = 0;
      for (let j = 0; j < eccLen; j++) rest[j] ^= gfMul(gen[j + 1], faktor);
    }
    return rest;
  }

  /* ------------------------------------------------------- Kapazitaeten */

  // Anzahl Module, die Daten und Fehlerkorrektur aufnehmen (ohne Funktionsmuster)
  function rohModule(version) {
    let n = (16 * version + 128) * version + 64;
    if (version >= 2) {
      const anzahl = Math.floor(version / 7) + 2;
      n -= (25 * anzahl - 10) * anzahl - 55;
      if (version >= 7) n -= 36;                // Bereiche der Versions-Information
    }
    return n;
  }

  function gesamtCodewoerter(version) {
    return Math.floor(rohModule(version) / 8);
  }

  function datenCodewoerter(version, stufe) {
    return gesamtCodewoerter(version) - ECC_PRO_BLOCK[stufe][version] * ECC_BLOECKE[stufe][version];
  }

  function zaehlerBits(version) {
    return version < 10 ? 8 : 16;
  }

  // Nutzbare Bytes im Byte-Modus, Modusindikator und Zeichenzaehler abgezogen
  function capacity(version, stufe) {
    const v = typeof version === 'number' ? Math.floor(version) : parseInt(alsText(version), 10);
    const s = pruefeStufe(stufe);
    if (!s || !(v >= 1 && v <= MAX_VERSION)) return 0;
    const bits = datenCodewoerter(v, s) * 8 - 4 - zaehlerBits(v);
    return bits < 0 ? 0 : Math.floor(bits / 8);
  }

  function pruefeStufe(stufe) {
    if (stufe === undefined || stufe === null) return 'M';
    if (typeof stufe !== 'string') return null;
    const s = stufe.toUpperCase();
    return STUFEN_BITS[s] === undefined ? null : s;
  }

  /* ------------------------------------------------------- Bitstromaufbau */

  function utf8Bytes(text) {
    const out = [];
    for (let i = 0; i < text.length; i++) {
      let cp = text.codePointAt(i);
      if (cp > 0xffff) i++;                     // Ersatzzeichenpaar zusammengefasst
      if (cp < 0x80) out.push(cp);
      else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 63));
      else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    }
    return out;
  }

  function latin1Bytes(text) {
    const out = [];
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      out.push(c < 256 ? c : 0x3f);             // nicht darstellbar wird zu "?"
    }
    return out;
  }

  function datenBlock(bytes, version, stufe) {
    const gesamt = datenCodewoerter(version, stufe);
    const cw = new Uint8Array(gesamt);
    let bit = 0;
    const schreibe = (wert, laenge) => {
      for (let i = laenge - 1; i >= 0; i--) {
        if ((wert >>> i) & 1) cw[bit >>> 3] |= 0x80 >>> (bit & 7);
        bit++;
      }
    };
    schreibe(4, 4);                             // Modusindikator Byte
    schreibe(bytes.length, zaehlerBits(version));
    for (let i = 0; i < bytes.length; i++) schreibe(bytes[i], 8);
    bit += Math.min(4, gesamt * 8 - bit);       // Abschlusszeichen
    bit += (8 - (bit & 7)) & 7;                 // auf volle Codewoerter auffuellen
    for (let i = 0; bit < gesamt * 8; i++) schreibe(i % 2 === 0 ? 0xec : 0x11, 8);
    return cw;
  }

  // Daten- und Fehlerkorrekturbloecke bilden und spaltenweise verweben
  function verwebe(daten, version, stufe) {
    const bloecke = ECC_BLOECKE[stufe][version];
    const eccLen = ECC_PRO_BLOCK[stufe][version];
    const kurz = Math.floor(daten.length / bloecke);
    const anzahlKurz = bloecke - (daten.length % bloecke);
    const dat = [];
    const ecc = [];
    let pos = 0;
    for (let b = 0; b < bloecke; b++) {
      const laenge = kurz + (b < anzahlKurz ? 0 : 1);
      const block = daten.subarray(pos, pos + laenge);
      pos += laenge;
      dat.push(block);
      ecc.push(reedSolomon(block, eccLen));
    }
    const alle = new Uint8Array(gesamtCodewoerter(version));
    let k = 0;
    for (let i = 0; i <= kurz; i++) {
      for (let b = 0; b < bloecke; b++) if (i < dat[b].length) alle[k++] = dat[b][i];
    }
    for (let i = 0; i < eccLen; i++) {
      for (let b = 0; b < bloecke; b++) alle[k++] = ecc[b][i];
    }
    return alle;
  }

  /* ------------------------------------------------------ Modulraster */

  function neueMatrix(size) {
    const m = [];
    for (let i = 0; i < size; i++) m.push(new Uint8Array(size));
    return m;
  }

  function setzeFunktion(mod, fkt, r, c, dunkel) {
    mod[r][c] = dunkel ? 1 : 0;
    fkt[r][c] = 1;
  }

  function suchmuster(mod, fkt, size, zr, zc) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = zr + dr;
        const c = zc + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const d = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
        setzeFunktion(mod, fkt, r, c, d <= 1 || d === 3);   // d===4 ist der Trenner
      }
    }
  }

  function ausrichtPositionen(version) {
    if (version === 1) return [];
    const anzahl = Math.floor(version / 7) + 2;
    const schritt = Math.ceil((version * 4 + 4) / (anzahl * 2 - 2)) * 2;
    const pos = [6];
    for (let p = version * 4 + 10; pos.length < anzahl; p -= schritt) pos.splice(1, 0, p);
    return pos;
  }

  function ausrichtmuster(mod, fkt, mr, mc) {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        setzeFunktion(mod, fkt, mr + dr, mc + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
      }
    }
  }

  // BCH(15,5) mit Maske 0x5412, zwei Kopien im Symbol
  function formatInfo(mod, fkt, size, stufe, maske) {
    const daten = (STUFEN_BITS[stufe] << 3) | maske;
    let rest = daten;
    for (let i = 0; i < 10; i++) rest = (rest << 1) ^ ((rest >>> 9) * 0x537);
    const bits = ((daten << 10) | rest) ^ 0x5412;
    const b = (i) => ((bits >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) setzeFunktion(mod, fkt, i, 8, b(i));
    setzeFunktion(mod, fkt, 7, 8, b(6));
    setzeFunktion(mod, fkt, 8, 8, b(7));
    setzeFunktion(mod, fkt, 8, 7, b(8));
    for (let i = 9; i < 15; i++) setzeFunktion(mod, fkt, 8, 14 - i, b(i));
    for (let i = 0; i < 8; i++) setzeFunktion(mod, fkt, 8, size - 1 - i, b(i));
    for (let i = 8; i < 15; i++) setzeFunktion(mod, fkt, size - 15 + i, 8, b(i));
    setzeFunktion(mod, fkt, size - 8, 8, true);            // Dunkelmodul
  }

  // BCH(18,6), erst ab Version 7 vorhanden
  function versionInfo(mod, fkt, size, version) {
    if (version < 7) return;
    let rest = version;
    for (let i = 0; i < 12; i++) rest = (rest << 1) ^ ((rest >>> 11) * 0x1f25);
    const bits = (version << 12) | rest;
    for (let i = 0; i < 18; i++) {
      const dunkel = ((bits >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setzeFunktion(mod, fkt, b, a, dunkel);
      setzeFunktion(mod, fkt, a, b, dunkel);
    }
  }

  function funktionsmuster(mod, fkt, size, version, stufe) {
    for (let i = 0; i < size; i++) {                       // Taktmuster
      setzeFunktion(mod, fkt, 6, i, i % 2 === 0);
      setzeFunktion(mod, fkt, i, 6, i % 2 === 0);
    }
    suchmuster(mod, fkt, size, 0, 0);
    suchmuster(mod, fkt, size, 0, size - 7);
    suchmuster(mod, fkt, size, size - 7, 0);
    const pos = ausrichtPositionen(version);
    const letzte = pos.length - 1;
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const beiSucher = (i === 0 && j === 0) || (i === 0 && j === letzte) || (i === letzte && j === 0);
        if (!beiSucher) ausrichtmuster(mod, fkt, pos[i], pos[j]);
      }
    }
    formatInfo(mod, fkt, size, stufe, 0);                  // reserviert den Bereich
    versionInfo(mod, fkt, size, version);
  }

  // Zickzack von rechts unten, zwei Spalten breit, Spalte 6 wird ausgelassen
  function setzeCodewoerter(mod, fkt, size, cw) {
    const bits = cw.length * 8;
    let i = 0;
    for (let rechts = size - 1; rechts >= 1; rechts -= 2) {
      if (rechts === 6) rechts = 5;
      for (let v = 0; v < size; v++) {
        for (let j = 0; j < 2; j++) {
          const c = rechts - j;
          const aufwaerts = ((rechts + 1) & 2) === 0;
          const r = aufwaerts ? size - 1 - v : v;
          if (!fkt[r][c] && i < bits) {
            mod[r][c] = (cw[i >>> 3] >>> (7 - (i & 7))) & 1;
            i++;
          }
        }
      }
    }
  }

  function maskiere(mod, fkt, size, maske) {
    const f = MASKEN[maske];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!fkt[r][c] && f(r, c)) mod[r][c] ^= 1;
      }
    }
  }

  /* ------------------------------------------------------ Strafpunkte */

  const SUCHER_A = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const SUCHER_B = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];

  function passt(hole, i, muster) {
    for (let k = 0; k < 11; k++) if (hole(i + k) !== muster[k]) return false;
    return true;
  }

  function strafe(mod, size) {
    let punkte = 0;
    let dunkel = 0;

    // Regel 1: fuenf und mehr gleichfarbige Module in Reihe
    for (let r = 0; r < size; r++) {
      let lauf = 1;
      let laufS = 1;
      for (let i = 1; i < size; i++) {
        if (mod[r][i] === mod[r][i - 1]) {
          lauf++;
          if (lauf === 5) punkte += 3; else if (lauf > 5) punkte += 1;
        } else lauf = 1;
        if (mod[i][r] === mod[i - 1][r]) {
          laufS++;
          if (laufS === 5) punkte += 3; else if (laufS > 5) punkte += 1;
        } else laufS = 1;
      }
    }

    // Regel 2: gleichfarbige Bloecke 2x2
    for (let r = 0; r + 1 < size; r++) {
      for (let c = 0; c + 1 < size; c++) {
        const a = mod[r][c];
        if (a === mod[r][c + 1] && a === mod[r + 1][c] && a === mod[r + 1][c + 1]) punkte += 3;
      }
    }

    // Regel 3: sucheraehnliches Muster 1:1:3:1:1 mit vier hellen Modulen daneben
    for (let r = 0; r < size; r++) {
      const zeile = (i) => (i < 0 || i >= size ? 0 : mod[r][i]);
      const spalte = (i) => (i < 0 || i >= size ? 0 : mod[i][r]);
      for (let i = 0; i + 11 <= size; i++) {
        if (passt(zeile, i, SUCHER_A) || passt(zeile, i, SUCHER_B)) punkte += 40;
        if (passt(spalte, i, SUCHER_A) || passt(spalte, i, SUCHER_B)) punkte += 40;
      }
    }

    // Regel 4: Abweichung vom Halbe-Halbe-Verhaeltnis in Schritten von 5 Prozent
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) if (mod[r][c]) dunkel++;
    }
    const gesamt = size * size;
    punkte += Math.floor(Math.abs(dunkel * 20 - gesamt * 10) / gesamt) * 10;
    return punkte;
  }

  /* ---------------------------------------------------------- Symbol */

  function baueSymbol(bytes, stufe) {
    let version = 0;
    for (let v = 1; v <= MAX_VERSION; v++) {
      if (bytes.length <= capacity(v, stufe)) { version = v; break; }
    }
    if (!version) return fehler('Text zu lang: maximal ' + capacity(MAX_VERSION, stufe) + ' Bytes bei Stufe ' + stufe + '.');
    const size = version * 4 + 17;
    const mod = neueMatrix(size);
    const fkt = neueMatrix(size);
    funktionsmuster(mod, fkt, size, version, stufe);
    setzeCodewoerter(mod, fkt, size, verwebe(datenBlock(bytes, version, stufe), version, stufe));

    let beste = 0;
    let besteStrafe = Infinity;
    for (let m = 0; m < 8; m++) {
      maskiere(mod, fkt, size, m);
      formatInfo(mod, fkt, size, stufe, m);
      const s = strafe(mod, size);
      if (s < besteStrafe) { besteStrafe = s; beste = m; }
      maskiere(mod, fkt, size, m);              // XOR hebt sich selbst wieder auf
    }
    maskiere(mod, fkt, size, beste);
    formatInfo(mod, fkt, size, stufe, beste);
    return { mod: mod, size: size, version: version, stufe: stufe, maske: beste, strafe: besteStrafe };
  }

  // Umwandlung in Text; ein Objekt mit fehlerhaftem toString darf nichts umwerfen
  function alsText(wert) {
    if (typeof wert === 'string') return wert;
    try {
      return String(wert);
    } catch (e) {
      return null;
    }
  }

  function symbolAusText(text, stufe, zeichensatz) {
    letzterFehler = '';
    if (text === undefined || text === null) return fehler('Kein Text uebergeben.');
    const s = pruefeStufe(stufe);
    if (!s) return fehler('Unbekannte Fehlerkorrekturstufe: ' + alsText(stufe));
    const roh = alsText(text);
    if (roh === null) return fehler('Text laesst sich nicht in eine Zeichenkette umwandeln.');
    const bytes = (alsText(zeichensatz) || '').toLowerCase() === 'latin1' ? latin1Bytes(roh) : utf8Bytes(roh);
    return baueSymbol(bytes, s);
  }

  /* -------------------------------------------------------------- SVG */

  function attr(wert) {
    const text = alsText(wert);
    return text === null ? '' : text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function zahl(wert, standard, kleinstes) {
    const n = typeof wert === 'number' ? Math.floor(wert) : parseInt(alsText(wert), 10);
    if (wert === undefined || !isFinite(n)) return standard;
    return n < kleinstes ? kleinstes : n;
  }

  function rund(x) {
    return Math.round(x * 1000) / 1000;
  }

  // Alle dunklen Module als waagrechte Laeufe in einem einzigen Pfad
  function pfad(mod, size, rand) {
    const teile = [];
    for (let r = 0; r < size; r++) {
      let c = 0;
      while (c < size) {
        if (!mod[r][c]) { c++; continue; }
        let laenge = 1;
        while (c + laenge < size && mod[r][c + laenge]) laenge++;
        teile.push('M' + (c + rand) + ' ' + (r + rand) + 'h' + laenge + 'v1h-' + laenge + 'z');
        c += laenge;
      }
    }
    return teile.join('');
  }

  // Schweizer Kreuz: 7 mm bei 46 mm Symbolgroesse, Kreuzarme im Verhaeltnis 20:6 zu 32
  function schweizerKreuz(size, rand, dunkel, hell) {
    const mitte = rand + size / 2;
    const aussen = size * 7 / 46;
    const quadrat = aussen * 0.9;
    const arm = quadrat * 0.625;
    const dicke = quadrat * 0.1875;
    const rechteck = (x, y, w, h, farbe) =>
      '<rect x="' + rund(x) + '" y="' + rund(y) + '" width="' + rund(w) + '" height="' + rund(h) + '" fill="' + farbe + '"/>';
    return rechteck(mitte - aussen / 2, mitte - aussen / 2, aussen, aussen, hell) +
      rechteck(mitte - quadrat / 2, mitte - quadrat / 2, quadrat, quadrat, dunkel) +
      rechteck(mitte - arm / 2, mitte - dicke / 2, arm, dicke, hell) +
      rechteck(mitte - dicke / 2, mitte - arm / 2, dicke, arm, hell);
  }

  function svg(text, opt) {
    const o = opt || {};
    const sym = symbolAusText(text, o.ecc, o.charset);
    if (!sym) return '';
    const rand = zahl(o.margin, 4, 0);
    const gesamt = sym.size + 2 * rand;
    const px = zahl(o.size, 256, 1);
    const dunkel = attr(o.dark || '#000');
    const hell = attr(o.light || '#fff');
    const teile = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + px + '" height="' + px +
      '" viewBox="0 0 ' + gesamt + ' ' + gesamt + '" shape-rendering="crispEdges" role="img" aria-label="' +
      attr(o.label || 'QR-Code') + '">'];
    if (hell !== 'none') teile.push('<rect width="' + gesamt + '" height="' + gesamt + '" fill="' + hell + '"/>');
    teile.push('<path fill="' + dunkel + '" d="' + pfad(sym.mod, sym.size, rand) + '"/>');
    if (o.swissCross) teile.push(schweizerKreuz(sym.size, rand, dunkel, hell));
    teile.push('</svg>');
    return teile.join('');
  }

  function matrix(text, stufe) {
    const sym = symbolAusText(text, stufe, 'utf8');
    if (!sym) return null;
    const out = [];
    for (let r = 0; r < sym.size; r++) {
      const zeile = [];
      for (let c = 0; c < sym.size; c++) zeile.push(sym.mod[r][c] === 1);
      out.push(zeile);
    }
    return out;
  }

  /* ================================================================ Teil B
     Swiss QR-Rechnung, Zahlteil Version 0200
     ====================================================================== */

  const ZEILENENDE = '\r\n';
  const MOD10_ZEILE0 = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];

  // Erlaubter Zeichenvorrat des Zahlteils (Latin Character Set der Spezifikation)
  const ZEICHEN_ERLAUBT = new RegExp('^[A-Za-z0-9 .,;:\'"+\\-/()?*\\[\\]{}|`´~!#%&<>÷=@_$£¥' +
    'àáâäçèéêëìíîïñòóôö' +
    'ùúûüý\u00dfÀÁÂÄÇÈÉÊËÌÍÎ' +
    'ÏÑÒÓÔÖÙÚÛÜÝ]*$');

  function str(wert) {
    if (wert === undefined || wert === null) return '';
    const text = alsText(wert);
    return text === null ? '' : text.replace(/[\r\n\t]+/g, ' ').trim();
  }

  function kuerze(wert, laenge) {
    const s = str(wert);
    return s.length > laenge ? s.slice(0, laenge) : s;
  }

  function nurZiffern(wert) {
    return str(wert).replace(/[^0-9]/g, '');
  }

  function reinigeIban(wert) {
    return str(wert).replace(/\s+/g, '').toUpperCase();
  }

  function mod97(zeichen) {
    let rest = 0;
    for (let i = 0; i < zeichen.length; i++) {
      const c = zeichen.charCodeAt(i);
      let wert;
      if (c >= 48 && c <= 57) wert = c - 48;
      else if (c >= 65 && c <= 90) wert = c - 55;
      else return -1;
      rest = wert > 9 ? (rest * 100 + wert) % 97 : (rest * 10 + wert) % 97;
    }
    return rest;
  }

  function ibanValid(iban) {
    const s = reinigeIban(iban);
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(s)) return false;
    return mod97(s.slice(4) + s.slice(0, 4)) === 1;
  }

  // QR-IBAN: Institutsnummer (Stelle 5 bis 9) im Bereich 30000 bis 31999
  function isQrIban(iban) {
    const s = reinigeIban(iban);
    if (!/^(CH|LI)[0-9]{19}$/.test(s)) return false;
    const iid = Number(s.slice(4, 9));
    return iid >= 30000 && iid <= 31999;
  }

  function formatIban(iban) {
    const s = reinigeIban(iban);
    return (s.match(/.{1,4}/g) || []).join(' ');
  }

  // QR-Referenz von rechts in Fuenfergruppen, Creditor Reference von links in Vierergruppen
  function formatRef(ref) {
    const s = str(ref).replace(/\s+/g, '').toUpperCase();
    if (!s) return '';
    if (s.slice(0, 2) === 'RF') return (s.match(/.{1,4}/g) || []).join(' ');
    const kopf = s.length % 5;
    const teile = kopf ? [s.slice(0, kopf)] : [];
    for (let i = kopf; i < s.length; i += 5) teile.push(s.slice(i, i + 5));
    return teile.join(' ');
  }

  // Modulo 10 rekursiv; jede Tabellenzeile ist die vorherige um eine Stelle verschoben
  function mod10rek(ziffern) {
    const z = str(ziffern).replace(/\s+/g, '');
    if (!/^[0-9]+$/.test(z)) return '';
    let uebertrag = 0;
    for (let i = 0; i < z.length; i++) uebertrag = MOD10_ZEILE0[(uebertrag + (z.charCodeAt(i) - 48)) % 10];
    return String((10 - uebertrag) % 10);
  }

  // 26 Stellen: Kundennummer links, Belegnummer rechts, dazwischen Nullen
  function qrReference(kundenNr, belegNr) {
    const k = nurZiffern(kundenNr);
    const b = nurZiffern(belegNr);
    if (k.length + b.length > 26) return '';
    const basis = k + '0'.repeat(26 - k.length - b.length) + b;
    return basis + mod10rek(basis);
  }

  function refTyp(data) {
    const t = str(data.referenzTyp).toUpperCase();
    if (t === 'QRR' || t === 'SCOR' || t === 'NON') return t;
    if (nurZiffern(data.referenz).length === 27 && isQrIban(data.konto)) return 'QRR';
    if (str(data.referenz).toUpperCase().slice(0, 2) === 'RF') return 'SCOR';
    return 'NON';
  }

  function refWert(typ, referenz) {
    if (typ === 'QRR') return nurZiffern(referenz);
    if (typ === 'SCOR') return str(referenz).replace(/\s+/g, '').toUpperCase();
    return '';
  }

  // Ausserhalb des zulaessigen Bereichs bleibt das Feld leer: der Zahlteil gilt dann als Betrag offen
  function betragText(betrag) {
    if (betrag === undefined || betrag === null || betrag === '') return '';
    const n = typeof betrag === 'number' ? betrag : Number(str(betrag).replace(/'/g, '').replace(/\s+/g, ''));
    if (!isFinite(n) || n < 0.01 || n > 999999999.99) return '';
    return n.toFixed(2);
  }

  // Sieben Zeilen je Adresse: Adresstyp, Name, zwei Adresszeilen, PLZ, Ort, Land
  function adressZeilen(adr) {
    if (!adr || !str(adr.name)) return ['', '', '', '', '', '', ''];
    const land = (str(adr.land) || 'CH').toUpperCase().slice(0, 2);
    const typ = str(adr.typ || adr.adressTyp).toUpperCase() === 'K' ? 'K' : 'S';
    if (typ === 'K') {
      const zeile2 = str(adr.zeile2) || (str(adr.plz) + ' ' + str(adr.ort)).trim();
      return ['K', kuerze(adr.name, 70), kuerze(str(adr.zeile1) || str(adr.strasse) + ' ' + str(adr.nr), 70),
        kuerze(zeile2, 70), '', '', land];
    }
    return ['S', kuerze(adr.name, 70), kuerze(adr.strasse, 70), kuerze(adr.nr, 16),
      kuerze(adr.plz, 16), kuerze(adr.ort, 35), land];
  }

  function billPayload(data) {
    if (!data || typeof data !== 'object') return '';
    const typ = refTyp(data);
    const zeilen = ['SPC', '0200', '1', reinigeIban(data.konto)];
    zeilen.push(...adressZeilen(data.zahlbarAn));
    zeilen.push('', '', '', '', '', '', '');            // endgueltiger Zahlungsempfaenger: nicht benutzt
    zeilen.push(betragText(data.betrag));
    zeilen.push((str(data.waehrung) || 'CHF').toUpperCase());
    zeilen.push(...adressZeilen(data.zahlbarDurch));
    zeilen.push(typ);
    zeilen.push(refWert(typ, data.referenz));
    zeilen.push(kuerze(data.mitteilung, 140));
    zeilen.push('EPD');
    const info = kuerze(data.rechnungsinfo, 140);
    if (info) zeilen.push(info);
    return zeilen.join(ZEILENENDE);
  }

  /* --------------------------------------------------------- Pruefung */

  function pruefeAdresse(fehlerListe, adr, titel, pflicht) {
    const name = str(adr && adr.name);
    if (!name) {
      if (pflicht) fehlerListe.push(titel + ': Name fehlt.');
      return;
    }
    if (name.length > 70) fehlerListe.push(titel + ': Name ist zu lang (max. 70 Zeichen).');
    const typ = str(adr.typ || adr.adressTyp).toUpperCase() === 'K' ? 'K' : 'S';
    if (typ === 'K') {
      if (!str(adr.zeile2) && !str(adr.ort)) fehlerListe.push(titel + ': zweite Adresszeile fehlt (PLZ und Ort).');
      if (str(adr.zeile1).length > 70) fehlerListe.push(titel + ': erste Adresszeile ist zu lang (max. 70 Zeichen).');
      if (str(adr.zeile2).length > 70) fehlerListe.push(titel + ': zweite Adresszeile ist zu lang (max. 70 Zeichen).');
    } else {
      if (str(adr.strasse).length > 70) fehlerListe.push(titel + ': Strasse ist zu lang (max. 70 Zeichen).');
      if (str(adr.nr).length > 16) fehlerListe.push(titel + ': Hausnummer ist zu lang (max. 16 Zeichen).');
      if (!str(adr.plz)) fehlerListe.push(titel + ': Postleitzahl fehlt.');
      if (str(adr.plz).length > 16) fehlerListe.push(titel + ': Postleitzahl ist zu lang (max. 16 Zeichen).');
      if (!str(adr.ort)) fehlerListe.push(titel + ': Ort fehlt.');
      if (str(adr.ort).length > 35) fehlerListe.push(titel + ': Ort ist zu lang (max. 35 Zeichen).');
    }
    if (str(adr.land) && !/^[A-Za-z]{2}$/.test(str(adr.land))) {
      fehlerListe.push(titel + ': Land muss aus zwei Buchstaben bestehen (z.B. CH).');
    }
    const alles = [adr.name, adr.strasse, adr.nr, adr.plz, adr.ort, adr.zeile1, adr.zeile2].map(str).join('');
    if (!ZEICHEN_ERLAUBT.test(alles)) fehlerListe.push(titel + ': enthält Zeichen, die im Zahlteil nicht erlaubt sind.');
  }

  function validateBill(data) {
    const f = [];
    if (!data || typeof data !== 'object') return ['Keine Rechnungsdaten übergeben.'];

    const iban = reinigeIban(data.konto);
    if (!iban) f.push('Konto: IBAN fehlt.');
    else if (!/^(CH|LI)[0-9]{19}$/.test(iban)) {
      f.push('Konto: erwartet wird eine Schweizer oder Liechtensteiner IBAN mit 21 Zeichen.');
    }
    else if (!ibanValid(iban)) f.push('Konto: die IBAN-Prüfziffer stimmt nicht.');

    const waehrung = (str(data.waehrung) || 'CHF').toUpperCase();
    if (waehrung !== 'CHF' && waehrung !== 'EUR') f.push('Währung: nur CHF oder EUR sind zulässig.');

    if (data.betrag !== undefined && data.betrag !== null && str(data.betrag) !== '') {
      const text = betragText(data.betrag);
      const n = Number(text);
      if (!text || !isFinite(n)) f.push('Betrag: keine gültige Zahl.');
      else if (n < 0.01 || n > 999999999.99) f.push('Betrag: muss zwischen 0.01 und 999999999.99 liegen.');
    }

    pruefeAdresse(f, data.zahlbarAn, 'Zahlbar an', true);
    if (data.zahlbarDurch && Object.keys(data.zahlbarDurch).some((k) => str(data.zahlbarDurch[k]))) {
      pruefeAdresse(f, data.zahlbarDurch, 'Zahlbar durch', true);
    }

    const typ = str(data.referenzTyp).toUpperCase();
    const ref = str(data.referenz).replace(/\s+/g, '').toUpperCase();
    if (typ !== 'QRR' && typ !== 'SCOR' && typ !== 'NON') {
      f.push('Referenztyp: erlaubt sind QRR, SCOR oder NON.');
    } else if (iban && /^(CH|LI)[0-9]{19}$/.test(iban)) {
      if (isQrIban(iban) && typ !== 'QRR') f.push('Referenztyp: eine QR-IBAN verlangt zwingend die QR-Referenz (QRR).');
      if (!isQrIban(iban) && typ === 'QRR') f.push('Referenztyp: die QR-Referenz (QRR) ist nur mit einer QR-IBAN zulässig.');
    }
    if (typ === 'QRR') {
      if (!/^[0-9]{27}$/.test(ref)) f.push('Referenz: die QR-Referenz muss aus genau 27 Ziffern bestehen.');
      else if (mod10rek(ref.slice(0, 26)) !== ref.charAt(26)) f.push('Referenz: die Prüfziffer der QR-Referenz stimmt nicht.');
    } else if (typ === 'SCOR') {
      if (!/^RF[0-9]{2}[A-Z0-9]{1,21}$/.test(ref)) {
        f.push('Referenz: die Creditor Reference muss mit RF beginnen und höchstens 25 Zeichen haben.');
      } else if (mod97(ref.slice(4) + ref.slice(0, 4)) !== 1) {
        f.push('Referenz: die Prüfziffer der Creditor Reference stimmt nicht.');
      }
    } else if (typ === 'NON' && ref) {
      f.push('Referenz: bei Referenztyp NON muss die Referenz leer bleiben.');
    }

    const mitteilung = str(data.mitteilung);
    const info = str(data.rechnungsinfo);
    if (mitteilung.length > 140) f.push('Mitteilung: zu lang (max. 140 Zeichen).');
    if (info.length > 140) f.push('Rechnungsinformationen: zu lang (max. 140 Zeichen).');
    if (mitteilung.length + info.length > 140) {
      f.push('Mitteilung und Rechnungsinformationen dürfen zusammen höchstens 140 Zeichen haben.');
    }
    if (info && info.slice(0, 2) !== '//') f.push('Rechnungsinformationen: müssen mit // beginnen (z.B. //S1/10/...).');
    if (!ZEICHEN_ERLAUBT.test(mitteilung + info)) f.push('Mitteilung: enthält Zeichen, die im Zahlteil nicht erlaubt sind.');

    return f;
  }

  global.BWQR = {
    svg: svg,
    matrix: matrix,
    capacity: capacity,
    billPayload: billPayload,
    validateBill: validateBill,
    qrReference: qrReference,
    mod10rek: mod10rek,
    ibanValid: ibanValid,
    isQrIban: isQrIban,
    formatIban: formatIban,
    formatRef: formatRef,
    MAX_VERSION: MAX_VERSION,
    get lastError() { return letzterFehler; }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
