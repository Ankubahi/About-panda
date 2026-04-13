'use strict';

/* ════════════════════════════════════════
   PRELOADER
════════════════════════════════════════ */
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('done');
    }, 2000);
});

/* ════════════════════════════════════════
   CURSOR
════════════════════════════════════════ */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
});

(function trackRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(trackRing);
})();

/* ════════════════════════════════════════
   STAR CANVAS
════════════════════════════════════════ */
const starCanvas = document.getElementById('starCanvas');
const sCtx = starCanvas.getContext('2d');
let stars = [];

function resizeStar() {
    starCanvas.width  = window.innerWidth;
    starCanvas.height = window.innerHeight;
    stars = Array.from({ length: 120 }, () => ({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r: Math.random() * 1.2 + 0.2,
        o: Math.random(),
        s: (Math.random() - 0.5) * 0.2,
        dx: (Math.random() - 0.5) * 0.15,
        dy: (Math.random() - 0.5) * 0.08,
    }));
}
resizeStar();
window.addEventListener('resize', resizeStar);

(function animStars() {
    sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    stars.forEach(s => {
        s.o += s.s * 0.02;
        if (s.o <= 0 || s.o >= 1) s.s *= -1;
        s.x += s.dx; s.y += s.dy;
        if (s.x < 0) s.x = starCanvas.width;
        if (s.x > starCanvas.width)  s.x = 0;
        if (s.y < 0) s.y = starCanvas.height;
        if (s.y > starCanvas.height) s.y = 0;

        sCtx.beginPath();
        sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sCtx.fillStyle = `rgba(200,180,255,${s.o * 0.7})`;
        sCtx.fill();
    });
    requestAnimationFrame(animStars);
})();

/* ════════════════════════════════════════
   NAVBAR
════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
const burger = document.getElementById('burger');
const menu   = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('stuck', window.scrollY > 60);
    highlightNav();
});

burger.addEventListener('click', () => {
    burger.classList.toggle('on');
    menu.classList.toggle('on');
});

document.querySelectorAll('.nlink').forEach(l => {
    l.addEventListener('click', () => {
        burger.classList.remove('on');
        menu.classList.remove('on');
    });
});

function highlightNav() {
    const sections = document.querySelectorAll('section[id]');
    const scroll   = window.scrollY + 120;
    sections.forEach(sec => {
        const link = document.querySelector(`.nlink[href="#${sec.id}"]`);
        if (!link) return;
        const inView = scroll >= sec.offsetTop && scroll < sec.offsetTop + sec.offsetHeight;
        link.classList.toggle('active', inView);
    });
}

/* ════════════════════════════════════════
   TYPING ANIMATION
════════════════════════════════════════ */
const words  = ['Content Creator 🎬', 'Gamer 🎮', 'Streamer 📡', 'Community Builder 🤝', 'Night Owl 🦉', 'Panda 🐼'];
const tw     = document.getElementById('typedWord');
let wi = 0, ci = 0, del = false;

function typeLoop() {
    const w = words[wi];
    tw.textContent = del ? w.slice(0, --ci) : w.slice(0, ++ci);
    if (!del && ci === w.length) { del = true; setTimeout(typeLoop, 1800); return; }
    if (del && ci === 0)         { del = false; wi = (wi + 1) % words.length; }
    setTimeout(typeLoop, del ? 55 : 85);
}
setTimeout(typeLoop, 1000);

/* ════════════════════════════════════════
   COUNT-UP ANIMATION
════════════════════════════════════════ */
function countUp(el) {
    const to   = +el.dataset.to;
    const dur  = 2200;
    const step = to / (dur / 16);
    let cur = 0;
    const run = () => {
        cur = Math.min(cur + step, to);
        el.textContent = Math.floor(cur).toLocaleString();
        if (cur < to) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
}

/* ════════════════════════════════════════
   SCROLL REVEAL + SKILL BARS + COUNTERS
════════════════════════════════════════ */
const revObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        setTimeout(() => {
            e.target.classList.add('in');

            // Skill bars
            e.target.querySelectorAll('.sk-fill').forEach(b => {
                b.style.width = b.dataset.w + '%';
            });

            // Counters
            e.target.querySelectorAll('[data-to]').forEach(el => countUp(el));

        }, i * 100);
        revObs.unobserve(e.target);
    });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
        .forEach(el => revObs.observe(el));

/* ════════════════════════════════════════
   3D CARD TILT
════════════════════════════════════════ */
document.querySelectorAll('.vcard, .soc-card, .sk-card, .dc-perk, .fact-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const x  = ((e.clientX - r.left) / r.width  - 0.5) * 12;
        const y  = ((e.clientY - r.top)  / r.height - 0.5) * 12;
        card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

/* ════════════════════════════════════════
   DISCORD ONLINE FLICKER
════════════════════════════════════════ */
function flickerOnline() {
    const el = document.getElementById('onlineNum');
    if (el) el.textContent = (200 + Math.floor(Math.random() * 100)).toString();
}
flickerOnline();
setInterval(flickerOnline, 25000);

/* ════════════════════════════════════════
   VIDEO MODAL
════════════════════════════════════════ */
const vmodal = document.getElementById('vidModal');
const vframe = document.getElementById('vmodal-frame');

function openVid(id) {
    vframe.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
        frameborder="0" allow="autoplay;encrypted-media" allowfullscreen></iframe>`;
    vmodal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeVid() {
    vmodal.classList.remove('open');
    vframe.innerHTML = '';
    document.body.style.overflow = '';
}

vmodal.addEventListener('click', e => { if (e.target === vmodal) closeVid(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVid(); });

/* ════════════════════════════════════════
   CONTACT FORM
════════════════════════════════════════ */
function sendMsg(e) {
    e.preventDefault();
    const btn  = document.getElementById('cfBtn');
    const orig = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
    btn.disabled = true;

    // Replace this with EmailJS / Formspree / your backend
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> <span>Message Sent! 🐼</span>';
        btn.style.background = 'linear-gradient(135deg,#059669,#10b981)';
        showToast('✅ Message sent! I\'ll get back to you soon 🐼');
        e.target.reset();
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.disabled  = false;
            btn.style.background = '';
        }, 3500);
    }, 1600);
}

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
const toastEl = document.getElementById('toast');
let toastTimer;

function showToast(msg, ms = 3500) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

/* ════════════════════════════════════════
   FOOTER YEAR
════════════════════════════════════════ */
const yrEl = document.getElementById('yr');
if (yrEl) yrEl.textContent = new Date().getFullYear();

/* ════════════════════════════════════════
   SMOOTH SCROLL FALLBACK
════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
});

/* ════════════════════════════════════════
   PARALLAX ON HERO CARD
════════════════════════════════════════ */
const heroCard = document.querySelector('.hero-card');
if (heroCard) {
    document.addEventListener('mousemove', e => {
        const x = (e.clientX / window.innerWidth  - 0.5) * 14;
        const y = (e.clientY / window.innerHeight - 0.5) * 14;
        heroCard.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
    });
    document.addEventListener('mouseleave', () => {
        heroCard.style.transform = '';
    });
}

console.log('%c🐼 About-Panda Loaded!', 'font-size:18px;color:#8b5cf6;font-weight:bold;');
console.log('%c✏️  Edit index.html to replace placeholder links with your real ones!', 'color:#22d3ee;font-size:12px;');
