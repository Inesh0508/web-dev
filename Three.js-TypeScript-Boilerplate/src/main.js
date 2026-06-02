// ─── CURSOR ───────────────────────────────────────────────────────────────────
const cur=document.getElementById('cursor'),ring=document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
(function animRing(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);})();

// ─── SCROLL PROGRESS ─────────────────────────────────────────────────────────
const prog=document.getElementById('progress');
window.addEventListener('scroll',()=>{const p=(scrollY/(document.body.scrollHeight-innerHeight))*100;prog.style.width=p+'%';});

// ─── THEME ────────────────────────────────────────────────────────────────────
function toggleTheme(){
  const html=document.documentElement;
  const isDark=html.dataset.theme==='dark';
  html.dataset.theme=isDark?'light':'dark';
  document.getElementById('themeIcon').textContent=isDark?'🌙':'☀️';
  document.getElementById('themeLabel').textContent=isDark?'Dark':'Light';
  renderGallery();
}

// ─── HERO 3D (Three.js) ───────────────────────────────────────────────────────
(function(){
  const canvas=document.getElementById('hero-canvas');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth,innerHeight);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,100);
  camera.position.z=5;
  const geom=new THREE.IcosahedronGeometry(1.5,1);
  const mat=new THREE.MeshPhongMaterial({color:0x7c6fff,wireframe:true,transparent:true,opacity:0.35});
  const mesh=new THREE.Mesh(geom,mat);
  scene.add(mesh);
  const light=new THREE.PointLight(0xffffff,2,50);light.position.set(5,5,5);scene.add(light);
  scene.add(new THREE.AmbientLight(0x7c6fff,0.6));

  // Floating dots
  const dots=[];
  for(let i=0;i<120;i++){
    const g=new THREE.SphereGeometry(0.015,4,4);
    const m=new THREE.MeshBasicMaterial({color:Math.random()>0.5?0x7c6fff:0xff6b9d,transparent:true,opacity:Math.random()*0.6+0.2});
    const d=new THREE.Mesh(g,m);
    d.position.set((Math.random()-0.5)*14,(Math.random()-0.5)*10,(Math.random()-0.5)*6);
    d._vx=(Math.random()-0.5)*0.004;d._vy=(Math.random()-0.5)*0.004;
    scene.add(d);dots.push(d);
  }
  let mxN=0,myN=0;
  document.addEventListener('mousemove',e=>{mxN=(e.clientX/innerWidth-0.5)*2;myN=-(e.clientY/innerHeight-0.5)*2;});
  window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
  let t=0;
  (function animate(){requestAnimationFrame(animate);t+=0.005;
    mesh.rotation.x+=0.003+myN*0.002;mesh.rotation.y+=0.005+mxN*0.002;
    dots.forEach(d=>{d.position.x+=d._vx;d.position.y+=d._vy;if(Math.abs(d.position.x)>7)d._vx*=-1;if(Math.abs(d.position.y)>5)d._vy*=-1;});
    renderer.render(scene,camera);})();
})();

