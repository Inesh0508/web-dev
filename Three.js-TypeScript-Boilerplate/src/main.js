// ─── CURSOR ───────────────────────────────────────────────────────────────────
const cur = document.getElementById('cursor'), ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
if (cur && ring) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  });
  (function animRing() {
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();
}

// ─── SCROLL PROGRESS ─────────────────────────────────────────────────────────
const prog = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const p = (scrollY / (document.body.scrollHeight - innerHeight)) * 100;
  prog.style.width = p + '%';
});

// ─── THEME ────────────────────────────────────────────────────────────────────
// FIX: html starts as data-theme="dark", so isDark check is now correct.
// Previously there was NO data-theme on <html>, making isDark always false on first click.
window.toggleTheme = function () {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? 'light' : 'dark';
  document.getElementById('themeIcon').textContent = isDark ? '🌙' : '☀️';
  document.getElementById('theme-label').textContent = isDark ? 'Dark' : 'Light';
  renderGallery();
};

// ─── HERO 3D (Three.js) ───────────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 5;
  const geom = new THREE.IcosahedronGeometry(1.5, 1);
  const mat = new THREE.MeshPhongMaterial({ color: 0x7c6fff, wireframe: true, transparent: true, opacity: 0.35 });
  const mesh = new THREE.Mesh(geom, mat);
  scene.add(mesh);
  const light = new THREE.PointLight(0xffffff, 2, 50); light.position.set(5, 5, 5); scene.add(light);
  scene.add(new THREE.AmbientLight(0x7c6fff, 0.6));

  const dots = [];
  for (let i = 0; i < 120; i++) {
    const g = new THREE.SphereGeometry(0.015, 4, 4);
    const m = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x7c6fff : 0xff6b9d, transparent: true, opacity: Math.random() * 0.6 + 0.2 });
    const d = new THREE.Mesh(g, m);
    d.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6);
    d._vx = (Math.random() - 0.5) * 0.004; d._vy = (Math.random() - 0.5) * 0.004;
    scene.add(d); dots.push(d);
  }

  let mxN = 0, myN = 0;
  document.addEventListener('mousemove', e => { mxN = (e.clientX / innerWidth - 0.5) * 2; myN = -(e.clientY / innerHeight - 0.5) * 2; });
  window.addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

  (function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.003 + myN * 0.002;
    mesh.rotation.y += 0.005 + mxN * 0.002;
    dots.forEach(d => {
      d.position.x += d._vx; d.position.y += d._vy;
      if (Math.abs(d.position.x) > 7) d._vx *= -1;
      if (Math.abs(d.position.y) > 5) d._vy *= -1;
    });
    renderer.render(scene, camera);
  })();
})();

// ─── SHAPE CARDS (Three.js) ──────────────────────────────────────────────────
const currentColors = ['#7c6fff', '#7c6fff', '#7c6fff'];
const shapeRenderers = [];
// Queue for setMat calls that arrive before init completes
const pendingMatChanges = [];

function makeShapeCard(id, type, color) {
  const canvas = document.getElementById('sc' + id);
  if (!canvas) return;
  const wrap = canvas.parentElement;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  function resizeRenderer() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resizeRenderer();
  new ResizeObserver(resizeRenderer).observe(wrap);

  let geom;
  if (type === 'torus') geom = new THREE.TorusKnotGeometry(0.5, 0.15, 120, 16, 2, 3);
  else if (type === 'ico') geom = new THREE.IcosahedronGeometry(0.8, 0);
  else geom = new THREE.SphereGeometry(0.8, 32, 32);

  const col = new THREE.Color(color);
  const mat = new THREE.MeshPhongMaterial({
    color: col,
    emissive: col.clone().multiplyScalar(0.4),
    shininess: 120,
    transparent: true,
    opacity: type === 'ico' ? 0.9 : 1,
    wireframe: type === 'ico'
  });

  const mesh = new THREE.Mesh(geom, mat);
  scene.add(mesh);

  const light = new THREE.PointLight(0xffffff, 2, 20);
  light.position.set(2, 3, 4);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  let hover = false, hx = 0, hy = 0;
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    hx = (e.clientX - r.left) / r.width - 0.5;
    hy = (e.clientY - r.top) / r.height - 0.5;
    hover = true;
  });
  canvas.addEventListener('mouseleave', () => hover = false);

  shapeRenderers.push({ renderer, scene, camera, mesh, mat });

  // Flush any color changes that were queued before this card finished initialising
  pendingMatChanges
    .filter(p => p.index === id)
    .forEach(p => {
      const c = new THREE.Color(p.hexColor);
      mat.color.set(c);
      mat.emissive.set(c.clone().multiplyScalar(0.4));
      mat.needsUpdate = true;
    });
  // Remove flushed entries
  for (let i = pendingMatChanges.length - 1; i >= 0; i--) {
    if (pendingMatChanges[i].index === id) pendingMatChanges.splice(i, 1);
  }

  (function animate() {
    requestAnimationFrame(animate);
    if (hover) {
      mesh.rotation.y += hx * 0.08;
      mesh.rotation.x += hy * 0.08;
    } else {
      mesh.rotation.y += 0.008;
      mesh.rotation.x += 0.004;
    }
    renderer.render(scene, camera);
  })();
}

