(() => {
  'use strict';
  const gallery = document.querySelector('#gallery');
  const figure = gallery.closest('figure');
  const slides = [...gallery.querySelectorAll('.carousel-slide')];
  const dots = [...figure.querySelectorAll('[data-slide]')];
  const toggle = document.querySelector('#gallery-toggle');
  const indexLabel = document.querySelector('#gallery-index');
  const source = document.querySelector('#gallery-source');
  const announcement = document.querySelector('#gallery-announcement');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let playing = !reducedMotion.matches;
  let hovered = false;
  let focused = false;
  let inView = true;
  let timer;
  let gesture = null;
  const t = key => window.BOKI_LOCALES[document.documentElement.lang][key];

  function schedule() {
    clearTimeout(timer);
    if (playing && !hovered && !focused && inView && !document.hidden) {
      timer = setTimeout(() => show(current + 1, false), 5000);
    }
  }

  function renderControls() {
    const key = playing ? 'galleryPause' : 'galleryPlay';
    toggle.dataset.i18nLabel = key;
    toggle.setAttribute('aria-label', t(key));
    toggle.firstElementChild.textContent = playing ? 'Ⅱ' : '▶';
    gallery.setAttribute('aria-roledescription', t('galleryRole'));
  }

  function show(index, manual) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== current; });
    dots.forEach((dot, dotIndex) => { dot.setAttribute('aria-current', String(dotIndex === current)); });
    const position = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    indexLabel.textContent = position;
    source.href = slides[current].dataset.source;
    if (manual) {
      // Manual navigation stops rotation until explicitly restarted.
      playing = false;
      announcement.textContent = `@AlanShao111 / X · ${position}`;
    }
    renderControls();
    schedule();
  }

  document.querySelector('#gallery-previous').addEventListener('click', () => show(current - 1, true));
  document.querySelector('#gallery-next').addEventListener('click', () => show(current + 1, true));
  dots.forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.slide), true)));
  toggle.addEventListener('click', () => {
    playing = !playing;
    focused = false;
    renderControls();
    schedule();
  });
  gallery.addEventListener('keydown', event => {
    if (event.target !== gallery) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1, true); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1, true); }
    if (event.key === 'Home') { event.preventDefault(); show(0, true); }
    if (event.key === 'End') { event.preventDefault(); show(slides.length - 1, true); }
  });
  gallery.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    gesture = { x: event.clientX, y: event.clientY, id: event.pointerId };
    gallery.setPointerCapture(event.pointerId);
  });
  gallery.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.25) show(current + (dx < 0 ? 1 : -1), true);
  });
  gallery.addEventListener('pointercancel', () => { gesture = null; });
  figure.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  figure.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  figure.addEventListener('focusin', () => { focused = true; schedule(); });
  figure.addEventListener('focusout', event => {
    if (!figure.contains(event.relatedTarget)) { focused = false; schedule(); }
  });
  document.addEventListener('visibilitychange', schedule);
  document.querySelector('#language').addEventListener('change', renderControls);
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { playing = false; renderControls(); schedule(); }
  });
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    schedule();
  }).observe(gallery);
  renderControls();
  schedule();
})();
