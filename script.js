const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const cards = document.querySelectorAll('.card');
const canvas = document.getElementById('particles');
const ctx = canvas?.getContext('2d');

let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let particles = [];
let animationFrame = null;

function updateClock() {
  const time = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());

  const clock = document.getElementById('clock');
  if (clock) clock.textContent = time;
}

function updateYear() {
  const year = document.getElementById('year-count');
  if (year) year.textContent = new Date().getFullYear();
}

function setPointerPosition(x, y) {
  pointerX = x;
  pointerY = y;
  root.style.setProperty('--mouse-x', `${x}px`);
  root.style.setProperty('--mouse-y', `${y}px`);
}

function bindCardInteractions() {
  cards.forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;

      card.style.setProperty('--card-x', `${x}px`);
      card.style.setProperty('--card-y', `${y}px`);

      if (!prefersReducedMotion) {
        card.style.transform = `translateY(-3px) rotateX(${-py * 5}deg) rotateY(${px * 6}deg) scale(1.012)`;
      }
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.removeProperty('--card-x');
      card.style.removeProperty('--card-y');
    });

    card.addEventListener('click', event => {
      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.7;
      const ripple = document.createElement('span');

      ripple.className = 'ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

      card.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });
}

function resizeCanvas() {
  if (!canvas || !ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(80, Math.max(34, Math.floor(window.innerWidth / 18)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.6 + 0.35,
    vx: (Math.random() - 0.5) * 0.16,
    vy: (Math.random() - 0.5) * 0.16,
    alpha: Math.random() * 0.42 + 0.12,
  }));
}

function drawParticles() {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach(particle => {
    const dx = pointerX - particle.x;
    const dy = pointerY - particle.y;
    const distance = Math.hypot(dx, dy);
    const pull = Math.max(0, 1 - distance / 420) * 0.018;

    particle.x += particle.vx + dx * pull;
    particle.y += particle.vy + dy * pull;

    if (particle.x < -10) particle.x = window.innerWidth + 10;
    if (particle.x > window.innerWidth + 10) particle.x = -10;
    if (particle.y < -10) particle.y = window.innerHeight + 10;
    if (particle.y > window.innerHeight + 10) particle.y = -10;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(188, 218, 230, ${particle.alpha})`;
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (distance < 112) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(159, 199, 216, ${(1 - distance / 112) * 0.11})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  animationFrame = requestAnimationFrame(drawParticles);
}

function initParticles() {
  if (!canvas || !ctx || prefersReducedMotion) return;

  resizeCanvas();
  drawParticles();
  window.addEventListener('resize', resizeCanvas);
}

document.addEventListener('pointermove', event => {
  setPointerPosition(event.clientX, event.clientY);
}, { passive: true });

document.addEventListener('pointerleave', () => {
  setPointerPosition(window.innerWidth / 2, window.innerHeight / 2);
});

updateYear();
updateClock();
setInterval(updateClock, 1000);
bindCardInteractions();
initParticles();

window.addEventListener('beforeunload', () => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
});
