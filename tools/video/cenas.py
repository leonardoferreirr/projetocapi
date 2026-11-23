"""Renderiza as cenas do vídeo de boas-vindas (1280x720) com Playwright e monta o MP4 com ffmpeg."""
import subprocess, os, pathlib
from playwright.sync_api import sync_playwright
R = pathlib.Path(__file__).resolve().parents[2]
OUT = R / 'tools' / 'video' / 'quadros'; OUT.mkdir(exist_ok=True)
CHROME = os.path.expanduser('~/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell')
logo = (R / 'assets' / 'logo.svg').read_text()
cenas = [
  ('', '<div class="logo">' + logo + '</div><p class="g">Boas-vindas à sua jornada</p>'),
  ('escada-inicio.webp', '<h1>Nos próximos 30 dias, você vai construir a sua transição <b>degrau por degrau.</b></h1>'),
  ('', '<ul><li><b>C</b>Comportamento</li><li><b>A</b>Atitude</li><li><b>P</b>Planejamento</li><li><b>I</b>Investimento</li></ul><p class="m">Quatro pilares, em sequência</p>'),
  ('escada-triangulo.webp', '<h1>A cada 24 horas, um módulo novo: <b>vídeo, material e uma tarefa prática.</b></h1>'),
  ('escada-turma.webp', '<h1>Sua turma caminha junto com você, <b>no grupo do WhatsApp.</b></h1>'),
  ('escada-passos.webp', '<h1>No fim, você tem nas mãos o seu <b>Plano Individual de Transição de Carreira.</b></h1>'),
  ('', '<div class="logo">' + logo + '</div><p class="g">Vamos começar?</p>'),
]
css = """@font-face{font-family:J;src:url('../../../assets/fonts/jakarta-var.woff2');font-weight:200 800}
*{margin:0;box-sizing:border-box}body{width:1280px;height:720px;overflow:hidden;font-family:J;background:#723147;color:#F8E5AD;position:relative}
.bg{position:absolute;inset:0;background-size:cover;background-position:center 40%}
.bg::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(63,24,39,.92) 0%,rgba(63,24,39,.7) 45%,rgba(63,24,39,.15) 100%)}
.c{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 110px}
.centro .c{align-items:center;text-align:center}
h1{font-weight:300;font-size:64px;line-height:1.08;letter-spacing:-.02em;max-width:760px}h1 b{font-weight:700}
.logo{width:520px;color:#F8E5AD}.logo svg{width:100%;height:auto;fill:#F8E5AD}
.g{margin-top:36px;font-size:40px;font-weight:300}
ul{list-style:none;padding:0;display:flex;gap:26px}li{width:240px;height:240px;border-radius:28px;background:rgba(248,229,173,.08);border:1px solid rgba(248,229,173,.25);display:flex;flex-direction:column;justify-content:flex-end;padding:26px;font-size:26px}
li b{font-size:96px;line-height:1;color:#CC4452;font-weight:800;margin-bottom:auto}
.m{margin-top:40px;font-size:30px;font-weight:300;color:rgba(248,229,173,.8)}"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME); pg = b.new_page(viewport={'width': 1280, 'height': 720})
    for i, (img, html) in enumerate(cenas):
        cls = 'centro' if not img else ''
        bg = f'<div class="bg" style="background-image:url(../../../assets/img/{img})"></div>' if img else ''
        f = OUT / f'c{i}.html'
        f.write_text(f'<!doctype html><html><head><meta charset=utf-8><style>{css}</style></head><body class="{cls}">{bg}<div class="c">{html}</div></body></html>')
        pg.goto(f.as_uri()); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(300)
        pg.screenshot(path=str(OUT / f'c{i}.png'))
    b.close()
# monta: cada cena 5,5 s com leve aproximação, transição de 0,7 s
dur, tr, n = 5.5, 0.7, len(cenas)
ins, flt = [], []
for i in range(n):
    ins += ['-i', str(OUT / f'c{i}.png')]
    flt.append(f"[{i}:v]scale=1408:792,zoompan=z='min(zoom+0.0006,1.1)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={int(dur*30)}:s=1280x720:fps=30,setsar=1,format=yuv420p[v{i}]")
prev = 'v0'; off = dur - tr
for i in range(1, n):
    flt.append(f'[{prev}][v{i}]xfade=transition=fade:duration={tr}:offset={off:.2f}[x{i}]'); prev = f'x{i}'; off += dur - tr
dest = R / 'assets' / 'video' / 'aula-01.mp4'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *ins, '-filter_complex', ';'.join(flt), '-map', f'[{prev}]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(dest)], check=True)
print(dest, dest.stat().st_size // 1024, 'KB')
