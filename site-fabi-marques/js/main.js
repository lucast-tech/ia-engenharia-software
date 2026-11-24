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
})();
