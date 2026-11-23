(function () {
  'use strict';
  var d = document, w = window;
  var calmo = w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* data da próxima turma: sempre o dia 1º do mês seguinte */
  var meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var hoje = new Date();
  var prox = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
  var txtTurma = '1º de ' + meses[prox.getMonth()];
  d.querySelectorAll('[data-turma]').forEach(function (el) { el.textContent = txtTurma; });

  /* cabeçalho */
  var top = d.getElementById('top');
  var botao = d.querySelector('.menu-b');
  var gaveta = d.getElementById('gaveta');
  function aoRolar() { top.classList.toggle('scrolled', w.scrollY > 40 || gaveta.classList.contains('open')); }
  w.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
  botao.addEventListener('click', function () {
    var aberto = gaveta.classList.toggle('open');
    botao.setAttribute('aria-expanded', aberto);
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    aoRolar();
  });
  gaveta.addEventListener('click', function (e) {
    if (e.target.closest('a')) { gaveta.classList.remove('open'); botao.setAttribute('aria-expanded', 'false'); aoRolar(); }
  });

  if (!('IntersectionObserver' in w)) {
    d.querySelectorAll('.rv').forEach(function (el) { el.classList.add('vis'); });
    return;
  }

  /* revelar ao rolar */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  d.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });

  /* contagem dos números */
  var ioN = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      ioN.unobserve(e.target);
      var el = e.target, alvo = +el.dataset.conta, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
      if (calmo) return;
      var t0 = null;
      function passo(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 1300), v = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
        el.textContent = pre + v + suf;
        if (p < 1) requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    });
  }, { threshold: 0.6 });
  d.querySelectorAll('[data-conta]').forEach(function (el) { ioN.observe(el); });

  /* escada do método: acende o degrau do pilar que está na tela */
  var grupos = d.querySelectorAll('.pyr g');
  var nome = d.querySelector('[data-pyr-nome]'), mods = d.querySelector('[data-pyr-mods]');
  var pilares = d.querySelectorAll('.pilar');
  function ativa(i) {
    grupos.forEach(function (g, k) {
      g.classList.toggle('ativo', k === i);
      g.classList.toggle('feito', k < i);
    });
    var p = pilares[i];
    if (p) { nome.textContent = p.dataset.nome; mods.textContent = p.dataset.mods; }
  }
  var ioP = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) ativa(+e.target.dataset.i); });
  }, { rootMargin: '-42% 0px -42% 0px' });
  pilares.forEach(function (p) { ioP.observe(p); });

  /* faixa: só corre quando está na tela */
  var faixa = d.querySelector('.faixa');
  if (faixa) {
    faixa.classList.add('pausa');
    new IntersectionObserver(function (es) {
      faixa.classList.toggle('pausa', !es[0].isIntersecting);
    }).observe(faixa);
  }

  /* barra fixa do celular: aparece depois do topo e some na oferta e no rodapé */
  var barra = d.querySelector('.barra');
  var hero = d.querySelector('.hero');
  var esconde = d.querySelectorAll('#investimento, .final, .rodape');
  var visiveis = new Set(), passouTopo = false;
  function atualiza() { barra.classList.toggle('on', passouTopo && visiveis.size === 0); }
  new IntersectionObserver(function (es) { passouTopo = !es[0].isIntersecting; atualiza(); }).observe(hero);
  var ioB = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) visiveis.add(e.target); else visiveis.delete(e.target); });
    atualiza();
  });
  esconde.forEach(function (el) { ioB.observe(el); });
})();