// FIX: shapes were not visible because ResizeObserver fired before layout was painted.
// Using requestAnimationFrame inside load ensures wrapper dimensions are non-zero.
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    makeShapeCard(0, 'torus', currentColors[0]);
    makeShapeCard(1, 'ico', currentColors[1]);
    makeShapeCard(2, 'sphere', currentColors[2]);
  });
});

window.setMat = function (e, index, hexColor) {
  e.stopPropagation();
  // Update chip UI immediately regardless of whether the card is ready
  currentColors[index] = hexColor;
  const chipContainer = document.getElementById('chips' + index);
  if (chipContainer) chipContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  e.target.classList.add('active');

  const cardData = shapeRenderers[index];
  if (cardData && cardData.mat) {
    // Card is ready — apply immediately
    const c = new THREE.Color(hexColor);
    cardData.mat.color.set(c);
    // Update emissive so wireframe icosahedron visibly changes colour too
    cardData.mat.emissive.set(c.clone().multiplyScalar(0.4));
    cardData.mat.needsUpdate = true;
  } else {
    // Card not initialised yet — queue for when it's ready
    pendingMatChanges.push({ index, hexColor });
  }
};

window.cycleShape = function (index) {
  const cardData = shapeRenderers[index];
  if (cardData && cardData.mesh) {
    cardData.mesh.rotation.y += 0.8;
    cardData.mesh.rotation.x += 0.5;
  }
};

// ─── PARTICLE SYSTEM ─────────────────────────────────────────────────────────
const pcanvas = document.getElementById('pcanvas');
const pctx = pcanvas.getContext('2d');
let particles = [], pColor = '#7c6fff', pGrav = 0.08, pCount = 80, pSpeed = 6;
let particleBgColor = '#0a0a0f';

// FIX: size the canvas to its CSS-rendered dimensions immediately and on resize
function resizeP() {
  const w = pcanvas.offsetWidth, h = pcanvas.offsetHeight;
  if (w > 0 && h > 0) { pcanvas.width = w; pcanvas.height = h; }
}
resizeP();
new ResizeObserver(resizeP).observe(pcanvas);

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

let pMouseX = 0, pMouseY = 0, isDrawing = false;

function spawn(x, y, isContinuous = false) {
  const amountToSpawn = isContinuous ? Math.ceil(pCount / 8) : pCount;
  const rgb = hexToRgb(pColor);
  for (let i = 0; i < amountToSpawn; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.7 + 0.3) * pSpeed;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: isContinuous ? (Math.random() * 0.008 + 0.004) : (Math.random() * 0.012 + 0.008),
      size: Math.random() * 4 + 1,
      r: rgb.r, g: rgb.g, b: rgb.b
    });
  }
}

// Mouse events
pcanvas.addEventListener('mousedown', e => {
  isDrawing = true;
  const r = pcanvas.getBoundingClientRect();
  pMouseX = e.clientX - r.left;
  pMouseY = e.clientY - r.top;
  spawn(pMouseX, pMouseY, false);
});
pcanvas.addEventListener('mousemove', e => {
  const r = pcanvas.getBoundingClientRect();
  pMouseX = e.clientX - r.left;
  pMouseY = e.clientY - r.top;
});
document.addEventListener('mouseup', () => isDrawing = false);

