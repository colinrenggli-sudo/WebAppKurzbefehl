/* ==================================================================
   41 · BWCap — Kamera, Unterschrift, Scanner
   Alles, was Finger und Linse betrifft. Jede Funktion hat einen
   Rueckfallpfad; fehlt eine Browser-Schnittstelle, gibt sie null
   zurueck statt zu scheitern. Uebernommen aus DACHWERK.
   ================================================================== */
(function (global) {
  'use strict';

  /** Bild verkleinern und als JPEG zurueckgeben. */
  function verkleinern(quelle, max, qualitaet) {
    const w = quelle.width || quelle.videoWidth, hh = quelle.height || quelle.videoHeight;
    const f = Math.min(1, max / Math.max(w, hh));
    const c = document.createElement('canvas');
    c.width = Math.round(w * f); c.height = Math.round(hh * f);
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(quelle, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', qualitaet);
  }

  /** EXIF-Orientierung aus dem JPEG-Kopf lesen (1..8), ohne Bibliothek. */
  function orientierung(buf) {
    const d = new DataView(buf);
    if (d.byteLength < 4 || d.getUint16(0) !== 0xFFD8) return 1;
    let o = 2;
    while (o + 4 < d.byteLength) {
      const marke = d.getUint16(o);
      if ((marke & 0xFF00) !== 0xFF00) break;
      const laenge = d.getUint16(o + 2);
      if (marke === 0xFFE1) {
        if (d.getUint32(o + 4) !== 0x45786966) return 1;   // "Exif"
        const tiff = o + 10;
        const klein = d.getUint16(tiff) === 0x4949;
        const le = klein;
        const ifd = tiff + d.getUint32(tiff + 4, le);
        const n = d.getUint16(ifd, le);
        for (let i = 0; i < n; i++) {
          const e = ifd + 2 + i * 12;
          if (d.getUint16(e, le) === 0x0112) return d.getUint16(e + 8, le) || 1;
        }
        return 1;
      }
      o += 2 + laenge;
    }
    return 1;
  }

  function drehen(img, ori, max, q) {
    const w = img.width, hh = img.height;
    const f = Math.min(1, max / Math.max(w, hh));
    const bw = Math.round(w * f), bh = Math.round(hh * f);
    const c = document.createElement('canvas');
    const quer = ori >= 5 && ori <= 8;
    c.width = quer ? bh : bw; c.height = quer ? bw : bh;
    const x = c.getContext('2d');
    const T = { 2: [-1, 0, 0, 1, bw, 0], 3: [-1, 0, 0, -1, bw, bh], 4: [1, 0, 0, -1, 0, bh], 5: [0, 1, 1, 0, 0, 0], 6: [0, 1, -1, 0, bh, 0], 7: [0, -1, -1, 0, bh, bw], 8: [0, -1, 1, 0, 0, bw] }[ori];
    if (T) x.transform(T[0], T[1], T[2], T[3], T[4], T[5]);
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, 0, 0, bw, bh);
    return c.toDataURL('image/jpeg', q);
  }

  const BWCap = {
    /** Foto per Kamera oder Datei. Liefert null, wenn abgebrochen. */
    photo(opt) {
      opt = opt || {};
      const max = opt.compressTo || 1280, q = opt.quality || 0.72;
      return new Promise(res => {
        const i = document.createElement('input');
        i.type = 'file'; i.accept = 'image/*';
        i.setAttribute('capture', 'environment');
        i.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(i);
        let fertig = false;
        const weg = () => { setTimeout(() => i.remove(), 100); };
        i.onchange = async () => {
          fertig = true;
          const f = i.files && i.files[0];
          if (!f) { weg(); return res(null); }
          try {
            const buf = await f.arrayBuffer();
            const ori = /jpe?g/i.test(f.type) ? orientierung(buf) : 1;
            const url = URL.createObjectURL(new Blob([buf], { type: f.type }));
            const img = new Image();
            img.onload = () => {
              const dataUrl = ori > 1 ? drehen(img, ori, max, q) : verkleinern(img, max, q);
              URL.revokeObjectURL(url); weg();
              res({ dataUrl, w: img.width, h: img.height, groesseKb: Math.round(dataUrl.length * 0.75 / 1024) });
            };
            img.onerror = () => { URL.revokeObjectURL(url); weg(); res(null); };
            img.src = url;
          } catch (e) { weg(); res(null); }
        };
        // Abbruch erkennen: das Fenster bekommt den Fokus zurueck, ohne dass eine Datei kam
        window.addEventListener('focus', function ab() {
          window.removeEventListener('focus', ab);
          setTimeout(() => { if (!fertig) { weg(); res(null); } }, 900);
        });
        i.click();
      });
    },

    /** Unterschriftfeld auf einem Canvas. Glatte Linie, korrekte Aufloesung. */
    signature(el, opt) {
      opt = opt || {};
      if (!el || !el.getContext) return null;
      const x = el.getContext('2d');
      const farbe = opt.farbe || '#111827';
      const dicke = opt.dicke || 2.4;
      let punkte = [], zeichnet = false, leer = true;

      function groesse() {
        const r = el.getBoundingClientRect();
        const dpr = Math.min(3, window.devicePixelRatio || 1);
        const alt = leer ? null : el.toDataURL();
        el.width = Math.max(1, Math.round(r.width * dpr));
        el.height = Math.max(1, Math.round(r.height * dpr));
        x.scale(dpr, dpr);
        x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = farbe; x.lineWidth = dicke;
        if (alt) { const i = new Image(); i.onload = () => x.drawImage(i, 0, 0, r.width, r.height); i.src = alt; }
      }
      groesse();
      const ro = window.ResizeObserver ? new ResizeObserver(groesse) : null;
      if (ro) ro.observe(el);

      const pos = e => {
        const r = el.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top, d: (e.pressure && e.pressure > 0 ? 0.6 + e.pressure : 1) * dicke };
      };
      const runter = e => {
        e.preventDefault(); zeichnet = true; leer = false;
        el.setPointerCapture && el.setPointerCapture(e.pointerId);
        punkte = [pos(e)];
      };
      const zieh = e => {
        if (!zeichnet) return;
        e.preventDefault();
        punkte.push(pos(e));
        const n = punkte.length;
        if (n < 3) return;
        const a = punkte[n - 3], b = punkte[n - 2], c = punkte[n - 1];
        x.lineWidth = b.d;
        x.beginPath();
        x.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
        x.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
        x.stroke();
      };
      const hoch = e => {
        if (!zeichnet) return;
        zeichnet = false;
        if (punkte.length === 1) { const p = punkte[0]; x.beginPath(); x.arc(p.x, p.y, dicke / 2, 0, 7); x.fillStyle = farbe; x.fill(); }
        punkte = [];
      };
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', runter);
      el.addEventListener('pointermove', zieh);
      el.addEventListener('pointerup', hoch);
      el.addEventListener('pointercancel', hoch);
      el.addEventListener('pointerleave', hoch);

      return {
        clear() { x.clearRect(0, 0, el.width, el.height); leer = true; },
        leer() { return leer; },
        /** Zugeschnittenes PNG mit durchsichtigem Grund. */
        toDataURL() {
          if (leer) return null;
          const d = x.getImageData(0, 0, el.width, el.height).data;
          let x0 = el.width, y0 = el.height, x1 = 0, y1 = 0;
          for (let y = 0; y < el.height; y++) for (let xx = 0; xx < el.width; xx++) {
            if (d[(y * el.width + xx) * 4 + 3] > 12) {
              if (xx < x0) x0 = xx; if (xx > x1) x1 = xx;
              if (y < y0) y0 = y; if (y > y1) y1 = y;
            }
          }
          if (x1 <= x0) return el.toDataURL();
          const r = 10;
          x0 = Math.max(0, x0 - r); y0 = Math.max(0, y0 - r);
          x1 = Math.min(el.width, x1 + r); y1 = Math.min(el.height, y1 + r);
          const c = document.createElement('canvas');
          c.width = x1 - x0; c.height = y1 - y0;
          c.getContext('2d').drawImage(el, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
          return c.toDataURL('image/png');
        },
        destroy() { if (ro) ro.disconnect(); }
      };
    },

    scanVerfuegbar() {
      return typeof window.BarcodeDetector !== 'undefined' &&
        !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    },

    /** Fortlaufender Barcode-Scanner mit eigenem Overlay. */
    async scan(opt) {
      opt = opt || {};
      if (!BWCap.scanVerfuegbar()) return null;
      let strom = null, laeuft = true;
      const box = document.createElement('div');
      box.className = 'bwcap-scan';
      box.innerHTML = `<style>
        .bwcap-scan{position:fixed;inset:0;z-index:9000;background:#000;display:flex;flex-direction:column}
        .bwcap-scan video{flex:1;width:100%;object-fit:cover}
        .bwcap-rahmen{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:75%;max-width:340px;aspect-ratio:1.6;border:3px solid #fff;border-radius:14px;box-shadow:0 0 0 100vmax rgba(0,0,0,.5)}
        .bwcap-bar{position:absolute;left:0;right:0;bottom:0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));display:flex;gap:10px;justify-content:center}
        .bwcap-bar button{height:46px;padding:0 22px;border-radius:12px;border:0;background:#fff;color:#111;font:600 16px -apple-system,sans-serif}
        .bwcap-txt{position:absolute;top:calc(24px + env(safe-area-inset-top,0px));left:0;right:0;text-align:center;color:#fff;font:600 15px -apple-system,sans-serif;text-shadow:0 1px 3px rgba(0,0,0,.6)}
      </style>
      <video playsinline muted></video><div class="bwcap-rahmen"></div>
      <div class="bwcap-txt">Barcode in den Rahmen halten</div>
      <div class="bwcap-bar"><button type="button">Abbrechen</button></div>`;
      document.body.appendChild(box);
      const video = box.querySelector('video');
      const stop = () => {
        laeuft = false;
        if (strom) strom.getTracks().forEach(t => t.stop());
        box.remove();
      };
      box.querySelector('button').addEventListener('click', stop);

      try {
        strom = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = strom;
        await video.play();
      } catch (e) { stop(); return null; }

      const det = new window.BarcodeDetector({ formats: opt.formats || ['ean_13', 'ean_8', 'code_128', 'qr_code'] });
      (async function schleife() {
        while (laeuft) {
          try {
            const t = await det.detect(video);
            if (t && t.length) {
              if (navigator.vibrate) navigator.vibrate(60);
              const code = t[0].rawValue;
              if (opt.onCode) opt.onCode(code);
              stop();
              return;
            }
          } catch (e) { /* einzelner Fehlversuch ist normal */ }
          await new Promise(r => setTimeout(r, 220));
        }
      })();
      return { stop };
    },

    /** Kleines Vorschaubild, damit Listen nicht an vollen Fotos ersticken. */
    thumb(dataUrl, px) {
      return new Promise(res => {
        const i = new Image();
        i.onload = () => res(verkleinern(i, px || 200, .6));
        i.onerror = () => res(dataUrl);
        i.src = dataUrl;
      });
    },

    groesse(dataUrl) {
      const i = String(dataUrl || '').indexOf(',');
      return i < 0 ? 0 : Math.round((dataUrl.length - i - 1) * 0.75);
    },

    /** Zeitstempel unten rechts ins Bild brennen. */
    stempel(dataUrl, text) {
      return new Promise(res => {
        const i = new Image();
        i.onload = () => {
          const c = document.createElement('canvas');
          c.width = i.width; c.height = i.height;
          const x = c.getContext('2d');
          x.drawImage(i, 0, 0);
          const gr = Math.max(12, Math.round(i.width / 42));
          x.font = '600 ' + gr + 'px -apple-system,sans-serif';
          const b = x.measureText(text).width + gr;
          x.fillStyle = 'rgba(0,0,0,.55)';
          x.fillRect(i.width - b - gr / 2, i.height - gr * 2.2, b, gr * 1.7);
          x.fillStyle = '#fff';
          x.fillText(text, i.width - b, i.height - gr);
          res(c.toDataURL('image/jpeg', .8));
        };
        i.onerror = () => res(dataUrl);
        i.src = dataUrl;
      });
    },

    /** Markierungen (Kreise, Pfeile, Text) ins Foto einbrennen. */
    annotate(dataUrl, markierungen) {
      return new Promise(res => {
        const i = new Image();
        i.onload = () => {
          const c = document.createElement('canvas');
          c.width = i.width; c.height = i.height;
          const x = c.getContext('2d');
          x.drawImage(i, 0, 0);
          (markierungen || []).forEach(m => {
            x.strokeStyle = m.farbe || '#FF3B30';
            x.lineWidth = Math.max(3, i.width / 200);
            x.beginPath();
            x.arc(m.x * i.width, m.y * i.height, (m.r || .07) * i.width, 0, 7);
            x.stroke();
            if (m.text) {
              x.fillStyle = m.farbe || '#FF3B30';
              x.font = '600 ' + Math.round(i.width / 26) + 'px -apple-system,sans-serif';
              x.fillText(m.text, m.x * i.width + (m.r || .07) * i.width + 8, m.y * i.height);
            }
          });
          res(c.toDataURL('image/jpeg', .8));
        };
        i.onerror = () => res(dataUrl);
        i.src = dataUrl;
      });
    }
  };

  global.BWCap = BWCap;
})(typeof globalThis !== 'undefined' ? globalThis : this);
