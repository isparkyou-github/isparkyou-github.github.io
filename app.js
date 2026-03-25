/* ====================================================================
   app.js  —  Power Grid Personal Page Interactive Engine
   ==================================================================== */

'use strict';

/* ─────────────────────────────────────────────
   1. PARTICLE BACKGROUND CANVAS
   ───────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], nodes = [];
  const PARTICLE_COUNT = 60;
  const NODE_COUNT = 18;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.7 ? '#f0c040' : '#3b8bff';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class Node {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = (Math.random() - 0.5) * 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    nodes = Array.from({ length: NODE_COUNT }, () => new Node());
  }

  function drawGrid() {
    // Draw faint grid
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = '#3b8bff';
    ctx.lineWidth = 1;
    const gap = 80;
    for (let x = 0; x < W; x += gap) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gap) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 200) * 0.12;
          ctx.strokeStyle = '#3b8bff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    nodes.forEach(n => n.update());
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  animate();
})();


/* ─────────────────────────────────────────────
   2. NAVBAR SCROLL EFFECT
   ───────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile toggle
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = links.style.display === 'flex';
      links.style.cssText = isOpen
        ? ''
        : 'display:flex;flex-direction:column;position:absolute;top:70px;left:0;right:0;background:rgba(5,13,26,0.98);padding:1.5rem;gap:1.5rem;border-bottom:1px solid rgba(60,139,255,0.2)';
    });
  }

  // Close mobile menu on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (links.style.display === 'flex') links.style.cssText = '';
    });
  });
})();


/* ─────────────────────────────────────────────
   3. HERO POWER GRID SCENE (SVG towers + animated wires)
   ───────────────────────────────────────────── */