// FIX: touch support so mobile users can also trigger particles
pcanvas.addEventListener('touchstart', e => {
  e.preventDefault();
  isDrawing = true;
  const r = pcanvas.getBoundingClientRect();
  pMouseX = e.touches[0].clientX - r.left;
  pMouseY = e.touches[0].clientY - r.top;
  spawn(pMouseX, pMouseY, false);
}, { passive: false });
pcanvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const r = pcanvas.getBoundingClientRect();
  pMouseX = e.touches[0].clientX - r.left;
  pMouseY = e.touches[0].clientY - r.top;
}, { passive: false });
pcanvas.addEventListener('touchend', () => isDrawing = false);

// Controls
const gravRange = document.getElementById('gravRange');
const countRange = document.getElementById('countRange');
const speedRange = document.getElementById('speedRange');
const bgColorPicker = document.getElementById('bgColorPicker');
const colorContainer = document.getElementById('particleColorContainer');

gravRange.addEventListener('input', e => {
  pGrav = parseFloat(e.target.value) / 100;
  document.getElementById('gravVal').textContent = pGrav.toFixed(2);
});
countRange.addEventListener('input', e => {
  pCount = parseInt(e.target.value);
  document.getElementById('countVal').textContent = pCount;
});
speedRange.addEventListener('input', e => {
  pSpeed = parseInt(e.target.value);
  document.getElementById('speedVal').textContent = pSpeed;
});
if (bgColorPicker) {
  bgColorPicker.addEventListener('input', e => { particleBgColor = e.target.value; });
}
if (colorContainer) {
  colorContainer.addEventListener('click', e => {
    const dot = e.target.closest('.color-dot');
    if (!dot) return;
    colorContainer.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
    dot.classList.add('selected');
    pColor = dot.getAttribute('data-color');
  });
}

window.clearParticles = function () { particles = []; };

let lastFPS = 60, fpsFrames = 0, fpsTime = performance.now();

// FIX: particle explosion is truly infinite — isDrawing flag continuously spawns
// each animation frame while the mouse/touch is held down, never stopping.
function animParticles() {
  requestAnimationFrame(animParticles);

  fpsFrames++;
  const now = performance.now();
  if (now - fpsTime > 500) {
    lastFPS = Math.round(fpsFrames / (now - fpsTime) * 1000);
    fpsFrames = 0; fpsTime = now;
  }
  document.getElementById('fps-stat').textContent = lastFPS;
  document.getElementById('particle-stat').textContent = particles.length;

  if (isDrawing) spawn(pMouseX, pMouseY, true);

  const bgRgb = hexToRgb(particleBgColor);
  pctx.fillStyle = `rgba(${bgRgb.r},${bgRgb.g},${bgRgb.b},0.18)`;
  pctx.fillRect(0, 0, pcanvas.width, pcanvas.height);

  particles = particles.filter(p => {
    p.vy += pGrav; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
    if (p.x < 0 || p.x > pcanvas.width) p.vx *= -0.7;
    if (p.y > pcanvas.height) { p.vy *= -0.6; p.y = pcanvas.height; }
    pctx.beginPath();
    pctx.arc(p.x, p.y, Math.max(0.1, p.size * p.life), 0, Math.PI * 2);
    pctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.life})`;
    pctx.fill();
    return p.life > 0.005;
  });
}
animParticles();

// ─── WAVE CANVAS ─────────────────────────────────────────────────────────────
// FIX: wave canvas now exists in HTML with id="wave-canvas"; previously missing.
(function () {
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight || 350; }
  resize();
  new ResizeObserver(resize).observe(canvas);

  let mouseX = canvas.width / 2, mouseY = canvas.height / 2, t = 0;
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });

  const COLS = 60, ROWS = 30;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.04;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cw = canvas.width, ch = canvas.height;
    const isDark = document.documentElement.dataset.theme !== 'light';
    for (let i = 0; i <= COLS; i++) {
      for (let j = 0; j <= ROWS; j++) {
        const x = i / COLS * cw, y = j / ROWS * ch;
        const dx = x - mouseX, dy = y - mouseY, dist = Math.sqrt(dx * dx + dy * dy);
        const wave = Math.sin(t + dist * 0.025) * 0.5 + Math.sin(t * 0.7 + i * 0.2 + j * 0.3) * 0.5;
        const r = (wave + 1) / 2;
        const sz = 2 + r * 4;
        const h = isDark ? (200 + r * 60 | 0) : (200 + r * 40 | 0);
        const s = isDark ? 70 : 65, l = isDark ? (30 + r * 50 | 0) : (40 + r * 40 | 0);
        ctx.beginPath();
        ctx.arc(x, y, sz * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${h},${s}%,${l}%,${0.5 + r * 0.5})`;
        ctx.fill();
      }
    }
  })();
})();

