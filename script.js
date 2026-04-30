// ── Animated background ──
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let W, H, blobs;

  const BLOB_DEFS = [
    { x: 0.15, y: 0.10, r: 340, color: [50, 100, 160],  speed: 0.00012 },
    { x: 0.80, y: 0.20, r: 260, color: [30,  70, 130],  speed: 0.00018 },
    { x: 0.60, y: 0.65, r: 300, color: [60,  90, 140],  speed: 0.00015 },
    { x: 0.20, y: 0.75, r: 220, color: [80, 110, 160],  speed: 0.00020 },
    { x: 0.90, y: 0.85, r: 200, color: [40,  75, 120],  speed: 0.00014 },
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    blobs = BLOB_DEFS.map(d => ({
      ...d,
      cx: d.x * W,
      cy: d.y * H,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);

    // Deep background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#111820');
    bg.addColorStop(0.5, '#161f2a');
    bg.addColorStop(1, '#0e1620');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Animated blobs
    blobs.forEach(b => {
      const ox = Math.sin(ts * b.speed + b.phase) * 60;
      const oy = Math.cos(ts * b.speed * 0.7 + b.phase) * 50;

      const grad = ctx.createRadialGradient(
        b.cx + ox, b.cy + oy, 0,
        b.cx + ox, b.cy + oy, b.r
      );
      const [r, g, bl] = b.color;
      grad.addColorStop(0,   `rgba(${r},${g},${bl},0.22)`);
      grad.addColorStop(0.5, `rgba(${r},${g},${bl},0.08)`);
      grad.addColorStop(1,   `rgba(${r},${g},${bl},0)`);

      ctx.beginPath();
      ctx.arc(b.cx + ox, b.cy + oy, b.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Subtle horizontal scan line
    const scanY = ((ts * 0.02) % H);
    const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
    scanGrad.addColorStop(0,   'rgba(127,168,201,0)');
    scanGrad.addColorStop(0.5, 'rgba(127,168,201,0.015)');
    scanGrad.addColorStop(1,   'rgba(127,168,201,0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 60, W, 120);

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();


// ── Tab switching ──
function switchTab(tab, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  el.classList.add('active');
}


// ── Live clock Buenos Aires ──
function updateClock() {
  const time = new Date().toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const el = document.getElementById('clock');
  if (el) el.textContent = time;
}
updateClock();
setInterval(updateClock, 1000);
