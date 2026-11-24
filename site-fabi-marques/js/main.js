/* =========================================================
   Fabi Marques — Interações do site
   ========================================================= */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Ano automático no rodapé ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header com sombra ao rolar + barra de progresso ---------- */
  const header = $('#header');
  const progress = $('#progressBar');
  const backTop = $('.back-top');

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const toggle = $('#menuToggle');
  const nav = $('#nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.classList.toggle('open', open);
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) {
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  }
  $$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Destaque do link ativo conforme a seção ---------- */
  const sections = $$('main section[id]');
  const navLinks = $$('#nav a[href^="#"]');
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Animação ao aparecer (reveal) ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => {
      // pequeno atraso escalonado para cards irmãos
      el.style.transitionDelay = (el.closest('.cards, .steps') ? (i % 4) * 0.08 : 0) + 's';
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Depoimentos (carrossel) ---------- */
  // Textos publicados nos depoimentos do Instagram. Nomes reduzidos por privacidade.
  const testimonials = [
    {
      name: 'Manuela B.',
      role: 'Aluna',
      text: 'Fabi, estou passando para agradecer por você ter descomplicado a matemática. O que antes era uma dificuldade pra mim, hoje se tornou mais leve graças à sua didática simples! Obrigada por ser tão acessível e ter tirado todas as minhas dúvidas. A minha aprovação também é mérito seu!'
    },
    {
      name: 'Helena B.',
      role: 'Aluna',
      text: 'Nunca fui muito adepta da área de exatas, e a dificuldade era algo nítido e persistente no meu cotidiano. Até que eu encontrei a Fabi, ela me ajudou a crescer não só no âmbito escolar, mas também pessoalmente. Me mostrou como a matemática pode ser divertida e leve. A Fabi se adapta às necessidades e métodos de estudo do aluno.'
    },
    {
      name: 'Maria Eduarda K.',
      role: 'Aluna',
      text: 'Obrigada por se dedicar ao seu trabalho com tanto entusiasmo. Você torna seus alunos confiantes e capazes de alcançarem seus objetivos de forma humana. Sua paciência e dedicação são honráveis e sem dúvidas marcou de forma muito positiva meu processo para alcançar a aprovação em medicina.'
    },
    {
      name: 'Marcos V.',
      role: 'Aprovado na PUC Minas',
      text: 'Tentei vários vestibulares e ontem saiu o resultado da PUC Minas: consegui o 36º de quase cento e trinta vagas! Gostaria de agradecer todo o apoio e incentivo que me deu durante esse ano de pandemia. Irei levar seus ensinamentos por onde eu passar e para toda a minha vida.'
    },
    {
      name: 'Luiza R.',
      role: 'Aluna',
      text: 'Conheci a Fabi no meu pré-vestibular, um dos momentos mais desafiadores de quem vai prestar vestibular para medicina. Além de bons professores, que saibam passar o conteúdo e ensinar atalhos, precisamos de acolhimento e orientação. A Fabi, além de ser uma professora maravilhosa e extremamente competente, sabe acolher e motivar os alunos, trazendo leveza para um processo que não precisa ser tão sofrido.'
    },
    {
      name: 'Gilzemar C.',
      role: 'Aprovado em 1º lugar · Medicina Multivix 2024-1',
      text: 'Foi um período intenso, com muitas expectativas, e a Fabi conseguiu com muita perícia entender minhas necessidades e encontramos a melhor forma de estudar. Com muito carinho, soube explorar de forma brilhante todo o meu potencial, me incentivando a continuar os estudos e a não desistir. Ela soube aproveitar minha aptidão, aprimorando-a de forma a tirar sempre o melhor proveito.'
    },
    {
      name: 'Vitória B.',
      role: 'Aluna',
      text: 'Toda calma e tranquilidade que você transmite durante o curso, só tenho a agradecer por todas as oportunidades que você me proporcionou. Cada aula eu saía mais aliviada e com o conteúdo na ponta da língua. A didática é única, a forma que a Fabi explica é tão boa que até uma criança aprende! Sem você essa aprovação nunca seria possível!'
    },
    {
      name: 'Danilo S.',
      role: 'Aluno',
      text: 'Decisão super acertada de estudar física e matemática com você! Física ficou fácil e matemática deixou de ser minha fraqueza. Obrigadoooo!'
    },
    {
      name: 'Roberta G. R.',
      role: 'Aluna',
      text: 'Te procurei pois tinha dificuldade de compreender os principais assuntos e entender as matérias que são mais cobradas nos vestibulares de medicina. Graças a você, estudar matemática e física tem sido muito mais fácil. Você superou as minhas expectativas!'
    },
    {
      name: 'Jamilla B.',
      role: 'Mãe de aluno(a)',
      text: 'Você tem ajudado muito meus filhos. Um deles fechou o trimestre com 100% em matemática e física, e a outra com 100% em matemática e 99% em física. Muito obrigada por tudo! Nem sei como agradecer o trabalho maravilhoso que está fazendo!'
    }
  ];

  const slidesEl = $('#slides');
  const dotsEl = $('#dots');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  let current = 0;
  let timer = null;

  function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  }

  if (slidesEl && dotsEl) {
    testimonials.forEach((t, i) => {
      const slide = document.createElement('article');
      slide.className = 'slide' + (i === 0 ? ' active' : '');
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1} de ${testimonials.length}`);
      slide.innerHTML = `
        <div class="stars" aria-label="5 estrelas">★★★★★</div>
        <p class="quote"></p>
        <div class="author">
          <div class="avatar">${initials(t.name)}</div>
          <div>
            <strong>${t.name}</strong>
            <small>${t.role}</small>
          </div>
        </div>`;
      slide.querySelector('.quote').textContent = '“' + t.text + '”';
      slidesEl.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = 'dot-btn' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); restart(); });
      dotsEl.appendChild(dot);
    });

    const slideEls = $$('.slide', slidesEl);
    const dotEls = $$('.dot-btn', dotsEl);

    function goTo(index) {
      const n = slideEls.length;
      current = (index + n) % n;
      slideEls.forEach((s, i) => s.classList.toggle('active', i === current));
      dotEls.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 6500);
    }

    prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); restart(); });
    nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); restart(); });

    // Pausa ao passar o mouse ou focar
    const slider = $('#slider');
    if (slider) {
      slider.addEventListener('mouseenter', () => clearInterval(timer));
      slider.addEventListener('mouseleave', restart);
      slider.addEventListener('focusin', () => clearInterval(timer));
      slider.addEventListener('focusout', restart);
    }

    // Gestos de arrastar/deslizar no celular
    let startX = null;
    slidesEl.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    slidesEl.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    });

    // Pausa quando a aba não está visível
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(timer); else restart();
    });

    restart();
  }

  /* ---------- Contador animado nos números do hero ---------- */
  // (Os números exibidos são fixos e vêm do próprio HTML; aqui só animamos a entrada.)
  const badges = $$('.hero-badges span');
  badges.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'opacity .7s ease, transform .7s ease';
  });
  setTimeout(() => {
    badges.forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, i * 150);
    });
  }, 400);

  /* ---------- Efeito de inclinação suave nos cards (somente desktop) ---------- */
  const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canTilt) {
    $$('.card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-10px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Voltar ao topo ---------- */
  if (backTop) {
    backTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
