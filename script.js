/* ================================================
   EST334 — Script Principal
   Cosmos Estadístico: partículas, cursor, animaciones
   ================================================ */

// ─── CURSOR PERSONALIZADO ───────────────────────

const dot  = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
});

// Animar el anillo con suavizado
function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();

// Hover sobre elementos interactivos
const hoverTargets = document.querySelectorAll('a, button, .project-card, .glass-card');
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});


// ─── CANVAS DE PARTÍCULAS (COSMOS) ──────────────

const canvas  = document.getElementById('cosmos-canvas');
const ctx     = canvas.getContext('2d');

let particles = [];
let W, H;

function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => {
    resize();
    initParticles();
});

// Caracteres de datos — mezcla estadística y geoespacial
const DATA_CHARS = [
    '∑','μ','σ','λ','∂','∇','∈','≈','≤','±',
    '0','1','Σ','π','∫','√','x²','β','α','γ'
];

class Particle {
    constructor() { this.reset(); }

    reset() {
        this.x     = Math.random() * W;
        this.y     = Math.random() * H;
        this.size  = Math.random() * 12 + 7;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3 - 0.1;
        this.opacity = Math.random() * 0.3 + 0.05;
        this.char   = DATA_CHARS[Math.floor(Math.random() * DATA_CHARS.length)];

        // Tipos: node (punto), char (símbolo), line-node
        this.type   = Math.random() < 0.6 ? 'char' : 'dot';
        this.dotR   = Math.random() * 1.5 + 0.5;
        this.color  = this.pickColor();
    }

    pickColor() {
        const palette = [
            `rgba(0, 212, 255, `,      // cyan
            `rgba(124, 58, 237, `,     // violet
            `rgba(0, 255, 135, `,      // green
        ];
        return palette[Math.floor(Math.random() * palette.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y < -20 || this.x < -20 || this.x > W + 20) this.reset();
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (this.type === 'char') {
            ctx.font = `${this.size}px 'JetBrains Mono', monospace`;
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fillText(this.char, this.x, this.y);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.dotR, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
        }

        ctx.restore();
    }
}

// Conexiones entre partículas cercanas
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const alpha = (1 - dist / 120) * 0.06;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = `rgba(0, 212, 255, 1)`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
}

function initParticles() {
    const count = Math.min(Math.floor((W * H) / 14000), 80);
    particles = Array.from({ length: count }, () => new Particle());
}

function animateCanvas() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateCanvas);
}

initParticles();
animateCanvas();


// ─── SCROLL REVEAL ───────────────────────────────

const sr = ScrollReveal({
    distance: '40px',
    duration: 900,
    delay: 150,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    reset: false,
});

sr.reveal('.sr-top',    { origin: 'top',    delay: 100, interval: 120 });
sr.reveal('.sr-bottom', { origin: 'bottom', delay: 200, interval: 150 });


// ─── NAVBAR AL HACER SCROLL ──────────────────────

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });


// ─── EFECTO PARALLAX SUAVE EN HERO ───────────────

const heroContent = document.querySelector('.hero-content');
const coordDisplay = document.querySelector('.coord-display');

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (heroContent && scrolled < window.innerHeight) {
        const offset = scrolled * 0.15;
        heroContent.style.transform = `translateY(${offset}px)`;
        heroContent.style.opacity   = 1 - (scrolled / (window.innerHeight * 0.7));
    }
}, { passive: true });


// ─── ANIMACIÓN DE BARRAS DECO (ABOUT) ────────────

const decoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll('.deco-bar');
            bars.forEach((bar, i) => {
                setTimeout(() => {
                    bar.style.opacity = '1';
                }, i * 120);
            });
        }
    });
}, { threshold: 0.3 });

const decoChart = document.querySelector('.deco-chart');
if (decoChart) decoObserver.observe(decoChart);


// ─── TILT 3D EN TARJETAS ─────────────────────────

function addTilt(selector) {
    document.querySelectorAll(selector).forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const dx   = (e.clientX - cx) / (rect.width  / 2);
            const dy   = (e.clientY - cy) / (rect.height / 2);
            const tiltX = dy * -5;
            const tiltY = dx * 5;
            card.style.transform = `translateY(-6px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

addTilt('.project-card');
addTilt('.about-card');


// ─── TEXTO DE COORDENADAS DINÁMICO ───────────────

// Simula datos "en vivo" de coordenadas de Puno, Perú
const coordValues = document.querySelectorAll('.coord-display .mono-text');
if (coordValues.length) {
    setInterval(() => {
        // Pequeña variación aleatoria para dar sensación de datos en tiempo real
        const latVar = (-15.840 + (Math.random() - 0.5) * 0.0001).toFixed(4);
        const lonVar = (-70.021 + (Math.random() - 0.5) * 0.0001).toFixed(4);
        coordValues[0].textContent = `LAT: ${latVar}°S`;
        coordValues[1].textContent = `LON: ${lonVar}°O`;
    }, 2500);
}