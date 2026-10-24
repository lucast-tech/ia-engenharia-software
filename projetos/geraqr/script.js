/* GeraQR · lógica da página
   Gera o QR Code no próprio navegador (biblioteca qrcode-generator),
   desenha num <canvas> e permite copiar ou baixar como PNG.
   Tudo dentro de uma função anônima para não poluir o escopo global. */
(function () {
  'use strict';

  // Referências aos elementos da página (ids definidos no index.html)
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var input = document.getElementById('qrInput');
  var generateBtn = document.getElementById('generateBtn');
  var qrEmpty = document.getElementById('qrEmpty');
  var canvas = document.getElementById('qrCanvas');
  var actions = document.getElementById('actions');
  var copyBtn = document.getElementById('copyBtn');
  var downloadBtn = document.getElementById('downloadBtn');
  var toast = document.getElementById('toast');
  var toastTimer = null; // guarda o timer do aviso para poder reiniciá-lo

  // ---- Theme toggle (initial theme is set inline in <head> to avoid a flash) ----
  themeToggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('geraqr-theme', next); } catch (e) {}
  });

  // Mostra uma mensagem rápida na tela por ~2,6 segundos
  function showToast(msg) {
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.style.opacity = '0'; }, 2600);
  }

  // ---- QR generation (100% local, no external API calls) ----
  // Desenha o QR Code do texto recebido dentro do canvas
  function drawQR(text) {
    var qr = qrcode(0, 'M'); // 0 = auto type size, 'M' = medium error correction
    qr.addData(text);
    qr.make();

    // Tamanho da grade (nº de módulos por lado); cada módulo vira um quadradinho
    var count = qr.getModuleCount();
    var cell = Math.max(4, Math.floor(288 / count));
    var margin = cell * 2;
    var size = count * cell + margin * 2;

    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    // Fundo branco (necessário para a leitura em qualquer tema da página)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    // Pinta só os módulos escuros
    ctx.fillStyle = '#081A30';
    for (var r = 0; r < count; r++) {
      for (var c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect(margin + c * cell, margin + r * cell, cell, cell);
        }
      }
    }
  }

  // Lê o texto digitado, valida e mostra o QR Code
  function generate() {
    var text = input.value.trim();
    if (!text) { input.focus(); return; }
    try {
      drawQR(text);
      qrEmpty.hidden = true;
      canvas.hidden = false;
      actions.hidden = false;
    } catch (err) {
      showToast('Não foi possível gerar. Tente um texto menor.');
    }
  }

  // Botão e atalho Ctrl+Enter (ou Cmd+Enter) para gerar
  generateBtn.addEventListener('click', generate);
  input.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generate();
  });

  // Baixar: converte o canvas em PNG e dispara o download
  downloadBtn.addEventListener('click', function () {
    if (canvas.hidden) return;
    var link = document.createElement('a');
    link.download = 'geraqr-qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('QR Code baixado!');
  });

  // Copiar: coloca a imagem na área de transferência (nem todo navegador deixa)
  copyBtn.addEventListener('click', function () {
    if (canvas.hidden) return;
    canvas.toBlob(function (blob) {
      if (!blob || !navigator.clipboard || !window.ClipboardItem) {
        showToast('Copiar não é suportado aqui — use Baixar PNG.');
        return;
      }
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        .then(function () { showToast('QR Code copiado!'); })
        .catch(function () { showToast('Copiar não é suportado aqui — use Baixar PNG.'); });
    }, 'image/png');
  });
})();
