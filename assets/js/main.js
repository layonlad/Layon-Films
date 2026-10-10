/* LAYON FILMS · interações */
(() => {
  'use strict';

  // Número oficial (apresentação comercial): (31) 9 9293 2034
  const WHATSAPP = '5531992932034';

  const FILMS = [
    { src: 'assets/video/filme-01.mp4', poster: 'assets/video/posters/filme-01.jpg', title: 'Filme 01 · Cerimônia' },
    { src: 'assets/video/filme-02.mp4', poster: 'assets/video/posters/filme-02.jpg', title: 'Filme 02 · Making of e cerimônia' },
    { src: 'assets/video/filme-03.mp4', poster: 'assets/video/posters/filme-03.jpg', title: 'Filme 03 · Cerimônia ao ar livre' }
  ];

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isDesktop = () => innerWidth > 960;

  root.classList.remove('no-js');
  root.classList.add('js');

  /* ---------------------------------------------------------- WhatsApp */
  $$('[data-wa]').forEach(a => {
    a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(a.dataset.wa)}`;
  });

  /* ---------------------------------------------------------- Abertura */
  const intro = $('#intro');
  const start = () => {
    document.body.classList.add('is-ready');
    if (intro) {
      intro.classList.add('is-done');
      setTimeout(() => intro.remove(), 1400);
    }
  };
  if (reduceMotion || !intro) start();
  else {
    let done = false;
    const go = () => { if (!done) { done = true; start(); } };
    // Mostra a marca por um instante, sem prender o visitante
    window.addEventListener('load', () => setTimeout(go, 600), { once: true });
    setTimeout(go, 2200);
  }

  /* ---------------------------------------------------------- Divisão de títulos em palavras */
  const splitWords = el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.style.setProperty('--i', i++);
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
  };
  $$('[data-split]').forEach(splitWords);

  /* ---------------------------------------------------------- Revelações na rolagem */
  const revealTargets = $$('[data-reveal], [data-reveal-group], [data-split], [data-stack], .timeline li, .cta');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealTargets.forEach(el => io.observe(el));

    // Pequeno atraso em cascata para itens irmãos da galeria
    $$('.spread').forEach(s => $$('[data-reveal]', s).forEach((el, i) => el.style.setProperty('--rd', `${i * 0.12}s`)));
    $$('.timeline li').forEach((el, i) => el.style.setProperty('--rd', `${(i % 3) * 0.1}s`));
  } else {
    revealTargets.forEach(el => el.classList.add('is-in'));
  }

  /* ---------------------------------------------------------- Cabeçalho, progresso, botão flutuante, parallax */
  const header = $('#header');
  const bar = $('#progress-bar');
  const fab = $('#fab');
  const hero = $('#inicio');
  const cta = $('#contato');
  const timeline = $('#timeline');
  const parallax = reduceMotion ? [] : $$('[data-parallax]');
  let lastY = scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    header.classList.toggle('is-scrolled', y > 40);
    const menuOpen = document.body.classList.contains('is-locked');
    header.classList.toggle('is-hidden', !menuOpen && y > innerHeight * 0.9 && y > lastY + 4);
    if (y < lastY - 4) header.classList.remove('is-hidden');
    lastY = y;

    const heroBottom = hero.offsetTop + hero.offsetHeight * 0.75;
    const ctaRect = cta.getBoundingClientRect();
    const ctaVisible = ctaRect.top < innerHeight * 0.8 && ctaRect.bottom > 0;
    fab.classList.toggle('is-visible', y > heroBottom && !ctaVisible);

    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / (r.height || 1)));
      timeline.style.setProperty('--fill', p.toFixed(3));
    }

    parallax.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const center = r.top + r.height / 2 - innerHeight / 2;
      el.style.transform = `translate3d(0, ${(center * parseFloat(el.dataset.parallax)).toFixed(1)}px, 0)`;
    });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // Item ativo do menu
  const navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(s => spy.observe(s));
  }

  /* ---------------------------------------------------------- Menu mobile */
  const burger = $('#burger');
  const menu = $('#menu');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
    header.classList.remove('is-hidden');
    if (open) header.classList.add('is-scrolled'); else onScroll();
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  addEventListener('resize', () => { if (isDesktop() && menu.classList.contains('is-open')) setMenu(false); });

  /* ---------------------------------------------------------- Vídeo da home */
  const heroVideo = $('#hero-video');
  const heroTc = $('#hero-tc');
  const ambient = $('#hero-ambient');
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  if (heroVideo) {
    heroVideo.addEventListener('error', () => heroVideo.parentElement.classList.add('media-error'), true);
    heroVideo.addEventListener('timeupdate', () => { heroTc.textContent = fmt(heroVideo.currentTime); });

    if (!reduceMotion && !saveData) {
      heroVideo.preload = 'auto';
      const tryPlay = () => heroVideo.play().catch(() => {});
      tryPlay();
      // Pausa quando a home sai da tela, para poupar bateria
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => { e.isIntersecting ? tryPlay() : heroVideo.pause(); }, { threshold: 0.05 }).observe(hero);
      }
    }

    // Luz ambiente: o próprio vídeo, desfocado, banha o fundo no desktop
    if (ambient && !reduceMotion) {
      const ctx = ambient.getContext('2d', { alpha: false });
      ambient.width = 48; ambient.height = 27;
      let last = 0;
      const draw = t => {
        if (!heroVideo.paused && isDesktop() && t - last > 80) {
          last = t;
          try {
            ctx.drawImage(heroVideo, 0, 0, ambient.width, ambient.height);
            ambient.classList.add('is-on');
          } catch (err) { /* quadro ainda indisponível */ }
        }
        requestAnimationFrame(draw);
      };
      heroVideo.addEventListener('playing', () => requestAnimationFrame(draw), { once: true });
    }
  }

  /* ---------------------------------------------------------- Filmes: prévia e carrossel */
  const cards = $$('.film-card');
  const loadPreview = v => { if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.preload = 'metadata'; } };
  const startPreview = card => {
    if (reduceMotion || saveData) return;
    const v = $('video', card);
    loadPreview(v);
    v.play().then(() => card.classList.add('is-previewing')).catch(() => {});
  };
  const stopPreview = card => {
    const v = $('video', card);
    v.pause();
    card.classList.remove('is-previewing');
  };

  cards.forEach(card => {
    const v = $('video', card);
    v.addEventListener('error', () => card.classList.add('media-error'));
    if (canHover) {
      card.addEventListener('mouseenter', () => startPreview(card));
      card.addEventListener('mouseleave', () => stopPreview(card));
    }
    card.addEventListener('click', () => openFilm(Number(card.dataset.film)));
  });

  // No celular, o filme centralizado no carrossel toca em silêncio
  const rail = $('#film-rail');
  const railBar = $('#rail-bar');
  if (!canHover && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const card = $('.film-card', e.target);
        if (e.intersectionRatio > 0.75) startPreview(card); else stopPreview(card);
      });
    }, { threshold: [0, 0.75, 1] });
    $$('.film', rail).forEach(f => io.observe(f));
  }
  if (rail && railBar) {
    rail.addEventListener('scroll', () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const p = max > 0 ? rail.scrollLeft / max : 0;
      railBar.style.transform = `translateX(${p * 199}%)`;
    }, { passive: true });
  }

  /* ---------------------------------------------------------- Modais (base) */
  let lastFocus = null;
  const openModal = m => {
    lastFocus = document.activeElement;
    m.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => m.classList.add('is-open'));
    $('[data-close]', m).focus({ preventScroll: true });
  };
  const closeModal = m => {
    m.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(() => { m.hidden = true; }, 400);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  const trapFocus = (m, e) => {
    const f = $$('button, video, [href]', m).filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const swipe = (el, onLeft, onRight) => {
    let x0 = null, y0 = null;
    el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) (dx < 0 ? onLeft : onRight)();
      x0 = null;
    }, { passive: true });
  };

  /* ---------------------------------------------------------- Player de filmes */
  const filmModal = $('#film-modal');
  const modalVideo = $('#modal-video');
  const modalCaption = $('#modal-caption');
  let filmIndex = 0;

  function setFilm(i) {
    filmIndex = (i + FILMS.length) % FILMS.length;
    const f = FILMS[filmIndex];
    modalVideo.poster = f.poster;
    modalVideo.src = f.src;
    modalCaption.textContent = f.title;
    modalVideo.muted = false;
    modalVideo.play().catch(() => {});
  }
  function openFilm(i) {
    cards.forEach(stopPreview);
    if (heroVideo) heroVideo.pause();
    openModal(filmModal);
    setFilm(i);
  }
  const closeFilm = () => {
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
    closeModal(filmModal);
  };
  modalVideo.addEventListener('error', () => { if (modalVideo.getAttribute('src')) modalCaption.textContent = 'Não foi possível carregar este filme agora.'; });
  $('[data-close]', filmModal).addEventListener('click', closeFilm);
  $('[data-prev]', filmModal).addEventListener('click', () => setFilm(filmIndex - 1));
  $('[data-next]', filmModal).addEventListener('click', () => setFilm(filmIndex + 1));
  filmModal.addEventListener('click', e => { if (e.target === filmModal) closeFilm(); });
  swipe(filmModal, () => setFilm(filmIndex + 1), () => setFilm(filmIndex - 1));

  /* ---------------------------------------------------------- Visualizador de fotos */
  const lightbox = $('#lightbox');
  const lbImg = $('#lightbox-img');
  const lbCount = $('#lightbox-count');
  const photos = $$('[data-lightbox]');
  let photoIndex = 0;

  const setPhoto = i => {
    photoIndex = (i + photos.length) % photos.length;
    const p = photos[photoIndex];
    lbImg.style.opacity = '0';
    const src = p.currentSrc && p.currentSrc.includes('/full/') ? p.currentSrc : p.src;
    const show = () => { lbImg.style.transition = 'opacity .5s'; lbImg.style.opacity = '1'; };
    lbImg.onload = show;
    lbImg.onerror = show;
    lbImg.src = src;
    lbImg.alt = p.alt;
    lbCount.textContent = `${String(photoIndex + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    // Pré-carrega a próxima
    const next = new Image(); next.src = photos[(photoIndex + 1) % photos.length].src;
  };
  photos.forEach((img, i) => {
    const fig = img.closest('figure');
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', `Ampliar fotografia: ${img.alt}`);
    const open = () => { openModal(lightbox); setPhoto(i); };
    fig.addEventListener('click', open);
    fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  $('[data-close]', lightbox).addEventListener('click', () => closeModal(lightbox));
  $('[data-prev]', lightbox).addEventListener('click', () => setPhoto(photoIndex - 1));
  $('[data-next]', lightbox).addEventListener('click', () => setPhoto(photoIndex + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target.classList.contains('modal-stage')) closeModal(lightbox); });
  swipe(lightbox, () => setPhoto(photoIndex + 1), () => setPhoto(photoIndex - 1));

  addEventListener('keydown', e => {
    const m = [filmModal, lightbox].find(x => !x.hidden);
    if (!m) return;
    if (e.key === 'Escape') m === filmModal ? closeFilm() : closeModal(lightbox);
    if (e.key === 'Tab') trapFocus(m, e);
    if (m === lightbox && e.key === 'ArrowRight') setPhoto(photoIndex + 1);
    if (m === lightbox && e.key === 'ArrowLeft') setPhoto(photoIndex - 1);
  });

  /* ---------------------------------------------------------- Luz que acompanha o cursor nos cards */
  if (canHover && !reduceMotion) {
    $$('[data-spot]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------------------------------------------------------- Imagens ausentes */
  $$('img').forEach(img => {
    const fail = () => { const box = img.closest('figure, .arch, .why-bg, .cta-bg'); if (box) box.classList.add('media-error'); };
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail();
    img.addEventListener('error', fail);
  });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
