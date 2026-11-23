"""Gera o PDF 'Guia da jornada C.A.P.I.' (material do módulo 1) a partir de app/dados.js."""
import json, re, os, pathlib
from playwright.sync_api import sync_playwright
R = pathlib.Path(__file__).resolve().parents[2]
CHROME = os.path.expanduser('~/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell')
js = (R / 'app' / 'dados.js').read_text()
mods = json.loads(re.search(r'window.CAPI_MODS=(\[.*?\]);\n', js, re.S).group(1))
logo = (R / 'assets' / 'logo.svg').read_text()
pil = [('C', 'Comportamento', 1, 10, 'O ponto de partida: olhar para os seus hábitos, padrões e reações.', 'Registro de autoconhecimento'),
       ('A', 'Atitude', 11, 15, 'A disposição para mudar e decidir com consciência.', 'Quadro de possibilidades e decisões'),
       ('P', 'Planejamento', 16, 25, 'A vontade de mudar traduzida em etapas concretas.', 'Plano de ação profissional'),
       ('I', 'Investimento', 26, 30, 'Recursos financeiros, emocionais e de tempo a favor do seu projeto.', 'Plano Individual de Transição de Carreira')]
blocos = ''.join(f'<section class="p"><div class="l">{l}</div><div><h3>{n}</h3><p class="d">{d} Você sai com: <b>{s}</b>.</p><ol start="{a}">' + ''.join(f'<li>{mods[i-1]["t"]}</li>' for i in range(a, b + 1)) + '</ol></div></section>' for l, n, a, b, d, s in pil)
html = f"""<!doctype html><html lang=pt-BR><head><meta charset=utf-8><style>
@font-face{{font-family:J;src:url('{(R/'assets/fonts/jakarta-var.woff2').as_uri()}');font-weight:200 800}}
@page{{size:A4;margin:0}}*{{box-sizing:border-box;margin:0}}body{{font-family:J;color:#3B1724;font-size:10.5pt;line-height:1.5}}
.capa{{height:297mm;background:#723147;color:#F8E5AD;padding:24mm 20mm;display:flex;flex-direction:column;justify-content:space-between;page-break-after:always}}
.capa .logo svg{{width:70mm;height:auto;fill:#F8E5AD}}.capa h1{{font-weight:300;font-size:40pt;line-height:1.05;letter-spacing:-.02em}}.capa h1 b{{font-weight:700}}
.capa p{{font-size:12pt;max-width:120mm;color:rgba(248,229,173,.85);margin-top:8mm}}.capa small{{font-size:9pt;color:rgba(248,229,173,.6)}}
.pg{{padding:18mm 20mm}}h2{{font-weight:300;font-size:22pt;color:#723147;letter-spacing:-.01em;margin-bottom:5mm}}
.dias{{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-bottom:9mm}}.dia{{border:1px solid #E7D2C0;border-radius:4mm;padding:4mm 5mm}}.dia b{{display:block;color:#723147;font-size:11pt}}
.p{{display:grid;grid-template-columns:16mm 1fr;gap:5mm;padding:5mm 0;border-top:1px solid #E7D2C0;page-break-inside:avoid}}.l{{width:14mm;height:14mm;border-radius:3mm;background:#CC4452;color:#fff;font-weight:800;font-size:18pt;display:grid;place-items:center}}
h3{{font-size:13pt;color:#723147}}.d{{color:#7A5562;margin:1mm 0 2mm}}ol{{padding-left:7mm;columns:2;column-gap:8mm;font-size:9.5pt}}li{{margin-bottom:1mm;break-inside:avoid}}
.sos{{margin-top:8mm;background:#F8E5AD;border-radius:4mm;padding:5mm 6mm}}.sos b{{color:#723147}}
</style></head><body>
<div class="capa"><div class="logo">{logo}</div><div><h1>Guia da sua <b>jornada</b></h1><p>Como funcionam os 30 dias do Projeto C.A.P.I., o que você vai construir em cada pilar e como seguir acompanhada depois.</p></div><small>Material do módulo 1 · Projeto de Graduação em Psicologia, ESAMC Uberlândia, 2026</small></div>
<div class="pg"><h2>Como vão ser os seus dias</h2><div class="dias">
<div class="dia"><b>A turma começa todo dia 1º</b>As turmas abrem uma vez por mês e começam juntas. A conversa da turma acontece no grupo do WhatsApp.</div>
<div class="dia"><b>Um módulo a cada 24 horas</b>O próximo módulo abre 24 horas depois que você conclui o anterior. O intervalo existe para dar tempo de pensar.</div>
<div class="dia"><b>Vídeo, material e tarefa</b>Cada módulo tem um vídeo curto, um material de apoio e uma tarefa prática para fazer até o dia seguinte.</div>
<div class="dia"><b>Um ano de encontros</b>Depois do módulo 30, você tem 12 créditos para encontros semanais em grupos fechados de até 20 mulheres.</div></div>
<h2>Os quatro pilares</h2>{blocos}
<div class="sos"><b>O C.A.P.I. é um programa educativo e não substitui a psicoterapia.</b> Se você estiver em sofrimento intenso, ligue 188 (CVV), gratuito e 24 horas. Em emergência, ligue 192.</div></div>
</body></html>"""
f = R / 'tools' / 'material' / 'guia.html'; f.write_text(html)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME); pg = b.new_page(); pg.goto(f.as_uri()); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(300)
    dest = R / 'assets' / 'materiais' / 'guia-da-jornada-capi.pdf'
    pg.pdf(path=str(dest), format='A4', print_background=True); b.close()
print(dest, dest.stat().st_size // 1024, 'KB')