// ─── SHAPE CARDS (Three.js) ──────────────────────────────────────────────────
const shapeRenderers = [];
function makeShapeCard(id, type, color) {
  const canvas = document.getElementById('sc' + id);
  const wrap = canvas.parentElement;

  // 💡 FIX 1: Force the layout container to have height before rendering
  // The grid cards need explicitly defined layout space or flex/grid parameters.
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  // 💡 FIX 2: Read actual computed offset widths to avoid a 0px canvas height collapse
  const width = wrap.offsetWidth || 260;
  const height = wrap.offsetHeight || 180;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(width, height, false); // "false" prevents canvas element layout stretching overrides

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.z = 3;

  let geom;
  if (type === 'torus') geom = new THREE.TorusKnotGeometry(0.5, 0.15, 120, 16, 2, 3); // Slightly scaled down to fit nicely
  else if (type === 'ico') geom = new THREE.IcosahedronGeometry(0.8, 0);
  else geom = new THREE.SphereGeometry(0.8, 32, 32);

  const mat = new THREE.MeshPhongMaterial({
    color: parseInt(color.replace('#', '0x')),
    shininess: 120,
    transparent: true,
    opacity: type === 'ico' ? 0.9 : 1,
    wireframe: type === 'ico'
  });

  const mesh = new THREE.Mesh(geom, mat);
  scene.add(mesh);

  // 💡 FIX 3: Reposition light so it faces the shapes directly from an angle
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

  shapeRenderers.push({ renderer, scene, camera, mesh, mat, hover: () => hover, hx: () => hx, hy: () => hy });

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

// Re-trigger the generation functions once the DOM is fully laid out by the browser engine
window.addEventListener('DOMContentLoaded', () => {
  makeShapeCard(0, 'torus', '#7c6fff');
  makeShapeCard(1, 'ico', '#7c6fff');
  makeShapeCard(2, 'sphere', '#7c6fff');
});

// ─── PARTICLE SYSTEM ─────────────────────────────────────────────────────────
const pcanvas = document.getElementById('pcanvas');
const pctx = pcanvas.getContext('2d');
let particles = [], pColor = '#7c6fff', pGrav = 0.08, pCount = 80, pSpeed = 6;
let particleBgColor = '#0a0a0f'; 

function resizeP() { pcanvas.width = pcanvas.offsetWidth; pcanvas.height = pcanvas.offsetHeight; }
resizeP(); new ResizeObserver(resizeP).observe(pcanvas);

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

let pMouseX = 0, pMouseY = 0, isDrawing = false;

// 💡 INFINTIE FLOW INJECTION: Handles bursts vs steady generation streams cleanly
function spawn(x, y, isContinuous = false) {
  // If holding mouse down, add a steady frame-by-frame stream. If a quick click, spawn full pCount burst.
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
      // Continuous generation particles decay slightly slower for a fuller cloud look
      decay: isContinuous ? (Math.random() * 0.008 + 0.004) : (Math.random() * 0.012 + 0.008),
      size: Math.random() * 4 + 1,
      r: rgb.r, g: rgb.g, b: rgb.b
    });
  }
}

// Track mouse positioning states cleanly
pcanvas.addEventListener('mousedown', e => {
  isDrawing = true;
  const r = pcanvas.getBoundingClientRect();
  pMouseX = e.clientX - r.left;
  pMouseY = e.clientY - r.top;
  spawn(pMouseX, pMouseY, false); // Single primary burst on direct down-click
});

pcanvas.addEventListener('mousemove', e => {
  const r = pcanvas.getBoundingClientRect();
  pMouseX = e.clientX - r.left;
  pMouseY = e.clientY - r.top;
});

document.addEventListener('mouseup', () => isDrawing = false);

// ─── MODULE LEVEL EVENT LISTENERS (FIXES COLOR SELECTION) ───────────────────
const gravRange = document.getElementById('gravRange');
const countRange = document.getElementById('countRange');
const speedRange = document.getElementById('speedRange');
const bgColorPicker = document.getElementById('bgColorPicker');
const colorContainer = document.getElementById('particleColorContainer');

gravRange.addEventListener('input', (e) => {
  pGrav = parseFloat(e.target.value) / 100;
  document.getElementById('gravVal').textContent = pGrav.toFixed(2);
});

countRange.addEventListener('input', (e) => {
  pCount = parseInt(e.target.value);
  document.getElementById('countVal').textContent = pCount;
});

speedRange.addEventListener('input', (e) => {
  pSpeed = parseInt(e.target.value);
  document.getElementById('speedVal').textContent = pSpeed;
});

if (bgColorPicker) {
  bgColorPicker.addEventListener('input', (e) => {
    particleBgColor = e.target.value;
  });
}

