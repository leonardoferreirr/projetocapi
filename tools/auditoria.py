"""Auditoria visual: screenshots de página inteira, rolagem lateral e erros de console.
Uso: python3 tools/auditoria.py <pasta_saida> [base_url]"""
import sys, os, json
from playwright.sync_api import sync_playwright
out = sys.argv[1]; base = sys.argv[2] if len(sys.argv) > 2 else 'http://localhost:4310'
CHROME = os.path.expanduser('~/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell')
os.makedirs(out, exist_ok=True)
paginas = [('site', '/'), ('app-entrar', '/app/'), ('app-inicio', '/app/#/inicio'), ('app-aula1', '/app/#/aula/1'), ('app-aula4', '/app/#/aula/4'), ('app-conteudo', '/app/#/conteudo'), ('app-encontros', '/app/#/encontros'), ('app-bem', '/app/#/bem-estar'), ('app-plano', '/app/#/plano'), ('app-apoio', '/app/#/apoio'), ('gestao', '/app/gestao/')]
sel = sys.argv[3].split(',') if len(sys.argv) > 3 else None
res = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    for w in (360, 390, 1440):
        ctx = b.new_context(viewport={'width': w, 'height': 820 if w < 900 else 900}, device_scale_factor=1)
        pg = ctx.new_page(); erros = []
        pg.on('console', lambda m: erros.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: erros.append(str(e)))
        pg.goto(base + '/app/'); pg.wait_for_timeout(300)
        pg.click('[data-a=demo]'); pg.wait_for_timeout(300)
        for nome, url in paginas:
            if sel and nome not in sel: continue
            erros.clear()
            pg.goto(base + url); pg.wait_for_timeout(500)
            if nome == 'app-entrar':
                pg.evaluate("localStorage.removeItem('capi.aluna.v1')"); pg.reload(); pg.wait_for_timeout(300)
            h = pg.evaluate('document.documentElement.scrollHeight')
            for y in range(0, h, 500):
                pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(60)
            pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(400)
            larg = pg.evaluate('[document.documentElement.scrollWidth, document.documentElement.clientWidth]')
            pg.screenshot(path=f'{out}/{nome}-{w}.png', full_page=True)
            res.append({'pag': nome, 'w': w, 'scrollW': larg[0], 'clientW': larg[1], 'erros': erros[:3]})
            if nome == 'app-entrar':
                pg.click('[data-a=demo]'); pg.wait_for_timeout(300)
        ctx.close()
    b.close()
for r in res:
    flag = 'ESTOURA' if r['scrollW'] > r['clientW'] else 'ok'
    print(f"{r['pag']:14} {r['w']:5} {flag} {r['erros'] if r['erros'] else ''}")
