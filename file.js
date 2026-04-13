// ═══════════════════════════════════════════════════
//  CUSTOM CURSOR
// ═══════════════════════════════════════════════════
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
});

function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
}
animateFollower();

// ═══════════════════════════════════════════════════
//  NAVBAR — SCROLL + ACTIVE LINKS + HAMBURGER
// ═══════════════════════════════════════════════════
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const navItems  = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveNav();
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
});

navItems.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(sec => {
        const top    = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        const id     = sec.getAttribute('id');
        const link   = document.querySelector(`.nav-link[href="#${id}"]`);
        if (link) {
            link.classList.toggle('active', scrollPos >= top && scrollPos < bottom);
        }
    });
}

// ═══════════════════════════════════════════════════
//  PARTICLE CANVAS
// ═══════════════════════════════════════════════════
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');

let particles = [];
let W, H;

function resizeCanvas() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

function initParticles() {
    particles = [];
    const count = Math.floor((W * H) / 18000);
    for (let i = 0; i < count; i++) {
        particles.push({
            x:  Math.random() * W,
            y:  Math.random() * H,
            r:  Math.random() * 2 + 0.5,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.5 + 0.2,
        });
    }
}
initParticles();

function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(159,103,255,${p.opacity})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // Draw connecting lines
    particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(124,58,237,${0.12 * (1 - dist / 120)})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        });
    });

    requestAnimationFrame(drawParticles);
}
drawParticles();

// ═══════════════════════════════════════════════════
//  TYPING ANIMATION
// ═══════════════════════════════════════════════════
const words  = ['Content Creator 🎬', 'Gamer 🎮', 'Streamer 📡', 'Community Builder 🤝', 'Night Owl 🦉', 'Panda 🐼'];
const target = document.getElementById('typedText');
let wi = 0, ci = 0, deleting = false;

function type() {
    const word = words[wi];
    if (!deleting) {
        target.textContent = word.slice(0, ++ci);
        if (ci === word.length) {
            deleting = true;
            setTimeout(type, 1800);
            return;
        }
    } else {
        target.textContent = word.slice(0, --ci);
        if (ci === 0) {
            deleting = false;
            wi = (wi + 1) % words.length;
        }
    }
    setTimeout(type, deleting ? 60 : 90);
}
setTimeout(type, 800);

// ═══════════════════════════════════════════════════
//  COUNTER ANIMATION
// ═══════════════════════════════════════════════════
function animateCount(el) {
    const target = +el.dataset.target;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const update = () => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString();
        if (current < target) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

// ═══════════════════════════════════════════════════
//  SCROLL REVEAL + SKILL BARS + COUNTERS
// ═══════════════════════════════════════════════════
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');

                // Animate skill bars inside
                entry.target.querySelectorAll('.skill-fill').forEach(bar => {
                    bar.style.width = bar.dataset.width + '%';
                });

                // Animate stat counters inside
                entry.target.querySelectorAll('.stat-num').forEach(el => {
                    animateCount(el);
                });
            }, i * 80);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Also observe hero stats immediately
const heroStatsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-num').forEach(el => animateCount(el));
            heroStatsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroStatsObserver.observe(heroStats);

// ═══════════════════════════════════════════════════
//  DISCORD ONLINE COUNT — FLICKER
// ═══════════════════════════════════════════════════
function updateOnlineCount() {
    const el = document.getElementById('onlineCount');
    if (!el) return;
    const base  = 200;
    const range = 80;
    const count = base + Math.floor(Math.random() * range);
    el.textContent = count;
}
updateOnlineCount();
setInterval(updateOnlineCount, 30000);

// ═══════════════════════════════════════════════════
//  VIDEO MODAL
// ═══════════════════════════════════════════════════
const vidModal     = document.getElementById('vidModal');
const vidModalEmbed = document.getElementById('vidModalEmbed');

function openVideo(videoId) {
    vidModalEmbed.innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen>
        </iframe>`;
    vidModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeVidModal() {
    vidModal.classList.remove('open');
    vidModalEmbed.innerHTML = '';
    document.body.style.overflow = '';
}

vidModal.addEventListener('click', e => {
    if (e.target === vidModal) closeVidModal();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeVidModal();
});

// ═══════════════════════════════════════════════════
//  CONTACT FORM
// ═══════════════════════════════════════════════════
function submitForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    // Simulate send delay (replace with real logic / EmailJS etc.)
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        btn.style.background = 'linear-gradient(135deg, #16a34a, #22c55e)';
        showToast('✅ Message sent! I\'ll get back to you soon 🐼');
        e.target.reset();

        setTimeout(() => {
            btn.innerHTML = orig;
            btn.disabled = false;
            btn.style.background = '';
        }, 3000);
    }, 1500);
}

// ═══════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════
const toastEl = document.getElementById('toast');
let toastTimer;

function showToast(msg, duration = 3500) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}

// ═══════════════════════════════════════════════════
//  FOOTER YEAR
// ═══════════════════════════════════════════════════
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ═══════════════════════════════════════════════════
//  SMOOTH SCROLL (fallback for older browsers)
// ═══════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ═══════════════════════════════════════════════════
//  CARD TILT ON MOUSE MOVE
// ═══════════════════════════════════════════════════
document.querySelectorAll('.skill-card, .social-card, .video-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect  = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
        const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
        card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

console.log(`
🐼 ═══════════════════════════════
   About-Panda Website Loaded!
   Customize your info in the HTML
   and replace links with your own.
🐼 ═══════════════════════════════
`);
