#!/usr/bin/env python3
"""
Baut bad/index.html aus bad/src/.

Die fertige App ist – wie alle Apps in diesem Repo – EINE Datei ohne
Build-Abhängigkeit. Entwickelt wird trotzdem in Teilen, weil eine Datei
mit zehntausend Zeilen niemandem hilft:

  src/head.html     alles im <head> ausser den Styles
  src/*.css         Styles, in Nummernreihenfolge (10-tokens.css, 20-…)
  src/body.html     Markup: Symbolvorrat, Anmeldung, Oberflächen, Overlays
  src/*.js          Skripte, in Nummernreihenfolge (30-core.js, 31-…)

    python3 build.py          baut index.html
    python3 build.py --check  prüft zusätzlich jede JS-Datei mit `node --check`

Änderungen gehören nach src/. index.html wird überschrieben.
"""
import os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
OUT = os.path.join(HERE, 'index.html')

def lesen(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read().rstrip('\n') + '\n'

def sortiert(endung):
    return sorted(n for n in os.listdir(SRC) if n.endswith(endung) and re.match(r'^\d', n))

def main():
    check = '--check' in sys.argv
    css = sortiert('.css')
    js = sortiert('.js')
    if check:
        fehler = 0
        for n in js:
            r = subprocess.run(['node', '--check', os.path.join(SRC, n)], capture_output=True, text=True)
            if r.returncode:
                fehler += 1
                print('✗', n); print(r.stderr)
        if fehler:
            print(f'{fehler} Datei(en) mit Syntaxfehlern – index.html nicht gebaut.')
            sys.exit(1)
    teile = ['<!doctype html>\n<html lang="de-CH" data-theme="auto">\n<head>\n']
    teile.append(lesen('head.html'))
    for n in css:
        teile.append(f'\n<style>\n/* ---- src/{n} ---- */\n{lesen(n)}</style>\n')
    teile.append('</head>\n')
    teile.append(lesen('body.html'))
    for n in js:
        teile.append(f'\n<script>\n/* ---- src/{n} ---- */\n{lesen(n)}</script>\n')
    teile.append('</body>\n</html>\n')
    html = ''.join(teile)
    # Ein </script> im Quelltext würde die Datei zerreissen
    for n in js:
        if '</script' in lesen(n).lower():
            print('✗', n, 'enthält "</script" – bitte als "<\\/script" schreiben'); sys.exit(1)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(html)
    n = f'{len(html):,}'.replace(',', "'")
    print(f'index.html geschrieben: {n} Bytes, {len(css)} CSS, {len(js)} JS')

if __name__ == '__main__':
    main()
