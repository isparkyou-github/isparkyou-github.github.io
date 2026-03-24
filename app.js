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
      // large
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

  function getWireAttachPoints(tower, sceneW, sceneH) {
    const tW = tower.dataset.twidth | 0;
    const tH = tower.dataset.theight | 0;
    const xC = parseFloat(tower.dataset.xratio) * sceneW;
    const yBase = sceneH;
    const scale = parseFloat(tower.dataset.scale);

    // Top wire attachment point
    const top = { x: xC, y: yBase - tH * scale + 5 };
    // Mid wire attachment points
    const midY = yBase - tH * scale * 0.55;
    const midW = (tW * 0.48 * scale);
    const left = { x: xC - midW, y: midY };
    const right = { x: xC + midW, y: midY };
    return { top, left, right };
  }

  function buildHeroScene() {
    container.innerHTML = '';
    svg.innerHTML = '';
    const sceneW = scene.offsetWidth;
    const sceneH = scene.offsetHeight;

    const towerEls = [];

    towerData.forEach((td, i) => {
      const isLarge = td.scale >= 1.0;
      const color = isLarge ? '#5ba3ff' : '#4a88cc';

      const wrapper = document.createElement('div');
      wrapper.className = 'tower-el';
      wrapper.style.left = (td.x * sceneW) + 'px';
      wrapper.style.transform = `translateX(-50%) scaleY(${td.scale})`;
      wrapper.style.transformOrigin = 'bottom center';
      wrapper.dataset.xratio = td.x;
      wrapper.dataset.scale = td.scale;

      const html = buildTowerSVG(td.variant, color);
      wrapper.innerHTML = html;

      const svgEl = wrapper.querySelector('svg');
      const tw = parseInt(svgEl.getAttribute('width'));
      const th = parseInt(svgEl.getAttribute('height'));
      wrapper.dataset.twidth = tw;
      wrapper.dataset.theight = th;

      container.appendChild(wrapper);
      towerEls.push(wrapper);
    });

    // After adding, draw wires via SVG
    svg.setAttribute('width', sceneW);
    svg.setAttribute('height', sceneH);
    svg.setAttribute('viewBox', `0 0 ${sceneW} ${sceneH}`);

    // Defs for gradients and filters
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

    // Draw wires between adjacent towers
    for (let i = 0; i < towerEls.length - 1; i++) {
      const t1 = towerEls[i];
      const t2 = towerEls[i + 1];
      const p1 = getWireAttachPoints(t1, sceneW, sceneH);
      const p2 = getWireAttachPoints(t2, sceneW, sceneH);

      // Top wire
      drawCatenary(svg, p1.top, p2.top, 18, 'url(#wireGrad)', 1.8, true);
      // Left-Right wires
      drawCatenary(svg, p1.left, p2.left, 12, '#1e4880', 1.2, false);
      drawCatenary(svg, p1.right, p2.right, 12, '#1e4880', 1.2, false);
    }

    // Animated electricity spark on wires
    animateSparks(towerEls, sceneW, sceneH);
  }

  function drawCatenary(svgEl, p1, p2, sag, stroke, width, glow) {
    const mx = (p1.x + p2.x) / 2;
    const my = Math.max(p1.y, p2.y) + sag;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${p1.x},${p1.y} Q ${mx},${my} ${p2.x},${p2.y}`;
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', stroke);
    path.setAttribute('stroke-width', width);
    if (glow) path.setAttribute('filter', 'url(#wireGlow)');
    path.setAttribute('stroke-linecap', 'round');
    svgEl.appendChild(path);
    return path;
  }

  function animateSparks(towers, sceneW, sceneH) {
    if (towers.length < 2) return;

    function createSpark() {
      const i = Math.floor(Math.random() * (towers.length - 1));
      const t1 = towers[i];
      const t2 = towers[i + 1];
      const p1 = getWireAttachPoints(t1, sceneW, sceneH).top;
      const p2 = getWireAttachPoints(t2, sceneW, sceneH).top;

      const mx = (p1.x + p2.x) / 2;
      const my = Math.max(p1.y, p2.y) + 18;

      const spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      spark.setAttribute('r', '2.5');
      spark.setAttribute('fill', '#f0c040');
      spark.setAttribute('filter', 'url(#wireGlow)');
      svg.appendChild(spark);

      let t = 0;
      const dur = 1200 + Math.random() * 800;
      const start = performance.now();

      function step(now) {
        t = Math.min((now - start) / dur, 1);
        // Quadratic Bezier position
        const x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * mx + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * my + t * t * p2.y;
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
    '.timeline-item, .edu-card, .skill-category, .contact-card, .cert-card'
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
