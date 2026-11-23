"""Gera app-celular.webp (tela da área da aluna), apple-touch-icon.png e og.jpg."""
import os, pathlib, io
from playwright.sync_api import sync_playwright
from PIL import Image
R = pathlib.Path(__file__).resolve().parents[1]
CHROME = os.path.expanduser('~/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell')
base = 'http://localhost:4310'
logo = (R / 'assets' / 'logo.svg').read_text()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    pg = b.new_page(viewport={'width': 390, 'height': 800}, device_scale_factor=2)
    pg.goto(base + '/app/'); pg.evaluate("localStorage.setItem('capi.tema','claro')"); pg.reload(); pg.click('[data-a=demo]'); pg.wait_for_timeout(600)
    pg.evaluate("document.getElementById('toast').remove()")
    png = pg.screenshot()
    Image.open(io.BytesIO(png)).convert('RGB').resize((620, 1272), Image.LANCZOS).save(R / 'assets/img/app-celular-v3.webp', 'WEBP', quality=74, method=6)
    pg2 = b.new_page(viewport={'width': 1200, 'height': 630})
    f = R / 'tools' / 'og.html'
    f.write_text(f"""<!doctype html><meta charset=utf-8><style>@font-face{{font-family:J;src:url('../assets/fonts/archivo-var.woff2');font-weight:600 900}}*{{margin:0}}body{{width:1200px;height:630px;background:#0D0A0B;font-family:J;position:relative;overflow:hidden;color:#F8E5AD}}
img{{position:absolute;right:0;top:0;height:630px;width:740px;object-fit:cover;object-position:40% 20%}}.g{{position:absolute;inset:0;background:linear-gradient(90deg,#0D0A0B 40%,rgba(13,10,11,.7) 56%,rgba(13,10,11,0) 82%)}}
.c{{position:absolute;left:70px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;width:560px}}.c svg{{width:250px;height:auto;fill:#F8E5AD}}h1{{margin-top:36px;font-weight:800;font-size:76px;line-height:.9;letter-spacing:-.02em;text-transform:uppercase;color:#fff}}h1 b{{color:#CC4452}}</style>
<img src="../assets/img/hero-d.webp"><div class=g></div><div class=c>{logo}<h1>Sua nova carreira, <b>degrau por degrau.</b></h1></div>""")
    pg2.goto(f.as_uri()); pg2.evaluate('document.fonts.ready'); pg2.wait_for_timeout(300)
    Image.open(io.BytesIO(pg2.screenshot())).convert('RGB').save(R / 'assets/img/og-v2.jpg', 'JPEG', quality=82, optimize=True)
    b.close()
# apple-touch-icon: o iOS pinta transparência de preto, então aqui leva fundo creme
ic = Image.new('RGB', (180, 180), (248, 229, 173))
from PIL import ImageDraw
d = ImageDraw.Draw(ic); s = 180 / 64
for x, y, w in [(23.2, 8.7, 17.6), (16.7, 21.2, 30.6), (10.5, 33.6, 43), (4, 46, 56)]:
    sx = 18 + x * s * .8; sy = 22 + y * s * .8
    d.rectangle([sx, sy, sx + w * s * .8, sy + 9.6 * s * .8], fill=(204, 68, 82))
ic.save(R / 'assets/img/apple-touch-icon.png', optimize=True)
for n in ['app-celular-v3.webp', 'og-v2.jpg', 'apple-touch-icon.png']: print(n, (R / 'assets/img' / n).stat().st_size // 1024, 'KB')