// ─── GALLERY GENERATIVE ART ──────────────────────────────────────────────────
const galGens = [
  function lissajous(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth, h = canvas.height = canvas.offsetHeight;
    ctx.fillStyle = document.documentElement.dataset.theme === 'light' ? '#f0eeff' : '#0d0d18';
    ctx.fillRect(0, 0, w, h);
    const a = Math.floor(Math.random() * 3 + 1), b = Math.floor(Math.random() * 3 + 1);
    const d = Math.random() * Math.PI;
    const colors = ['#7c6fff', '#ff6b9d', '#00e5c9'];
    for (let ci = 0; ci < 3; ci++) {
      ctx.beginPath(); ctx.strokeStyle = colors[ci]; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7;
      for (let t = 0; t < Math.PI * 2 * 20; t += 0.01) {
        const x = w / 2 + w * 0.42 * Math.sin(a * t + d + ci * 0.4);
        const y = h / 2 + h * 0.42 * Math.sin((b + ci * 0.3) * t);
        t < 0.01 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
  function spiralBloom(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth, h = canvas.height = canvas.offsetHeight;
    ctx.fillStyle = document.documentElement.dataset.theme === 'light' ? '#f5f3ff' : '#0a0a12';
    ctx.fillRect(0, 0, w, h);
    const n = Math.floor(Math.random() * 4 + 5);
    for (let i = 0; i < 1200; i++) {
      const t = i * 0.08, r = t * 2;
      const x = w / 2 + r * Math.cos(t * n), y = h / 2 + r * Math.sin(t * n);
      const hue = 200 + t * 2 % 160;
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue},80%,65%,${1 - r / (w * 0.7)})`; ctx.fill();
    }
  },
  function voronoi(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth, h = canvas.height = canvas.offsetHeight;
    const pts = Array.from({ length: 24 }, () => ({ x: Math.random() * w, y: Math.random() * h, h: Math.random() * 360 }));
    const img = ctx.createImageData(w, h);
    // FIX: replaced per-pixel canvas color parsing (extremely slow) with inline HSL-to-RGB conversion
    function hslToRgb(h, s, l) {
      s /= 100; l /= 100;
      const k = n => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
    }
    const lightness = document.documentElement.dataset.theme === 'light' ? 70 : 25;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let min = Infinity, ci = 0;
        pts.forEach((p, i) => { const d = (x - p.x) ** 2 + (y - p.y) ** 2; if (d < min) { min = d; ci = i; } });
        const idx = (y * w + x) * 4;
        const [r, g, b] = hslToRgb(pts[ci].h, 60, lightness);
        img.data[idx] = r; img.data[idx + 1] = g; img.data[idx + 2] = b; img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  },
  function starfield(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth, h = canvas.height = canvas.offsetHeight;
    ctx.fillStyle = '#04040e'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = Math.random() * 1.5 + 0.2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random()})`; ctx.fill();
    }
    const cols = ['#7c6fff', '#ff6b9d', '#00e5c9', '#ffa94d'];
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = Math.random() * 3 + 2;
      const c = cols[i % cols.length];
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = c; ctx.shadowBlur = 12; ctx.shadowColor = c; ctx.fill(); ctx.shadowBlur = 0;
    }
  }
];

function renderGallery() {
  galGens.forEach((_, i) => { setTimeout(() => galGens[i](document.getElementById('gc' + i)), i * 80); });
}
window.regenGallery = function (i) { galGens[i](document.getElementById('gc' + i)); };
window.addEventListener('load', () => { setTimeout(renderGallery, 200); });
window.addEventListener('resize', () => { renderGallery(); });