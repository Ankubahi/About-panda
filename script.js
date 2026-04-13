/* ════════════════════════════════════════════════
   PANDAAGAMERZZ — script.js
════════════════════════════════════════════════ */

'use strict';

/* ── DOM helpers ── */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ════════════════════════════════════════════════
   1. PRELOADER
════════════════════════════════════════════════ */
(function initPreloader() {
  const loader  = $('#preloader');
  const bar     = $('#preBar');
  const pct     = $('#prePct');
  let progress  = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 12 + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('hide');
        document.body.style.overflow = '';
        startAnimations();
      }, 400);
    }
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
  }, 80);

  document.body.style.overflow = 'hidden';
})();

/* ════════════════════════════════════════════════
   2. CUSTOM CURSOR
════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  /* Hover effect on interactive elements */
  $$('a, button, .vid-card, .soc-card, .short-card-wrap').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();

/* ════════════════════════════════════════════════
   3. PARTICLE CANVAS
════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('#particleCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function() {
    this.x   = Math.random() * W;
    this.y   = Math.random() * H;
    this.r   = Math.random() * 2 + .5;
    this.vx  = (Math.random() - .5) * .4;
    this.vy  = (Math.random() - .5) * .4;
    this.a   = Math.random() * .5 + .1;
    const colors = ['124,58,237', '6,182,212', '245,158,11', '236,72,153'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  };
  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };
  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.a})`;
    ctx.fill();
  };

  function init() {
    resize();
    particles = Array.from({ length: 80 }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124,58,237,${(1 - dist / 120) * .08})`;
          ctx.lineWidth   = .5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  init();
  animate();
})();

/* ════════════════════════════════════════════════
   4. NAVBAR — scroll effect + active link
════════════════════════════════════════════════ */
(function initNavbar() {
  const nav      = $('#navbar');
  const progress = $('#scrollProgress');
  const links    = $$('.nav-link, .mob-link');
  const sections = $$('section[id]');

  function onScroll() {
    const scrollY   = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const pct       = (scrollY / maxScroll) * 100;

    /* Navbar state */
    nav.classList.toggle('scrolled', scrollY > 50);

    /* Scroll progress bar */
    progress.style.width = pct + '%';

    /* Back to top */
    const btn = $('#backTop');
    btn.classList.toggle('show', scrollY > 400);

    /* Active link */
    let current = '';
    sections.forEach(s => {
      if (scrollY >= s.offsetTop - 140) current = s.id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ════════════════════════════════════════════════
   5. MOBILE MENU
════════════════════════════════════════════════ */
(function initMobileMenu() {
  const btn     = $('#hamburger');
  const menu    = $('#mobMenu');
  const overlay = $('#mobOverlay');
  const close   = $('#mobClose');
  const links   = $$('.mob-link');

  function open() {
    menu.classList.add('open');
    overlay.classList.add('show');
    btn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('open');
    overlay.classList.remove('show');
    btn.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', open);
  close.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  links.forEach(l => l.addEventListener('click', closeMenu));
})();

/* ════════════════════════════════════════════════
   6. TYPING ANIMATION
════════════════════════════════════════════════ */
(function initTyping() {
  const el    = $('#typedWord');
  if (!el) return;

  const words = [
    'Epic Gaming Videos 🎮',
    'Funny Moments 😂',
    'Clutch Plays ⚡',
    'YouTube Shorts 📱',
    'Daily Content 🔥',
    'Panda Army 🐼',
  ];
  let wi = 0, ci = 0, deleting = false;

  function type() {
    const word    = words[wi];
    const current = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    el.textContent = current;

    let delay = deleting ? 60 : 100;

    if (!deleting && ci > word.length) {
      delay = 2000;
      deleting = true;
    } else if (deleting && ci < 0) {
      deleting = false;
      wi = (wi + 1) % words.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  setTimeout(type, 1200);
})();

/* ════════════════════════════════════════════════
   7. STAT COUNTERS
════════════════════════════════════════════════ */
(function initCounters() {
  const counters = $$('.counter');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const card   = el.closest('.stat-card');
      let current  = 0;
      const step   = Math.max(1, Math.ceil(target / 80));

      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString() + suffix;
        if (current >= target) {
          clearInterval(timer);
          if (card) card.classList.add('counted');
        }
      }, 20);

      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

/* ════════════════════════════════════════════════
   8. SCROLL REVEAL
════════════════════════════════════════════════ */
(function initReveal() {
  const els = $$('.reveal');

  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), +delay);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  /* Stagger children in grids */
  $$('.stats-grid, .vid-grid, .social-grid').forEach(grid => {
    grid.querySelectorAll('.reveal').forEach((el, i) => {
      el.dataset.delay = i * 100;
    });
  });

  els.forEach(el => obs.observe(el));
})();

/* ════════════════════════════════════════════════
   9. VIDEO MODAL
════════════════════════════════════════════════ */
const SHORT_IDS = ['6KFoU5PL24g'];

function openModal(id, forceShort = false) {
  const bd    = $('#modalBd');
  const box   = $('#modalBox');
  const frame = $('#modalFrame');
  const isShort = forceShort || SHORT_IDS.includes(id);

  frame.className = 'modal-frame' + (isShort ? ' is-short' : '');

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  iframe.title = 'Video Player';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;

  if (isShort) {
    iframe.style.cssText = 'width:340px;aspect-ratio:9/16;max-height:85vh;border:none;display:block;';
    box.style.maxWidth = '380px';
  } else {
    iframe.style.cssText = 'width:100%;aspect-ratio:16/9;border:none;display:block;';
    box.style.maxWidth = '900px';
  }

  frame.innerHTML = '';
  frame.appendChild(iframe);

  bd.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const bd    = $('#modalBd');
  const frame = $('#modalFrame');
  const box   = $('#modalBox');

  bd.classList.remove('open');
  frame.innerHTML = '';
  box.style.maxWidth = '900px';
  document.body.style.overflow = '';
}

/* Close on ESC */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ════════════════════════════════════════════════
   10. BACK TO TOP
════════════════════════════════════════════════ */
function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ════════════════════════════════════════════════
   11. TOAST NOTIFICATION
════════════════════════════════════════════════ */
function showToast(msg, duration = 3000) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ════════════════════════════════════════════════
   12. SMOOTH SCROLLING for anchor links
════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ════════════════════════════════════════════════
   13. CARD TILT EFFECT (Desktop)
════════════════════════════════════════════════ */
(function initTilt() {
  if (window.innerWidth < 900) return;

  $$('.stat-card, .soc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(600px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ════════════════════════════════════════════════
   14. GLITCH on click (Easter egg)
════════════════════════════════════════════════ */
const glitch = $('.glitch');
if (glitch) {
  glitch.addEventListener('click', () => {
    showToast('🐼 PANDA POWER ACTIVATED!');
    glitch.style.animation = 'none';
    setTimeout(() => glitch.style.animation = '', 100);
  });
}

/* ════════════════════════════════════════════════
   15. START ANIMATIONS (called after preloader)
════════════════════════════════════════════════ */
function startAnimations() {
  /* Animate hero elements in sequence */
  const heroEls = $$('.pulse-badge, .hero-title, .hero-typed-wrap, .hero-desc, .hero-btns, .hero-pills');
  heroEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    setTimeout(() => {
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    }, i * 120 + 200);
  });

  /* Show avatar scene */
  const scene = $('.avatar-scene');
  if (scene) {
    scene.style.opacity = '0';
    setTimeout(() => {
      scene.style.transition = 'opacity .8s ease';
      scene.style.opacity    = '1';
    }, 600);
  }

  /* Scroll indicator */
  const hint = $('.scroll-hint');
  if (hint) {
    hint.style.opacity = '0';
    setTimeout(() => {
      hint.style.transition = 'opacity .6s ease';
      hint.style.opacity    = '1';
    }, 1200);
  }
}

/* ════════════════════════════════════════════════
   16. KONAMI CODE easter egg 🐼
════════════════════════════════════════════════ */
(function initKonami() {
  const code    = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let   pressed = [];

  document.addEventListener('keydown', e => {
    pressed.push(e.key);
    pressed = pressed.slice(-code.length);
    if (pressed.join(',') === code.join(',')) {
      showToast('🐼🎉 PANDA CHEAT CODE! Welcome to the Secret Panda Club!', 5000);
      document.body.style.animation = 'none';
      /* Flash screen */
      const flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;inset:0;background:rgba(124,58,237,.3);z-index:9000;pointer-events:none;animation:flashOut .8s forwards';
      const style = document.createElement('style');
      style.textContent = '@keyframes flashOut{0%{opacity:1}100%{opacity:0}}';
      document.head.appendChild(style);
      document.body.appendChild(flash);
      setTimeout(() => { flash.remove(); style.remove(); }, 900);
    }
  });
})();

/* ════════════════════════════════════════════════
   INIT LOG
════════════════════════════════════════════════ */
console.log('%c🐼 PandaaGamerzz Website Loaded!', 'color:#7c3aed;font-size:1.2rem;font-weight:bold;');
console.log('%c👉 youtube.com/@PandaaGamerzz', 'color:#06b6d4;font-size:.9rem;');

/* ══ Milestone banner progress fill ══ */
(function initMilestone() {
  const banner = $('.milestone-banner');
  if (!banner) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        banner.classList.add('visible');
        obs.unobserve(banner);
      }
    });
  }, { threshold: 0.4 });

  obs.observe(banner);
})();