(function initHeroScene() {
  const container = document.getElementById('towerContainer');
  const svg = document.getElementById('powerLineSvg');
  const scene = document.getElementById('gridScene');

  const towerData = [
    { x: 0.04, scale: 0.65, label: '2012', variant: 'small' },
    { x: 0.16, scale: 0.75, label: '2014', variant: 'medium' },
    { x: 0.28, scale: 0.85, label: '2016', variant: 'medium' },
    { x: 0.38, scale: 1.0,  label: '2018', variant: 'large' },
    /* -- Gap for Scroll Hint at 0.5 -- */
    { x: 0.62, scale: 1.1,  label: '2020', variant: 'large' },
    { x: 0.72, scale: 1.05, label: '2022', variant: 'medium' },
    { x: 0.84, scale: 0.9,  label: '2023', variant: 'medium' },
    { x: 0.94, scale: 0.75, label: '2025', variant: 'small' },
  ];

  /* Insulator positions in each variant's SVG coordinate system
     Used to compute exact wire attach points after CSS scaleY transform */
  const variantGeo = {
    small:  { w: 40, h: 100, tl: { x: 6, y: 28 },  tr: { x: 34, y: 28 },  ml: { x: 10, y: 48 }, mr: { x: 30, y: 48 } },
    medium: { w: 52, h: 120, tl: { x: 2, y: 30 },  tr: { x: 50, y: 30 },  ml: { x: 7, y: 52 },  mr: { x: 45, y: 52 } },
    large:  { w: 70, h: 160, tl: { x: 0, y: 36 },  tr: { x: 70, y: 36 },  ml: { x: 6, y: 62 },  mr: { x: 64, y: 62 } },
  };

  /* Energy infrastructure elements placed between towers */
  const infraData = [
    { x: 0.10, type: 'solar',      scale: 0.7 },
    { x: 0.22, type: 'wind',       scale: 0.85 },
    { x: 0.33, type: 'factory',    scale: 0.65 },
    { x: 0.46, type: 'substation', scale: 0.8 },
    { x: 0.54, type: 'powerplant', scale: 0.75 },
    { x: 0.67, type: 'wind',       scale: 0.65 },
    { x: 0.78, type: 'factory',    scale: 0.55 },
    { x: 0.89, type: 'solar',      scale: 0.6 },
  ];

  function buildTowerSVG(variant, color) {
    const c = color || '#60a0e0';
    if (variant === 'small') {
      return `<svg viewBox="0 0 40 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="100">
        <line x1="20" y1="2" x2="20" y2="100" stroke="${c}" stroke-width="2"/>
        <line x1="6" y1="28" x2="34" y2="28" stroke="${c}" stroke-width="2"/>
        <line x1="10" y1="48" x2="30" y2="48" stroke="${c}" stroke-width="2"/>
        <line x1="6" y1="28" x2="20" y2="8" stroke="${c}" stroke-width="1.5"/>
        <line x1="34" y1="28" x2="20" y2="8" stroke="${c}" stroke-width="1.5"/>
        <line x1="10" y1="48" x2="6" y2="28" stroke="${c}" stroke-width="1.5"/>
        <line x1="30" y1="48" x2="34" y2="28" stroke="${c}" stroke-width="1.5"/>
        <line x1="4" y1="68" x2="36" y2="68" stroke="${c}" stroke-width="2"/>
        <line x1="4" y1="68" x2="10" y2="48" stroke="${c}" stroke-width="1.5"/>
        <line x1="36" y1="68" x2="30" y2="48" stroke="${c}" stroke-width="1.5"/>
        <line x1="4" y1="68" x2="0" y2="100" stroke="${c}" stroke-width="2"/>
        <line x1="36" y1="68" x2="40" y2="100" stroke="${c}" stroke-width="2"/>
        <circle cx="6" cy="28" r="2.5" fill="${c}"/>
        <circle cx="34" cy="28" r="2.5" fill="${c}"/>
        <circle cx="10" cy="48" r="2" fill="${c}"/>
        <circle cx="30" cy="48" r="2" fill="${c}"/>
      </svg>`;
    } else if (variant === 'medium') {
      return `<svg viewBox="0 0 52 120" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="120">
        <line x1="26" y1="2" x2="26" y2="120" stroke="${c}" stroke-width="2.5"/>
        <line x1="2" y1="30" x2="50" y2="30" stroke="${c}" stroke-width="2.5"/>
        <line x1="7" y1="52" x2="45" y2="52" stroke="${c}" stroke-width="2"/>
        <line x1="12" y1="72" x2="40" y2="72" stroke="${c}" stroke-width="1.8"/>
        <line x1="2" y1="30" x2="26" y2="8" stroke="${c}" stroke-width="2"/>
        <line x1="50" y1="30" x2="26" y2="8" stroke="${c}" stroke-width="2"/>
        <line x1="7" y1="52" x2="2" y2="30" stroke="${c}" stroke-width="1.8"/>
        <line x1="45" y1="52" x2="50" y2="30" stroke="${c}" stroke-width="1.8"/>
        <line x1="12" y1="72" x2="7" y2="52" stroke="${c}" stroke-width="1.5"/>
        <line x1="40" y1="72" x2="45" y2="52" stroke="${c}" stroke-width="1.5"/>
        <line x1="4" y1="94" x2="48" y2="94" stroke="${c}" stroke-width="2.2"/>
        <line x1="4" y1="94" x2="12" y2="72" stroke="${c}" stroke-width="1.8"/>
        <line x1="48" y1="94" x2="40" y2="72" stroke="${c}" stroke-width="1.8"/>
        <line x1="4" y1="94" x2="0" y2="120" stroke="${c}" stroke-width="2.5"/>
        <line x1="48" y1="94" x2="52" y2="120" stroke="${c}" stroke-width="2.5"/>
        <circle cx="2" cy="30" r="3" fill="${c}"/>
        <circle cx="50" cy="30" r="3" fill="${c}"/>
        <circle cx="7" cy="52" r="2.5" fill="${c}"/>
        <circle cx="45" cy="52" r="2.5" fill="${c}"/>
        <circle cx="12" cy="72" r="2" fill="${c}"/>
        <circle cx="40" cy="72" r="2" fill="${c}"/>
      </svg>`;
    } else {
      return `<svg viewBox="0 0 70 160" fill="none" xmlns="http://www.w3.org/2000/svg" width="70" height="160">
        <line x1="35" y1="2" x2="35" y2="160" stroke="${c}" stroke-width="3"/>
        <line x1="0" y1="36" x2="70" y2="36" stroke="${c}" stroke-width="3"/>
        <line x1="6" y1="62" x2="64" y2="62" stroke="${c}" stroke-width="2.5"/>
        <line x1="12" y1="86" x2="58" y2="86" stroke="${c}" stroke-width="2.2"/>
        <line x1="0" y1="36" x2="35" y2="8" stroke="${c}" stroke-width="2.5"/>
        <line x1="70" y1="36" x2="35" y2="8" stroke="${c}" stroke-width="2.5"/>
        <line x1="6" y1="62" x2="0" y2="36" stroke="${c}" stroke-width="2.2"/>
        <line x1="64" y1="62" x2="70" y2="36" stroke="${c}" stroke-width="2.2"/>
        <line x1="12" y1="86" x2="6" y2="62" stroke="${c}" stroke-width="2"/>
        <line x1="58" y1="86" x2="64" y2="62" stroke="${c}" stroke-width="2"/>
        <line x1="5" y1="112" x2="65" y2="112" stroke="${c}" stroke-width="2.5"/>
        <line x1="5" y1="112" x2="12" y2="86" stroke="${c}" stroke-width="2.2"/>
        <line x1="65" y1="112" x2="58" y2="86" stroke="${c}" stroke-width="2.2"/>
        <line x1="5" y1="112" x2="0" y2="160" stroke="${c}" stroke-width="3"/>
        <line x1="65" y1="112" x2="70" y2="160" stroke="${c}" stroke-width="3"/>
        <circle cx="0" cy="36" r="4" fill="${c}"/>
        <circle cx="70" cy="36" r="4" fill="${c}"/>
        <circle cx="6" cy="62" r="3.5" fill="${c}"/>
        <circle cx="64" cy="62" r="3.5" fill="${c}"/>
        <circle cx="12" cy="86" r="3" fill="${c}"/>
        <circle cx="58" cy="86" r="3" fill="${c}"/>
        <circle cx="5" cy="112" r="3" fill="${c}"/>
        <circle cx="65" cy="112" r="3" fill="${c}"/>
      </svg>`;
    }
  }

  /* ── Infrastructure SVG builders ── */
  function buildInfraSVG(type) {
    const c = '#4a7ab5';
    const cg = '#3a9a5a'; // green accent for solar/wind
    switch (type) {

      case 'solar': // Solar panel array
        return `<svg viewBox="0 0 70 45" width="70" height="45" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Stand -->
          <line x1="20" y1="30" x2="20" y2="45" stroke="${c}" stroke-width="1.5"/>
          <line x1="50" y1="30" x2="50" y2="45" stroke="${c}" stroke-width="1.5"/>
          <!-- Panel 1 (tilted) -->
          <polygon points="2,18 30,10 30,28 2,36" stroke="${c}" stroke-width="1.2" fill="rgba(59,139,255,0.08)"/>
          <line x1="10" y1="15" x2="10" y2="33" stroke="${c}" stroke-width="0.6" opacity="0.5"/>
          <line x1="18" y1="13" x2="18" y2="31" stroke="${c}" stroke-width="0.6" opacity="0.5"/>
          <line x1="4" y1="27" x2="28" y2="19" stroke="${c}" stroke-width="0.6" opacity="0.5"/>
          <!-- Panel 2 -->
          <polygon points="35,15 68,6 68,24 35,33" stroke="${c}" stroke-width="1.2" fill="rgba(59,139,255,0.08)"/>
          <line x1="45" y1="12" x2="45" y2="30" stroke="${c}" stroke-width="0.6" opacity="0.5"/>
          <line x1="55" y1="9" x2="55" y2="27" stroke="${c}" stroke-width="0.6" opacity="0.5"/>
          <line x1="38" y1="24" x2="65" y2="15" stroke="${c}" stroke-width="0.6" opacity="0.5"/>
          <!-- Sun reflection -->
          <circle cx="60" cy="3" r="1.5" fill="#f0c040" opacity="0.6"/>
        </svg>`;

      case 'wind': // Wind turbine
        return `<svg viewBox="0 0 40 90" width="40" height="90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Mast -->
          <line x1="20" y1="12" x2="20" y2="90" stroke="${c}" stroke-width="2"/>
          <!-- Base -->
          <line x1="12" y1="90" x2="28" y2="90" stroke="${c}" stroke-width="2"/>
          <!-- Nacelle -->
          <rect x="17" y="10" width="8" height="5" rx="1" stroke="${c}" stroke-width="1.2" fill="rgba(59,139,255,0.1)"/>
          <!-- Hub -->
          <circle cx="20" cy="12" r="2.5" fill="${c}"/>
          <!-- Blade 1 (up) -->
          <path d="M20 12 L18 0 Q20 -2 22 0 Z" fill="${c}" opacity="0.7"/>
          <!-- Blade 2 (lower right) -->
          <path d="M20 12 L30 20 Q32 18 28 16 Z" fill="${c}" opacity="0.5"/>
          <!-- Blade 3 (lower left) -->
          <path d="M20 12 L10 20 Q8 18 12 16 Z" fill="${c}" opacity="0.5"/>
        </svg>`;

      case 'substation': // Substation / transformer yard
        return `<svg viewBox="0 0 60 45" width="60" height="45" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Fence / boundary -->
          <rect x="2" y="12" width="56" height="33" rx="2" stroke="${c}" stroke-width="1.2" fill="rgba(59,139,255,0.05)"/>
          <!-- Transformer 1 -->
          <rect x="8" y="20" width="14" height="20" rx="1" stroke="${c}" stroke-width="1.2" fill="rgba(59,139,255,0.1)"/>
          <!-- Coil symbol -->
          <path d="M12 25 Q15 23 15 27 Q15 31 12 29" stroke="${c}" stroke-width="1" fill="none"/>
          <path d="M18 25 Q15 23 15 27 Q15 31 18 29" stroke="${c}" stroke-width="1" fill="none"/>
          <!-- Transformer 2 -->
          <rect x="28" y="22" width="12" height="18" rx="1" stroke="${c}" stroke-width="1.2" fill="rgba(59,139,255,0.1)"/>
          <!-- Busbar -->
          <line x1="5" y1="12" x2="5" y2="5" stroke="${c}" stroke-width="1.5"/>
          <line x1="55" y1="12" x2="55" y2="5" stroke="${c}" stroke-width="1.5"/>
          <line x1="5" y1="5" x2="55" y2="5" stroke="${c}" stroke-width="1.8"/>
          <!-- Insulator dots -->
          <circle cx="5" cy="5" r="2" fill="${c}"/>
          <circle cx="30" cy="5" r="2" fill="${c}"/>
          <circle cx="55" cy="5" r="2" fill="${c}"/>
          <!-- Lightning rod -->
          <line x1="30" y1="5" x2="30" y2="0" stroke="#f0c040" stroke-width="1"/>
          <circle cx="30" cy="0" r="1" fill="#f0c040" opacity="0.8"/>
        </svg>`;

      case 'factory': // Industrial factory
        return `<svg viewBox="0 0 65 50" width="65" height="50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Main building -->
          <rect x="5" y="18" width="40" height="32" stroke="${c}" stroke-width="1.2" fill="rgba(59,139,255,0.06)"/>
          <!-- Roof / saw-tooth -->
          <polygon points="5,18 15,8 25,18 35,8 45,18" stroke="${c}" stroke-width="1.2" fill="rgba(59,139,255,0.04)"/>
          <!-- Windows -->
          <rect x="10" y="28" width="6" height="6" stroke="${c}" stroke-width="0.8" fill="rgba(240,192,64,0.15)"/>
          <rect x="20" y="28" width="6" height="6" stroke="${c}" stroke-width="0.8" fill="rgba(240,192,64,0.15)"/>
          <rect x="30" y="28" width="6" height="6" stroke="${c}" stroke-width="0.8" fill="rgba(240,192,64,0.15)"/>
          <!-- Chimney -->
          <rect x="48" y="5" width="8" height="45" stroke="${c}" stroke-width="1.2" fill="rgba(59,139,255,0.08)"/>
          <!-- Smoke -->
          <path d="M52 5 Q50 0 54 -2 Q56 -4 52 -5" stroke="${c}" stroke-width="0.8" opacity="0.4" fill="none"/>
          <!-- Door -->
          <rect x="15" y="38" width="8" height="12" rx="1" stroke="${c}" stroke-width="0.8" fill="rgba(59,139,255,0.1)"/>
        </svg>`;

      case 'powerplant': // Cooling tower / power plant
        return `<svg viewBox="0 0 55 55" width="55" height="55" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Cooling tower 1 (hyperbolic shape) -->
          <path d="M5 55 Q5 30, 12 25 Q15 23, 15 20 L15 8 Q12 6 10 8 L10 3 Q15 0 20 0 Q25 0 25 3 L25 8 Q23 6 20 8 L20 20 Q20 23, 23 25 Q30 30, 30 55 Z" stroke="${c}" stroke-width="1.2" fill="rgba(59,139,255,0.06)"/>
          <!-- Cooling tower 2 (smaller, behind) -->
          <path d="M28 55 Q28 35, 34 30 Q36 28, 36 25 L36 15 Q40 12 44 15 L44 25 Q44 28, 46 30 Q52 35, 52 55 Z" stroke="${c}" stroke-width="1" fill="rgba(59,139,255,0.04)" opacity="0.7"/>
          <!-- Steam from tower 1 -->
          <path d="M17 0 Q14 -5, 18 -7 Q22 -9, 19 -12" stroke="rgba(143,173,214,0.4)" stroke-width="1" fill="none"/>
          <!-- Steam from tower 2 -->
          <path d="M40 12 Q37 8, 41 6 Q44 3, 40 1" stroke="rgba(143,173,214,0.3)" stroke-width="0.8" fill="none"/>
          <!-- Base pipe -->
          <line x1="0" y1="55" x2="55" y2="55" stroke="${c}" stroke-width="1.5"/>
        </svg>`;

      default: return '';
    }
  }

  /* ── Precise wire attachment point calculation ──
     Converts SVG-space insulator coordinates to scene-space,
     accounting for CSS scaleY transform with bottom-center origin.
     scene_x = centerX - svgWidth/2 + insulator_x
     scene_y = sceneH  - (svgHeight - insulator_y) * cssScale */
  function getWireAttachPoints(towerIndex, sceneW, sceneH) {
    const td = towerData[towerIndex];
    const geo = variantGeo[td.variant];
    const centerX = td.x * sceneW;

    return {
      left:  { x: centerX - geo.w / 2 + geo.tl.x, y: sceneH - (geo.h - geo.tl.y) * td.scale },
      right: { x: centerX - geo.w / 2 + geo.tr.x, y: sceneH - (geo.h - geo.tr.y) * td.scale },
      midL:  { x: centerX - geo.w / 2 + geo.ml.x, y: sceneH - (geo.h - geo.ml.y) * td.scale },
      midR:  { x: centerX - geo.w / 2 + geo.mr.x, y: sceneH - (geo.h - geo.mr.y) * td.scale },
    };
  }

  function buildHeroScene() {
    container.innerHTML = '';
    svg.innerHTML = '';
    const sceneW = scene.offsetWidth;
    const sceneH = scene.offsetHeight;

    /* ── Place infrastructure elements (behind towers, z-index lower) ── */
    infraData.forEach(inf => {
      const wrapper = document.createElement('div');
      wrapper.className = 'infra-el';
      wrapper.style.cssText = `position:absolute;bottom:0;left:${inf.x * sceneW}px;transform:translateX(-50%) scale(${inf.scale});transform-origin:bottom center;opacity:0.55;pointer-events:none;`;
      wrapper.innerHTML = buildInfraSVG(inf.type);
      container.appendChild(wrapper);
    });

    /* ── Place towers ── */
    towerData.forEach((td) => {
      const isLarge = td.scale >= 1.0;
      const color = isLarge ? '#5ba3ff' : '#4a88cc';
      const wrapper = document.createElement('div');
      wrapper.className = 'tower-el';
      wrapper.style.left = (td.x * sceneW) + 'px';
      wrapper.style.transform = `translateX(-50%) scaleY(${td.scale})`;
      wrapper.style.transformOrigin = 'bottom center';
      wrapper.innerHTML = buildTowerSVG(td.variant, color);
      container.appendChild(wrapper);
    });

    /* ── SVG overlay for wires ── */
    svg.setAttribute('width', sceneW);
    svg.setAttribute('height', sceneH);
    svg.setAttribute('viewBox', `0 0 ${sceneW} ${sceneH}`);

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="wireGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <linearGradient id="wireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1a3a6a" stop-opacity="0.8"/>
        <stop offset="50%" stop-color="#2a5faa" stop-opacity="1"/>
        <stop offset="100%" stop-color="#1a3a6a" stop-opacity="0.8"/>
      </linearGradient>
    `;
    svg.appendChild(defs);

    /* ── Draw catenary wires connecting tower insulators ── */
    for (let i = 0; i < towerData.length - 1; i++) {
      const p1 = getWireAttachPoints(i, sceneW, sceneH);
      const p2 = getWireAttachPoints(i + 1, sceneW, sceneH);

      // Top crossarm wires (left-to-left and right-to-right)
      drawCatenary(svg, p1.left, p2.left, 16, 'url(#wireGrad)', 1.6, true);
      drawCatenary(svg, p1.right, p2.right, 16, 'url(#wireGrad)', 1.6, true);
      // Mid crossarm wires
      drawCatenary(svg, p1.midL, p2.midL, 10, '#1e4880', 1.0, false);
      drawCatenary(svg, p1.midR, p2.midR, 10, '#1e4880', 1.0, false);
    }

    /* ── Animated spark ── */
    animateSparks(sceneW, sceneH);
  }

  function drawCatenary(svgEl, p1, p2, sag, stroke, width, glow) {
    const mx = (p1.x + p2.x) / 2;
    const my = Math.max(p1.y, p2.y) + sag;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${p1.x},${p1.y} Q ${mx},${my} ${p2.x},${p2.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', stroke);
    path.setAttribute('stroke-width', width);
    if (glow) path.setAttribute('filter', 'url(#wireGlow)');
    path.setAttribute('stroke-linecap', 'round');
    svgEl.appendChild(path);
  }

  function animateSparks(sceneW, sceneH) {
    if (towerData.length < 2) return;

    function createSpark() {
      const i = Math.floor(Math.random() * (towerData.length - 1));
      const p1 = getWireAttachPoints(i, sceneW, sceneH);
      const p2 = getWireAttachPoints(i + 1, sceneW, sceneH);

      // Pick a random wire (left or right)
      const useLeft = Math.random() > 0.5;
      const a = useLeft ? p1.left : p1.right;
      const b = useLeft ? p2.left : p2.right;
      const mx = (a.x + b.x) / 2;
      const my = Math.max(a.y, b.y) + 16;

      const spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      spark.setAttribute('r', '2.5');
      spark.setAttribute('fill', '#f0c040');
      spark.setAttribute('filter', 'url(#wireGlow)');
      svg.appendChild(spark);

      const dur = 1200 + Math.random() * 800;
      const start = performance.now();

      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x;
        const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y;
        spark.setAttribute('cx', x);
        spark.setAttribute('cy', y);
        spark.setAttribute('opacity', 1 - Math.abs(t - 0.5) * 0.6);
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          svg.removeChild(spark);
        }
      }
      requestAnimationFrame(step);
    }

    setInterval(createSpark, 800);
  }

  // Build on load and resize
  window.addEventListener('load', buildHeroScene);
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildHeroScene, 150);
  });
})();


/* ─────────────────────────────────────────────
   4. TIMELINE CANVAS SCENE (mini grid)
   ───────────────────────────────────────────── */
(function initTimelineCanvas() {
  const canvas = document.getElementById('timelineCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  const towerPositions = [0.1, 0.3, 0.5, 0.7, 0.9];
  const towerHeights   = [50, 65, 80, 65, 50];
  const sparkPos = { t: 0, i: 0 };
  let sparkDir = 1;

  function drawMini() {
    ctx.clearRect(0, 0, W, H);

    // Ground line
    ctx.save();
    ctx.strokeStyle = 'rgba(59,139,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H - 2);
    ctx.lineTo(W, H - 2);
    ctx.stroke();
    ctx.restore();

    // Towers
    const tPos = towerPositions.map(p => ({ x: p * W, h: towerHeights[towerPositions.indexOf(p)] }));

    tPos.forEach(tp => {
      ctx.save();
      ctx.strokeStyle = 'rgba(96,160,224,0.6)';
      ctx.lineWidth = 1.5;
      // main mast
      ctx.beginPath();
      ctx.moveTo(tp.x, H - 2);
      ctx.lineTo(tp.x, H - tp.h - 2);
      ctx.stroke();
      // crossarm
      const armW = tp.h * 0.5;
      ctx.beginPath();
      ctx.moveTo(tp.x - armW / 2, H - tp.h * 0.55 - 2);
      ctx.lineTo(tp.x + armW / 2, H - tp.h * 0.55 - 2);
      ctx.stroke();
      // insulator dots
      ctx.fillStyle = 'rgba(96,160,224,0.8)';
      ctx.beginPath();
      ctx.arc(tp.x - armW / 2, H - tp.h * 0.55 - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tp.x + armW / 2, H - tp.h * 0.55 - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Wires
    for (let i = 0; i < tPos.length - 1; i++) {
      const p1 = { x: tPos[i].x, y: H - tPos[i].h * 0.55 - 2 - 2 };
      const p2 = { x: tPos[i + 1].x, y: H - tPos[i + 1].h * 0.55 - 2 - 2 };
      const mx = (p1.x + p2.x) / 2;
      const my = Math.max(p1.y, p2.y) + 8;
      ctx.save();
      ctx.strokeStyle = 'rgba(42,80,128,0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(mx, my, p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    }

    // Spark
    const i = sparkPos.i;
    if (i < tPos.length - 1) {
      const t = sparkPos.t;
      const p1 = { x: tPos[i].x, y: H - tPos[i].h * 0.55 - 2 - 2 };
      const p2 = { x: tPos[i + 1].x, y: H - tPos[i + 1].h * 0.55 - 2 - 2 };
      const mx = (p1.x + p2.x) / 2;
      const my = Math.max(p1.y, p2.y) + 8;

      const sx = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * mx + t * t * p2.x;
      const sy = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * my + t * t * p2.y;

      ctx.save();
      ctx.fillStyle = '#f0c040';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#f0c040';
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function animate() {
    sparkPos.t += 0.012 * sparkDir;
    if (sparkPos.t >= 1) {
      sparkPos.t = 1;
      if (sparkPos.i < towerPositions.length - 2) {
        sparkPos.i++;
        sparkPos.t = 0;
      } else {
        sparkDir = -1;
        sparkPos.t = 1;
      }
    } else if (sparkPos.t <= 0) {
      sparkPos.t = 0;
      if (sparkPos.i > 0) {
        sparkPos.i--;
        sparkPos.t = 1;
      } else {
        sparkDir = 1;
        sparkPos.t = 0;
      }
    }
    drawMini();
    requestAnimationFrame(animate);
  }

  window.addEventListener('load', () => {
    resize();
    animate();
  });
  window.addEventListener('resize', () => {
    resize();
  });
})();


/* ─────────────────────────────────────────────
   5. SCROLL ANIMATIONS (Intersection Observer)
   ───────────────────────────────────────────── */
(function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Animate skill bars
        entry.target.querySelectorAll('.skill-fill').forEach(bar => {
          const target = bar.dataset.width;
          setTimeout(() => {
            bar.style.width = target + '%';
          }, 200);
        });

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  const animEls = document.querySelectorAll(
    '.timeline-item, .edu-card, .skill-category, .hobby-item, .contact-card, .cert-card'
  );

  animEls.forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.12 + 's';
    observer.observe(el);
  });
})();


/* ─────────────────────────────────────────────
   6. ACTIVE NAV LINK HIGHLIGHTING
   ───────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.style.color = 'var(--accent)';
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
})();


/* ─────────────────────────────────────────────
   7. TOWER HOVER TOOLTIPS (Hero scene)
   ───────────────────────────────────────────── */
(function initTowerTooltips() {
  // Tooltips will appear on hover via CSS :hover, handled by CSS.
  // Add subtle floating glow on hero towers for effect.
  document.querySelectorAll('.tower-el').forEach((el, i) => {
    el.style.animationDelay = (i * 0.3) + 's';
  });
})();


/* ─────────────────────────────────────────────
   8. SMOOTH SECTION ENTRANCE via CSS class
   ───────────────────────────────────────────── */
(function sectionFadeIn() {
  const sections = document.querySelectorAll('section');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.05 });

  sections.forEach(s => {
    if (s.id !== 'hero') {
      s.style.opacity = '0';
      s.style.transform = 'translateY(20px)';
      s.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    }
    obs.observe(s);
  });
})();
