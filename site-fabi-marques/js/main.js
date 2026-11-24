/* =========================================================
   Fabi Marques: interações do site
   ========================================================= */
(function () {
  'use strict';

  /* Ano no rodapé */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Menu no celular */
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!btn || !menu) return;
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Fechar' : 'Menu';
  }
  if (btn) {
    btn.addEventListener('click', function () {
      setMenu(!menu.classList.contains('open'));
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* Quando o site é aberto direto do computador (file://), as pastas
     não abrem o index.html sozinhas. Aqui os links internos que terminam
     em "/" ganham "index.html". Num servidor de verdade nada muda. */
  if (location.protocol === 'file:') {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (/^(https?:|mailto:|tel:|#)/.test(href)) return;
      var parts = href.split('#');
      if (parts[0] === '' || !/\/$/.test(parts[0])) return;
      parts[0] += 'index.html';
      a.setAttribute('href', parts.join('#'));
    });
  }

  /* ---------- Carrossel de avaliações ----------
     A troca é guiada pela barra de progresso: quando a animação da barra
     termina (4 s), passa para a próxima. Pausar só congela a animação,
     então ao continuar ela segue de onde parou. */
  var root = document.querySelector('[data-carousel]');
  if (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.review'));
    var segs = Array.prototype.slice.call(root.querySelectorAll('.seg'));
    var stage = root.querySelector('.reviews-stage');
    var controls = root.querySelector('.reviews-controls');
    var pauseBtn = root.querySelector('[data-pause]');
    var counter = root.querySelector('[data-current]');
    var interval = parseInt(root.getAttribute('data-interval'), 10) || 4000;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0;

    root.style.setProperty('--dur', interval + 'ms');
    root.classList.add('is-ready');
    if (controls) controls.hidden = false;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function show(index) {
      var n = slides.length;
      current = (index + n) % n;
      slides.forEach(function (s, i) {
        var on = i === current;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
      });
      segs.forEach(function (g, i) {
        g.classList.toggle('is-done', i < current);
        g.classList.remove('is-running');
      });
      var seg = segs[current];
      if (seg) {
        void seg.offsetWidth; // reinicia a animação da barra
        seg.classList.add('is-running');
      }
      if (counter) counter.textContent = pad(current + 1);
    }

    function setPaused(p) {
      root.classList.toggle('is-paused', p);
      if (pauseBtn) {
        pauseBtn.setAttribute('aria-pressed', String(p));
        pauseBtn.textContent = p ? 'Continuar' : 'Pausar';
      }
      // Pausado, leitores de tela anunciam a troca manual
      stage.setAttribute('aria-live', p ? 'polite' : 'off');
    }

    segs.forEach(function (g, i) {
      g.firstElementChild.addEventListener('animationend', function () {
        if (i === current) show(current + 1);
      });
    });

    root.querySelector('[data-next]').addEventListener('click', function () { show(current + 1); });
    root.querySelector('[data-prev]').addEventListener('click', function () { show(current - 1); });
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        setPaused(!root.classList.contains('is-paused'));
      });
    }

    // Mouse em cima do texto segura a avaliação enquanto a pessoa lê
    stage.addEventListener('mouseenter', function () { root.classList.add('is-hover'); });
    stage.addEventListener('mouseleave', function () { root.classList.remove('is-hover'); });

    // Arrastar para o lado no celular
    var startX = null;
    stage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      startX = null;
    });

    // Setas do teclado quando o foco está no carrossel
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });

    // Quem prefere menos movimento começa com o carrossel pausado
    setPaused(reduce);
    show(0);
  }
})();
