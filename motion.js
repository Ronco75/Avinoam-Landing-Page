/**
 * AVINOAM HATTAL - MENTAL COACHING
 * Motion & scroll choreography (GSAP + ScrollTrigger + SplitText + Lenis)
 *
 * Runs only when <html> has .js-motion (set in <head> when reduced motion is off).
 * Without it — or if the libraries fail to load — the page stays fully static and readable.
 */

(function () {
  'use strict';

  const root = document.documentElement;
  if (!root.classList.contains('js-motion')) return;

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js-motion');
    return;
  }

  window.__motionReady = true;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText || null;

  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  ScrollTrigger.config({ ignoreMobileResize: true });

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const isMobile = () => window.innerWidth < 768;

  // ===================================
  // SMOOTH SCROLL (Lenis)
  // ===================================

  let lenis = null;
  const lenisRaf = (time) => lenis?.raf(time * 1000);

  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);
  }

  // ===================================
  // HELPERS
  // ===================================

  function split(el, vars) {
    if (!SplitText) return null;
    return SplitText.create(el, Object.assign({ aria: 'none' }, vars));
  }

  /** Prepare SVG shapes so their strokes can be "drawn" */
  function prepareDraw(shapes) {
    return shapes.filter(shape => {
      if (!shape.getTotalLength || shape.getAttribute('stroke-dasharray')) return false;
      const length = shape.getTotalLength();
      gsap.set(shape, { strokeDasharray: length, strokeDashoffset: length });
      return true;
    });
  }

  function waitForFonts(maxWait) {
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return Promise.race([fonts, new Promise(resolve => setTimeout(resolve, maxWait))]);
  }

  // ===================================
  // HERO
  // (the entrance and preloader are pure CSS so they never wait on this file)
  // ===================================

  function buildHero() {
    // Scroll parallax as the hero leaves
    gsap.to('.hero__visual', {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    gsap.to('.hero__content', {
      yPercent: -8,
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  // ===================================
  // STORY: תקוע -> לזוז
  // ===================================

  function buildStory() {
    const story = $('.story');
    if (!story) return;

    const tangle = $('.story__tangle', story);
    const flow = $('.story__flow', story);
    const stuckWord = $('.story__word--stuck', story);
    const stuckChars = $$('.story__word--stuck span[aria-hidden]', story);
    const moveWord = $('.story__word--move', story);
    const moveChars = $$('.story__word--move span[aria-hidden]', story);
    const before = $('.story__block--before', story);
    const after = $('.story__block--after', story);
    const beforeText = $$('.story__lead, .story__caption', before);
    const afterLead = $('.story__lead', after);

    const tangleLength = tangle.getTotalLength();
    const flowLength = flow.getTotalLength();
    gsap.set(tangle, { strokeDasharray: tangleLength, strokeDashoffset: tangleLength });
    gsap.set(flow, { strokeDasharray: flowLength, strokeDashoffset: flowLength });
    gsap.set(afterLead, { opacity: 0, y: 30 });
    gsap.set(moveChars, { opacity: 0, yPercent: 60, rotation: 8 });

    // The knot tangles itself as the section scrolls into view
    gsap.to(tangle, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: { trigger: story, start: 'top 85%', end: 'top top', scrub: true }
    });

    gsap.from([...beforeText, stuckWord], {
      opacity: 0,
      y: 40,
      stagger: 0.1,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: story, start: 'top 55%', toggleActions: 'play none none reverse' }
    });

    // "Stuck" trembles while it waits
    const jitter = gsap.to(stuckWord, {
      x: 'random(-2.5, 2.5)',
      y: 'random(-2, 2)',
      rotation: 'random(-0.8, 0.8)',
      duration: 0.09,
      ease: 'none',
      repeat: -1,
      repeatRefresh: true,
      paused: true
    });

    ScrollTrigger.create({
      trigger: story,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: self => (self.isActive ? jitter.play() : jitter.pause())
    });

    const spread = isMobile() ? 0.45 : 1;

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: story,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * (isMobile() ? 1.8 : 2.6)),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    tl.to({}, { duration: 0.35 }) // hold on "stuck"
      .to(stuckChars, {
        x: () => gsap.utils.random(-320, 320) * spread,
        y: () => gsap.utils.random(-220, 220) * spread,
        rotation: () => gsap.utils.random(-120, 120),
        opacity: 0,
        filter: 'blur(10px)',
        stagger: 0.06,
        duration: 1,
        ease: 'power2.in'
      })
      .to(beforeText, { opacity: 0, y: -30, duration: 0.6, stagger: 0.05 }, '<')
      .to(tangle, { strokeDashoffset: tangleLength, duration: 1.1, ease: 'power1.inOut' }, '<0.2')
      .to(flow, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' }, '-=0.6')
      .to(afterLead, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.9')
      .to(moveChars, {
        opacity: 1,
        yPercent: 0,
        rotation: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'back.out(1.6)'
      }, '-=0.6')
      .fromTo(moveWord, { scale: 0.96 }, { scale: 1.03, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .to({}, { duration: 0.45 }); // hold on "move"
  }

  // ===================================
  // SECTION REVEALS
  // ===================================

  function buildReveals() {
    // Section titles: lines rise from masks
    $$('[data-split]').forEach(el => {
      const s = split(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      gsap.from(s ? s.lines : el, {
        yPercent: s ? 105 : 0,
        y: s ? 0 : 40,
        opacity: s ? 1 : 0,
        duration: 1.2,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Generic soft reveal
    $$('[data-reveal]').forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    // Word-by-word highlight tied to scroll
    $$('[data-scrub-words]').forEach(el => {
      const s = split(el, { type: 'words' });
      if (!s) return;
      gsap.fromTo(s.words, { opacity: 0.14 }, {
        opacity: 1,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: true }
      });
    });
  }

  function buildFit() {
    $$('.fit-row').forEach(row => {
      const shapes = prepareDraw($$('.fit-row__icon path, .fit-row__icon circle', row));
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        scrollTrigger: { trigger: row, start: 'top 88%' }
      });

      tl.from(row, { '--line': 0, duration: 1.2, ease: 'power3.inOut' })
        .from($('.fit-row__num', row), { opacity: 0, x: 20, duration: 0.8 }, 0.2)
        .from($('.fit-row__text', row), { opacity: 0, yPercent: 40, duration: 1.1 }, 0.25)
        .to(shapes, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.15 }, 0.3);
    });
  }

  function buildOffer() {
    const bento = $('.offer__bento');
    if (!bento) return;

    gsap.from($$('[data-card]', bento), {
      opacity: 0,
      y: 70,
      rotation: (i) => (i === 0 ? 0 : i % 2 ? -2 : 2),
      duration: 1.3,
      stagger: 0.12,
      ease: 'expo.out',
      scrollTrigger: { trigger: bento, start: 'top 82%' }
    });

    gsap.from($$('[data-item]', bento), {
      opacity: 0,
      x: 40,
      duration: 1,
      stagger: 0.14,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.offer__list', start: 'top 85%' }
    });
  }

  function buildResults() {
    $$('[data-line]').forEach((line, i) => {
      gsap.fromTo(line,
        { opacity: 0.08, yPercent: 35, x: i % 2 ? -90 : 90 },
        {
          opacity: 1,
          yPercent: 0,
          x: 0,
          ease: 'none',
          scrollTrigger: { trigger: line, start: 'top 95%', end: 'top 50%', scrub: true }
        }
      );
    });
  }

  function buildAbout() {
    const frame = $('.about__frame');
    const img = $('.about__portrait');
    if (!frame || !img) return;

    gsap.set(img, { scale: 1.18 });

    gsap.fromTo(frame,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: frame, start: 'top 80%' }
      }
    );

    gsap.fromTo(img, { yPercent: -7 }, {
      yPercent: 7,
      ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  function buildCerts() {
    const grid = $('.certs__grid');
    if (!grid) return;

    const cards = $$('.cert-card', grid);
    const shapes = prepareDraw($$('.cert-card__mark > *', grid));

    const tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: 'top 82%' } });
    tl.from(cards, { opacity: 0, y: 60, duration: 1.2, stagger: 0.1, ease: 'expo.out' })
      .to(shapes, { strokeDashoffset: 0, duration: 1.6, stagger: 0.06, ease: 'power2.inOut' }, 0.2);
  }

  // ===================================
  // TESTIMONIALS MARQUEE
  // ===================================

  function buildMarquee() {
    const marquee = $('.marquee');
    const track = $('.marquee__track', marquee || document);
    const group = $('.marquee__group', track || document);
    if (!marquee || !track || !group) return;

    const setup = () => {
      $$('.marquee__group[data-clone]', track).forEach(clone => clone.remove());

      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const groupWidth = group.getBoundingClientRect().width + gap;
      if (!groupWidth) return;

      const copies = Math.ceil(window.innerWidth / groupWidth) + 1;
      for (let i = 0; i < copies; i++) {
        const clone = group.cloneNode(true);
        clone.dataset.clone = '';
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('inert', '');
        track.appendChild(clone);
      }

      marquee.style.setProperty('--marquee-shift', groupWidth + 'px');
      marquee.style.setProperty('--marquee-duration', Math.round(groupWidth / 55) + 's');
      marquee.classList.add('is-running');
    };

    setup();

    let lastWidth = window.innerWidth;
    let timer;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(setup, 200);
    });

    // Pause when off-screen
    ScrollTrigger.create({
      trigger: marquee,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: self => { track.style.animationPlayState = self.isActive ? '' : 'paused'; }
    });
  }

  // ===================================
  // CONTACT + FOOTER
  // ===================================

  function buildContact() {
    const panel = $('.contact__panel');
    if (panel) {
      gsap.from(panel, {
        opacity: 0,
        y: 80,
        rotation: -1.5,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: panel, start: 'top 85%' }
      });
    }

    const fill = $('.footer__mark-fill');
    if (fill) {
      gsap.fromTo(fill, { clipPath: 'inset(0% 0% 0% 100%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: { trigger: '.footer__mark', start: 'top 90%', end: 'bottom 75%', scrub: true }
      });
    }
  }

  // ===================================
  // GLOBAL: header, progress
  // ===================================

  function buildGlobal() {
    const header = $('.header');

    gsap.to('.scroll-progress', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
    });

    if (header) {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: self => {
          if (header.classList.contains('menu-open')) return;
          const hide = self.direction === 1 && self.scroll() > window.innerHeight * 0.6;
          header.classList.toggle('is-hidden', hide);
        }
      });

      // Keyboard users must always see the header
      header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    }
  }

  // ===================================
  // REFRESH HOOKS
  // ===================================

  function refresh() {
    lenis?.resize();
    ScrollTrigger.refresh();
  }

  function initRefreshHooks() {
    window.addEventListener('layoutchange', refresh);
    window.addEventListener('load', refresh);

    // Accessibility widget (NagishLi) can resize text; re-measure when content height jumps
    const main = $('#main');
    if (main && 'ResizeObserver' in window) {
      let lastHeight = main.offsetHeight;
      let timer;
      new ResizeObserver(() => {
        const height = main.offsetHeight;
        if (Math.abs(height - lastHeight) < 40) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          refresh();
          lastHeight = main.offsetHeight;
        }, 250);
      }).observe(main);
    }
  }

  // ===================================
  // INIT
  // ===================================

  function init() {
    waitForFonts(1000).then(() => {
      const ctx = gsap.context(() => {});
      try {
        ctx.add(build);
      } catch (error) {
        // Never leave content hidden: revert every tween, trigger and split, then show the static page
        console.error('Motion init failed:', error);
        ctx.revert();
        gsap.ticker.remove(lenisRaf);
        lenis?.destroy();
        lenis = window.lenis = null;
        root.classList.remove('js-motion', 'lenis', 'lenis-smooth');
      }
    });
  }

  function build() {
    buildHero();
    buildStory();
    buildReveals();
    buildFit();
    buildOffer();
    buildResults();
    buildAbout();
    buildCerts();
    buildMarquee();
    buildContact();
    buildGlobal();
    initRefreshHooks();

    ScrollTrigger.refresh();

    // Honour a deep link once pins have been measured
    if (location.hash && location.hash.length > 1) {
      const target = document.querySelector(location.hash);
      const offset = -($('.header')?.offsetHeight || 76) + 1;
      if (target && lenis) lenis.scrollTo(target, { offset, immediate: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
