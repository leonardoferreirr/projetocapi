# Projeto C.A.P.I.

Projeto de Graduação em Psicologia (ESAMC Uberlândia, 2026). Dois produtos no mesmo deploy:

- `/` site institucional (`index.html`, `assets/site.js`)
- `/app/` área da aluna, no estilo das áreas de membros da Hotmart e da Kiwify (`app/index.html`, `app/app-v2.js`, `app/dados-v2.js`)
- `/app/gestao/` painel da equipe (`app/gestao/`)

Fonte de verdade do conteúdo: o PGE 1 (plano de negócios). Os números do painel são de demonstração.

## Onde trocar

- Vídeo de cada módulo: `VIDEOS` no topo de `app/app-v2.js` (mp4 em `assets/video/` ou link de incorporação do YouTube). O vídeo atual da aula 1 é uma abertura provisória feita com as imagens da marca (`tools/video/cenas.py`).
- Material de cada módulo: `MATERIAIS` em `app/app-v2.js` (PDF em `assets/materiais/`). O guia da aula 1 sai de `tools/material/guia.py`.
- Link do grupo da turma no WhatsApp: `LINK_GRUPO` em `app/app-v2.js`.
- Títulos, resumos e perguntas dos 30 módulos: `app/dados-v2.js`.
- Botão de compra do site: hoje leva para `/app/?matricula=1` (compra simulada). Trocar pelo link do checkout da Hotmart quando existir.

## Rodar local

```
node tools/serve.mjs 4310
```

Imagens: `python3 tools/build_assets.py <pasta com as imagens extraídas do PDF>`. Ao trocar uma imagem já publicada, salve com nome novo (`-v2`), porque `/assets/` fica em cache por 7 dias.