// 💡 FIXED: Capture dot clicks completely inside the local module scope bounds
if (colorContainer) {
  colorContainer.addEventListener('click', (e) => {
    const clickedDot = e.target.closest('.color-dot');
    if (!clickedDot) return;
    
    // Manage visual active indicator borders
    colorContainer.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
    clickedDot.classList.add('selected');
    
    // Safely shift the interior calculation variable state
    pColor = clickedDot.getAttribute('data-color');
  });
}

// Expose clear function globally just in case your HTML calls it directly
window.clearParticles = function() { particles = []; };

let lastFPS = 60, fpsFrames = 0, fpsTime = performance.now();

function animParticles() {
  requestAnimationFrame(animParticles);
  fpsFrames++; const now = performance.now();
  if (now - fpsTime > 500) { lastFPS = Math.round(fpsFrames / (now - fpsTime) * 1000); fpsFrames = 0; fpsTime = now; }
  document.getElementById('fps-stat').textContent = lastFPS;
  document.getElementById('particle-stat').textContent = particles.length;

  // 💡 FORCES TRULY INFINITE GENERATION
  // Re-injects fresh particles every animation frame loop iteration while drawing flag is true
  if (isDrawing) {
    spawn(pMouseX, pMouseY, true);
  }

  const bgRgb = hexToRgb(particleBgColor);
  pctx.fillStyle = `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 0.18)`;
  pctx.fillRect(0, 0, pcanvas.width, pcanvas.height);

  particles = particles.filter(p => {
    p.vy += pGrav; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
    if (p.x < 0 || p.x > pcanvas.width) p.vx *= -0.7;
    if (p.y > pcanvas.height) { p.vy *= -0.6; p.y = pcanvas.height; }
    
    pctx.beginPath();
    pctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    pctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.life})`;
    pctx.fill();
    
    return p.life > 0.005; // Drop threshold lower to extend general tracking lifetime
  });
}
animParticles();

// ─── WAVE CANVAS ─────────────────────────────────────────────────────────────
(function(){
  const canvas=document.getElementById('wave-canvas');
  const ctx=canvas.getContext('2d');
  function resize(){canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;}
  resize();new ResizeObserver(resize).observe(canvas);
  let mouseX=canvas.width/2,mouseY=canvas.height/2,t=0;
  canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mouseX=e.clientX-r.left;mouseY=e.clientY-r.top;});
  const COLS=60,ROWS=30;
  (function animate(){
    requestAnimationFrame(animate);t+=0.04;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const cw=canvas.width,ch=canvas.height;
    const isDark=document.documentElement.dataset.theme==='dark';
    for(let i=0;i<=COLS;i++){
      for(let j=0;j<=ROWS;j++){
        const x=i/COLS*cw,y=j/ROWS*ch;
        const dx=x-mouseX,dy=y-mouseY,dist=Math.sqrt(dx*dx+dy*dy);
        const wave=Math.sin(t+dist*0.025)*0.5+Math.sin(t*0.7+i*0.2+j*0.3)*0.5;
        const r=(wave+1)/2;
        const sz=2+r*4;
        const h=isDark?(200+r*60|0):(200+r*40|0);
        const s=isDark?70:65,l=isDark?(30+r*50|0):(40+r*40|0);
        ctx.beginPath();
        ctx.arc(x,y,sz*0.5,0,Math.PI*2);
        ctx.fillStyle=`hsla(${h},${s}%,${l}%,${0.5+r*0.5})`;
        ctx.fill();
      }
    }
  })();
})();

// ─── GALLERY GENERATIVE ART ──────────────────────────────────────────────────
const galGens=[
  function lissajous(canvas){
    const ctx=canvas.getContext('2d');
    const w=canvas.width=canvas.offsetWidth,h=canvas.height=canvas.offsetHeight;
    ctx.fillStyle=document.documentElement.dataset.theme==='dark'?'#0d0d18':'#f0eeff';
    ctx.fillRect(0,0,w,h);
    const a=Math.floor(Math.random()*3+1),b=Math.floor(Math.random()*3+1);
    const d=Math.random()*Math.PI;
    const colors=['#7c6fff','#ff6b9d','#00e5c9'];
    for(let ci=0;ci<3;ci++){
      ctx.beginPath();ctx.strokeStyle=colors[ci];ctx.lineWidth=1.5;ctx.globalAlpha=0.7;
      for(let t=0;t<Math.PI*2*20;t+=0.01){
        const x=w/2+w*0.42*Math.sin(a*t+d+ci*0.4);
        const y=h/2+h*0.42*Math.sin((b+ci*0.3)*t);
        t<0.01?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }ctx.stroke();
    }ctx.globalAlpha=1;
  },
  function spiralBloom(canvas){
    const ctx=canvas.getContext('2d');
    const w=canvas.width=canvas.offsetWidth,h=canvas.height=canvas.offsetHeight;
    ctx.fillStyle=document.documentElement.dataset.theme==='dark'?'#0a0a12':'#f5f3ff';
    ctx.fillRect(0,0,w,h);
    const n=Math.floor(Math.random()*4+5);
    for(let i=0;i<1200;i++){
      const t=i*0.08;const r=t*2;
      const x=w/2+r*Math.cos(t*n);const y=h/2+r*Math.sin(t*n);
      const hue=200+t*2%160;
      ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);
      ctx.fillStyle=`hsla(${hue},80%,65%,${1-r/(w*0.7)})`;
      ctx.fill();
    }
  },
  function voronoi(canvas){
    const ctx=canvas.getContext('2d');
    const w=canvas.width=canvas.offsetWidth,h=canvas.height=canvas.offsetHeight;
    const pts=Array.from({length:24},()=>({x:Math.random()*w,y:Math.random()*h,h:Math.random()*360}));
    const img=ctx.createImageData(w,h);
    for(let y=0;y<h;y++){for(let x=0;x<w;x++){
      let min=Infinity,ci=0;
      pts.forEach((p,i)=>{const d=(x-p.x)**2+(y-p.y)**2;if(d<min){min=d;ci=i;}});
      const idx=(y*w+x)*4;
      const hsl=`hsl(${pts[ci].h},60%,${document.documentElement.dataset.theme==='dark'?'25':'70'}%)`;
      const tmp=document.createElement('canvas').getContext('2d');
      tmp.fillStyle=hsl;tmp.fillRect(0,0,1,1);
      const d=tmp.getImageData(0,0,1,1).data;
      img.data[idx]=d[0];img.data[idx+1]=d[1];img.data[idx+2]=d[2];img.data[idx+3]=255;
    }}ctx.putImageData(img,0,0);
  },
  function starfield(canvas){
    const ctx=canvas.getContext('2d');
    const w=canvas.width=canvas.offsetWidth,h=canvas.height=canvas.offsetHeight;
    ctx.fillStyle='#04040e';ctx.fillRect(0,0,w,h);
    for(let i=0;i<300;i++){
      const x=Math.random()*w,y=Math.random()*h,r=Math.random()*1.5+0.2;
      const a=Math.random();
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.fill();
    }
    for(let i=0;i<8;i++){
      const x=Math.random()*w,y=Math.random()*h,r=Math.random()*3+2;
      const colors=['#7c6fff','#ff6b9d','#00e5c9','#ffa94d'];
      const c=colors[i%colors.length];
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=c;ctx.shadowBlur=12;ctx.shadowColor=c;ctx.fill();ctx.shadowBlur=0;
    }
  }
];
function renderGallery(){galGens.forEach((_,i)=>{setTimeout(()=>galGens[i](document.getElementById('gc'+i)),i*80);});}
function regenGallery(i){galGens[i](document.getElementById('gc'+i));}
window.addEventListener('load',()=>{setTimeout(renderGallery,200);});
window.addEventListener('resize',()=>{renderGallery();});
