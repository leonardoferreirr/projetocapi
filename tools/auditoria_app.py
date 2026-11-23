"""Auditoria de UX da área da aluna: percorre telas e estados, mede problemas e tira capturas.
Uso: python3 tools/auditoria_app.py <pasta_saida> [base]"""
import sys, os, json, time
from playwright.sync_api import sync_playwright
out = sys.argv[1]; base = sys.argv[2] if len(sys.argv) > 2 else 'http://localhost:4310'
os.makedirs(out, exist_ok=True)
CH = os.path.expanduser('~/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell')
MEDE = """() => {
  const W = document.documentElement.clientWidth, probs = [];
  const nome = el => (el.className && el.className.baseVal === undefined ? '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase()) + (el.textContent ? ' "' + el.textContent.trim().slice(0, 28) + '"' : '');
  document.querySelectorAll('svg').forEach(s => {
    const r = s.getBoundingClientRect(); if (!r.width) return;
    if (s.closest('.graf,.anel,.logo,.bar .logo,.poster,.player,.cred')) return;
    if (r.width > 34 || r.height > 34) probs.push('ícone grande ' + Math.round(r.width) + 'px em ' + nome(s.parentElement));
  });
  document.querySelectorAll('#app *').forEach(el => {
    const r = el.getBoundingClientRect(); if (!r.width) return;
    if (r.right > W + 1 && !el.closest('.vitrine,.abas,.pessoas')) probs.push('estoura ' + Math.round(r.right - W) + 'px: ' + nome(el));
    if (el.children.length === 0 && el.textContent.trim().length > 14) {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 20, linhas = Math.round(r.height / lh);
      if (r.width < 120 && linhas >= 3) probs.push('texto espremido (' + Math.round(r.width) + 'px, ' + linhas + ' linhas): ' + nome(el));
    }
  });
  document.querySelectorAll('button, .btn, a.btn').forEach(b => {
    const r = b.getBoundingClientRect(); if (!r.width) return;
    const lh = parseFloat(getComputedStyle(b).lineHeight) || 18;
    if (r.height > 80 && b.textContent.trim().length > 0 && !b.closest('.esc')) probs.push('botão alto ' + Math.round(r.height) + 'px: ' + nome(b));
  });
  return { sw: document.documentElement.scrollWidth, W, probs: [...new Set(probs)].slice(0, 20) };
}"""
FEITOS = {str(i): int(time.time() * 1000) - (40 - i) * 86400000 for i in range(1, 30)}
estados = [
  ('entrar', None, '/app/', None),
  ('inicio', 'demo', '#/inicio', None),
  ('menu', 'demo', '#/inicio', "document.querySelector('[data-a=menu]').click()"),
  ('checkin1', 'demo', '#/bem-estar', "document.querySelector('[data-a=ckn][data-v=\"3\"]').click()"),
  ('checkin2', 'demo', '#/bem-estar', "document.querySelector('[data-a=ckn][data-v=\"5\"]').click();setTimeout(()=>{document.querySelector('[data-a=cks]').click();setTimeout(()=>document.querySelector('[data-a=ckok]').click(),80)},80)"),
  ('conteudo', 'demo', '#/conteudo', None),
  ('aula1-sobre', 'demo', '#/aula/1', None),
  ('aula1-tarefa', 'demo', '#/aula/1', "document.querySelector('[data-a=aba][data-v=tarefa]').click()"),
  ('aula1-material', 'demo', '#/aula/1', "document.querySelector('[data-a=aba][data-v=material]').click()"),
  ('aula1-notas', 'demo', '#/aula/1', "document.querySelector('[data-a=aba][data-v=notas]').click()"),
  ('aula4', 'demo', '#/aula/4', None),
  ('aula5-bloq', 'demo', '#/aula/5', None),
  ('aula9-ferr', 'tudo', '#/aula/9', "document.querySelector('[data-a=aba][data-v=tarefa]').click()"),
  ('aula15-custo', 'tudo', '#/aula/15', "document.querySelector('[data-a=aba][data-v=tarefa]').click()"),
  ('aula27-orc', 'tudo', '#/aula/27', "document.querySelector('[data-a=aba][data-v=tarefa]').click()"),
  ('aula28-res', 'tudo', '#/aula/28', "document.querySelector('[data-a=aba][data-v=tarefa]').click()"),
  ('aula30', 'tudo', '#/aula/30', "document.querySelector('[data-a=aba][data-v=tarefa]').click()"),
  ('aula2-sem-video', 'demo', '#/aula/2', "document.querySelector('[data-a=play]').click()"),
  ('encontros', 'demo', '#/encontros', None),
  ('encontros-agendado', 'demo', '#/encontros', "document.querySelector('[data-a=agenda]').click()"),
  ('bem-estar', 'demo', '#/bem-estar', None),
  ('plano', 'demo', '#/plano', None),
  ('apoio', 'demo', '#/apoio', None),
]
rel = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CH)
    for tema in ('claro', 'escuro'):
        for w, h in ((390, 844), (1440, 900)):
            if tema == 'escuro' and w == 1440: continue
            ctx = b.new_context(viewport={'width': w, 'height': h}); pg = ctx.new_page()
            erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
            for nome, modo, rota, acao in estados:
                pg.goto(base + '/app/'); pg.evaluate(f"localStorage.setItem('capi.tema','{tema}')")
                if modo is None: pg.evaluate("localStorage.removeItem('capi.aluna.v1')")
                pg.reload(); pg.wait_for_timeout(250)
                if modo and pg.query_selector('[data-a=demo]'): pg.click('[data-a=demo]'); pg.wait_for_timeout(200)
                if modo == 'tudo':
                    pg.evaluate("(f)=>{const S=JSON.parse(localStorage.getItem('capi.aluna.v1'));S.done=f;localStorage.setItem('capi.aluna.v1',JSON.stringify(S))}", FEITOS)
                if modo: pg.goto(base + '/app/' + rota); pg.reload()
                pg.wait_for_timeout(450)
                if acao: pg.evaluate(acao); pg.wait_for_timeout(450)
                r = pg.evaluate(MEDE)
                pg.screenshot(path=f'{out}/{tema}-{w}-{nome}.png', full_page=True)
                rel.append((tema, w, nome, r['sw'] > r['W'], r['probs'], erros[:2])); erros.clear()
            ctx.close()
    # painel
    for w, h in ((390, 844), (1440, 900)):
        ctx = b.new_context(viewport={'width': w, 'height': h}); pg = ctx.new_page(); pg.goto(base + '/app/gestao/'); pg.wait_for_timeout(1200)
        pg.screenshot(path=f'{out}/painel-{w}.png', full_page=True); r = pg.evaluate(MEDE.replace('#app *', 'body *'))
        rel.append(('painel', w, 'gestao', r['sw'] > r['W'], r['probs'], [])); ctx.close()
    b.close()
for t, w, n, est, probs, er in rel:
    if est or probs or er: print(t, w, n, 'ESTOURA' if est else '', probs, er)
print('telas auditadas:', len(rel))
