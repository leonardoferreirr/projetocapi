/* Área da aluna do Projeto C.A.P.I. (protótipo). Tudo fica salvo no navegador da pessoa (localStorage). */
(function () {
  'use strict';
  var MODS = window.CAPI_MODS || [], PLANO = window.CAPI_PLANO || [];
  var KEY = 'capi.aluna.v1', H24 = 864e5;

  /* troque aqui quando o vídeo gravado da aula chegar (mp4 próprio ou link do YouTube) */
  var VIDEOS = { 1: '/assets/video/aula-01.mp4' };
  var MATERIAIS = { 1: '/assets/materiais/guia-da-jornada-capi.pdf' };
  var LINK_GRUPO = ''; /* link do grupo da turma no WhatsApp */

  var PIL = [
    { id: 'C', nome: 'Comportamento', de: 1, ate: 10, img: 'c', desc: 'O ponto de partida: olhar para os seus hábitos, padrões e reações.', sai: 'Registro de autoconhecimento' },
    { id: 'A', nome: 'Atitude', de: 11, ate: 15, img: 'a', desc: 'A disposição para mudar e decidir com consciência.', sai: 'Quadro de possibilidades e decisões' },
    { id: 'P', nome: 'Planejamento', de: 16, ate: 25, img: 'p', desc: 'A vontade de mudar traduzida em etapas concretas.', sai: 'Plano de ação profissional' },
    { id: 'I', nome: 'Investimento', de: 26, ate: 30, img: 'i', desc: 'Recursos financeiros, emocionais e de tempo a favor do seu projeto.', sai: 'Plano Individual de Transição de Carreira' }
  ];
  var NIVEIS = ['Nenhuma', 'Leve', 'Moderada', 'Forte', 'Muito intensa'];
  var SENT = ['Medo', 'Insegurança', 'Esperança', 'Entusiasmo', 'Angústia', 'Culpa', 'Alívio'];
  var FACIL = ['Andréa', 'Jéssika', 'Kerley', 'Priscila', 'Thaís'];
  var DECISOES = ['Iniciar a transição agora', 'Continuar me preparando antes de mudar', 'Ampliar conhecimentos primeiro', 'Reorganizar as finanças antes de iniciar'];
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  /* mapa pergunta por chave, para montar o plano */
  var CAMPO = {};
  MODS.forEach(function (m, i) { m.campos.forEach(function (c) { CAMPO[c.k] = { q: c.q, n: i + 1 }; }); });

  /* ---------- estado ---------- */
  var S = null;
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  function salva() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function dkey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function novo(nome, email) {
    var hoje = new Date();
    return { v: 1, user: { nome: nome, email: email || '' }, turma: MESES[hoje.getMonth()] + ' de ' + hoje.getFullYear(), done: {}, ans: {}, notas: {}, ck: {}, creditos: 12, agenda: [], lib: {}, dias: true, abaV: {} };
  }
  function demo() {
    var s = novo('Mariana Souza', 'mariana@exemplo.com'), agora = Date.now();
    s.done = { 1: agora - 3 * H24 - 4e6, 2: agora - 2 * H24 - 3e6, 3: agora - H24 - 36e5 };
    s.ans = {
      m1_motivo: 'Sinto que parei no tempo no trabalho e o cansaço já não compensa. Quero entender se a Nutrição é um caminho possível para mim.',
      m1_expect: 'Um plano com datas e a segurança de saber quanto preciso guardar antes de mudar.',
      m2_historia: 'Comecei como assistente administrativa aos 23 anos. Virei coordenadora aos 29 e gerente aos 33. Nesse meio tempo tive meus dois filhos.',
      m2_significado: 'Hoje o trabalho é mais obrigação do que realização. Gosto das pessoas, mas não do que faço.',
      m3_valores: 'Tempo com a família, autonomia, cuidar de pessoas e aprender sempre.',
      m3_interesses: 'Alimentação, saúde e conversar com pessoas, vendo resultado no dia a dia delas.',
      m3_expect: 'Trabalhar com mais flexibilidade e sentir que o que eu faço faz diferença.'
    };
    var hist = [4, 4, 3, 4, 3, 3, 3, 2, 3], sents = [['Medo', 'Insegurança'], ['Insegurança', 'Angústia'], ['Medo', 'Esperança'], ['Insegurança', 'Culpa'], ['Esperança'], ['Medo', 'Entusiasmo'], ['Esperança', 'Insegurança'], ['Entusiasmo', 'Alívio'], ['Esperança']];
    hist.forEach(function (v, i) { var d = new Date(); d.setDate(d.getDate() - (hist.length - i)); s.ck[dkey(d)] = { n: v, s: sents[i], ex: true }; });
    s.demo = true;
    return s;
  }

  /* ---------- utilidades ---------- */
  var $ = function (q, r) { return (r || document).querySelector(q); };
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function primeiro() { return esc(((S && S.user.nome) || '').trim().split(' ')[0] || 'você'); }
  function inicial() { return esc((((S && S.user.nome) || 'C').trim()[0] || 'C').toUpperCase()); }
  function pilarDe(n) { for (var i = 0; i < PIL.length; i++) if (n >= PIL[i].de && n <= PIL[i].ate) return PIL[i]; return PIL[0]; }
  function feitos() { return Object.keys(S.done).length; }
  function feitosPil(p) { var c = 0; for (var n = p.de; n <= p.ate; n++) if (S.done[n]) c++; return c; }
  function atual() { for (var n = 1; n <= 30; n++) if (!S.done[n]) return n; return 0; }
  function abreEm(n) { return n === 1 || !S.done[n - 1] ? 0 : S.done[n - 1] + H24; }
  function disponivel(n) { if (n === 1 || S.done[n]) return true; if (!S.done[n - 1]) return false; return S.lib[n] || Date.now() >= abreEm(n); }
  function falta(ts) {
    var ms = Math.max(0, ts - Date.now()), h = Math.floor(ms / 36e5), m = Math.ceil((ms % 36e5) / 6e4);
    if (m === 60) { h++; m = 0; }
    return h > 0 ? h + 'h ' + String(m).padStart(2, '0') + 'min' : m + ' min';
  }
  function brl(v) { return (+v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
  function num(v) { var n = parseFloat(String(v || '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')); return isFinite(n) ? n : 0; }
  function toast(t) { var el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('on'); }, 2800); }
  function ic(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[n] || '') + '</svg>'; }
  var I = {
    casa: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    lista: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    grupo: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.7-3.6 3.1-5.6 6-5.6s5.3 2 6 5.6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.6c2.5.2 4.3 2 4.9 5.4"/>',
    coracao: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
    plano: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>',
    ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    cad: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    esq: '<path d="M15 5l-7 7 7 7"/>', dir: '<path d="M9 5l7 7-7 7"/>', chev: '<path d="M6 9l6 6 6-6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    chat: '<path d="M4 18.5V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H8.5z"/>',
    sair: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l4-4-4-4M14 12H4"/>', painel: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', site: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', lua: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    pres: '<path d="M4 12h16v8H4zM12 12v8M3 8h18v4H3zM12 8c-2-3.5-6-3.5-6-1s4 1 6 1zm0 0c2-3.5 6-3.5 6-1s-4 1-6 1z"/>', lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'
  };
  function temaAtual() { return document.documentElement.dataset.tema === 'escuro' ? 'escuro' : 'claro'; }
  function rota() { var p = location.hash.replace(/^#\/?/, '').split('/'); return { r: p[0] || 'inicio', a: p[1] }; }
  function vai(h) { location.hash = '#/' + h; }
  function anel(p, tam) {
    tam = tam || 92; var r = tam / 2 - 7, C = 2 * Math.PI * r;
    return '<div class="anel" style="width:' + tam + 'px;height:' + tam + 'px" role="img" aria-label="' + p + '% da jornada concluída"><svg viewBox="0 0 ' + tam + ' ' + tam + '" style="width:' + tam + 'px;height:' + tam + 'px"><circle cx="' + tam / 2 + '" cy="' + tam / 2 + '" r="' + r + '" fill="none" style="stroke:var(--s3)" stroke-width="8"/><circle cx="' + tam / 2 + '" cy="' + tam / 2 + '" r="' + r + '" fill="none" stroke="#CC4452" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="' + C * (1 - p / 100) + '"/></svg><b>' + p + '%</b></div>';
  }

  /* ---------- casca ---------- */
  var NAV = [['inicio', 'Início', 'casa'], ['conteudo', 'Conteúdo', 'lista'], ['encontros', 'Encontros', 'grupo'], ['bem-estar', 'Bem-estar', 'coracao'], ['plano', 'Meu plano', 'plano']];
  function casca(sec, corpo) {
    var pct = Math.round(feitos() / 30 * 100);
    var nav = NAV.map(function (x) { return '<a href="#/' + x[0] + '"' + (sec === x[0] ? ' class="on" aria-current="page"' : '') + '>' + x[1] + '</a>'; }).join('');
    var tabs = NAV.map(function (x) { return '<a href="#/' + x[0] + '"' + (sec === x[0] ? ' class="on" aria-current="page"' : '') + '>' + ic(x[2]) + '<span>' + (x[0] === 'plano' ? 'Plano' : x[1]) + '</span></a>'; }).join('');
    return '<header class="bar"><a class="logo" href="#/inicio" aria-label="Início da área da aluna"><svg viewBox="0 0 2852 1020" fill="currentColor" role="img" aria-label="Projeto C.A.P.I."><use href="#logo"/></svg></a>' +
      '<nav aria-label="Área da aluna">' + nav + '</nav>' +
      '<div class="dir"><div class="pill-prog" title="Progresso da jornada"><i><b style="width:' + pct + '%"></b></i>' + feitos() + ' de 30</div>' +
      '<button class="tema-b" data-a="tema" aria-label="' + (temaAtual() === 'escuro' ? 'Usar tema claro' : 'Usar tema escuro') + '">' + ic(temaAtual() === 'escuro' ? 'sol' : 'lua') + '</button><button class="av" data-a="menu" aria-haspopup="true" aria-expanded="false" aria-label="Menu da conta">' + inicial() + '</button></div>' +
      '<div class="menu-av" id="menuav" role="menu"><div class="quem"><b>' + esc(S.user.nome) + '</b><small class="mut">Turma de ' + esc(S.turma) + '</small></div>' +
      '<button data-a="tema" role="menuitem">' + ic(temaAtual() === 'escuro' ? 'sol' : 'lua') + (temaAtual() === 'escuro' ? 'Tema claro' : 'Tema escuro') + '</button><a href="#/apoio" role="menuitem">' + ic('chat') + 'Apoio e conta</a><a href="/app/gestao/" role="menuitem">' + ic('painel') + 'Painel da equipe</a><a href="/" role="menuitem">' + ic('site') + 'Site do projeto</a><button data-a="sair" role="menuitem">' + ic('sair') + 'Sair</button></div></header>' +
      '<main class="vista" id="vista" tabindex="-1">' + corpo + '</main><nav class="tabs" aria-label="Navegação">' + tabs + '</nav>';
  }

  /* ---------- entrar ---------- */
  function entrar() {
    var q = new URLSearchParams(location.search), mat = q.get('matricula');
    return '<main class="entrar"><div class="entrar-foto"><svg class="logo" viewBox="0 0 2852 1020" fill="currentColor" role="img" aria-label="Projeto C.A.P.I."><use href="#logo"/></svg>' +
      '<img src="/assets/img/hero-m.webp" srcset="/assets/img/hero-s.webp 480w, /assets/img/hero-m.webp 720w, /assets/img/hero-d.webp 1240w" sizes="(min-width: 980px) 54vw, 100vw" width="720" height="864" alt="" fetchpriority="high"></div>' +
      '<form class="entrar-box" id="fEntrar" novalidate><h1>Boas-vindas à sua área</h1><p class="mut">Entre para assistir aos módulos, fazer as tarefas e acompanhar a sua jornada.</p>' +
      (mat ? '<div class="aviso" style="margin-top:18px">' + ic('info') + '<span><b>Compra simulada.</b> Na versão real, o pagamento acontece na Hotmart e o acesso chega no seu e-mail.</span></div>' : '') +
      '<label class="campo"><span>Seu nome</span><input class="inp" name="nome" autocomplete="name" required placeholder="Como você quer ser chamada"></label>' +
      '<label class="campo"><span>E-mail</span><input class="inp" name="email" type="email" autocomplete="email" inputmode="email" placeholder="voce@email.com"></label>' +
      '<button class="btn" type="submit">Entrar ' + ic('dir') + '</button><p class="ou">ou</p>' +
      '<button class="btn sec" type="button" data-a="demo" style="width:100%">Ver como a Mariana, já no módulo 4</button>' +
      '<p class="rod">Protótipo: suas respostas ficam salvas só neste navegador. <a href="/">Voltar ao site</a></p></form></main>';
  }

  /* ---------- check-in ---------- */
  function checkin(compacto) {
    var hoje = S.ck[dkey()];
    if (hoje && !compacto) return ckFeito(hoje);
    if (hoje) return '<div class="card ck">' + ckFeito(hoje) + '</div>';
    var rasc = ckRasc;
    return '<div class="card ck" id="ck"><h2>Como está a sua ansiedade hoje?</h2><p class="mut pq" style="margin-top:4px">De 1 a 5, sem resposta certa. Leva menos de um minuto.</p>' +
      '<div class="esc" role="group" aria-label="Nível de ansiedade">' + NIVEIS.map(function (l, i) { return '<button type="button" data-a="ckn" data-v="' + (i + 1) + '" aria-pressed="' + (rasc.n === i + 1) + '" class="' + (rasc.n === i + 1 ? 'on' : '') + '"><b>' + (i + 1) + '</b><small>' + l + '</small></button>'; }).join('') + '</div>' +
      (rasc.n ? '<p class="rot">Que sentimentos estão mais presentes?</p><div class="sent">' + SENT.map(function (s) { var on = rasc.s.indexOf(s) > -1; return '<button type="button" data-a="cks" data-v="' + s + '" aria-pressed="' + on + '" class="' + (on ? 'on' : '') + '">' + s + '</button>'; }).join('') + '</div>' +
        '<div class="btns" style="margin-top:18px"><button class="btn" data-a="ckok">Registrar check-in</button></div>' : '') + '</div>';
  }
  var ckRasc = { n: 0, s: [] };
  function ckFeito(c) {
    var apoio = c.n >= 5 ? '<div class="apoio-alerta"><b>Obrigada por contar. Você não precisa passar por isso sozinha.</b>Se a ansiedade estiver difícil de suportar, ligue para o <a href="tel:188">CVV, 188</a>, gratuito e 24 horas. A equipe também pode te orientar pelo suporte da turma.</div>' : '';
    return '<div class="ck-feito"><span class="nv">' + c.n + '</span><div><b>Check-in de hoje feito</b><p class="mut pq">Ansiedade ' + NIVEIS[c.n - 1].toLowerCase() + (c.s && c.s.length ? ', com ' + c.s.join(', ').toLowerCase() : '') + '.</p></div></div>' + apoio;
  }
  function grafico() {
    var dias = [], i;
    for (i = 13; i >= 0; i--) { var d = new Date(); d.setDate(d.getDate() - i); dias.push({ d: d, c: S.ck[dkey(d)] }); }
    var W = 620, H = 170, L = 26, R = 10, T = 12, B = 26, x = function (k) { return L + k * (W - L - R) / 13; }, y = function (v) { return T + (H - T - B) * (1 - (v - 1) / 4); };
    var g = '';
    for (i = 1; i <= 5; i++) g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(i) + '" y2="' + y(i) + '" style="stroke:var(--line)"/><text x="' + (L - 10) + '" y="' + (y(i) + 4) + '" text-anchor="end">' + i + '</text>';
    g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(3.7) + '" y2="' + y(3.7) + '" style="stroke:var(--ouro)" stroke-dasharray="4 5" stroke-width="1.5"/><text x="' + (W - R) + '" y="' + (y(3.7) - 6) + '" text-anchor="end">média da pesquisa: 3,7</text>';
    var pts = dias.map(function (o, k) { return o.c ? [x(k), y(o.c.n), o.c.n] : null; }).filter(Boolean);
    if (pts.length > 1) g += '<polyline fill="none" stroke="#CC4452" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '"/>';
    g += pts.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5" fill="#CC4452" style="stroke:var(--s1)" stroke-width="2"/>'; }).join('');
    g += dias.map(function (o, k) { return k % 2 === 1 || k === 13 ? '<text x="' + x(k) + '" y="' + (H - 6) + '" text-anchor="middle">' + (k === 13 ? 'hoje' : o.d.getDate() + '/' + (o.d.getMonth() + 1)) + '</text>' : ''; }).join('');
    var desc = pts.length ? 'Ansiedade registrada nos últimos 14 dias: ' + pts.map(function (p) { return p[2]; }).join(', ') : 'Nenhum check-in ainda';
    return '<svg class="graf" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + desc + '">' + g + '</svg>';
  }

  /* ---------- início ---------- */
  function inicio() {
    var n = atual(), f = feitos(), pct = Math.round(f / 30 * 100), txt, cta;
    if (!n) { txt = 'Você concluiu os 30 módulos. O seu Plano Individual de Transição de Carreira está pronto para revisar.'; cta = '<a class="btn" href="#/plano">Ver meu plano ' + ic('dir') + '</a>'; }
    else if (f === 0) { txt = 'Que bom ter você aqui. Comece pelo vídeo da primeira aula, ele explica como vão ser os próximos dias.'; cta = '<a class="btn" href="#/aula/1">' + ic('play') + ' Assistir à primeira aula</a>'; }
    else if (disponivel(n)) { txt = 'Hoje é dia do módulo ' + n + ': ' + esc(MODS[n - 1].t) + '.'; cta = '<a class="btn" href="#/aula/' + n + '">' + ic('play') + ' Continuar no módulo ' + n + '</a>'; }
    else { txt = 'Você concluiu o módulo ' + (n - 1) + '. O módulo ' + n + ' abre em ' + falta(abreEm(n)) + ', enquanto isso você pode rever a tarefa ou fazer o check-in.'; cta = '<a class="btn" href="#/aula/' + (n - 1) + '">Rever o módulo ' + (n - 1) + '</a>'; }
    var m = MODS[(n || 30) - 1], p = pilarDe(n || 30), prox = proximoEncontro(), plano = planoFeito();
    return '<section class="banner"><div class="banner-foto"><picture><source media="(min-width: 980px)" srcset="/assets/img/banner-d.webp"><img src="/assets/img/escada-turma-s.webp" width="520" height="506" alt="Mulheres subindo uma escada juntas" fetchpriority="high"></picture></div>' +
      '<div class="banner-txt"><h1>Olá, ' + primeiro() + '.</h1><p>' + txt + '</p><div class="btns">' + cta + '<a class="btn vidro" href="#/conteudo">Ver todo o conteúdo</a></div>' +
      '<div class="prog"><span><span>' + f + ' de 30 módulos</span><span>' + pct + '%</span></span><div class="barra"><i style="width:' + pct + '%"></i></div></div></div></section>' +
      (S.dias ? '<section class="dias" aria-labelledby="t-dias"><h2 id="t-dias">Como vão ser os seus 30 dias</h2><button class="x" data-a="fechaDias" aria-label="Fechar explicação">' + ic('x') + '</button><ol>' +
        '<li><span class="n">1</span><div><b>Um módulo por vez</b>O próximo abre 24 horas depois que você conclui o anterior, para dar tempo de pensar.</div></li>' +
        '<li><span class="n">2</span><div><b>Vídeo, material e tarefa</b>Cada módulo tem um vídeo curto, um material de apoio e uma tarefa prática.</div></li>' +
        '<li><span class="n">3</span><div><b>Seu plano se monta sozinho</b>As respostas das tarefas formam o seu Plano Individual de Transição.</div></li>' +
        '<li><span class="n">4</span><div><b>Depois do módulo 30</b>Você usa os seus 12 créditos em encontros em grupo, ao longo de um ano.</div></li></ol></section>' : '') +
      '<section class="bloco grade2"><div>' + (n ? '<h2 style="margin-bottom:14px">Continue de onde parou</h2><a class="card continuar" href="#/aula/' + n + '"><div class="th"><img src="/assets/img/aula-' + p.img + '-s.webp" width="560" height="315" alt="" loading="lazy">' + (disponivel(n) ? ic('play') : '') + '</div><div><small>Pilar ' + p.nome + ' · Módulo ' + n + ' de 30</small><b>' + esc(m.t) + '</b><small style="margin-top:6px">' + (disponivel(n) ? m.min + ' min de vídeo e uma tarefa' : 'Abre em ' + falta(abreEm(n))) + '</small></div></a>' : '<h2 style="margin-bottom:14px">Jornada concluída</h2><div class="card"><p class="mut">Você passou pelos quatro pilares. Agora é hora de usar os encontros para colocar o plano em prática.</p></div>') + '</div>' +
      '<div><h2 style="margin-bottom:14px">Check-in de bem-estar</h2>' + checkin(true) + '</div></section>' +
      '<section class="bloco"><div class="cab-sec"><h2>Os quatro pilares</h2><a href="#/conteudo">Ver tudo</a></div><div class="vitrine">' + PIL.map(function (q) {
        var tot = q.ate - q.de + 1, fe = feitosPil(q);
        return '<a class="poster" href="#/conteudo/' + q.id + '"><img src="/assets/img/pilar-' + q.img + '.webp" width="420" height="630" alt="" loading="lazy"><span class="l" aria-hidden="true">' + q.id + '</span><span class="pinfo"><b>' + q.nome + '</b><small>Módulos ' + q.de + ' a ' + q.ate + ' · ' + fe + ' de ' + tot + '</small><span class="barra creme"><i style="width:' + (fe / tot * 100) + '%"></i></span></span></a>';
      }).join('') + '</div></section>' +
      '<section class="bloco grade2"><div class="card"><div class="cab-sec" style="margin-bottom:8px"><h2>Encontros em grupo</h2><a href="#/encontros">Abrir</a></div>' +
      (prox ? '<p>Seu próximo encontro: <b style="text-transform:capitalize">' + dataLonga(prox.ts) + '</b>, com ' + prox.f + '.</p>' : '<p class="mut">Você tem <b style="color:var(--txt)">' + S.creditos + ' créditos</b> para encontros semanais em grupos de até 20 mulheres, ao longo de um ano.</p>') + '</div>' +
      '<div class="card"><div class="cab-sec" style="margin-bottom:8px"><h2>Meu plano</h2><a href="#/plano">Abrir</a></div><p class="mut">' + plano.f + ' de ' + plano.t + ' respostas preenchidas. Cada tarefa que você faz entra aqui.</p><div class="barra" style="margin-top:12px"><i style="width:' + Math.round(plano.f / plano.t * 100) + '%"></i></div></div></section>';
  }

  /* ---------- aula ---------- */
  var aba = 'sobre';
  function linhaMod(k) {
    var m = MODS[k - 1], st, cls = '', d = m.min + ' min';
    if (S.done[k]) { st = ic('ok'); cls = 'feito'; }
    else if (disponivel(k)) { st = k; cls = 'atual'; }
    else { st = ic('lock'); cls = 'bloq'; d = S.done[k - 1] ? 'abre em ' + falta(abreEm(k)) : 'em breve'; }
    return '<li><a class="mod ' + cls + '" href="#/aula/' + k + '"' + (rota().a == k ? ' aria-current="page"' : '') + '><span class="st">' + st + '</span><span class="t">' + esc(m.t) + '<small>Módulo ' + k + '</small></span><span class="d">' + d + '</span></a></li>';
  }
  function listaPilares(abrir) {
    return PIL.map(function (q) {
      var tot = q.ate - q.de + 1, rows = '';
      for (var k = q.de; k <= q.ate; k++) rows += linhaMod(k);
      return '<details class="pil"' + (abrir === q.id ? ' open' : '') + '><summary><span class="lt">' + q.id + '</span><span><b>' + q.nome + '</b><small>' + feitosPil(q) + ' de ' + tot + ' concluídos</small></span>' + ic('chev').replace('<svg', '<svg class="chev"') + '</summary><ul>' + rows + '</ul></details>';
    }).join('');
  }
  function aula(n) {
    n = Math.max(1, Math.min(30, +n || 1));
    var m = MODS[n - 1], p = pilarDe(n), ok = disponivel(n), feito = !!S.done[n];
    var topo = ok ? '<div class="player" id="player" data-n="' + n + '"><img src="/assets/img/aula-' + p.img + '.webp" srcset="/assets/img/aula-' + p.img + '-s.webp 560w, /assets/img/aula-' + p.img + '.webp 960w" sizes="(min-width: 980px) 820px, 100vw" width="960" height="540" alt="" fetchpriority="high"><button class="play" data-a="play" aria-label="Assistir ao vídeo do módulo ' + n + '">' + ic('play') + '</button><span class="leg">Módulo ' + n + ' · ' + m.min + ' min</span></div>'
      : '<div class="bloqueado"><div class="cad">' + ic('cad') + '</div><h2>Este módulo ainda não abriu</h2>' + (S.done[n - 1] ? '<p class="mut" style="margin-top:6px">Ele abre 24 horas depois da conclusão do módulo ' + (n - 1) + '.</p><p class="cont" data-cont="' + abreEm(n) + '">' + falta(abreEm(n)) + '</p><div class="btns"><button class="btn sec" data-a="liberar" data-v="' + n + '">Abrir agora (demonstração)</button></div>' : '<p class="mut" style="margin-top:6px">Conclua o módulo ' + (n - 1) + ' para começar a contagem de 24 horas.</p><div class="btns"><a class="btn" href="#/aula/' + atual() + '">Ir para o módulo ' + atual() + '</a></div>') + '</div>';
    var acoes = '<div class="acoes">' + (ok ? (feito ? '<span class="etq ok">' + ic('ok') + 'Concluído</span><button class="btn sec pq2" data-a="desfaz" data-v="' + n + '">Marcar como não concluído</button>' : '<button class="btn" data-a="concluir" data-v="' + n + '">' + ic('ok') + 'Concluir módulo</button>') : '') +
      '<div class="nav2"><a class="ib" href="#/aula/' + (n - 1) + '" aria-label="Módulo anterior"' + (n === 1 ? ' aria-disabled="true"' : '') + '>' + ic('esq') + '</a><a class="ib" href="#/aula/' + (n + 1) + '" aria-label="Próximo módulo"' + (n === 30 ? ' aria-disabled="true"' : '') + '>' + ic('dir') + '</a></div></div>';
    var abas = [['sobre', 'Sobre o módulo'], ['tarefa', 'Tarefa do dia'], ['material', 'Material'], ['notas', 'Anotações']];
    var corpoAba = ok ? '<div class="abas" role="tablist">' + abas.map(function (a) { return '<button role="tab" data-a="aba" data-v="' + a[0] + '" aria-selected="' + (aba === a[0]) + '" class="' + (aba === a[0] ? 'on' : '') + '">' + a[1] + '</button>'; }).join('') + '</div><div class="painel-aba" role="tabpanel">' + painelAba(n) + '</div>' : '';
    return '<div class="aula"><div><div style="margin-top:0">' + topo + '</div><div class="aula-cab" style="margin-top:20px"><small>Pilar ' + p.nome + ' · Módulo ' + n + ' de 30</small><h1>' + esc(m.t) + '</h1></div>' + acoes + corpoAba + '</div>' +
      '<aside class="lado" aria-label="Conteúdo do programa"><h2>Conteúdo do programa</h2>' + listaPilares(p.id) + '</aside></div>';
  }
  function painelAba(n) {
    var m = MODS[n - 1];
    if (aba === 'sobre') {
      var extra = n === 1 ? '<p><b>Como vão ser os próximos dias.</b> As turmas começam todo dia 1º. A cada módulo que você conclui, o próximo abre 24 horas depois. Cada um tem um vídeo curto, um material de apoio e uma tarefa prática para fazer até o dia seguinte. São 30 módulos, divididos nos quatro pilares do método: Comportamento, Atitude, Planejamento e Investimento.</p><p>Durante os 30 dias, a sua turma conversa no grupo do WhatsApp. Quando você terminar o módulo 30, o seu Plano Individual de Transição de Carreira estará pronto, e começam os encontros em grupo, com 12 créditos para usar ao longo de um ano.</p><p>O programa é educativo e não substitui a psicoterapia. Se em algum momento precisar de ajuda, a página Apoio e conta reúne os canais.</p>' : '';
      return '<div class="txt"><p>' + esc(m.r) + '</p>' + extra + '<p style="margin-top:16px">Depois do vídeo, abra a aba <b>Tarefa do dia</b>. As suas respostas ficam salvas e entram no seu plano.</p></div>';
    }
    if (aba === 'tarefa') {
      var campos = m.campos.map(function (c) {
        var v = esc(S.ans[c.k] || ''), id = 'c_' + c.k, campo;
        if (c.tipo === 'short') campo = '<input class="inp" id="' + id + '" data-k="' + c.k + '" value="' + v + '">';
        else if (c.tipo === 'select') campo = '<select class="inp" id="' + id + '" data-k="' + c.k + '"><option value="">Escolha uma opção</option>' + DECISOES.map(function (o) { return '<option' + (S.ans[c.k] === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>';
        else campo = '<textarea class="inp" id="' + id + '" data-k="' + c.k + '">' + v + '</textarea>';
        return '<div class="q"><label for="' + id + '">' + esc(c.q) + '</label>' + (c.d ? '<span class="dica">' + esc(c.d) + '</span>' : '') + campo + '</div>';
      }).join('');
      return '<div class="tarefa">' + (m.ferr ? ferramenta(m.ferr) : '') + '<div style="margin-top:' + (m.ferr ? '24px' : '0') + '">' + campos + '</div><span class="salvo" id="salvo">' + ic('ok') + 'As respostas salvam sozinhas</span></div>';
    }
    if (aba === 'material') {
      var url = MATERIAIS[n];
      return '<a class="mat" href="' + (url || '#') + '"' + (url ? ' target="_blank" rel="noopener"' : ' data-a="semMat"') + '><span class="mi">' + ic('doc') + '</span><span><b>' + esc(m.mat) + '</b><small>PDF para ler e guardar</small></span>' + ic('dir') + '</a>' +
        (m.ferr ? '<p class="mut pq" style="margin-top:14px">Este módulo também tem uma ferramenta prática, que fica na aba Tarefa do dia.</p>' : '');
    }
    return '<label class="campo" style="margin-top:0"><span>Suas anotações sobre este módulo</span><textarea class="inp" data-nota="' + n + '" placeholder="Só você vê o que escrever aqui">' + esc(S.notas[n] || '') + '</textarea></label><span class="salvo" id="salvo">' + ic('ok') + 'Salvam sozinhas</span>';
  }
  function fv(k) { return esc(S.ans['f_' + k] || ''); }
  function ferramenta(t) {
    if (t === 'pensamentos') return '<div class="ferr"><h3>Registro de pensamentos</h3><p class="mut pq">Escolha um pensamento que aparece quando você imagina a mudança e examine as evidências antes de acreditar nele.</p><div class="gr c2">' +
      fq('pens', 'Qual pensamento passou pela sua cabeça?', 'Ex.: “não sou capaz de recomeçar”') + fq('sit', 'Em que situação ele apareceu?') + fq('favor', 'Que fatos apoiam esse pensamento?') + fq('contra', 'E que fatos não apoiam?') + fq('amiga', 'O que você diria a uma amiga na mesma situação?') + fq('equi', 'Como seria um pensamento mais equilibrado?') + '</div></div>';
    if (t === 'custo') return '<div class="ferr"><h3>Análise de custo e benefício</h3><p class="mut pq">Toda escolha tem ganhos e custos, inclusive a de ficar onde está.</p><div class="gr c2">' +
      fq('ficaV', 'Ficar onde estou: vantagens') + fq('ficaD', 'Ficar onde estou: desvantagens') + fq('mudaV', 'Mudar: vantagens') + fq('mudaD', 'Mudar: desvantagens') + '</div></div>';
    if (t === 'orcamento') {
      var r = num(S.ans.f_renda) + num(S.ans.f_renda2), d = num(S.ans.f_fixas) + num(S.ans.f_var), sobra = r - d;
      return '<div class="ferr" data-calc="orc"><h3>Orçamento do mês</h3><p class="mut pq">Valores aproximados já servem. O objetivo é enxergar quanto sobra.</p><div class="gr c2">' +
        fn('renda', 'Sua renda líquida') + fn('renda2', 'Outras rendas da casa') + fn('fixas', 'Despesas fixas') + fn('var', 'Despesas variáveis') + '</div><p class="res" id="resCalc">Sobra por mês: <b>' + brl(sobra) + '</b>' + (sobra < 0 ? ' <span class="mut">(o mês fecha no vermelho)</span>' : '') + '</p></div>';
    }
    if (t === 'reserva') {
      var c = num(S.ans.f_custo), me = num(S.ans.f_meses) || 6, g = num(S.ans.f_guard), mes = num(S.ans.f_mes), nec = c * me, fal = Math.max(0, nec - g), em = mes > 0 ? Math.ceil(fal / mes) : 0;
      return '<div class="ferr" data-calc="res"><h3>Reserva de transição</h3><p class="mut pq">Quanto você precisa guardar para atravessar os meses de renda menor com tranquilidade.</p><div class="gr c2">' +
        fn('custo', 'Custo mensal essencial da família') + fn('meses', 'Meses de transição previstos', '6') + fn('guard', 'Quanto você já tem guardado') + fn('mes', 'Quanto consegue guardar por mês') + '</div><p class="res" id="resCalc">Reserva necessária: <b>' + brl(nec) + '</b><br>Falta juntar: <b>' + brl(fal) + '</b>' + (em ? '<br><span class="mut">Guardando ' + brl(mes) + ' por mês, você chega lá em ' + em + (em === 1 ? ' mês' : ' meses') + '.</span>' : '') + '</p></div>';
    }
    return '';
  }
  function fq(k, l, d) { return '<label class="campo" style="margin-top:0"><span>' + l + '</span>' + (d ? '<small class="dica">' + d + '</small>' : '') + '<textarea class="inp" data-k="f_' + k + '" style="min-height:84px">' + fv(k) + '</textarea></label>'; }
  function fn(k, l, ph) { return '<label class="campo" style="margin-top:0"><span>' + l + '</span><input class="inp" inputmode="decimal" data-k="f_' + k + '" data-calc-in value="' + fv(k) + '" placeholder="' + (ph || 'R$ 0') + '"></label>'; }

  /* ---------- conteúdo ---------- */
  function conteudo(foco) {
    var n = atual();
    return '<div style="padding-top:26px"><h1>Conteúdo do programa</h1><p class="mut" style="margin-top:8px">30 módulos em quatro pilares. ' + (n ? 'Você está no módulo ' + n + '.' : 'Você concluiu todos.') + '</p></div>' + PIL.map(function (q) {
      var tot = q.ate - q.de + 1, fe = feitosPil(q), rows = '';
      for (var k = q.de; k <= q.ate; k++) rows += linhaMod(k);
      return '<section class="bloco card" id="pilar-' + q.id + '"><div class="pil-cab"><img src="/assets/img/pilar-' + q.img + '.webp" width="420" height="630" alt="" loading="lazy"><div><small class="mut">Módulos ' + q.de + ' a ' + q.ate + '</small><h2 style="font-size:1.5rem;font-weight:400;margin-top:2px">' + q.id + ' · ' + q.nome + '</h2><p>' + q.desc + ' Você sai com: <b style="color:var(--txt)">' + q.sai + '</b>.</p><div class="barra"><i style="width:' + (fe / tot * 100) + '%"></i></div><small class="mut" style="display:block;margin-top:6px">' + fe + ' de ' + tot + ' concluídos</small></div></div><ul class="lista-mods">' + rows + '</ul></section>';
    }).join('');
  }

  /* ---------- encontros ---------- */
  function slots() {
    var out = [], base = new Date(); base.setHours(0, 0, 0, 0);
    var mod = [[2, 19, 30, 'On-line'], [4, 19, 30, 'Presencial, sala em Uberlândia'], [6, 10, 0, 'On-line']], k = 0;
    for (var dia = 1; dia <= 42; dia++) {
      var d = new Date(base); d.setDate(base.getDate() + dia);
      mod.forEach(function (h) {
        if (d.getDay() !== h[0]) return;
        var t = new Date(d); t.setHours(h[1], h[2], 0, 0);
        var seed = (t.getDate() * 7 + t.getMonth() * 13 + h[1]) % 15;
        out.push({ id: +t, ts: +t, f: FACIL[k % 5], oc: 5 + seed, local: h[3] });
        k++;
      });
    }
    return out;
  }
  function dataLonga(ts) { var d = new Date(ts); return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
  function proximoEncontro() {
    var meus = S.agenda.filter(function (a) { return a.ts > Date.now(); }).sort(function (a, b) { return a.ts - b.ts; });
    return meus[0] || null;
  }
  function linhaSlot(s, meu) {
    var d = new Date(s.ts), oc = Math.min(20, s.oc + (meu ? 1 : 0)), cheio = oc >= 20 && !meu;
    var podeCancelar = s.ts - Date.now() > H24;
    return '<div class="slot' + (meu ? ' meu' : '') + '"><div class="dt"><small>' + d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') + '</small><b>' + d.getDate() + '</b></div><div class="inf"><b>' + d.toLocaleDateString('pt-BR', { weekday: 'long' }) + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '</b><small>' + (s.local || 'On-line') + ' · conduzido por ' + s.f + '</small><div class="vagas"><div class="barra"><i style="width:' + oc / 20 * 100 + '%"></i></div>' + oc + ' de 20 vagas</div></div><div class="ac">' +
      (meu ? (podeCancelar ? '<button class="btn sec pq2" data-a="cancela" data-v="' + s.id + '">Cancelar</button>' : '<span class="etq">Não dá mais para cancelar</span>') : '<button class="btn pq2" data-a="agenda" data-v="' + s.id + '"' + (cheio || S.creditos < 1 ? ' disabled' : '') + '>' + (cheio ? 'Lotado' : 'Agendar') + '</button>') + '</div></div>';
  }
  function encontros() {
    var meus = S.agenda.filter(function (a) { return a.ts > Date.now(); }).sort(function (a, b) { return a.ts - b.ts; }), ids = {};
    meus.forEach(function (a) { ids[a.id] = 1; });
    var livres = slots().filter(function (s) { return !ids[s.id]; }).slice(0, 9), fim = feitos() === 30;
    var blocos = ''; for (var i = 0; i < 12; i++) blocos += '<i class="' + (i < S.creditos ? '' : 'u') + '"></i>';
    return '<div style="padding-top:26px"><h1>Encontros em grupo</h1><p class="mut" style="margin-top:8px;max-width:40rem">Depois de montar o plano, você não precisa colocá-lo em prática sozinha. Os encontros acontecem toda semana, em grupos fechados de até 20 mulheres, e servem para tirar dúvidas, revisar o plano e ajustar a rota.</p></div>' +
      '<div class="bloco grade2" style="align-items:start"><div>' + (!fim ? '<div class="aviso" style="margin-bottom:16px">' + ic('info') + '<span>Na turma real, os créditos valem a partir da conclusão do módulo 30. <b>Nesta demonstração, o agendamento já está aberto.</b></span></div>' : '') +
      (meus.length ? '<h2 style="margin-bottom:12px">Seus encontros</h2>' + meus.map(function (s) { return linhaSlot(s, true); }).join('') + '<div style="height:24px"></div>' : '') +
      '<h2 style="margin-bottom:12px">Próximas datas</h2>' + livres.map(function (s) { return linhaSlot(s, false); }).join('') + '<p class="fra pq" style="margin-top:12px">Datas de exemplo. Cancelando com mais de 24 horas de antecedência, o crédito volta para você.</p></div>' +
      '<div><div class="card"><h2 style="font-size:1rem;color:var(--mut);font-weight:500">Seus créditos</h2><div class="cred" style="margin-top:8px"><b>' + S.creditos + '</b><span class="mut" style="padding-bottom:6px">de 12, válidos por um ano</span></div><div class="cred-blocos" aria-hidden="true">' + blocos + '</div><p class="mut pq" style="margin-top:14px">Um crédito vale um encontro. Se quiser continuar depois, dá para comprar créditos avulsos.</p></div>' +
      '<div class="card" style="margin-top:14px"><h2 style="font-size:1.1rem">Indicou, ganhou</h2><p class="mut pq" style="margin-top:6px">Cada amiga que entrar por sua indicação vale créditos extras. Contando a sua história publicamente, você ganha 50% de desconto para presentear uma amiga.</p><div class="btns" style="margin-top:14px"><button class="btn sec pq2" data-a="indica">' + ic('pres') + 'Copiar meu link de indicação</button></div></div></div></div>';
  }

  /* ---------- bem-estar ---------- */
  function bemestar() {
    var hist = Object.keys(S.ck).sort().slice(-14).map(function (k) { return S.ck[k]; }), cont = {};
    hist.forEach(function (c) { (c.s || []).forEach(function (s) { cont[s] = (cont[s] || 0) + 1; }); });
    var top = Object.keys(cont).sort(function (a, b) { return cont[b] - cont[a]; }).slice(0, 4);
    var media = hist.length ? (hist.reduce(function (a, c) { return a + c.n; }, 0) / hist.length) : 0;
    return '<div style="padding-top:26px"><h1>Bem-estar</h1><p class="mut" style="margin-top:8px;max-width:40rem">Um registro rápido por dia ajuda você a perceber como a ansiedade muda ao longo da jornada. Só você vê as suas respostas, a equipe recebe apenas números gerais e sem identificação.</p></div>' +
      '<div class="bloco grade2" style="align-items:start"><div>' + (S.ck[dkey()] ? '<div class="card ck">' + ckFeito(S.ck[dkey()]) + '</div>' : checkin(false)) +
      '<div class="card" style="margin-top:14px"><h2 style="font-size:1.1rem">Seus últimos 14 dias</h2>' + grafico() + (hist.some(function (c) { return c.ex; }) ? '<p class="fra pq" style="margin-top:6px">Os dias anteriores são exemplos da demonstração.</p>' : '') + '</div></div>' +
      '<div><div class="card"><h2 style="font-size:1.1rem">Resumo</h2><div class="grade2" style="margin-top:14px;gap:10px;grid-template-columns:1fr 1fr"><div style="background:var(--s2);border-radius:14px;padding:14px"><b style="font-size:1.6rem;font-weight:300">' + (media ? media.toFixed(1).replace('.', ',') : '–') + '</b><small class="mut" style="display:block">média dos seus registros</small></div><div style="background:var(--s2);border-radius:14px;padding:14px"><b style="font-size:1.6rem;font-weight:300">' + hist.length + '</b><small class="mut" style="display:block">check-ins feitos</small></div></div>' +
      (top.length ? '<p class="mut pq" style="margin-top:14px">Sentimentos mais presentes: <b style="color:var(--txt)">' + top.join(', ') + '</b>.</p>' : '') + '<p class="mut pq" style="margin-top:12px">Na pesquisa que deu origem ao C.A.P.I., a ansiedade média de quem pensa em mudar de carreira foi 3,7 numa escala de 1 a 5.</p></div>' +
      '<div class="card sos" style="margin-top:14px"><h2 style="font-size:1.1rem">Precisa de ajuda agora?</h2><p class="mut pq" style="margin-top:6px">O C.A.P.I. é um programa educativo e não substitui a psicoterapia nem o atendimento de urgência.</p><a href="tel:188"><b class="n">188</b><span><b>CVV</b><br><small class="mut">Apoio emocional gratuito, 24 horas</small></span></a><a href="tel:192"><b class="n">192</b><span><b>SAMU</b><br><small class="mut">Emergências de saúde</small></span></a></div></div></div>';
  }

  /* ---------- plano ---------- */
  function planoFeito() { var t = 0, f = 0; PLANO.forEach(function (s) { s.k.forEach(function (k) { t++; if ((S.ans[k] || '').trim()) f++; }); }); return { t: t, f: f }; }
  function plano() {
    var pf = planoFeito(), pct = Math.round(pf.f / pf.t * 100);
    return '<div style="padding-top:26px;display:flex;gap:18px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:240px"><h1>Plano Individual de Transição de Carreira</h1><p class="mut" style="margin-top:8px;max-width:38rem">Montado com as suas respostas das tarefas. Ele fica completo no módulo 30, mas você pode revisar e imprimir quando quiser.</p></div>' + anel(pct) + '</div>' +
      '<div class="btns nao-imprime" style="margin-top:18px"><button class="btn sec pq2" data-a="imprime">' + ic('doc') + 'Imprimir ou salvar em PDF</button></div><div class="bloco">' + PLANO.map(function (s, i) {
        var f = s.k.filter(function (k) { return (S.ans[k] || '').trim(); }).length;
        return '<section class="plano-sec"><h3><span>' + (i + 1) + '. ' + esc(s.t) + '</span><span class="etq' + (f === s.k.length ? ' ok' : '') + '">' + f + ' de ' + s.k.length + '</span></h3><dl>' + s.k.map(function (k) {
          var c = CAMPO[k] || { q: k, n: 0 }, v = (S.ans[k] || '').trim();
          return '<dt>' + esc(c.q) + ' <a href="#/aula/' + c.n + '" class="nao-imprime" style="color:var(--fra)">módulo ' + c.n + '</a></dt><dd' + (v ? '' : ' class="vaz"') + '>' + (v ? esc(v) : 'Ainda não respondido') + '</dd>';
        }).join('') + '</dl></section>';
      }).join('') + '</div>';
  }

  /* ---------- apoio ---------- */
  function apoio() {
    return '<div style="padding-top:26px"><h1>Apoio e conta</h1><p class="mut" style="margin-top:8px">Canais da sua turma, limites do programa e controle sobre os seus dados.</p></div><div class="bloco grade2" style="align-items:start"><div>' +
      '<div class="card"><h2 style="font-size:1.1rem">Sua turma</h2><a class="mat" style="margin-top:12px" href="' + (LINK_GRUPO || '#') + '"' + (LINK_GRUPO ? ' target="_blank" rel="noopener"' : ' data-a="semGrupo"') + '><span class="mi">' + ic('chat') + '</span><span><b>Grupo da turma no WhatsApp</b><small>Troca entre participantes durante os 30 dias</small></span>' + ic('dir') + '</a><a class="mat" style="margin-top:8px" href="#" data-a="semGrupo"><span class="mi">' + ic('info') + '</span><span><b>Suporte operacional</b><small>Dúvidas de acesso e organização da jornada</small></span>' + ic('dir') + '</a></div>' +
      '<div class="card sos" style="margin-top:14px"><h2 style="font-size:1.1rem">Precisa de ajuda agora?</h2><p class="mut pq" style="margin-top:6px">Quando uma demanda vai além do caráter educativo do programa, a equipe acolhe, explica os limites e orienta a busca pela rede de apoio.</p><a href="tel:188"><b class="n">188</b><span><b>CVV</b><br><small class="mut">Apoio emocional gratuito, 24 horas</small></span></a><a href="tel:192"><b class="n">192</b><span><b>SAMU</b><br><small class="mut">Emergências de saúde</small></span></a><a href="tel:180"><b class="n">180</b><span><b>Central de Atendimento à Mulher</b><br><small class="mut">Orientação em casos de violência</small></span></a></div></div>' +
      '<div><div class="card"><h2 style="font-size:1.1rem">Minha conta</h2><label class="campo"><span>Nome</span><input class="inp" data-user="nome" value="' + esc(S.user.nome) + '"></label><label class="campo"><span>E-mail</span><input class="inp" type="email" data-user="email" value="' + esc(S.user.email) + '"></label><p class="mut pq" style="margin-top:12px">Turma de ' + esc(S.turma) + '.</p></div>' +
      '<div class="card" style="margin-top:14px"><h2 style="font-size:1.1rem">Privacidade</h2><p class="mut pq" style="margin-top:6px">Neste protótipo, tudo o que você escreve fica salvo só neste navegador. Nada é enviado para servidores.</p><div class="btns" style="margin-top:14px"><button class="btn sec pq2" data-a="baixa">Baixar meus dados</button><button class="btn sec pq2" data-a="apaga">Apagar tudo e sair</button></div></div></div></div>';
  }

  /* ---------- render ---------- */
  var timer = null;
  function render(focar) {
    var app = $('#app'), r = rota();
    clearInterval(timer);
    if (!S) { app.innerHTML = entrar(); document.title = 'Entrar | Projeto C.A.P.I.'; return; }
    var views = { inicio: inicio, conteudo: function () { return conteudo(r.a); }, encontros: encontros, 'bem-estar': bemestar, plano: plano, apoio: apoio, aula: function () { return aula(r.a); } };
    var sec = r.r === 'aula' ? 'conteudo' : r.r;
    if (!views[r.r]) { sec = 'inicio'; }
    app.innerHTML = casca(sec, (views[r.r] || inicio)());
    var titulos = { inicio: 'Início', conteudo: 'Conteúdo', encontros: 'Encontros', 'bem-estar': 'Bem-estar', plano: 'Meu plano', apoio: 'Apoio e conta', aula: 'Módulo ' + (r.a || '') };
    document.title = (titulos[r.r] || 'Início') + ' | Área da aluna C.A.P.I.';
    if (focar) { window.scrollTo(0, 0); var v = $('#vista'); if (v) v.focus({ preventScroll: true }); }
    if (r.r === 'conteudo' && r.a) { var alvo = document.getElementById('pilar-' + r.a); if (alvo) alvo.scrollIntoView(); }
    var conts = document.querySelectorAll('[data-cont]');
    if (conts.length) timer = setInterval(function () {
      conts.forEach(function (el) { if (+el.dataset.cont <= Date.now()) render(); else el.textContent = falta(+el.dataset.cont); });
    }, 15000);
  }

  /* ---------- eventos ---------- */
  document.addEventListener('submit', function (e) {
    if (e.target.id !== 'fEntrar') return;
    e.preventDefault();
    var f = e.target, nome = f.nome.value.trim();
    if (!nome) { f.nome.focus(); toast('Escreva como você quer ser chamada'); return; }
    S = novo(nome, f.email.value.trim()); salva();
    history.replaceState(null, '', '/app/#/inicio'); render(true);
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]');
    var menu = $('#menuav');
    if (menu && menu.classList.contains('on') && !e.target.closest('#menuav') && !(b && b.dataset.a === 'menu')) { menu.classList.remove('on'); }
    if (!b) return;
    var a = b.dataset.a, v = b.dataset.v;
    if (a === 'demo') { S = demo(); salva(); history.replaceState(null, '', '/app/#/inicio'); render(true); toast('Você está vendo a área como a Mariana'); }
    else if (a === 'menu') { var on = menu.classList.toggle('on'); b.setAttribute('aria-expanded', on); }
    else if (a === 'tema') { var nt = temaAtual() === 'escuro' ? 'claro' : 'escuro'; document.documentElement.dataset.tema = nt; try { localStorage.setItem('capi.tema', nt); } catch (er) { } var mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.content = nt === 'escuro' ? '#0F0D0E' : '#F6F4F1'; render(); }
    else if (a === 'sair') { S = null; history.replaceState(null, '', '/app/'); render(true); }
    else if (a === 'fechaDias') { S.dias = false; salva(); render(); }
    else if (a === 'ckn') { ckRasc.n = +v; render(); var ck = $('#ck'); if (ck) ck.scrollIntoView({ block: 'nearest' }); }
    else if (a === 'cks') { var i = ckRasc.s.indexOf(v); if (i > -1) ckRasc.s.splice(i, 1); else ckRasc.s.push(v); render(); }
    else if (a === 'ckok') { S.ck[dkey()] = { n: ckRasc.n, s: ckRasc.s.slice() }; ckRasc = { n: 0, s: [] }; salva(); render(); toast('Check-in registrado. Obrigada por cuidar de você.'); }
    else if (a === 'aba') { aba = v; render(); }
    else if (a === 'play') {
      var pl = $('#player'), n = +pl.dataset.n, src = VIDEOS[n];
      if (src && /youtu/.test(src)) pl.insertAdjacentHTML('beforeend', '<iframe src="' + src + '" title="Vídeo do módulo ' + n + '" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>');
      else if (src) pl.insertAdjacentHTML('beforeend', '<video src="' + src + '" controls autoplay playsinline preload="auto"><track kind="captions" srclang="pt-BR" label="Português" src="/assets/video/aula-01.vtt"></video>');
      else pl.insertAdjacentHTML('beforeend', '<div class="sem"><div><b>O vídeo deste módulo entra aqui</b><p>Nesta demonstração, só a primeira aula tem vídeo. O roteiro e a tarefa do módulo já estão nas abas abaixo.</p></div></div>');
    }
    else if (a === 'concluir') {
      var k = +v; S.done[k] = Date.now(); salva(); aba = 'sobre';
      if (k === 30) { toast('Você concluiu a jornada. Seu plano está pronto.'); vai('plano'); return; }
      render(); toast('Módulo ' + k + ' concluído. O próximo abre em 24 horas.');
    }
    else if (a === 'desfaz') { var j = +v; for (var q = j; q <= 30; q++) { delete S.done[q]; delete S.lib[q]; } salva(); render(); }
    else if (a === 'liberar') { S.lib[+v] = true; salva(); render(); toast('Módulo aberto para a demonstração'); }
    else if (a === 'agenda') {
      if (S.creditos < 1) return;
      var sl = slots().filter(function (s) { return s.id == v; })[0]; if (!sl) return;
      S.agenda.push(sl); S.creditos--; salva(); render(); toast('Encontro agendado: ' + dataLonga(sl.ts));
    }
    else if (a === 'cancela') { S.agenda = S.agenda.filter(function (s) { return s.id != v; }); S.creditos = Math.min(12, S.creditos + 1); salva(); render(); toast('Encontro cancelado. O crédito voltou para você.'); }
    else if (a === 'indica') {
      var link = location.origin + '/?indicacao=' + encodeURIComponent((S.user.nome || '').split(' ')[0].toLowerCase());
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(function () { toast('Link copiado: ' + link); }, function () { toast(link); }); else toast(link);
    }
    else if (a === 'imprime') { window.print(); }
    else if (a === 'semMat') { e.preventDefault(); toast('Nesta demonstração, só o material do módulo 1 está disponível'); }
    else if (a === 'semGrupo') { e.preventDefault(); toast('Na versão real, este botão abre o grupo da sua turma'); }
    else if (a === 'baixa') {
      var blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }), u = URL.createObjectURL(blob), l = document.createElement('a');
      l.href = u; l.download = 'meus-dados-capi.json'; l.click(); setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
    }
    else if (a === 'apaga') { if (confirm('Apagar todas as suas respostas deste navegador?')) { try { localStorage.removeItem(KEY); } catch (er) { } S = null; history.replaceState(null, '', '/app/'); render(true); } }
  });
  var tSalvo = null;
  document.addEventListener('input', function (e) {
    var el = e.target, k = el.dataset.k, nt = el.dataset.nota, us = el.dataset.user;
    if (!k && !nt && !us) return;
    if (k) S.ans[k] = el.value; else if (nt) S.notas[nt] = el.value; else S.user[us] = el.value;
    clearTimeout(tSalvo);
    tSalvo = setTimeout(function () { salva(); var s = $('#salvo'); if (s) { s.classList.add('on'); s.lastChild.textContent = 'Salvo agora'; } }, 400);
    if (el.hasAttribute('data-calc-in')) {
      var box = el.closest('[data-calc]'), res = $('#resCalc');
      if (box && res) { var tmp = document.createElement('div'); tmp.innerHTML = ferramenta(box.dataset.calc === 'orc' ? 'orcamento' : 'reserva'); res.innerHTML = tmp.querySelector('#resCalc').innerHTML; }
    }
  });
  window.addEventListener('hashchange', function () { aba = 'sobre'; render(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var m = $('#menuav'); if (m) m.classList.remove('on'); } });
  render(false);
})();
