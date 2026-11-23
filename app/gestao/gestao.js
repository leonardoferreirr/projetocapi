(function () {
  'use strict';
  var d = document, w = window;

  /* ------------------------------------------------------------------
     Dados de demonstração. Regras fixas vêm do PGE 1:
     preço 12x R$ 69,90 = R$ 838,80 (Canvas, Bloco 5); presente de 50%
     para amiga de quem publica depoimento (Bloco 4); 12 créditos por
     participante que conclui os 30 módulos; grupos de até 20 (cap. 6);
     pilares C 1-10, A 11-15, P 16-25, I 26-30.
     Todo o resto (quantidades) é simulado e coerente entre si.
  ------------------------------------------------------------------ */
  var PRECO = 838.80, PRESENTE = PRECO / 2, CREDITOS = 12, VAGAS = 20, BASE = 3.7;
  var PILARES = [
    { id: 'C', nome: 'Comportamento', de: 1, ate: 10 },
    { id: 'A', nome: 'Atitude', de: 11, ate: 15 },
    { id: 'P', nome: 'Planejamento', de: 16, ate: 25 },
    { id: 'I', nome: 'Investimento', de: 26, ate: 30 }
  ];
  var CANAIS = ['Instagram', 'TikTok', 'LinkedIn', 'Influencers parceiras', 'Indicação entre participantes'];
  var REGIOES = ['Uberlândia', 'Outras cidades do Triângulo Mineiro', 'Outros estados'];
  var SENT = ['Esperança', 'Insegurança', 'Medo', 'Entusiasmo', 'Angústia', 'Alívio', 'Culpa'];

  var TURMAS = [
    {
      id: 'set', nome: 'Setembro', curto: 'Set', estado: 'encerrada', fim: '30 de setembro',
      mat: 38, presentes: 0, concl: 31, parou: [3, 2, 2, 0],
      canais: [18, 5, 6, 9, 0], regiao: [25, 9, 4],
      depo: 9, indic: 13, credUsados: 96, avulsos: 5, checkMedio: 68,
      be: [3.9, 3.8, 3.8, 3.7, 3.7, 3.6, 3.6, 3.5, 3.5, 3.4, 3.6, 3.7, 3.6, 3.5, 3.4, 3.3, 3.3, 3.2, 3.2, 3.1, 3.1, 3.0, 3.0, 3.0, 3.1, 3.3, 3.2, 3.1, 3.0, 2.9],
      sent: [58, 27, 19, 44, 9, 31, 6], cinco: 1
    },
    {
      id: 'out', nome: 'Outubro', curto: 'Out', estado: 'encerrada', fim: '30 de outubro',
      mat: 46, presentes: 3, concl: 35, parou: [5, 3, 2, 1],
      canais: [18, 6, 5, 8, 9], regiao: [27, 12, 7],
      depo: 7, indic: 10, credUsados: 41, avulsos: 2, checkMedio: 71,
      be: [3.8, 3.8, 3.7, 3.7, 3.6, 3.6, 3.5, 3.5, 3.4, 3.4, 3.5, 3.6, 3.6, 3.5, 3.4, 3.3, 3.3, 3.2, 3.2, 3.2, 3.1, 3.1, 3.0, 3.0, 3.1, 3.2, 3.2, 3.1, 3.0, 3.0],
      sent: [55, 30, 22, 39, 11, 28, 7], cinco: 1
    },
    {
      id: 'nov', nome: 'Novembro', curto: 'Nov', estado: 'andamento', dia: 23,
      mat: 57, presentes: 5,
      modulos: [0, 1, 0, 1, 1, 0, 2, 1, 1, 2, 2, 1, 3, 2, 3, 2, 3, 4, 4, 6, 6, 7, 5, 0, 0, 0, 0, 0, 0, 0],
      paradas: 7, checkHoje: 41,
      canais: [21, 8, 6, 10, 12], regiao: [31, 15, 11],
      depo: 2, indic: 5, avulsos: 0,
      be: [3.9, 3.9, 3.8, 3.8, 3.7, 3.6, 3.6, 3.5, 3.5, 3.4, 3.5, 3.7, 3.6, 3.5, 3.4, 3.4, 3.3, 3.3, 3.2, 3.2, 3.3, 3.2, 3.2],
      sent: [46, 41, 33, 29, 18, 15, 9], cinco: 3
    },
    {
      id: 'dez', nome: 'Dezembro', curto: 'Dez', estado: 'inscricoes', comeca: '1º de dezembro', faltam: 8,
      mat: 21, presentes: 2, canais: [7, 3, 2, 3, 6], regiao: [10, 6, 5], depo: 0, indic: 0, avulsos: 0, metaExemplo: 50
    }
  ];

  var AGENDA = [
    { dia: 24, sem: 'ter', hora: '19h30', turma: 'set', grupo: 'Turma de setembro, grupo 1', quem: 'Thaís', local: 'On-line', n: 18 },
    { dia: 25, sem: 'qua', hora: '12h00', turma: 'set', grupo: 'Turma de setembro, grupo 2', quem: 'Andréa', local: 'On-line', n: 11 },
    { dia: 26, sem: 'qui', hora: '19h30', turma: 'out', grupo: 'Turma de outubro, grupo 1', quem: 'Jéssika', local: 'Sala em Uberlândia', n: 20 },
    { dia: 27, sem: 'sex', hora: '08h00', turma: 'out', grupo: 'Turma de outubro, grupo 2', quem: 'Kerley', local: 'On-line', n: 7 },
    { dia: 28, sem: 'sáb', hora: '10h00', turma: 'mix', grupo: 'Grupo misto, setembro e outubro', quem: 'Priscila', local: 'On-line', n: 14 }
  ];

  /* ---------------- utilidades ---------------- */
  var $ = function (s) { return d.querySelector(s); };
  var soma = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
  var brl = function (v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
  var n1 = function (v) { return v.toFixed(1).replace('.', ','); };
  var pc = function (v) { return Math.round(v * 100) + '%'; };
  var SVGNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, txt) {
    var e = d.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'cls') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (txt != null) e.textContent = txt;
    return e;
  }
  function sv(tag, attrs, txt) {
    var e = d.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }
  function limpa(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }
  function icone(nome) { var s = sv('svg', { 'aria-hidden': 'true' }); s.appendChild(sv('use', { href: '#i-' + nome })); return s; }
  function status(tipo, txt) { var s = el('span', { cls: 'st ' + tipo }); s.appendChild(icone(tipo)); s.appendChild(d.createTextNode(txt)); return s; }
  function receita(t) { return (t.mat - t.presentes) * PRECO + t.presentes * PRESENTE; }
  function creditosTotal(t) { return t.concl * CREDITOS + t.indic; }

  /* ---------------- tooltip ---------------- */
  var tt = $('#tt');
  function mostra(ev, titulo, valor, extra) {
    limpa(tt);
    tt.appendChild(el('b', null, valor));
    tt.appendChild(el('span', null, titulo));
    if (extra) tt.appendChild(el('span', null, extra));
    var x, y;
    if (ev && ev.clientX != null && ev.type !== 'focus') { x = ev.clientX; y = ev.clientY; }
    else { var r = ev.target.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top; }
    tt.classList.add('on');
    var tw = tt.offsetWidth, th = tt.offsetHeight;
    var L = Math.min(Math.max(8, x - tw / 2), w.innerWidth - tw - 8);
    var T = y - th - 14; if (T < 8) T = y + 18;
    tt.style.left = L + 'px'; tt.style.top = T + 'px';
  }
  function esconde() { tt.classList.remove('on'); }
  function dica(alvo, titulo, valor, extra, marca) {
    alvo.addEventListener('pointermove', function (e) { mostra(e, titulo, valor, extra); if (marca) marca.classList.add('hov'); });
    alvo.addEventListener('pointerleave', function () { esconde(); if (marca) marca.classList.remove('hov'); });
    alvo.addEventListener('focus', function (e) { mostra(e, titulo, valor, extra); if (marca) marca.classList.add('hov'); });
    alvo.addEventListener('blur', function () { esconde(); if (marca) marca.classList.remove('hov'); });
  }
  w.addEventListener('scroll', esconde, { passive: true });

  /* ---------------- barras horizontais (HTML) ---------------- */
  function barras(host, itens, opt) {
    opt = opt || {};
    limpa(host);
    var max = opt.max || Math.max.apply(null, itens.map(function (i) { return i.v; })) || 1;
    itens.forEach(function (it) {
      var row = el('div', { cls: 'hb', tabindex: '0', role: 'img', 'aria-label': it.nome + ': ' + it.txt });
      row.appendChild(el('span', { cls: 'nm' }, it.nome));
      var tr = el('span', { cls: 'tr' });
      var bar = el('i', it.dest ? { cls: 'dest' } : null);
      bar.style.width = (it.v / max * 100) + '%';
      tr.appendChild(bar);
      row.appendChild(tr);
      row.appendChild(el('span', { cls: 'v' }, it.txt));
      dica(row, it.nome, it.txt, it.extra);
      host.appendChild(row);
    });
  }
  function tabela(host, cab, linhas) {
    limpa(host);
    var t = el('table'), th = el('thead'), tr = el('tr');
    cab.forEach(function (c, i) { tr.appendChild(el('th', i ? { cls: 'r', scope: 'col' } : { scope: 'col' }, c)); });
    th.appendChild(tr); t.appendChild(th);
    var tb = el('tbody');
    linhas.forEach(function (l) {
      var r = el('tr');
      l.forEach(function (c, i) { r.appendChild(el('td', i ? { cls: 'r' } : null, c)); });
      tb.appendChild(r);
    });
    t.appendChild(tb); host.appendChild(t);
  }

  /* ---------------- colunas por módulo (SVG) ---------------- */
  function colunasModulos(host, t) {
    limpa(host);
    var W = Math.max(280, host.clientWidth), H = 230, L = 26, R = 6, T = 12, B = 58;
    var pw = W - L - R, ph = H - T - B, band = pw / 30;
    var ymax = Math.max(4, Math.ceil(Math.max.apply(null, t.modulos) / 2) * 2);
    var y = function (v) { return T + ph * (1 - v / ymax); };
    var s = sv('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': 'Participantes por módulo atual, turma de ' + t.nome.toLowerCase() });
    for (var v = 0; v <= ymax; v += 2) {
      s.appendChild(sv('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: v ? 'var(--grid)' : 'var(--axis)', 'stroke-width': 1 }));
      s.appendChild(sv('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end', 'class': 'tick' }, String(v)));
    }
    // limite de hoje
    var xh = L + band * t.dia;
    s.appendChild(sv('line', { x1: xh, x2: xh, y1: T - 4, y2: T + ph, stroke: 'var(--muted)', 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
    var livre = W - R - xh - 6;
    s.appendChild(sv('text', { x: xh + 5, y: T + 6, 'text-anchor': 'start' }, livre > 135 ? 'Módulos ainda fechados' : livre > 82 ? 'Ainda fechados' : 'Fechados'));
    var bw = Math.min(24, Math.max(3, band - 2));
    t.modulos.forEach(function (n, i) {
      var cx = L + band * i + band / 2, x0 = cx - bw / 2, mod = i + 1;
      var pil = PILARES.filter(function (p) { return mod >= p.de && mod <= p.ate; })[0];
      var g = sv('g');
      var hit = sv('rect', { x: L + band * i, y: T, width: band, height: ph, 'class': 'hit', tabindex: '0', role: 'img', 'aria-label': 'Módulo ' + mod + ': ' + n + ' participantes' });
      var mk = null;
      if (n > 0) {
        var top = y(n), base = y(0), r = Math.min(4, bw / 2, base - top);
        mk = sv('path', { 'class': 'mk', fill: 'var(--bordo)', d: 'M' + x0 + ',' + base + 'V' + (top + r) + 'Q' + x0 + ',' + top + ' ' + (x0 + r) + ',' + top + 'H' + (x0 + bw - r) + 'Q' + (x0 + bw) + ',' + top + ' ' + (x0 + bw) + ',' + (top + r) + 'V' + base + 'Z' });
      }
      g.appendChild(hit); if (mk) g.appendChild(mk);
      var fechado = mod > t.dia;
      dica(hit, 'Módulo ' + mod + ', ' + pil.nome, fechado ? 'Ainda fechado' : n + (n === 1 ? ' participante' : ' participantes'), null, mk);
      s.appendChild(g);
      if ([1, 10, 15, 20, 25, 30].indexOf(mod) > -1) s.appendChild(sv('text', { x: cx, y: T + ph + 16, 'text-anchor': 'middle', 'class': 'tick' }, String(mod)));
    });
    // faixas dos pilares
    PILARES.forEach(function (p) {
      var x1 = L + band * (p.de - 1) + 1, x2 = L + band * p.ate - 1, yb = T + ph + 30;
      s.appendChild(sv('line', { x1: x1, x2: x2, y1: yb, y2: yb, stroke: 'var(--bordo)', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: .35 }));
      var nm = (x2 - x1) > 80 ? p.nome : p.id;
      s.appendChild(sv('text', { x: (x1 + x2) / 2, y: yb + 16, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-weight': 600 }, nm));
    });
    host.appendChild(s);
  }

  /* ---------------- linha do bem-estar (SVG) ---------------- */
  function linhaBemEstar(host, t) {
    limpa(host);
    var serie = t.be, total = 30;
    var W = Math.max(280, host.clientWidth), H = W > 600 ? 270 : 220, L = 30, R = 40, T = 14, B = 28;
    var pw = W - L - R, ph = H - T - B, mn = 2.5, mx = 4.5;
    var x = function (i) { return L + pw * i / (total - 1); };
    var y = function (v) { return T + ph * (1 - (v - mn) / (mx - mn)); };
    var s = sv('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Ansiedade média diária de ' + n1(serie[0]) + ' no dia 1 para ' + n1(serie[serie.length - 1]) + ' no dia ' + serie.length + '. Linha de base da pesquisa: 3,7.' });
    [2.5, 3, 3.5, 4, 4.5].forEach(function (v) {
      s.appendChild(sv('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: v === 2.5 ? 'var(--axis)' : 'var(--grid)', 'stroke-width': 1 }));
      s.appendChild(sv('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end', 'class': 'tick' }, n1(v)));
    });
    [1, 10, 20, 30].forEach(function (dd) { s.appendChild(sv('text', { x: x(dd - 1), y: H - 8, 'text-anchor': 'middle', 'class': 'tick' }, 'Dia ' + dd)); });
    s.appendChild(sv('line', { x1: L, x2: W - R, y1: y(BASE), y2: y(BASE), stroke: 'var(--muted)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }));
    s.appendChild(sv('text', { x: W - R + 4, y: y(BASE) + 4 }, '3,7'));
    var dpath = serie.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1); }).join('');
    s.appendChild(sv('path', { d: dpath, fill: 'none', stroke: 'var(--bordo)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    var li = serie.length - 1;
    s.appendChild(sv('circle', { cx: x(li), cy: y(serie[li]), r: 4.5, fill: 'var(--bordo)', stroke: 'var(--card)', 'stroke-width': 2 }));
    s.appendChild(sv('text', { x: x(li) + 8, y: y(serie[li]) + 4, fill: 'var(--ink)', 'font-weight': 700 }, n1(serie[li])));
    // cruz de leitura
    var cross = sv('line', { y1: T, y2: T + ph, stroke: 'var(--axis)', 'stroke-width': 1, opacity: 0 });
    var dot = sv('circle', { r: 4.5, fill: 'var(--bordo)', stroke: 'var(--card)', 'stroke-width': 2, opacity: 0 });
    s.appendChild(cross); s.appendChild(dot);
    var area = sv('rect', { x: L, y: T, width: pw, height: ph, fill: 'transparent', tabindex: '0', role: 'img', 'aria-label': 'Leitura dia a dia. Use as setas.' });
    var atual = li;
    function marca(i, ev) {
      atual = Math.max(0, Math.min(li, i));
      cross.setAttribute('x1', x(atual)); cross.setAttribute('x2', x(atual)); cross.setAttribute('opacity', 1);
      dot.setAttribute('cx', x(atual)); dot.setAttribute('cy', y(serie[atual])); dot.setAttribute('opacity', 1);
      var dif = serie[atual] - BASE;
      mostra(ev, 'Dia ' + (atual + 1) + ' da jornada', n1(serie[atual]) + ' de média', (dif <= 0 ? n1(Math.abs(dif)) + ' abaixo' : n1(dif) + ' acima') + ' da linha de base');
    }
    function some() { cross.setAttribute('opacity', 0); dot.setAttribute('opacity', 0); esconde(); }
    area.addEventListener('pointermove', function (e) {
      var r = s.getBoundingClientRect(), px = e.clientX - r.left;
      marca(Math.round((px - L) / pw * (total - 1)), e);
    });
    area.addEventListener('pointerleave', some);
    area.addEventListener('focus', function (e) { marca(atual, e); });
    area.addEventListener('blur', some);
    area.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); marca(atual + (e.key === 'ArrowRight' ? 1 : -1), { target: dot, type: 'focus' }); }
    });
    s.appendChild(area);
    host.appendChild(s);
  }

  /* ---------------- render por turma ---------------- */
  var atualId = 'nov';
  function turma() { return TURMAS.filter(function (t) { return t.id === atualId; })[0]; }

  function kpi(lab, val, det, st, largo) {
    var k = el('div', { cls: 'kpi' + (largo ? ' largo' : '') });
    k.appendChild(el('span', { cls: 'lab' }, lab));
    k.appendChild(el('span', { cls: 'val' }, val));
    if (st) k.appendChild(st);
    if (det) k.appendChild(el('span', { cls: 'det' }, det));
    return k;
  }

  function renderResumo(t) {
    var R = receita(t), k = limpa($('#kpis'));
    $('#hero-lab').textContent = t.estado === 'inscricoes' ? 'Pré-matrículas da turma' : 'Matrículas da turma';
    $('#hero-val').textContent = t.mat;
    var det = $('#hero-det'); limpa(det);
    var txt = t.estado === 'andamento' ? 'Turma de ' + t.nome.toLowerCase() + ', dia ' + t.dia + ' de 30. ' :
      t.estado === 'encerrada' ? 'Turma de ' + t.nome.toLowerCase() + ', encerrada em ' + t.fim + '. ' :
        'Turma de ' + t.nome.toLowerCase() + ', começa em ' + t.comeca + '. ';
    det.appendChild(d.createTextNode(txt));
    var b = el('b', null, t.presentes ? t.presentes + ' entraram com o presente de 50%.' : 'Nenhuma entrou com o presente de 50%.');
    det.appendChild(b);

    if (t.estado === 'andamento') {
      var ritmo = soma(t.modulos.slice(19));
      k.appendChild(kpi('No ritmo da turma', ritmo + ' (' + pc(ritmo / t.mat) + ')', 'no módulo 20 ou depois'));
      k.appendChild(kpi('Sem avançar há mais de 3 dias', String(t.paradas), 'precisam de um contato da equipe', status('atencao', 'Atenção')));
      k.appendChild(kpi('Ansiedade média hoje', n1(t.be[t.be.length - 1]), 'linha de base da pesquisa: 3,7', status('ok', 'Abaixo da base')));
      k.appendChild(kpi('Check-ins hoje', t.checkHoje + ' de ' + t.mat, pc(t.checkHoje / t.mat) + ' da turma respondeu'));
      k.appendChild(kpi('Receita contratada', brl(R), 'em 12 parcelas, antes da taxa da Hotmart', null, true));
    } else if (t.estado === 'encerrada') {
      var tot = creditosTotal(t);
      k.appendChild(kpi('Concluíram os 30 módulos', t.concl + ' de ' + t.mat, pc(t.concl / t.mat) + ' saíram com o Plano Individual'));
      k.appendChild(kpi('Créditos de encontros usados', t.credUsados + ' de ' + tot, pc(t.credUsados / tot) + ' do total da turma'));
      k.appendChild(kpi('Ansiedade no último dia', n1(t.be[29]), 'começou em ' + n1(t.be[0]) + ' no dia 1', status('ok', 'Abaixo da base')));
      k.appendChild(kpi('Check-in médio por dia', t.checkMedio + '%', 'das participantes responderam'));
      k.appendChild(kpi('Receita contratada', brl(R), 'em 12 parcelas, antes da taxa da Hotmart', null, true));
    } else {
      k.appendChild(kpi('Começa em', t.comeca, 'faltam ' + t.faltam + ' dias'));
      k.appendChild(kpi('Meta de exemplo', t.metaExemplo + ' matrículas', pc(t.mat / t.metaExemplo) + ' alcançado até agora'));
      k.appendChild(kpi('Por indicação', String(t.canais[4]), 'de participantes das turmas anteriores'));
      k.appendChild(kpi('Com presente de 50%', String(t.presentes), 'amigas de quem publicou depoimento'));
      k.appendChild(kpi('Receita contratada', brl(R), 'em 12 parcelas, antes da taxa da Hotmart', null, true));
    }
  }

  function renderJornada(t) {
    var host = $('#c-jornada'), et = limpa($('#etapas')), tab = $('#tab-jornada');
    var sub = $('#jor-sub');
    if (t.estado === 'inscricoes') {
      $('#jor-tit').textContent = 'A jornada ainda não começou';
      sub.textContent = '';
      limpa(host).appendChild(el('p', { cls: 'vazio' }, 'A turma começa em ' + t.comeca + '. A partir daí, um módulo novo é liberado a cada 24 horas para cada participante.'));
      limpa(tab).appendChild(el('p', { cls: 'muted' }, 'Sem dados ainda.'));
      return;
    }
    var porPilar, concl;
    if (t.estado === 'andamento') {
      $('#jor-tit').textContent = 'Onde cada participante está';
      sub.textContent = 'Módulo atual de cada uma das ' + t.mat + ' participantes. Hoje é o dia ' + t.dia + ' da turma, então ninguém passou do módulo ' + t.dia + '.';
      colunasModulos(host, t);
      porPilar = PILARES.map(function (p) { return soma(t.modulos.slice(p.de - 1, p.ate)); });
      concl = 0;
      tabela(tab, ['Módulo', 'Pilar', 'Participantes'], t.modulos.map(function (n, i) {
        var p = PILARES.filter(function (pp) { return i + 1 >= pp.de && i + 1 <= pp.ate; })[0];
        return [String(i + 1), p.nome, String(n)];
      }));
    } else {
      $('#jor-tit').textContent = 'Como a turma terminou';
      sub.textContent = 'Quem concluiu os 30 módulos e em que pilar ficou quem parou.';
      porPilar = t.parou; concl = t.concl;
      var itens = [{ nome: 'Concluíram', v: t.concl, txt: String(t.concl), extra: pc(t.concl / t.mat) + ' da turma' }].concat(PILARES.map(function (p, i) {
        return { nome: 'Pararam em ' + p.nome, v: t.parou[i], txt: String(t.parou[i]), extra: 'Módulos ' + p.de + ' a ' + p.ate };
      }));
      barras(host, itens, { max: t.mat });
      tabela(tab, ['Situação', 'Participantes'], itens.map(function (i) { return [i.nome, i.txt]; }));
    }
    PILARES.forEach(function (p, i) {
      var c = el('div', { cls: 'etapa' });
      c.appendChild(el('b', null, String(porPilar[i])));
      c.appendChild(el('span', null, (t.estado === 'andamento' ? 'em ' : 'pararam em ') + p.nome + ' (' + p.de + ' a ' + p.ate + ')'));
      et.appendChild(c);
    });
    var c5 = el('div', { cls: 'etapa' });
    c5.appendChild(el('b', null, String(concl)));
    c5.appendChild(el('span', null, 'concluíram os 30 módulos'));
    et.appendChild(c5);
  }

  function renderBemEstar(t) {
    var host = $('#c-be'), sent = $('#c-sent'), ac = limpa($('#acolhe'));
    if (t.estado === 'inscricoes') {
      $('#be-sub').textContent = '';
      limpa(host).appendChild(el('p', { cls: 'vazio' }, 'Os check-ins começam no primeiro dia da turma.'));
      limpa(sent).appendChild(el('p', { cls: 'vazio' }, 'Ainda sem respostas.'));
      limpa($('#tab-be')).appendChild(el('p', { cls: 'muted' }, 'Sem dados ainda.'));
      return;
    }
    $('#be-sub').textContent = t.estado === 'andamento' ? 'Dias 1 a ' + t.dia + ' da turma' : 'Os 30 dias da turma';
    linhaBemEstar(host, t);
    tabela($('#tab-be'), ['Dia', 'Média'], t.be.map(function (v, i) { return ['Dia ' + (i + 1), n1(v)]; }));
    var itens = SENT.map(function (s, i) { return { nome: s, v: t.sent[i], txt: t.sent[i] + '%', extra: 'dos check-ins dos últimos 7 dias' }; })
      .sort(function (a, b) { return b.v - a.v; });
    barras(sent, itens, { max: 100 });
    var box = el('div', { cls: 'acolhe' });
    box.appendChild(icone('alerta'));
    var p = el('p');
    p.appendChild(el('b', null, t.cinco + (t.cinco === 1 ? ' check-in' : ' check-ins') + ' com ansiedade 5 '));
    p.appendChild(d.createTextNode((t.estado === 'andamento' ? 'nos últimos 7 dias. ' : 'na última semana da jornada. ') + 'A facilitadora de plantão entra em contato, explica os limites do programa e orienta a rede de apoio, como o CVV (188).'));
    box.appendChild(p);
    ac.appendChild(box);
  }

  function renderEncontros(t) {
    var ag = limpa($('#agenda')), cr = limpa($('#creditos'));
    AGENDA.forEach(function (a) {
      var meu = a.turma === t.id || (a.turma === 'mix' && (t.id === 'set' || t.id === 'out'));
      var cls = 'ag' + (t.estado === 'encerrada' ? (meu ? ' destaque' : ' fora') : '');
      var li = el('li', { cls: cls });
      var dia = el('div', { cls: 'dia' });
      dia.appendChild(el('b', null, String(a.dia)));
      dia.appendChild(el('span', null, a.sem));
      li.appendChild(dia);
      var inf = el('div', { cls: 'inf' });
      var l1 = el('div', { cls: 'l1' });
      l1.appendChild(el('b', null, a.hora + ', ' + a.grupo));
      var st = a.n >= VAGAS ? status('alerta', 'Lotado') : a.n < 10 ? status('atencao', 'Poucas inscritas') : status('ok', 'Com vagas');
      l1.appendChild(st);
      inf.appendChild(l1);
      inf.appendChild(el('p', { cls: 'l2' }, 'Facilitadora: ' + a.quem + '. ' + a.local + '.'));
      var occ = el('div', { cls: 'occ' });
      var tr = el('span', { cls: 'tr', role: 'img', 'aria-label': a.n + ' de ' + VAGAS + ' vagas ocupadas' });
      var i = el('i'); i.style.width = (a.n / VAGAS * 100) + '%'; tr.appendChild(i);
      occ.appendChild(tr);
      occ.appendChild(el('span', { cls: 'v' }, a.n + ' de ' + VAGAS));
      inf.appendChild(occ);
      li.appendChild(inf);
      ag.appendChild(li);
    });
    var sem = soma(AGENDA.map(function (a) { return a.n; }));
    $('#ag-sub').textContent = 'De 23 a 28 de novembro, todas as turmas em acompanhamento. ' + sem + ' créditos reservados na semana.';
    if (t.estado !== 'encerrada') {
      $('#cred-sub').textContent = 'Turma de ' + t.nome.toLowerCase();
      cr.appendChild(el('p', { cls: 'vazio' }, 'Esta turma ainda está nos 30 dias. Os 12 créditos de cada participante começam a valer depois do módulo 30.'));
      return;
    }
    var tot = creditosTotal(t);
    $('#cred-sub').textContent = 'Turma de ' + t.nome.toLowerCase() + ', ' + t.concl + ' participantes em acompanhamento';
    var m = el('div', { cls: 'meter' });
    m.appendChild(el('span', { cls: 'big' }, t.credUsados + ' de ' + tot));
    var trk = el('div', { cls: 'tr', role: 'img', 'aria-label': t.credUsados + ' de ' + tot + ' créditos usados' });
    var f = el('i'); f.style.width = (t.credUsados / tot * 100) + '%'; trk.appendChild(f);
    m.appendChild(trk);
    m.appendChild(el('p', null, 'créditos usados (' + pc(t.credUsados / tot) + '). Inclui ' + t.indic + ' créditos extras por indicação, na regra de exemplo de 1 por amiga.'));
    cr.appendChild(m);
    var mini = el('div', { cls: 'mini' });
    [['Base por participante', CREDITOS + ' créditos'], ['Média usada até agora', n1(t.credUsados / t.concl) + ' por pessoa'], ['Pedidos de créditos avulsos', String(t.avulsos)]].forEach(function (r) {
      var dv = el('div'); dv.appendChild(el('span', null, r[0])); dv.appendChild(el('b', null, r[1])); mini.appendChild(dv);
    });
    cr.appendChild(mini);
  }

  function renderCaptacao(t) {
    var itens = CANAIS.map(function (c, i) { return { nome: c, v: t.canais[i], txt: String(t.canais[i]), extra: pc(t.canais[i] / t.mat) + ' das matrículas' }; })
      .sort(function (a, b) { return b.v - a.v; });
    barras($('#c-canais'), itens);
    $('#cap-sub').textContent = t.mat + (t.estado === 'inscricoes' ? ' pré-matrículas' : ' matrículas') + ', pelo canal em que cada uma chegou';
    tabela($('#tab-canais'), ['Canal', 'Matrículas'], itens.map(function (i) { return [i.nome, i.txt]; }));
    barras($('#regiao'), REGIOES.map(function (r, i) { return { nome: r, v: t.regiao[i], txt: String(t.regiao[i]), extra: pc(t.regiao[i] / t.mat) + ' da turma' }; }));
    var pv = limpa($('#prova'));
    [['Depoimentos publicados por esta turma', String(t.depo)], ['Indicações feitas por esta turma', String(t.indic)], ['Matrículas com presente de 50%', String(t.presentes)]].forEach(function (r) {
      var dv = el('div'); dv.appendChild(el('span', null, r[0])); dv.appendChild(el('b', null, r[1])); pv.appendChild(dv);
    });
  }

  function renderReceitas(t) {
    var h = limpa($('#receitas'));
    function card(lab, val, det, fraco) {
      var c = el('div', { cls: 'rec' });
      c.appendChild(el('span', { cls: 'lab' }, lab));
      c.appendChild(el('b', { cls: 'val' + (fraco ? ' fraco' : '') }, val));
      c.appendChild(el('p', { cls: 'det' }, det));
      h.appendChild(c);
    }
    var cheias = t.mat - t.presentes;
    card('Programa principal', brl(cheias * PRECO), cheias + (cheias === 1 ? ' matrícula' : ' matrículas') + ' a R$ 838,80, ou 12x de R$ 69,90');
    card('Presente de 50% por depoimento', brl(t.presentes * PRESENTE), t.presentes ? t.presentes + (t.presentes === 1 ? ' amiga presenteada' : ' amigas presenteadas') + ', a R$ 419,40 cada' : 'Primeira turma, ainda sem depoimentos de turmas anteriores.');
    card('Créditos avulsos de encontros', 'Valor a definir', t.avulsos + (t.avulsos === 1 ? ' pedido registrado' : ' pedidos registrados') + '. O preço do crédito avulso ainda não foi fixado.', true);
    card('Licenciamento para empresas', 'Expansão futura', 'Para empresas com muitos desligamentos, depois que o modelo estiver validado.', true);
  }

  function renderRiscos(t) {
    var eng = $('#risco-eng'), cfp = $('#risco-cfp');
    if (t.estado === 'andamento') eng.textContent = 'Nesta turma: ' + t.paradas + ' participantes sem avançar há mais de 3 dias.';
    else if (t.estado === 'encerrada') eng.textContent = 'Nesta turma: ' + (t.mat - t.concl) + ' de ' + t.mat + ' não chegaram ao módulo 30 (' + pc((t.mat - t.concl) / t.mat) + ').';
    else eng.textContent = 'Nesta turma: a jornada começa em ' + t.comeca + '.';
    cfp.textContent = t.estado === 'inscricoes' ? 'Nesta turma: ainda sem check-ins.' : 'Nesta turma: ' + t.cinco + (t.cinco === 1 ? ' check-in' : ' check-ins') + ' com ansiedade 5 na última semana, todos com contato da equipe.';
  }

  function estadoTxt(t) {
    var e = limpa($('#estado'));
    var b = el('b', null, t.estado === 'andamento' ? 'Em andamento' : t.estado === 'encerrada' ? 'Encerrada' : 'Inscrições abertas');
    e.appendChild(b);
    e.appendChild(d.createTextNode(t.estado === 'andamento' ? ', dia ' + t.dia + ' de 30' : t.estado === 'encerrada' ? ' em ' + t.fim + ', em acompanhamento' : ', começa em ' + t.comeca));
  }

  function render() {
    var t = turma();
    estadoTxt(t);
    renderResumo(t); renderJornada(t); renderBemEstar(t); renderEncontros(t); renderCaptacao(t); renderReceitas(t); renderRiscos(t);
    $('#conteudo').classList.add('pronto');
  }

  /* ---------------- filtro de turma ---------------- */
  var seg = $('#turmas');
  TURMAS.forEach(function (t) {
    var b = el('button', { type: 'button', 'data-id': t.id, 'aria-pressed': String(t.id === atualId) });
    b.appendChild(d.createTextNode(t.nome));
    b.appendChild(el('small', null, t.estado === 'andamento' ? 'em andamento' : t.estado === 'encerrada' ? 'encerrada' : 'inscrições'));
    b.addEventListener('click', function () {
      atualId = t.id;
      seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.id === atualId)); });
      try { history.replaceState(null, '', '#' + atualId); } catch (e) { }
      render();
    });
    seg.appendChild(b);
  });
  var h = (location.hash || '').slice(1);
  if (TURMAS.some(function (t) { return t.id === h; })) {
    atualId = h;
    seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.id === atualId)); });
  }
  render();
  var sel = seg.querySelector('[aria-pressed="true"]');
  if (sel && seg.scrollWidth > seg.clientWidth) seg.scrollLeft = sel.offsetLeft - 8;
  w.addEventListener('hashchange', function () {
    var id = (location.hash || '').slice(1);
    if (id === atualId || !TURMAS.some(function (t) { return t.id === id; })) return;
    atualId = id;
    seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.id === atualId)); });
    render();
  });

  /* redesenha os gráficos em SVG quando a largura muda */
  var larg = w.innerWidth, pend = false;
  w.addEventListener('resize', function () {
    if (pend || w.innerWidth === larg) return;
    pend = true;
    requestAnimationFrame(function () {
      pend = false; larg = w.innerWidth;
      var t = turma();
      if (t.estado === 'andamento') colunasModulos($('#c-jornada'), t);
      if (t.estado !== 'inscricoes') linhaBemEstar($('#c-be'), t);
    });
  });
})();
