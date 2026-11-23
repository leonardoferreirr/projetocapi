"""Gera as imagens WebP do site a partir das imagens extraídas do PGE 1 (pdfimages).
Uso: python3 tools/build_assets.py <pasta_com_pgN-000.png>"""
import sys, os
from PIL import Image
src = sys.argv[1]
out = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
os.makedirs(out, exist_ok=True)

def load(name):
    return Image.open(os.path.join(src, name)).convert('RGB')

def save(im, name, w, q=72):
    h = round(im.height * w / im.width)
    im.resize((w, h), Image.LANCZOS).save(os.path.join(out, name), 'WEBP', quality=q, method=6)
    print(name, w, h, os.path.getsize(os.path.join(out, name)) // 1024, 'KB')

# Capa: três rostos, sem o logo (logo começa em ~y=1080)
capa = load('pg1-000.png').crop((0, 0, 1240, 1060))
save(capa, 'hero-d.webp', 1240, 70)
save(capa.crop((170, 0, 1053, 1060)), 'hero-m.webp', 720, 68)
save(capa.crop((170, 0, 1053, 1060)), 'hero-s.webp', 480, 66)

# Aberturas de capítulo: o logo fica entre ~15% e 29% da altura; recortar abaixo
def below(name):
    im = load(name)
    return im.crop((0, int(im.height * 0.31), im.width, im.height))

esc = {'pg91': 'escada-inicio', 'pg45': 'escada-triangulo', 'pg21': 'escada-passos', 'pg117': 'escada-turma'}
for pg, nome in esc.items():
    im = below(pg + '-000.png')
    save(im, nome + '.webp', 900, 70)
    save(im, nome + '-s.webp', 520, 68)

# Capas verticais (2:3) para a área da aluna, uma por pilar
posters = {'C': ('pg91', 0.30), 'A': ('pg45', 0.18), 'P': ('pg21', 0.0), 'I': ('pg117', 0.08)}
for letra, (pg, fx) in posters.items():
    im = below(pg + '-000.png')
    w = round(im.height * 2 / 3)
    x = int((im.width - w) * fx / 0.34) if fx else 0
    x = max(0, min(im.width - w, x))
    save(im.crop((x, 0, x + w, im.height)), f'pilar-{letra.lower()}.webp', 420, 70)

# Equipe: retratos sobre coral, pessoa à direita (corte na borda direita é do original)
for pg, nome in zip(['pg16', 'pg17', 'pg18', 'pg19', 'pg20'], ['andrea', 'jessika', 'kerley', 'priscila', 'thais']):
    im = load(pg + '-000.png').crop((290, 110, 827, 1030))
    save(im, f'equipe-{nome}.webp', 420, 74)

g = load('pg15-000.png')
save(g.crop((0, int(g.height * 0.47), g.width, g.height)), 'equipe-grupo.webp', 1000, 72)

# Capas 16:9 do player (uma por pilar) e banner da área da aluna
capas = {'c': ('pg91', 400), 'a': ('pg45', 200), 'p': ('pg21', 0), 'i': ('pg117', 250)}
for letra, (pg, y) in capas.items():
    im = below(pg + '-000.png')
    save(im.crop((0, y, 1000, y + 563)), f'aula-{letra}.webp', 960, 70)
    save(im.crop((0, y, 1000, y + 563)), f'aula-{letra}-s.webp', 560, 66)
t = below('pg117-000.png')
save(t.crop((0, 120, 1000, 760)), 'banner-d.webp', 1000, 70)
