

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initNavbarRotatingMoon();
  initProjectFilters();
  initModals();
  initCopyEmail();
  initCustomCursor();
  initSkillsNetworkCanvas();
  initPlanetary3DSystem();
  initSpaceStarfield();
  initDistantBlackHole();
  initMassiveBlackHole();
  initStellarSun();
  initHeroGasCloud();
  initCosmicNebula();
  initSpiralGalaxy();
  initCartwheelGalaxy();
  initSpaceStation3D();
});


function initNavbarScroll() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}


function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');

  if (!toggleBtn || !navMenu) return;

  function toggleMenu() {
    const isOpen = navMenu.classList.contains('open');
    navMenu.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', !isOpen);
  }

  toggleBtn.addEventListener('click', toggleMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      navMenu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}


function initNavbarRotatingMoon() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('nav-moon-canvas');
  const wrapper = document.getElementById('nav-moon-wrapper');
  if (!canvas || !wrapper) return;

  const width = canvas.width;
  const height = canvas.height;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
  camera.position.z = 3.6;

  // Realistic directional sunlight (giving a lunar crescent / gibbous shadow)
  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(-3.5, 2.0, 3.0);
  scene.add(dirLight);

  const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.35);
  scene.add(ambientLight);

  // Generate high-resolution procedural lunar texture with craters & maria
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 512;
  texCanvas.height = 256;
  const tCtx = texCanvas.getContext('2d');

  const grad = tCtx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#94a3b8');
  grad.addColorStop(0.5, '#cbd5e1');
  grad.addColorStop(1, '#64748b');
  tCtx.fillStyle = grad;
  tCtx.fillRect(0, 0, 512, 256);

  // Dark lunar maria patches (seas)
  tCtx.fillStyle = 'rgba(30, 41, 59, 0.65)';
  for (let i = 0; i < 35; i++) {
    const cx = (i * 47) % 512;
    const cy = 20 + ((i * 59) % 216);
    const rw = 12 + ((i * 7) % 28);
    const rh = 8 + ((i * 5) % 18);
    tCtx.beginPath();
    tCtx.ellipse(cx, cy, rw, rh, i * 0.4, 0, Math.PI * 2);
    tCtx.fill();
  }

  // Bright impact crater rays
  tCtx.fillStyle = 'rgba(241, 245, 249, 0.45)';
  for (let i = 0; i < 25; i++) {
    const cx = (i * 71 + 18) % 512;
    const cy = 25 + ((i * 83) % 206);
    tCtx.beginPath();
    tCtx.arc(cx, cy, 3 + (i % 4), 0, Math.PI * 2);
    tCtx.fill();
  }

  const moonTex = new THREE.CanvasTexture(texCanvas);
  const moonGeo = new THREE.SphereGeometry(1.15, 36, 36);
  const moonMat = new THREE.MeshStandardMaterial({
    map: moonTex,
    roughness: 0.82,
    metalness: 0.08
  });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);
  scene.add(moonMesh);

  let isHovered = false;
  wrapper.addEventListener('pointerenter', () => { isHovered = true; });
  wrapper.addEventListener('pointerleave', () => { isHovered = false; });

  // Interactive drag / flick
  let isDragging = false;
  let prevX = 0;
  let velY = 0;

  wrapper.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevX = e.clientX;
    velY = 0;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    prevX = e.clientX;
    velY = dx * 0.02;
    moonMesh.rotation.y += velY;
  });

  window.addEventListener('pointerup', () => { isDragging = false; });
  window.addEventListener('pointercancel', () => { isDragging = false; });

  let animId = null;
  let lastTime = 0;

  function render(time) {
    const curTime = time || performance.now();
    const dt = lastTime ? Math.min((curTime - lastTime) / 1000, 0.1) : 0.016;
    lastTime = curTime;
    const delta = dt * 60;

    if (!isDragging) {
      velY *= Math.pow(0.95, delta);
      const baseSpeed = isHovered ? 0.022 : 0.0075;
      moonMesh.rotation.y += (baseSpeed + velY) * delta;
    }

    renderer.render(scene, camera);
    animId = requestAnimationFrame(render);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      lastTime = 0;
    } else if (!animId) {
      lastTime = 0;
      animId = requestAnimationFrame(render);
    }
  });

  animId = requestAnimationFrame(render);
}





function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease-out';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}


const PROJECT_DETAILS = {
  'bandup': {
    title: 'BandUp — AI-Powered IELTS Preparation Platform',
    tag: 'Node.js • Express • MySQL • Google Gemini API • Tailwind CSS',
    description: 'BandUp is a full-featured web application engineered to help students systematically prepare for the IELTS examination with automated AI scoring and interactive testing.',
    highlights: [
      'Comprehensive 4-module test suite: Reading passages, Listening audio tests, Writing essays, and Speaking prompts.',
      'Integrated Google Gemini AI for instant band score prediction, grammatical correction, and detailed rubric feedback on Task 1 and Task 2 essays.',
      'Secure authentication using JSON Web Tokens (JWT) stored exclusively in HTTP-only cookies to eliminate XSS token theft.',
      'Vocabulary Master tracker allowing students to bookmark difficult words and track learning progress (new / learning / mastered).',
      'Full administrative panel for educators to manage passages, questions, vocabulary words, and student records.'
    ],
    metrics: '4 Complete IELTS Modules • Automated AI Feedback • Deployed on Render',
    demoUrl: 'https://bandup-52ay.onrender.com',
    githubUrl: 'https://github.com/IshmamHussain/BandUp'
  },
  'noteshub': {
    title: 'University Notes Hub — Academic Resource Sharing Portal',
    tag: 'Vanilla JavaScript • Node.js • Express • MySQL • Glassmorphism CSS',
    description: 'University Notes Hub is a centralized academic sharing platform designed for university students to discover, preview, upload, and download semester course notes, slides, and exam preparation materials.',
    highlights: [
      'Hierarchical course and department organization (CSE, EEE, BBA, Law) with instant filtering.',
      'Custom glassmorphism dark-mode interface with zero external CSS frameworks for maximum performance and silky 60fps animations.',
      'Student ID validation tailored to university formats (e.g., Metropolitan University registration structure).',
      'Search and sort index for lecture slides, handwritten notes, and previous year exam questions with download tracking.',
      'Admin moderation workflow for reviewing uploaded files, managing course categories, and moderating content.'
    ],
    metrics: 'Multi-Department Support • Fast Client-Side SPA Routing • Deployed on Vercel',
    demoUrl: 'https://university-notes-hub.vercel.app',
    githubUrl: 'https://github.com/IshmamHussain/University-Notes-Hub'
  },
  'bazaardor': {
    title: 'BazarDor — Daily Market Price Tracker & Marketplace',
    tag: 'Next.js 16 • React 19 • TypeScript • MongoDB • Tailwind CSS • Better-Auth',
    description: 'BazarDor is a modern, high-performance web platform designed to track and compare daily market prices of essential commodities in Bangladesh with live updates, interactive tickers, and demographic market analysis.',
    highlights: [
      'Built with Next.js 16 App Router and React 19 for instantaneous server-side rendering, SEO, and fast client navigation.',
      'Live auto-scrolling marquee ticker below the navbar streaming real-time commodity price fluctuations and trends.',
      'Category-based filtering across essential groceries (Rice, Dal, Oil, Vegetables, Fish, Meat, Eggs, Spices) with Bengali numeric sorting.',
      'Protected product analytics detailing minimum, maximum, and average commodity prices across divisions and local bazaars.',
      'Full authentication suite powered by Better-Auth and MongoDB Atlas supporting credentials and OAuth 2.0 social sign-in.'
    ],
    metrics: 'Real-Time Price Ticker • MongoDB Atlas Caching • Deployed on Vercel',
    demoUrl: 'https://bazaar-dor.vercel.app',
    githubUrl: 'https://github.com/IshmamHussain/Bazaar-Dor'
  }
};

const CERT_DETAILS = {
  'it-aid-web-design': {
    title: 'Web Design — Certificate of Completion',
    issuer: 'The IT Aid · Al-Hamra Shopping City, Zindabazar, Sylhet',
    date: '6 Nov 2022 – 7 May 2023 · Issued: 23 May 2023',
    id: 'ID: WD1329 | S/N: 20232275565845',
    grade: 'Grade A+ (80% – 100%)',
    image: 'assets/images/certificates/cert-the-it-aid-web-design.jpg',
    skills: 'Responsive Web Design, HTML5 Semantic Structure, CSS3 Layouts, UI/UX Principles, Cross-Browser Compatibility',
    description: 'Awarded to Ishmam Hussain Chowdhury for successfully completing the comprehensive professional training course on Web Design from 6th November 2022 to 7th May 2023 with an outstanding Grade A+ rating. Verified and signed by Instructor and Exam Controller at The IT Aid, Sylhet.'
  },
  'murs-authorship': {
    title: 'Certificate of Authorship — Research Presentation',
    issuer: 'Metropolitan University Research Society (MURS) & Metropolitan University',
    date: '17–18 July 2026',
    id: 'Certificate No: 560/2026',
    grade: 'Presented & Authored Research Paper',
    image: 'assets/images/certificates/cert-murs-authorship.png',
    skills: 'Academic Research, Scholarly Paper Authoring, Conference Presentation, Sustainable Development Goals (SDGs), Interdisciplinary Analysis',
    description: 'Proudly presented to Ishmam Hussain Chowdhury in recognition of presenting and authoring a research paper at the National Interdisciplinary Conference on Sustainable Development Goals 2026 (NICSDG-2026), held on 17–18 July 2026 at Metropolitan University, Sylhet. Officially signed by MURS General Secretary Shahriar Alam Mehedi Tapadar and Conference Convener Md. Ziaur Rahman.'
  },
  'lurs-presentation': {
    title: 'Certificate of Participation — Paper Presentation',
    issuer: 'Leading University Research Society (LURS) & Leading University',
    date: '01 August 2026',
    id: 'Conference: LURS 3rd Student Research Conference 2026',
    grade: 'Paper Presentation Participant',
    image: 'assets/images/certificates/cert-lurs-presentation.jpg',
    skills: 'Paper Presentation, Scholarly Research, Sustainable Development Solutions, Interdisciplinary Innovation',
    description: 'Proudly presented to Ishmam Hussain for participating in Paper Presentation in the "LURS 3rd Student Research Conference 2026" themed "Turning Ideas into Sustainable Solutions for a Better Tomorrow", organized by Leading University Research Society on August 01, 2026. Officially signed by Advisor Dr. Shafkat Kibria (Associate Professor) and Co-Advisor Md. Jamaner Rahaman (Assistant Professor).'
  }
};

function initModals() {
  const backdrop = document.getElementById('details-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!backdrop) return;

  function closeModal() {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closeModal();
    }
  });

  
  document.querySelectorAll('[data-project-trigger]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.getAttribute('data-project-trigger');
      const data = PROJECT_DETAILS[key];
      if (!data) return;

      modalTitle.textContent = data.title;
      modalBody.innerHTML = `
        <div style="margin-bottom: 16px;">
          <span style="font-family: var(--font-mono); font-size: 13px; color: var(--primary); background: rgba(56, 189, 248, 0.1); padding: 4px 12px; border-radius: 4px;">
            ${data.tag}
          </span>
        </div>
        <p style="margin-bottom: 20px; font-size: 15.5px; line-height: 1.65;">${data.description}</p>
        <h4 style="font-size: 16px; margin-bottom: 12px; color: var(--text-main);">Key Engineering Highlights:</h4>
        <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 22px; display: flex; flex-direction: column; gap: 8px;">
          ${data.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
        <div style="background: rgba(10, 15, 28, 0.7); border: 1px solid var(--border-subtle); padding: 14px 18px; border-radius: 8px; margin-bottom: 24px;">
          <span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">ARCHITECTURE SUMMARY</span>
          <strong style="color: var(--accent-emerald); font-size: 14px;">${data.metrics}</strong>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="${data.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Launch Live Application ↗</a>
          <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">View GitHub Repository ↗</a>
        </div>
      `;

      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  
  document.querySelectorAll('[data-cert-trigger]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const key = trigger.getAttribute('data-cert-trigger');
      const data = CERT_DETAILS[key];
      if (!data) return;

      modalTitle.textContent = data.title;

      modalBody.innerHTML = `
        <div class="modal-cert-viewer">
          <img src="${data.image}" alt="${data.title}" class="modal-cert-img" id="modal-cert-display-img">
        </div>

        <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <h3 style="font-size: 18.5px; color: #ffffff; margin-bottom: 4px;">${data.title}</h3>
            <p style="font-size: 14px; color: var(--primary); font-family: var(--font-mono);">${data.issuer}</p>
          </div>
          <span style="display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 12px; color: var(--accent-emerald); background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.3); padding: 5px 12px; border-radius: 9999px;">
            ${data.grade}
          </span>
        </div>

        <p style="margin-bottom: 20px; font-size: 15px; line-height: 1.65; color: var(--text-secondary);">${data.description}</p>

        <div style="background: rgba(10, 15, 28, 0.85); border: 1px solid var(--border-subtle); padding: 16px; border-radius: 10px; margin-bottom: 22px; display: flex; flex-direction: column; gap: 9px; font-family: var(--font-mono); font-size: 13px;">
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <span style="color: var(--text-muted);">RECORD REFERENCE:</span>
            <span style="color: var(--text-main); font-weight: 600;">${data.id}</span>
          </div>
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <span style="color: var(--text-muted);">TIMELINE / ISSUE DATE:</span>
            <span style="color: var(--text-secondary);">${data.date}</span>
          </div>
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <span style="color: var(--text-muted);">VERIFIED COMPETENCY:</span>
            <span style="color: var(--accent-cyan); font-weight: 500;">${data.skills}</span>
          </div>
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="${data.image}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" id="modal-cert-external-link">
            Open Original File in New Tab ↗
          </a>
        </div>
      `;

      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
}





function initCopyEmail() {
  const copyBtns = document.querySelectorAll('.btn-copy-email, [data-copy-email]');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'ishmamhussain003@gmail.com';

      navigator.clipboard.writeText(email).then(() => {
        showToast('Email copied to clipboard: ishmamhussain003@gmail.com ✓');
      }).catch(() => {
        showToast('Direct email: ishmamhussain003@gmail.com');
      });
    });
  });
}


function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary);">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const canvas = document.getElementById('cursor-particles-canvas');

  if (!canvas) return;
  if (dot) dot.style.display = 'none';

  if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { passive: true });

  const particles = [];
  let prevX = -1;
  let prevY = -1;
  let isCursorAnimRunning = false;

  function scheduleCursorAnim() {
    if (!isCursorAnimRunning) {
      isCursorAnimRunning = true;
      requestAnimationFrame(animateParticles);
    }
  }

  const purpleSpacePalette = [
    '217, 70, 239',  // Cosmic magenta
    '168, 85, 247',  // Purple nebula
    '129, 140, 248', // Ethereal violet
    '56, 189, 248',  // Starlight cyan
    '253, 224, 71'   // Stellar gold
  ];

  window.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    if (prevX !== -1) {
      const dist = Math.hypot(x - prevX, y - prevY);
      if (dist > 14 && particles.length < 24) {
        const color = purpleSpacePalette[Math.floor(Math.random() * purpleSpacePalette.length)];
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45 + 0.15,
          size: Math.random() * 1.8 + 1.1,
          alpha: 0.9,
          color: color,
          decay: 0.035
        });
        scheduleCursorAnim();
      }
    }
    prevX = x;
    prevY = y;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    prevX = -1;
    prevY = -1;
  });

  document.addEventListener('mousedown', (e) => {
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i) / 7 + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 2.2 + 1.2;
      const color = purpleSpacePalette[Math.floor(Math.random() * purpleSpacePalette.length)];
      particles.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.2 + 1.2,
        alpha: 1.0,
        color: color,
        decay: 0.04
      });
    }
    scheduleCursorAnim();
  });

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${p.color}, 0.8)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (particles.length > 0) {
      requestAnimationFrame(animateParticles);
    } else {
      isCursorAnimRunning = false;
    }
  }
}

function initSkillsNetworkCanvas() {
  const canvas = document.getElementById('skills-network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.offsetWidth || window.innerWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight || 600);

  let mouseX = -1000;
  let mouseY = -1000;
  let isSkillsVisible = false;
  let skillsAnimId = null;

  function startSkillsAnimate() {
    if (!skillsAnimId && isSkillsVisible && !document.hidden) {
      skillsAnimId = requestAnimationFrame(animate);
    }
  }

  function stopSkillsAnimate() {
    if (skillsAnimId) {
      cancelAnimationFrame(skillsAnimId);
      skillsAnimId = null;
    }
  }

  let canvasRect = null;
  const section = document.getElementById('skills');
  if (section) {
    section.addEventListener('mouseenter', () => {
      canvasRect = canvas.getBoundingClientRect();
    });
    section.addEventListener('mousemove', (e) => {
      if (!canvasRect) canvasRect = canvas.getBoundingClientRect();
      mouseX = e.clientX - canvasRect.left;
      mouseY = e.clientY - canvasRect.top;
    }, { passive: true });

    section.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
      canvasRect = null;
    });

    window.addEventListener('scroll', () => {
      canvasRect = null;
    }, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      isSkillsVisible = entries[0].isIntersecting;
      if (isSkillsVisible) {
        startSkillsAnimate();
      } else {
        stopSkillsAnimate();
      }
    }, { threshold: 0.05 });
    observer.observe(section);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopSkillsAnimate();
    } else if (isSkillsVisible) {
      startSkillsAnimate();
    }
  });

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight || 600;
    canvasRect = null;
  }, { passive: true });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const starCount = window.innerWidth < 768 ? 32 : 64;
  const stars = [];

  for (let i = 0; i < starCount; i++) {
    const orbitRadius = 40 + Math.random() * (Math.min(width, height) * 0.48);
    stars.push({
      orbitRadius: orbitRadius,
      angle: Math.random() * Math.PI * 2,
      orbitSpeed: (0.002 + 0.006 * (1 - orbitRadius / (Math.min(width, height) * 0.5))) * (Math.random() > 0.5 ? 1 : -1),
      eccentricityY: 0.55 + Math.random() * 0.35,
      radius: Math.random() * 2.2 + 1,
      baseAlpha: Math.random() * 0.5 + 0.35,
      pulseSpeed: Math.random() * 0.04 + 0.02,
      pulsePhase: Math.random() * Math.PI * 2,
      color: i % 4 === 0 ? '56, 189, 248' : (i % 4 === 1 ? '129, 140, 248' : (i % 4 === 2 ? '52, 211, 153' : '255, 255, 255'))
    });
  }

  let lastSkillsTime = 0;

  function animate(time) {
    if (!isSkillsVisible || document.hidden) {
      skillsAnimId = null;
      lastSkillsTime = 0;
      return;
    }

    const curTime = time || performance.now();
    let deltaFactor = 1;
    if (!lastSkillsTime) {
      lastSkillsTime = curTime;
    } else {
      const dt = Math.min((curTime - lastSkillsTime) / 1000, 0.1);
      lastSkillsTime = curTime;
      deltaFactor = dt * 60;
    }

    ctx.clearRect(0, 0, width, height);

    const curCenterX = width * 0.5;
    const curCenterY = height * 0.5;

    const positions = [];

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.angle += s.orbitSpeed * deltaFactor;
      s.pulsePhase += s.pulseSpeed * deltaFactor;

      let px = curCenterX + Math.cos(s.angle) * s.orbitRadius;
      let py = curCenterY + Math.sin(s.angle) * (s.orbitRadius * s.eccentricityY);

      const mdx = mouseX - px;
      const mdy = mouseY - py;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

      if (mDist < 160) {
        px += mdx * 0.025;
        py += mdy * 0.025;
      }

      positions.push({ x: px, y: py, star: s, mDist: mDist });

      const alphaPulse = Math.sin(s.pulsePhase) * 0.2;
      let finalAlpha = Math.min(1, Math.max(0.15, s.baseAlpha + alphaPulse));
      if (mDist < 160) {
        finalAlpha = Math.min(1, finalAlpha + (1 - mDist / 160) * 0.6);
        ctx.beginPath();
        ctx.arc(px, py, s.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color}, 0.2)`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(px, py, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color}, ${finalAlpha})`;
      ctx.fill();
    }

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const p1 = positions[i];
        const p2 = positions[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 115) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          let linkAlpha = (1 - dist / 115) * 0.18;
          if (p1.mDist < 160 || p2.mDist < 160) {
            linkAlpha = Math.min(0.65, linkAlpha * 2.5);
          }
          ctx.strokeStyle = `rgba(56, 189, 248, ${linkAlpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }

    if (!prefersReduced) {
      skillsAnimId = requestAnimationFrame(animate);
    }
  }

  if (isSkillsVisible && !document.hidden) {
    skillsAnimId = requestAnimationFrame(animate);
  }
}

function initPlanetary3DSystem() {
  if (typeof THREE === 'undefined') return;

  const canvasList = Array.from(document.querySelectorAll('.planet-3d-canvas'));
  if (!canvasList.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function createTexture(type) {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');

    if (type === 'hero') {
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#0a2240');
      grad.addColorStop(0.3, '#0f3c6e');
      grad.addColorStop(0.7, '#071f38');
      grad.addColorStop(1, '#0a2240');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      ctx.fillStyle = '#065f46';
      for (let i = 0; i < 28; i++) {
        const cx = (i * 47) % 1024;
        const cy = 110 + ((i * 79) % 270);
        const rw = 65 + ((i * 29) % 95);
        const rh = 35 + ((i * 17) % 65);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, i * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#15803d';
      for (let i = 0; i < 24; i++) {
        const cx = (i * 53 + 15) % 1024;
        const cy = 130 + ((i * 61) % 230);
        const rw = 45 + ((i * 19) % 70);
        const rh = 25 + ((i * 13) % 45);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, i * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#b45309';
      for (let i = 0; i < 14; i++) {
        const cx = (i * 71 + 30) % 1024;
        const cy = 150 + ((i * 53) % 190);
        const rw = 25 + ((i * 11) % 35);
        const rh = 15 + ((i * 7) % 25);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, i * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1024, 34);
      ctx.fillRect(0, 478, 1024, 34);
    } else if (type === 'clouds') {
      ctx.clearRect(0, 0, 1024, 512);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.46)';
      for (let i = 0; i < 60; i++) {
        const cx = (i * 29) % 1024;
        const cy = 50 + ((i * 47) % 410);
        const rw = 80 + ((i * 31) % 140);
        const rh = 18 + ((i * 11) % 35);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, -0.15 + (i * 0.02), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'about') {
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#082f49');
      grad.addColorStop(0.3, '#0369a1');
      grad.addColorStop(0.7, '#0284c7');
      grad.addColorStop(1, '#082f49');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      for (let i = 0; i < 34; i++) {
        const cx = (i * 39) % 1024;
        const cy = 90 + ((i * 67) % 330);
        ctx.beginPath();
        ctx.arc(cx, cy, 30 + ((i * 17) % 65), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'projects') {
      for (let y = 0; y < 512; y++) {
        const pos = y / 512;
        const c1 = Math.sin(pos * 24) * 0.5 + 0.5;
        const c2 = Math.cos(pos * 14) * 0.5 + 0.5;
        const r = Math.floor(217 * (0.6 + c1 * 0.4));
        const g = Math.floor(119 * (0.5 + c2 * 0.5));
        const b = Math.floor(30 + c1 * 50);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, y, 1024, 1);
      }
      ctx.fillStyle = 'rgba(180, 83, 9, 0.75)';
      ctx.beginPath();
      ctx.ellipse(650, 310, 80, 42, -0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'ring') {
      const ringC = document.createElement('canvas');
      ringC.width = 512;
      ringC.height = 1;
      const rCtx = ringC.getContext('2d');
      for (let x = 0; x < 512; x++) {
        const u = x / 512;
        if (u < 0.1 || (u > 0.55 && u < 0.62) || u > 0.96) {
          rCtx.fillStyle = 'rgba(0,0,0,0)';
        } else {
          const a = Math.sin(u * Math.PI) * 0.88;
          const r = Math.floor(245 - u * 35);
          const g = Math.floor(158 - u * 45);
          const b = Math.floor(60 + u * 40);
          rCtx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(2)})`;
        }
        rCtx.fillRect(x, 0, 1, 1);
      }
      return new THREE.CanvasTexture(ringC);
    } else if (type === 'skills') {
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#0c4a6e');
      grad.addColorStop(0.5, '#0284c7');
      grad.addColorStop(1, '#082f49');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      ctx.fillStyle = 'rgba(165, 243, 252, 0.3)';
      for (let i = 0; i < 40; i++) {
        const cx = (i * 31) % 1024;
        const cy = 70 + ((i * 53) % 370);
        ctx.fillRect(cx, cy, 140, 4);
      }
    } else if (type === 'certificates') {
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#431407');
      grad.addColorStop(0.4, '#ea580c');
      grad.addColorStop(0.7, '#c2410c');
      grad.addColorStop(1, '#431407');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      ctx.fillStyle = 'rgba(67, 20, 7, 0.45)';
      for (let i = 0; i < 45; i++) {
        const cx = (i * 41) % 1024;
        const cy = 60 + ((i * 59) % 390);
        ctx.beginPath();
        ctx.arc(cx, cy, 15 + ((i * 13) % 40), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'contact') {
      const grad = ctx.createRadialGradient(512, 256, 40, 512, 256, 500);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#38bdf8');
      grad.addColorStop(0.7, '#6366f1');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);
    } else if (type === 'moon') {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#94a3b8');
      grad.addColorStop(1, '#334155');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.55)';
      for (let i = 0; i < 30; i++) {
        const cx = (i * 37) % 512;
        const cy = 15 + ((i * 47) % 225);
        ctx.beginPath();
        ctx.arc(cx, cy, 6 + ((i * 5) % 18), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return new THREE.CanvasTexture(c);
  }

  const instances = canvasList.map(canvas => {
    const type = canvas.dataset.planet || 'hero';
    const section = canvas.closest('section') || canvas.parentElement;
    const parentSystem = canvas.closest('.planet-system');
    const width = canvas.width;
    const height = canvas.height;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7.5;

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.45);
    dirLight.position.set(-5, 3, 5);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.35);
    scene.add(ambientLight);

    const planetPivot = new THREE.Group();
    scene.add(planetPivot);

    const tex = createTexture(type);
    const planetGeo = new THREE.SphereGeometry(1.22, 36, 36);
    const planetMat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.75,
      metalness: 0.15
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetPivot.add(planetMesh);

    let cloudsMesh = null;
    if (type === 'hero' || type === 'about') {
      const cloudTex = createTexture('clouds');
      const cloudGeo = new THREE.SphereGeometry(1.25, 28, 28);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
      planetPivot.add(cloudsMesh);
    }

    let ringMesh = null;
    if (type === 'projects') {
      const ringTex = createTexture('ring');
      const ringGeo = new THREE.RingGeometry(1.55, 2.35, 48);
      const pos = ringGeo.attributes.position;
      const v3 = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        ringGeo.attributes.uv.setXY(i, (v3.length() - 1.55) / (2.35 - 1.55), 0);
      }
      const ringMat = new THREE.MeshBasicMaterial({
        map: ringTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92
      });
      ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI * 0.58;
      ringMesh.rotation.y = -0.22;
      planetPivot.add(ringMesh);
    }

    const moonPivot = new THREE.Group();
    scene.add(moonPivot);
    const moonTex = createTexture('moon');
    const moonGeo = new THREE.SphereGeometry(0.22, 20, 20);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.85
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonPivot.add(moonMesh);

    let moon2Mesh = null;
    let moon2Pivot = null;
    let asteroidsGroup = null;
    if (type === 'projects') {
      moon2Pivot = new THREE.Group();
      scene.add(moon2Pivot);
      const moon2Geo = new THREE.SphereGeometry(0.14, 18, 18);
      const moon2Mat = new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        roughness: 0.5
      });
      moon2Mesh = new THREE.Mesh(moon2Geo, moon2Mat);
      moon2Pivot.add(moon2Mesh);

      asteroidsGroup = new THREE.Group();
      planetPivot.add(asteroidsGroup);
      for (let i = 0; i < 4; i++) {
        const aGeo = new THREE.DodecahedronGeometry(0.1 + (i % 2) * 0.04, 1);
        const aPos = aGeo.attributes.position;
        const av = new THREE.Vector3();
        for (let j = 0; j < aPos.count; j++) {
          av.fromBufferAttribute(aPos, j);
          av.multiplyScalar(1 + Math.sin(av.x * 6 + av.y * 5) * 0.2);
          aPos.setXYZ(j, av.x, av.y, av.z);
        }
        aGeo.computeVertexNormals();
        const aMat = new THREE.MeshStandardMaterial({
          color: 0x78716c,
          roughness: 0.9,
          metalness: 0.2,
          flatShading: true
        });
        const aMesh = new THREE.Mesh(aGeo, aMat);
        const aAngle = (i / 4) * Math.PI * 2;
        const aDist = 2.05 + i * 0.08;
        aMesh.position.set(Math.cos(aAngle) * aDist, (i % 2 ? 0.08 : -0.08), Math.sin(aAngle) * aDist);
        asteroidsGroup.add(aMesh);
      }
    }

    const inst = {
      canvas,
      section,
      parentSystem,
      renderer,
      scene,
      camera,
      planetMesh,
      cloudsMesh,
      moonMesh,
      moon2Mesh,
      planetPivot,
      type,
      isVisible: false,
      sectionTop: 0,
      sectionHeight: 0,
      moonAngle: Math.random() * Math.PI * 2,
      moon2Angle: Math.random() * Math.PI * 2,
      isDragging: false,
      dragVelX: 0,
      dragVelY: 0,
      moonFlung: false,
      moonFlingVx: 0,
      moonFlingVy: 0,
      moonFlingVz: 0,
      moonFlingX: 0,
      moonFlingY: 0,
      moonFlingZ: 0,
      moonDragActive: false,
      moonOrbitRadius: 2.15,
      moonOrbitY: 0.55,
      moonOrbitZ: 1.6,
      moonReturnStrength: 0.008,
      moonDamping: 0.985
    };

    let prevPointerX = 0;
    let prevPointerY = 0;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let moonDragPrevX = 0;
    let moonDragPrevY = 0;

    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const moonHits = raycaster.intersectObject(moonMesh, false);
      if (moonHits.length > 0) {
        inst.moonDragActive = true;
        inst.moonFlingVx = 0;
        inst.moonFlingVy = 0;
        inst.moonFlingVz = 0;
        moonDragPrevX = e.clientX;
        moonDragPrevY = e.clientY;
        canvas.style.cursor = 'grabbing';
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
        return;
      }

      inst.isDragging = true;
      inst.dragVelX = 0;
      inst.dragVelY = 0;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    canvas.addEventListener('pointermove', (e) => {
      if (inst.moonDragActive) {
        const dx = e.clientX - moonDragPrevX;
        const dy = e.clientY - moonDragPrevY;
        moonDragPrevX = e.clientX;
        moonDragPrevY = e.clientY;
        inst.moonFlingVx = dx * 0.035;
        inst.moonFlingVy = -dy * 0.035;
        const pos = inst.moonMesh.position;
        pos.x += dx * 0.012;
        pos.y -= dy * 0.012;
        return;
      }
      if (!inst.isDragging) return;
      const dx = e.clientX - prevPointerX;
      const dy = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      inst.dragVelX = dx * 0.005;
      inst.dragVelY = dy * 0.005;
      inst.planetPivot.rotation.y += inst.dragVelX;
      inst.planetPivot.rotation.x += inst.dragVelY;
    });

    const onPointerUp = (e) => {
      if (inst.moonDragActive) {
        inst.moonDragActive = false;
        inst.moonFlung = true;
        inst.moonFlingX = inst.moonMesh.position.x;
        inst.moonFlingY = inst.moonMesh.position.y;
        inst.moonFlingZ = inst.moonMesh.position.z;
        canvas.style.cursor = '';
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}
        return;
      }
      if (!inst.isDragging) return;
      inst.isDragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
    };

    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    return inst;
  });

  const instanceMap = new Map();
  instances.forEach(inst => {
    if (inst.section) instanceMap.set(inst.section, inst);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const inst = instanceMap.get(entry.target);
      if (inst) {
        inst.isVisible = entry.isIntersecting;
      }
    });
  }, {
    rootMargin: '100px 0px 100px 0px',
    threshold: 0
  });

  instances.forEach(inst => {
    if (inst.section) observer.observe(inst.section);
  });

  let cachedWinH = window.innerHeight;
  let cachedScrollY = window.scrollY;

  function updateMetrics() {
    cachedWinH = window.innerHeight;
    cachedScrollY = window.scrollY;
    instances.forEach(inst => {
      if (inst.section) {
        const rect = inst.section.getBoundingClientRect();
        inst.sectionTop = rect.top + window.scrollY;
        inst.sectionHeight = rect.height;
      }
    });
  }

  window.addEventListener('resize', updateMetrics, { passive: true });
  window.addEventListener('scroll', () => {
    cachedScrollY = window.scrollY;
  }, { passive: true });

  updateMetrics();

  let animId = null;
  let lastTime = 0;

  function render(time) {
    const curTime = time || performance.now();
    let deltaFactor = 1;
    if (!lastTime) {
      lastTime = curTime;
    } else {
      const dt = Math.min((curTime - lastTime) / 1000, 0.1);
      lastTime = curTime;
      deltaFactor = dt * 60;
    }

    instances.forEach((inst) => {
      if (!inst.isVisible) return;

      if (!inst.isDragging) {
        inst.planetMesh.rotation.y += 0.0014 * deltaFactor;
        if (inst.cloudsMesh) {
          inst.cloudsMesh.rotation.y += 0.0022 * deltaFactor;
        }
        if (Math.abs(inst.dragVelX) > 0.0001 || Math.abs(inst.dragVelY) > 0.0001) {
          inst.planetPivot.rotation.y += inst.dragVelX * deltaFactor;
          inst.planetPivot.rotation.x += inst.dragVelY * deltaFactor;
          inst.dragVelX *= Math.pow(0.94, deltaFactor);
          inst.dragVelY *= Math.pow(0.94, deltaFactor);
        }
      }

      inst.moonAngle += 0.004 * deltaFactor;
      const orbitX = Math.cos(inst.moonAngle) * inst.moonOrbitRadius;
      const orbitY = Math.sin(inst.moonAngle) * inst.moonOrbitY;
      const orbitZ = Math.sin(inst.moonAngle) * inst.moonOrbitZ;

      if (inst.moonDragActive) {
      } else if (inst.moonFlung) {
        inst.moonFlingX += inst.moonFlingVx * deltaFactor;
        inst.moonFlingY += inst.moonFlingVy * deltaFactor;
        inst.moonFlingZ += inst.moonFlingVz * deltaFactor;

        const springX = (orbitX - inst.moonFlingX) * inst.moonReturnStrength * deltaFactor;
        const springY = (orbitY - inst.moonFlingY) * inst.moonReturnStrength * deltaFactor;
        const springZ = (orbitZ - inst.moonFlingZ) * inst.moonReturnStrength * deltaFactor;
        inst.moonFlingVx += springX;
        inst.moonFlingVy += springY;
        inst.moonFlingVz += springZ;

        inst.moonFlingVx *= Math.pow(inst.moonDamping, deltaFactor);
        inst.moonFlingVy *= Math.pow(inst.moonDamping, deltaFactor);
        inst.moonFlingVz *= Math.pow(inst.moonDamping, deltaFactor);

        inst.moonMesh.position.set(inst.moonFlingX, inst.moonFlingY, inst.moonFlingZ);

        const distToOrbit = Math.hypot(
          inst.moonFlingX - orbitX,
          inst.moonFlingY - orbitY,
          inst.moonFlingZ - orbitZ
        );
        const speed = Math.hypot(inst.moonFlingVx, inst.moonFlingVy, inst.moonFlingVz);
        if (distToOrbit < 0.15 && speed < 0.005) {
          inst.moonFlung = false;
        }
      } else {
        inst.moonMesh.position.set(orbitX, orbitY, orbitZ);
      }

      if (inst.moon2Mesh) {
        inst.moon2Angle += 0.0065 * deltaFactor;
        inst.moon2Mesh.position.set(
          Math.cos(inst.moon2Angle) * 1.75,
          Math.sin(inst.moon2Angle) * -0.65,
          Math.sin(inst.moon2Angle) * 1.3
        );
      }

      if (inst.parentSystem && inst.sectionHeight > 0) {
        const distFromTop = inst.sectionTop - cachedScrollY;
        const totalH = cachedWinH + inst.sectionHeight;
        const progress = Math.max(0, Math.min(1, (cachedWinH - distFromTop) / totalH));
        const translateY = (progress - 0.5) * 45;
        inst.parentSystem.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      }

      inst.renderer.render(inst.scene, inst.camera);
    });

    if (!prefersReduced.matches) {
      animId = requestAnimationFrame(render);
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      lastTime = 0;
    } else if (!prefersReduced.matches && !animId) {
      lastTime = 0;
      animId = requestAnimationFrame(render);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (prefersReduced.matches) {
    instances.forEach(inst => {
      inst.isVisible = true;
      inst.renderer.render(inst.scene, inst.camera);
    });
  } else {
    animId = requestAnimationFrame(render);
  }
}

function initSpaceStarfield() {
  const canvas = document.getElementById('space-starfield-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const starColors = ['#ffffff', '#bae6fd', '#fef08a', '#7dd3fc', '#c084fc', '#e0e7ff'];
  const starCount = Math.min(260, Math.floor((width * height) / 7500));
  const stars = [];

  for (let i = 0; i < starCount; i++) {
    const isBright = Math.random() < 0.12;
    const isMid = !isBright && Math.random() < 0.28;
    const layer = isBright ? 2 : (isMid ? 1 : 0);

    stars.push({
      x: Math.random(),
      y: Math.random(),
      size: isBright ? Math.random() * 0.9 + 1.8 : (isMid ? Math.random() * 0.6 + 1.1 : Math.random() * 0.5 + 0.5),
      baseAlpha: isBright ? Math.random() * 0.35 + 0.65 : (isMid ? Math.random() * 0.35 + 0.45 : Math.random() * 0.4 + 0.22),
      twinkleSpeed: Math.random() * 0.025 + 0.008,
      phase: Math.random() * Math.PI * 2,
      layer,
      hasSpike: isBright && Math.random() < 0.45,
      spikeLen: Math.random() * 5 + 6,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      driftX: (Math.random() - 0.5) * 0.00004,
      driftY: (Math.random() - 0.5) * 0.00003,
      shimmerPhase: Math.random() * Math.PI * 2,
      shimmerSpeed: Math.random() * 0.003 + 0.001
    });
  }

  const shootingStars = [];
  let lastShootingStarTime = 0;

  function spawnShootingStar(time) {
    if (shootingStars.length >= 2) return;
    if (time - lastShootingStarTime < 5000 + Math.random() * 6000) return;

    lastShootingStarTime = time;
    const startX = Math.random() * width * 0.85;
    const startY = Math.random() * (height * 0.4);
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
    const speed = Math.random() * 1.3 + 2.5;
    const length = Math.random() * 70 + 90;

    shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length,
      life: 1.0,
      decay: Math.random() * 0.0032 + 0.004
    });
  }

  let cachedScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    cachedScrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { passive: true });

  let animId = null;
  let lastTime = 0;

  function draw(time) {
    const curTime = time || performance.now();
    let deltaFactor = 1;
    if (!lastTime) {
      lastTime = curTime;
    } else {
      const dt = Math.min((curTime - lastTime) / 1000, 0.1);
      lastTime = curTime;
      deltaFactor = dt * 60;
    }

    ctx.clearRect(0, 0, width, height);

    spawnShootingStar(curTime);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const scrollFactor = s.layer === 2 ? 0.16 : (s.layer === 1 ? 0.09 : 0.04);
      const rawY = s.y * height - cachedScrollY * scrollFactor;
      const y = ((rawY % height) + height) % height;
      const x = s.x * width;

      s.phase += s.twinkleSpeed * deltaFactor;
      s.shimmerPhase += s.shimmerSpeed * deltaFactor;
      s.x += s.driftX * deltaFactor;
      s.y += s.driftY * deltaFactor;
      if (s.x < -0.02) s.x = 1.02;
      if (s.x > 1.02) s.x = -0.02;
      if (s.y < -0.02) s.y = 1.02;
      if (s.y > 1.02) s.y = -0.02;
      const shimmer = Math.sin(s.shimmerPhase) * 0.15;
      const currentAlpha = Math.max(0.08, Math.min(1, s.baseAlpha + Math.sin(s.phase) * 0.32 + shimmer));

      ctx.fillStyle = s.color;
      ctx.globalAlpha = currentAlpha;

      if (s.layer >= 1) {
        ctx.beginPath();
        ctx.arc(x, y, s.size * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fill();
        ctx.fillStyle = s.color;
      }

      ctx.beginPath();
      ctx.arc(x, y, s.size, 0, Math.PI * 2);
      ctx.fill();

      if (s.hasSpike) {
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (currentAlpha * 0.45) + ')';
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(x - s.spikeLen, y);
        ctx.lineTo(x + s.spikeLen, y);
        ctx.moveTo(x, y - s.spikeLen);
        ctx.lineTo(x, y + s.spikeLen);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += ss.vx * deltaFactor;
      ss.y += ss.vy * deltaFactor;
      ss.life -= ss.decay * deltaFactor;

      if (ss.life <= 0 || ss.x > width + 100 || ss.y > height + 100) {
        shootingStars.splice(i, 1);
        continue;
      }

      const tailX = ss.x - (ss.vx / Math.hypot(ss.vx, ss.vy)) * ss.length;
      const tailY = ss.y - (ss.vy / Math.hypot(ss.vx, ss.vy)) * ss.length;

      const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.65, 'rgba(56, 189, 248, ' + (ss.life * 0.5) + ')');
      grad.addColorStop(1, 'rgba(255, 255, 255, ' + ss.life + ')');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ss.x, ss.y);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!prefersReduced.matches) {
      animId = requestAnimationFrame(draw);
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      lastTime = 0;
    } else if (!prefersReduced.matches && !animId) {
      lastTime = 0;
      animId = requestAnimationFrame(draw);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (prefersReduced.matches) {
    draw(0);
  } else {
    animId = requestAnimationFrame(draw);
  }
}

function initDistantBlackHole() {
  const canvas = document.getElementById('black-hole-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const Rs = 28;     // Event horizon radius
  const Rph = 31.5;  // Photon sphere radius

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  let pitch = -0.32; // 3D vertical tilt (X-axis)
  let yaw = 0.0;     // 3D horizontal rotation (Y-axis)
  let spin = 0.0;    // Accretion disk matter rotation
  let velPitch = 0;
  let velYaw = 0;
  let isDragging = false;
  let prevPointerX = 0;
  let prevPointerY = 0;
  let animId = null;
  let isVisible = true;
  let lastTime = 0;

  const wrapper = document.getElementById('distant-black-hole-wrapper');
  const dragTarget = wrapper || canvas;

  dragTarget.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;
    velYaw = 0;
    velPitch = 0;
    try { dragTarget.setPointerCapture(e.pointerId); } catch (_) {}
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevPointerX;
    const dy = e.clientY - prevPointerY;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;

    velYaw = dx * 0.007;
    velPitch = dy * 0.007;
    yaw += velYaw;
    pitch = Math.max(-1.42, Math.min(1.42, pitch + velPitch));
  });

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try { dragTarget.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  const heroSection = document.getElementById('intro');
  if (heroSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId && !prefersReduced.matches) {
          lastTime = 0;
          animId = requestAnimationFrame(draw);
        }
      });
    }, { rootMargin: '150px 0px 150px 0px', threshold: 0 });
    observer.observe(heroSection);
  }

  const particleCount = 44;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const r = 36 + Math.random() * 66;
    particles.push({
      r,
      phi: Math.random() * Math.PI * 2,
      speed: 0.005 + ((105 - r) / 70) * 0.010,
      size: Math.random() * 1.6 + 1.1,
      isHot: Math.random() > 0.4
    });
  }

  function draw(time) {
    if (!isVisible) {
      lastTime = 0;
      if (!prefersReduced.matches) animId = requestAnimationFrame(draw);
      return;
    }

    const curTime = time || performance.now();
    let deltaFactor = 1;
    if (!lastTime) {
      lastTime = curTime;
    } else {
      const dt = Math.min((curTime - lastTime) / 1000, 0.1);
      lastTime = curTime;
      deltaFactor = dt * 60;
    }

    ctx.clearRect(0, 0, width, height);

    // Continuous celestial rotation and inertial momentum decay
    yaw += (0.0015 + velYaw) * deltaFactor;
    pitch = Math.max(-1.42, Math.min(1.42, pitch + velPitch));
    velYaw *= Math.pow(0.94, deltaFactor);
    velPitch *= Math.pow(0.94, deltaFactor);
    spin += 0.006 * deltaFactor;

    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const absCosP = Math.max(0.08, Math.abs(cosP));
    const signCosP = Math.sign(cosP) || 1;

    // 1. Spacetime Curvature Haze (Gravitational Lens Corona)
    const pulse = Math.sin(spin * 2) * 0.04;
    const bgGlow = ctx.createRadialGradient(cx, cy, Rs * 0.6, cx, cy, 124);
    bgGlow.addColorStop(0, `rgba(245, 158, 11, ${0.32 + pulse})`);
    bgGlow.addColorStop(0.35, 'rgba(217, 119, 6, 0.20)');
    bgGlow.addColorStop(0.65, 'rgba(168, 85, 247, 0.12)');
    bgGlow.addColorStop(0.85, 'rgba(56, 189, 248, 0.04)');
    bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    // 2. Gravitational Deflection Rings (Einstein Background Space Warping)
    ctx.save();
    ctx.translate(cx, cy);
    for (let g = 0; g < 3; g++) {
      const gRadius = Rs * 1.55 + g * 12;
      const gAlpha = (0.18 - g * 0.04) * (1 + Math.sin(spin * 1.5 + g) * 0.2);
      ctx.beginPath();
      ctx.arc(0, 0, gRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251, 191, 36, ${gAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();

    // 3. PHYSICAL ACCRETION DISK GEOMETRY & CONTINUOUS RELATIVISTIC DOPPLER BEAMING
    const tilt = Math.max(0.12, Math.abs(cosP));
    const signP = pitch <= 0 ? 1 : -1;
    const streamCount = 16;
    const stepCount = 36;
    const Rin = 36;
    const Rout = 94;

    // Helper to generate a luminous, incandescent relativistic Doppler gradient
    // Approaching flank (Left) is brilliant white-hot, receding flank (Right) is warm glowing gold
    // Fully illuminated all the way around with minimum alpha >= 0.70 (no dark half)
    function createDiskGradient(x1, x2, baseAlpha = 1.0) {
      const grad = ctx.createLinearGradient(x1, cy, x2, cy);
      grad.addColorStop(0.00, `rgba(255, 255, 255, ${0.98 * baseAlpha})`);
      grad.addColorStop(0.12, `rgba(254, 240, 138, ${0.94 * baseAlpha})`);
      grad.addColorStop(0.28, `rgba(251, 191, 36, ${0.90 * baseAlpha})`);
      grad.addColorStop(0.50, `rgba(245, 158, 11, ${0.86 * baseAlpha})`);
      grad.addColorStop(0.70, `rgba(234, 88, 12, ${0.82 * baseAlpha})`);
      grad.addColorStop(0.86, `rgba(245, 158, 11, ${0.78 * baseAlpha})`);
      grad.addColorStop(0.96, `rgba(253, 224, 71, ${0.74 * baseAlpha})`);
      grad.addColorStop(1.00, `rgba(254, 240, 138, ${0.70 * baseAlpha})`);
      return grad;
    }

    // 3a. Volumetric Upper Arch Gas Cloud (Smooth Incandescent Base)
    ctx.beginPath();
    for (let s = 0; s <= stepCount; s++) {
      const t = -1 + (s / stepCount) * 2;
      const x = cx + Rout * t;
      const sinT = Math.sqrt(Math.max(0, 1 - t * t));
      const archOffset = (Rs + (Rout - Rin) * 0.52 * tilt + (Rout - Rs) * 0.28) * sinT;
      const y = cy - archOffset * signP;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let s = stepCount; s >= 0; s--) {
      const t = -1 + (s / stepCount) * 2;
      const x = cx + Rin * t;
      const sinT = Math.sqrt(Math.max(0, 1 - t * t));
      const archOffset = (Rs + 2.5) * sinT;
      const y = cy - archOffset * signP;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    const archFillGrad = ctx.createRadialGradient(cx, cy - (Rs + 18) * signP, 5, cx, cy, Rout);
    archFillGrad.addColorStop(0, 'rgba(254, 240, 138, 0.32)');
    archFillGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.22)');
    archFillGrad.addColorStop(0.75, 'rgba(234, 88, 12, 0.12)');
    archFillGrad.addColorStop(1, 'rgba(168, 85, 247, 0.03)');
    ctx.fillStyle = archFillGrad;
    ctx.fill();

    // 3b. Glowing Magnetic Filament Streams (Upper Lensed Arch)
    for (let i = 0; i < streamCount; i++) {
      const fr = i / (streamCount - 1);
      const r = Rin + fr * (Rout - Rin);

      ctx.beginPath();
      for (let s = 0; s <= stepCount; s++) {
        const t = -1 + (s / stepCount) * 2;
        const x = cx + r * t;
        const sinT = Math.sqrt(Math.max(0, 1 - t * t));

        const theta = Math.acos(Math.max(-1, Math.min(1, t)));
        const orbitPhase = theta + spin * Math.sqrt(Rout / r) * 1.5 - yaw;
        const ripple = Math.sin(orbitPhase * 3) * 0.9 * sinT;

        const archOffset = (Rs + (r - Rin) * 0.52 * tilt + (r - Rs) * 0.28 + ripple) * sinT;
        const y = cy - archOffset * signP;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = createDiskGradient(cx - r, cx + r, 1.0 - fr * 0.25);
      ctx.lineWidth = 2.4 - fr * 1.0;
      ctx.stroke();
    }

    // 3c. Lower Lensed Arc (Secondary Einstein Arc under the Event Horizon)
    for (let i = 0; i < streamCount; i += 2) {
      const fr = i / (streamCount - 1);
      const r = Rin + fr * (Rout - Rin);

      ctx.beginPath();
      for (let s = 0; s <= stepCount; s++) {
        const t = -1 + (s / stepCount) * 2;
        const x = cx + r * t;
        const sinT = Math.sqrt(Math.max(0, 1 - t * t));
        const botOffset = (Rs + (r - Rin) * 0.16 * tilt + 3.2) * sinT;
        const y = cy + botOffset * signP;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const dopGradBot = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      dopGradBot.addColorStop(0.00, 'rgba(254, 240, 138, 0.85)');
      dopGradBot.addColorStop(0.25, 'rgba(251, 191, 36, 0.78)');
      dopGradBot.addColorStop(0.50, 'rgba(245, 158, 11, 0.74)');
      dopGradBot.addColorStop(0.75, 'rgba(234, 88, 12, 0.70)');
      dopGradBot.addColorStop(1.00, 'rgba(251, 191, 36, 0.65)');

      ctx.strokeStyle = dopGradBot;
      ctx.lineWidth = 1.6 - fr * 0.6;
      ctx.stroke();
    }

    // 4. Infalling Matter Particles (Rear Hemisphere)
    particles.forEach(p => {
      p.phi += p.speed * deltaFactor;
      p.r -= 0.012 * deltaFactor;
      if (p.r < Rs) {
        p.r = Rout + Math.random() * 8;
        p.phi = Math.random() * Math.PI * 2;
        p.speed = 0.005 + ((Rout - p.r) / (Rout - Rs)) * 0.010;
      }

      const u = p.phi + spin;
      const alpha = u - yaw;
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);
      const zCam = p.r * sinA * cosP;

      if (zCam < 0) {
        const sinT = Math.sqrt(Math.max(0, 1 - Math.min(1, cosA * cosA)));
        const archOffset = (Rs + (p.r - Rin) * 0.52 * tilt + (p.r - Rs) * 0.28) * sinT;
        const px = cx + p.r * cosA;
        const py = cy - archOffset * signP;

        const isLeft = cosA < 0;
        const color = isLeft
          ? (p.isHot ? 'rgba(255, 255, 255, 0.95)' : 'rgba(254, 240, 138, 0.92)')
          : (p.isHot ? 'rgba(251, 191, 36, 0.88)' : 'rgba(245, 158, 11, 0.82)');

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. EVENT HORIZON SHADOW (Absolute Singularity Void)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, Rs, 0, Math.PI * 2);
    ctx.fill();

    // 6. THE PHOTON SPHERE / EINSTEIN RING (Unstable Orbit Circular Halo encircling all 360 degrees)
    const ringPulse = Math.sin(spin * 3) * 0.12;

    // Outer soft luminous bloom
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
    ctx.lineWidth = 3.6;
    ctx.shadowBlur = 15 + ringPulse * 4;
    ctx.shadowColor = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy, Rph, 0, Math.PI * 2);
    ctx.stroke();

    // Razor-sharp electric white core beam
    ctx.strokeStyle = '#fffbeb';
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, Rph, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 7a. Volumetric Front Accretion Disk Base (Smooth Glowing Sheet in Foreground)
    ctx.beginPath();
    for (let s = 0; s <= stepCount; s++) {
      const t = -1 + (s / stepCount) * 2;
      const x = cx + Rout * t;
      const sinT = Math.sqrt(Math.max(0, 1 - t * t));
      const y = cy + Rout * sinT * (-sinP);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let s = stepCount; s >= 0; s--) {
      const t = -1 + (s / stepCount) * 2;
      const x = cx + Rin * t;
      const sinT = Math.sqrt(Math.max(0, 1 - t * t));
      const y = cy + Rin * sinT * (-sinP);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    const frontFillGrad = ctx.createRadialGradient(cx, cy + (Rin + 12) * (-sinP), 4, cx, cy, Rout);
    frontFillGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    frontFillGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.24)');
    frontFillGrad.addColorStop(0.7, 'rgba(234, 88, 12, 0.14)');
    frontFillGrad.addColorStop(1, 'rgba(168, 85, 247, 0.04)');
    ctx.fillStyle = frontFillGrad;
    ctx.fill();

    // 7b. Front Filament Streams (Sweeping Across the Front of the Shadow)
    for (let i = 0; i < streamCount; i++) {
      const fr = i / (streamCount - 1);
      const r = Rin + fr * (Rout - Rin);

      ctx.beginPath();
      for (let s = 0; s <= stepCount; s++) {
        const t = -1 + (s / stepCount) * 2;
        const x = cx + r * t;
        const sinT = Math.sqrt(Math.max(0, 1 - t * t));

        const theta = Math.acos(Math.max(-1, Math.min(1, t)));
        const orbitPhase = theta + spin * Math.sqrt(Rout / r) * 1.5 - yaw;
        const ripple = Math.sin(orbitPhase * 3) * 0.8 * sinT;

        const y = cy + (r * sinT + ripple) * (-sinP);

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = createDiskGradient(cx - r, cx + r, 1.0 - fr * 0.2);
      ctx.lineWidth = 2.6 - fr * 1.0;
      ctx.stroke();
    }

    // 8. Infalling Matter Particles (Front Hemisphere)
    particles.forEach(p => {
      const u = p.phi + spin;
      const alpha = u - yaw;
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);
      const zCam = p.r * sinA * cosP;

      if (zCam >= 0) {
        const px = cx + p.r * cosA;
        const py = cy + p.r * Math.abs(sinA) * (-sinP);

        const isLeft = cosA < 0;
        const color = isLeft
          ? (p.isHot ? 'rgba(255, 255, 255, 0.98)' : 'rgba(254, 240, 138, 0.94)')
          : (p.isHot ? 'rgba(251, 191, 36, 0.90)' : 'rgba(245, 158, 11, 0.86)');

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.95, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (!prefersReduced.matches) {
      animId = requestAnimationFrame(draw);
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      lastTime = 0;
    } else if (!prefersReduced.matches && !animId) {
      lastTime = 0;
      animId = requestAnimationFrame(draw);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (prefersReduced.matches) {
    draw(0);
  } else {
    animId = requestAnimationFrame(draw);
  }
}

function initMassiveBlackHole() {
  const canvas = document.getElementById('massive-bh-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const Rs = 44;     // Supermassive event horizon radius
  const Rph = 48.5;  // Photon sphere radius

  let isVisible = false;
  let animId = null;
  let lastTime = 0;
  let pitch = -0.34; // 3D vertical tilt (X-axis)
  let yaw = 0.0;     // 3D horizontal rotation (Y-axis)
  let spin = 0.0;    // Matter accretion rotation
  let velPitch = 0;
  let velYaw = 0;
  let isDragging = false;
  let prevPointerX = 0;
  let prevPointerY = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const wrapper = document.getElementById('massive-black-hole-wrapper');
  const dragTarget = wrapper || canvas;

  dragTarget.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;
    velYaw = 0;
    velPitch = 0;
    try { dragTarget.setPointerCapture(e.pointerId); } catch (_) {}
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevPointerX;
    const dy = e.clientY - prevPointerY;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;

    velYaw = dx * 0.005;
    velPitch = dy * 0.005;
    yaw += velYaw;
    pitch = Math.max(-1.42, Math.min(1.42, pitch + velPitch));
  });

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try { dragTarget.releasePointerCapture(e.pointerId); } catch (_) {}
  };

  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  const particles = [];
  const pCount = 55;
  for (let i = 0; i < pCount; i++) {
    const r = 52 + Math.random() * 115;
    particles.push({
      r,
      phi: Math.random() * Math.PI * 2,
      speed: 0.004 + ((170 - r) / 120) * 0.010,
      size: 1.3 + Math.random() * 2.2,
      isHot: Math.random() > 0.45
    });
  }

  const section = document.getElementById('skills');
  if (section) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId && !prefersReduced.matches) {
          lastTime = 0;
          animId = requestAnimationFrame(draw);
        }
      });
    }, { rootMargin: '100px 0px 100px 0px' });
    observer.observe(section);
  } else {
    isVisible = true;
  }

  function draw(time) {
    if (!isVisible) {
      lastTime = 0;
      if (!prefersReduced.matches) animId = requestAnimationFrame(draw);
      return;
    }

    const curTime = time || performance.now();
    let deltaFactor = 1;
    if (!lastTime) {
      lastTime = curTime;
    } else {
      const dt = Math.min((curTime - lastTime) / 1000, 0.1);
      lastTime = curTime;
      deltaFactor = dt * 60;
    }

    ctx.clearRect(0, 0, width, height);

    // Apply continuous celestial rotation + inertial momentum decay
    yaw += (0.0012 + velYaw) * deltaFactor;
    pitch = Math.max(-1.42, Math.min(1.42, pitch + velPitch));
    velYaw *= Math.pow(0.94, deltaFactor);
    velPitch *= Math.pow(0.94, deltaFactor);
    spin += 0.006 * deltaFactor;

    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const absCosP = Math.max(0.08, Math.abs(cosP));
    const signCosP = Math.sign(cosP) || 1;

    // 1. Gargantuan Spacetime Curvature Glow (Deep Ultraviolet & Fiery Amber)
    const pulse = Math.sin(spin * 2) * 0.04;
    const bgGlow = ctx.createRadialGradient(cx, cy, Rs * 0.6, cx, cy, 200);
    bgGlow.addColorStop(0, `rgba(168, 85, 247, ${0.34 + pulse})`);
    bgGlow.addColorStop(0.35, 'rgba(245, 158, 11, 0.22)');
    bgGlow.addColorStop(0.65, 'rgba(126, 34, 206, 0.12)');
    bgGlow.addColorStop(0.9, 'rgba(56, 189, 248, 0.04)');
    bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    // 2. Gravitational Deflection Rings (Background Spacetime Warping)
    ctx.save();
    ctx.translate(cx, cy);
    for (let g = 0; g < 4; g++) {
      const gRadius = Rs * 1.55 + g * 18;
      const gAlpha = (0.20 - g * 0.04) * (1 + Math.sin(spin * 1.5 + g) * 0.2);
      ctx.beginPath();
      ctx.arc(0, 0, gRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168, 85, 247, ${gAlpha})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();

    // 3. PHYSICAL ACCRETION DISK GEOMETRY & FULL 360° INCANDESCENT BEAMING
    const tilt = Math.max(0.12, Math.abs(cosP));
    const signP = pitch <= 0 ? 1 : -1;
    const streamCount = 22;
    const stepCount = 42;
    const Rin = 64;
    const Rout = 168;

    // Luminous relativistic Doppler gradient across full disk diameter (no dark half)
    function createDiskGradient(x1, x2, baseAlpha = 1.0) {
      const grad = ctx.createLinearGradient(x1, cy, x2, cy);
      grad.addColorStop(0.00, `rgba(255, 255, 255, ${0.98 * baseAlpha})`);
      grad.addColorStop(0.12, `rgba(254, 240, 138, ${0.95 * baseAlpha})`);
      grad.addColorStop(0.28, `rgba(251, 191, 36, ${0.90 * baseAlpha})`);
      grad.addColorStop(0.50, `rgba(245, 158, 11, ${0.86 * baseAlpha})`);
      grad.addColorStop(0.70, `rgba(234, 88, 12, ${0.82 * baseAlpha})`);
      grad.addColorStop(0.86, `rgba(245, 158, 11, ${0.78 * baseAlpha})`);
      grad.addColorStop(0.96, `rgba(253, 224, 71, ${0.74 * baseAlpha})`);
      grad.addColorStop(1.00, `rgba(254, 240, 138, ${0.70 * baseAlpha})`);
      return grad;
    }

    // 3a. Volumetric Upper Arch Gas Cloud (Smooth Glowing Base)
    ctx.beginPath();
    for (let s = 0; s <= stepCount; s++) {
      const t = -1 + (s / stepCount) * 2;
      const x = cx + Rout * t;
      const sinT = Math.sqrt(Math.max(0, 1 - t * t));
      const archOffset = (Rs + (Rout - Rin) * 0.52 * tilt + (Rout - Rs) * 0.28) * sinT;
      const y = cy - archOffset * signP;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let s = stepCount; s >= 0; s--) {
      const t = -1 + (s / stepCount) * 2;
      const x = cx + Rin * t;
      const sinT = Math.sqrt(Math.max(0, 1 - t * t));
      const archOffset = (Rs + 4.0) * sinT;
      const y = cy - archOffset * signP;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    const archFillGrad = ctx.createRadialGradient(cx, cy - (Rs + 32) * signP, 8, cx, cy, Rout);
    archFillGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    archFillGrad.addColorStop(0.38, 'rgba(245, 158, 11, 0.24)');
    archFillGrad.addColorStop(0.72, 'rgba(234, 88, 12, 0.14)');
    archFillGrad.addColorStop(1, 'rgba(168, 85, 247, 0.04)');
    ctx.fillStyle = archFillGrad;
    ctx.fill();

    // 3b. Glowing Magnetic Filament Streams (Upper Lensed Arch)
    for (let i = 0; i < streamCount; i++) {
      const fr = i / (streamCount - 1);
      const r = Rin + fr * (Rout - Rin);

      ctx.beginPath();
      for (let s = 0; s <= stepCount; s++) {
        const t = -1 + (s / stepCount) * 2;
        const x = cx + r * t;
        const sinT = Math.sqrt(Math.max(0, 1 - t * t));

        const theta = Math.acos(Math.max(-1, Math.min(1, t)));
        const orbitPhase = theta + spin * Math.sqrt(Rout / r) * 1.5 - yaw;
        const ripple = Math.sin(orbitPhase * 3) * 1.4 * sinT;

        const archOffset = (Rs + (r - Rin) * 0.52 * tilt + (r - Rs) * 0.28 + ripple) * sinT;
        const y = cy - archOffset * signP;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = createDiskGradient(cx - r, cx + r, 1.0 - fr * 0.25);
      ctx.lineWidth = 3.2 - fr * 1.4;
      ctx.stroke();
    }

    // 3c. Lower Lensed Arc (Secondary Einstein Arc under the Event Horizon)
    for (let i = 0; i < streamCount; i += 2) {
      const fr = i / (streamCount - 1);
      const r = Rin + fr * (Rout - Rin);

      ctx.beginPath();
      for (let s = 0; s <= stepCount; s++) {
        const t = -1 + (s / stepCount) * 2;
        const x = cx + r * t;
        const sinT = Math.sqrt(Math.max(0, 1 - t * t));
        const botOffset = (Rs + (r - Rin) * 0.16 * tilt + 4.5) * sinT;
        const y = cy + botOffset * signP;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const dopGradBot = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      dopGradBot.addColorStop(0.00, 'rgba(254, 240, 138, 0.85)');
      dopGradBot.addColorStop(0.25, 'rgba(251, 191, 36, 0.78)');
      dopGradBot.addColorStop(0.50, 'rgba(245, 158, 11, 0.74)');
      dopGradBot.addColorStop(0.75, 'rgba(234, 88, 12, 0.70)');
      dopGradBot.addColorStop(1.00, 'rgba(251, 191, 36, 0.65)');

      ctx.strokeStyle = dopGradBot;
      ctx.lineWidth = 2.0 - fr * 0.8;
      ctx.stroke();
    }

    // 4. Infalling Matter Particles (Rear Hemisphere)
    particles.forEach(p => {
      p.phi += p.speed * deltaFactor;
      p.r -= 0.014 * deltaFactor;
      if (p.r < Rs) {
        p.r = Rout + Math.random() * 12;
        p.phi = Math.random() * Math.PI * 2;
        p.speed = 0.004 + ((Rout - p.r) / (Rout - Rs)) * 0.010;
      }

      const u = p.phi + spin;
      const alpha = u - yaw;
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);
      const zCam = p.r * sinA * cosP;

      if (zCam < 0) {
        const sinT = Math.sqrt(Math.max(0, 1 - Math.min(1, cosA * cosA)));
        const archOffset = (Rs + (p.r - Rin) * 0.52 * tilt + (p.r - Rs) * 0.28) * sinT;
        const px = cx + p.r * cosA;
        const py = cy - archOffset * signP;

        const isLeft = cosA < 0;
        const color = isLeft
          ? (p.isHot ? 'rgba(255, 255, 255, 0.95)' : 'rgba(254, 240, 138, 0.92)')
          : (p.isHot ? 'rgba(251, 191, 36, 0.88)' : 'rgba(245, 158, 11, 0.82)');

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. SUPERMASSIVE EVENT HORIZON SHADOW (Absolute Singularity Void)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, Rs, 0, Math.PI * 2);
    ctx.fill();

    // 6. THE SUPERMASSIVE PHOTON SPHERE / EINSTEIN RING (Unstable Orbit Circular Halo around 360 degrees)
    const ringPulse = Math.sin(spin * 3) * 0.14;

    // Outer luminous bloom
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.70)';
    ctx.lineWidth = 4.4;
    ctx.shadowBlur = 20 + ringPulse * 5;
    ctx.shadowColor = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy, Rph, 0, Math.PI * 2);
    ctx.stroke();

    // Razor-sharp electric white core beam
    ctx.strokeStyle = '#fffbeb';
    ctx.lineWidth = 2.2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, Rph, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 7a. Volumetric Front Accretion Disk Base (Smooth Glowing Sheet in Foreground)
    ctx.beginPath();
    for (let s = 0; s <= stepCount; s++) {
      const t = -1 + (s / stepCount) * 2;
      const x = cx + Rout * t;
      const sinT = Math.sqrt(Math.max(0, 1 - t * t));
      const y = cy + Rout * sinT * (-sinP);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let s = stepCount; s >= 0; s--) {
      const t = -1 + (s / stepCount) * 2;
      const x = cx + Rin * t;
      const sinT = Math.sqrt(Math.max(0, 1 - t * t));
      const y = cy + Rin * sinT * (-sinP);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    const frontFillGrad = ctx.createRadialGradient(cx, cy + (Rin + 20) * (-sinP), 6, cx, cy, Rout);
    frontFillGrad.addColorStop(0, 'rgba(254, 240, 138, 0.38)');
    frontFillGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.26)');
    frontFillGrad.addColorStop(0.7, 'rgba(234, 88, 12, 0.15)');
    frontFillGrad.addColorStop(1, 'rgba(168, 85, 247, 0.04)');
    ctx.fillStyle = frontFillGrad;
    ctx.fill();

    // 7b. Front Filament Streams (Sweeping Across the Front of the Shadow)
    for (let i = 0; i < streamCount; i++) {
      const fr = i / (streamCount - 1);
      const r = Rin + fr * (Rout - Rin);

      ctx.beginPath();
      for (let s = 0; s <= stepCount; s++) {
        const t = -1 + (s / stepCount) * 2;
        const x = cx + r * t;
        const sinT = Math.sqrt(Math.max(0, 1 - t * t));

        const theta = Math.acos(Math.max(-1, Math.min(1, t)));
        const orbitPhase = theta + spin * Math.sqrt(Rout / r) * 1.5 - yaw;
        const ripple = Math.sin(orbitPhase * 3) * 1.2 * sinT;

        const y = cy + (r * sinT + ripple) * (-sinP);

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = createDiskGradient(cx - r, cx + r, 1.0 - fr * 0.2);
      ctx.lineWidth = 3.4 - fr * 1.4;
      ctx.stroke();
    }

    // 8. Infalling Matter Particles (Front Hemisphere)
    particles.forEach(p => {
      const u = p.phi + spin;
      const alpha = u - yaw;
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);
      const zCam = p.r * sinA * cosP;

      if (zCam >= 0) {
        const px = cx + p.r * cosA;
        const py = cy + p.r * Math.abs(sinA) * (-sinP);

        const isLeft = cosA < 0;
        const color = isLeft
          ? (p.isHot ? 'rgba(255, 255, 255, 0.98)' : 'rgba(254, 240, 138, 0.94)')
          : (p.isHot ? 'rgba(251, 191, 36, 0.90)' : 'rgba(245, 158, 11, 0.86)');

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.95, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (!prefersReduced.matches) {
      animId = requestAnimationFrame(draw);
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      lastTime = 0;
    } else if (!prefersReduced.matches && !animId) {
      lastTime = 0;
      animId = requestAnimationFrame(draw);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (prefersReduced.matches) {
    draw(0);
  } else {
    animId = requestAnimationFrame(draw);
  }
}

function initStellarSun() {
  const canvas = document.getElementById('stellar-sun-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const sunRadius = 34; // Scaled down for distant astronomical perspective

  let isVisible = false;
  let animId = null;
  let lastTime = 0;
  let timeCount = 0;
  let mouseParallaxX = 0;
  let mouseParallaxY = 0;
  let targetParallaxX = 0;
  let targetParallaxY = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Deep space parallax (low displacement factor reinforces immense cosmic distance)
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    targetParallaxX = nx * 8;
    targetParallaxY = ny * 6;
  }, { passive: true });

  // Solar wind embers
  const embers = [];
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = sunRadius + Math.random() * 60;
    embers.push({
      angle,
      dist,
      speed: 0.2 + Math.random() * 0.45,
      size: 0.8 + Math.random() * 1.6,
      maxDist: sunRadius + 40 + Math.random() * 50,
      alpha: Math.random()
    });
  }

  // Graceful magnetic prominence arc loops
  const prominences = [
    { baseAngle: 0.6, span: 0.38, height: 16, speed: 0.8 },
    { baseAngle: 2.1, span: 0.32, height: 20, speed: 1.1 },
    { baseAngle: 3.7, span: 0.42, height: 18, speed: 0.9 },
    { baseAngle: 5.2, span: 0.34, height: 22, speed: 1.2 }
  ];

  const section = document.getElementById('certificates');
  if (section) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId && !prefersReduced.matches) {
          lastTime = 0;
          animId = requestAnimationFrame(draw);
        }
      });
    }, { rootMargin: '100px 0px 100px 0px' });
    observer.observe(section);
  } else {
    isVisible = true;
  }

  function draw(time) {
    if (!isVisible) {
      lastTime = 0;
      if (!prefersReduced.matches) animId = requestAnimationFrame(draw);
      return;
    }

    const curTime = time || performance.now();
    let deltaFactor = 1;
    if (!lastTime) {
      lastTime = curTime;
    } else {
      const dt = Math.min((curTime - lastTime) / 1000, 0.1);
      lastTime = curTime;
      deltaFactor = dt * 60;
    }

    timeCount += 0.015 * deltaFactor;
    mouseParallaxX += (targetParallaxX - mouseParallaxX) * 0.04 * deltaFactor;
    mouseParallaxY += (targetParallaxY - mouseParallaxY) * 0.04 * deltaFactor;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(cx + mouseParallaxX, cy + mouseParallaxY);

    // 1. Distant Atmospheric Corona (Soft Continuous Gaussian Gradients)
    const pulse1 = Math.sin(timeCount * 1.5) * 0.04;
    const pulse2 = Math.cos(timeCount * 2.1) * 0.03;
    const coronaGrad = ctx.createRadialGradient(0, 0, sunRadius * 0.6, 0, 0, 115);
    coronaGrad.addColorStop(0, `rgba(254, 240, 138, ${0.48 + pulse1})`);
    coronaGrad.addColorStop(0.3, `rgba(245, 158, 11, ${0.26 + pulse2})`);
    coronaGrad.addColorStop(0.55, 'rgba(234, 88, 12, 0.12)');
    coronaGrad.addColorStop(0.8, 'rgba(185, 28, 28, 0.04)');
    coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coronaGrad;
    ctx.fillRect(-cx, -cy, width, height);

    // 2. Soft Coronal Plasma Streamers (Feathered Radial Blends)
    const rayCount = 14;
    for (let i = 0; i < rayCount; i++) {
      const rayAngle = (i / rayCount) * Math.PI * 2 + timeCount * 0.06;
      const rayLen = sunRadius + 28 + Math.sin(timeCount * 1.8 + i * 1.3) * 14;
      const rayGrad = ctx.createLinearGradient(
        Math.cos(rayAngle) * sunRadius,
        Math.sin(rayAngle) * sunRadius,
        Math.cos(rayAngle) * rayLen,
        Math.sin(rayAngle) * rayLen
      );
      rayGrad.addColorStop(0, 'rgba(253, 224, 71, 0.35)');
      rayGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
      rayGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, rayLen, rayAngle - 0.05, rayAngle + 0.05);
      ctx.closePath();
      ctx.fillStyle = rayGrad;
      ctx.fill();
    }

    // 3. Magnetic Prominences (Thin Glowing Corona Loops)
    prominences.forEach(p => {
      const pAngle = p.baseAngle + Math.sin(timeCount * 0.25 * p.speed) * 0.06;
      const loopH = p.height + Math.sin(timeCount * 1.6 * p.speed) * 5;
      const startX = Math.cos(pAngle) * (sunRadius - 1);
      const startY = Math.sin(pAngle) * (sunRadius - 1);
      const endX = Math.cos(pAngle + p.span) * (sunRadius - 1);
      const endY = Math.sin(pAngle + p.span) * (sunRadius - 1);
      const midAngle = pAngle + p.span * 0.5;
      const ctrlX = Math.cos(midAngle) * (sunRadius + loopH);
      const ctrlY = Math.sin(midAngle) * (sunRadius + loopH);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ea580c';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.lineWidth = 3.2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // 4. Photosphere Base (Deep Continuous Fusion Core Gradient)
    const sunCoreGrad = ctx.createRadialGradient(
      -sunRadius * 0.18,
      -sunRadius * 0.18,
      2,
      0,
      0,
      sunRadius
    );
    sunCoreGrad.addColorStop(0, '#ffffff');
    sunCoreGrad.addColorStop(0.2, '#fef08a');
    sunCoreGrad.addColorStop(0.48, '#f59e0b');
    sunCoreGrad.addColorStop(0.76, '#ea580c');
    sunCoreGrad.addColorStop(0.92, '#c2410c');
    sunCoreGrad.addColorStop(1, '#991b1b');

    ctx.fillStyle = sunCoreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // 5. NATURAL ORGANIC SOLAR CONVECTION (Zero Grid / Zero Pixels)
    // Silky smooth, continuous overlapping convective plasma waves
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, sunRadius - 0.5, 0, Math.PI * 2);
    ctx.clip();

    // Convective plasma wave 1 (Warm gold breathing eddy)
    const w1X = Math.sin(timeCount * 0.8) * (sunRadius * 0.28);
    const w1Y = Math.cos(timeCount * 0.6) * (sunRadius * 0.24);
    const grad1 = ctx.createRadialGradient(w1X, w1Y, 1, w1X, w1Y, sunRadius * 0.85);
    grad1.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
    grad1.addColorStop(0.45, 'rgba(254, 240, 138, 0.18)');
    grad1.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.arc(0, 0, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Convective plasma wave 2 (Radiant amber counter-swirl)
    const w2X = -Math.cos(timeCount * 0.7) * (sunRadius * 0.26);
    const w2Y = Math.sin(timeCount * 0.85) * (sunRadius * 0.22);
    const grad2 = ctx.createRadialGradient(w2X, w2Y, 2, w2X, w2Y, sunRadius * 0.7);
    grad2.addColorStop(0, 'rgba(254, 240, 138, 0.32)');
    grad2.addColorStop(0.5, 'rgba(245, 158, 11, 0.16)');
    grad2.addColorStop(1, 'rgba(153, 27, 27, 0)');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(0, 0, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Convective plasma wave 3 (Center fusion pulsation)
    const corePulse = Math.sin(timeCount * 2) * (sunRadius * 0.08);
    const grad3 = ctx.createRadialGradient(0, 0, 0, 0, 0, sunRadius * 0.45 + corePulse);
    grad3.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    grad3.addColorStop(0.6, 'rgba(254, 240, 138, 0.15)');
    grad3.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = grad3;
    ctx.beginPath();
    ctx.arc(0, 0, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 6. Smooth Solar Limb Halo
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
    ctx.lineWidth = 1.6;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, sunRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 7. Subtle Distant Solar Wind Embers
    embers.forEach(e => {
      e.dist += e.speed * deltaFactor;
      e.alpha = 1 - (e.dist - sunRadius) / (e.maxDist - sunRadius);
      if (e.dist > e.maxDist || e.alpha <= 0) {
        e.dist = sunRadius + 2;
        e.angle = Math.random() * Math.PI * 2;
        e.alpha = 0.85;
      }
      const ex = Math.cos(e.angle) * e.dist;
      const ey = Math.sin(e.angle) * e.dist;
      ctx.fillStyle = `rgba(253, 224, 71, ${Math.max(0, e.alpha * 0.8)})`;
      ctx.beginPath();
      ctx.arc(ex, ey, e.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    if (!prefersReduced.matches) {
      animId = requestAnimationFrame(draw);
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      lastTime = 0;
    } else if (!prefersReduced.matches && !animId) {
      lastTime = 0;
      animId = requestAnimationFrame(draw);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (prefersReduced.matches) {
    draw(0);
  } else {
    animId = requestAnimationFrame(draw);
  }
}

function initHeroGasCloud() {
  const canvas = document.getElementById('gas-cloud-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;

  let isVisible = false;
  let animId = null;
  let lastTime = 0;
  let timeCount = 0;
  let mouseParallaxX = 0;
  let mouseParallaxY = 0;
  let targetParallaxX = 0;
  let targetParallaxY = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    targetParallaxX = nx * 12;
    targetParallaxY = ny * 8;
  }, { passive: true });

  const lobes = [
    { ox: -65, oy: -15, rx: 110, ry: 75, angle: 0.2, color: 'rgba(34, 211, 238, 0.15)', speed: 0.7 },
    { ox: 45, oy: -25, rx: 125, ry: 80, angle: -0.3, color: 'rgba(45, 212, 191, 0.16)', speed: 0.9 },
    { ox: 10, oy: 28, rx: 140, ry: 85, angle: 0.15, color: 'rgba(99, 102, 241, 0.14)', speed: 0.6 },
    { ox: -30, oy: 15, rx: 95, ry: 60, angle: -0.1, color: 'rgba(168, 85, 247, 0.12)', speed: 1.1 },
    { ox: 75, oy: 10, rx: 85, ry: 55, angle: 0.35, color: 'rgba(56, 189, 248, 0.15)', speed: 0.8 },
    { ox: -10, oy: -40, rx: 75, ry: 48, angle: -0.25, color: 'rgba(217, 70, 239, 0.08)', speed: 1.0 }
  ];

  const dustParticles = [];
  for (let i = 0; i < 28; i++) {
    dustParticles.push({
      x: cx + (Math.random() - 0.5) * 260,
      y: cy + (Math.random() - 0.5) * 160,
      size: 0.7 + Math.random() * 1.5,
      twinkleSpeed: 0.8 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.08,
      driftY: (Math.random() - 0.5) * 0.06
    });
  }

  const section = document.getElementById('intro');
  if (section) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId && !prefersReduced.matches) {
          lastTime = 0;
          animId = requestAnimationFrame(draw);
        }
      });
    }, { rootMargin: '100px 0px 100px 0px' });
    observer.observe(section);
  } else {
    isVisible = true;
  }

  function draw(time) {
    if (!isVisible) {
      lastTime = 0;
      if (!prefersReduced.matches) animId = requestAnimationFrame(draw);
      return;
    }

    const curTime = time || performance.now();
    let deltaFactor = 1;
    if (!lastTime) {
      lastTime = curTime;
    } else {
      const dt = Math.min((curTime - lastTime) / 1000, 0.1);
      lastTime = curTime;
      deltaFactor = dt * 60;
    }

    timeCount += 0.008 * deltaFactor;
    mouseParallaxX += (targetParallaxX - mouseParallaxX) * 0.05 * deltaFactor;
    mouseParallaxY += (targetParallaxY - mouseParallaxY) * 0.05 * deltaFactor;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(cx + mouseParallaxX, cy + mouseParallaxY);

    lobes.forEach((lobe, idx) => {
      const breath = Math.sin(timeCount * lobe.speed + idx * 1.2) * 6;
      const waveTilt = lobe.angle + Math.cos(timeCount * 0.5 + idx) * 0.04;
      const lobeX = lobe.ox + Math.sin(timeCount * 0.4 + idx) * 4;
      const lobeY = lobe.oy + Math.cos(timeCount * 0.4 + idx) * 3;
      const rx = lobe.rx + breath;
      const ry = lobe.ry + breath * 0.7;

      ctx.save();
      ctx.translate(lobeX, lobeY);
      ctx.rotate(waveTilt);

      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, rx);
      grad.addColorStop(0, lobe.color);
      grad.addColorStop(0.45, lobe.color.replace(/[\d\.]+\)$/, '0.08)'));
      grad.addColorStop(0.8, lobe.color.replace(/[\d\.]+\)$/, '0.03)'));
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    dustParticles.forEach(p => {
      p.x += p.driftX * deltaFactor;
      p.y += p.driftY * deltaFactor;
      p.phase += p.twinkleSpeed * 0.03 * deltaFactor;

      const alpha = 0.2 + (Math.sin(p.phase) + 1) * 0.35;
      ctx.fillStyle = `rgba(186, 230, 253, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x - cx, p.y - cy, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    if (!prefersReduced.matches) {
      animId = requestAnimationFrame(draw);
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      lastTime = 0;
    } else if (!prefersReduced.matches && !animId) {
      lastTime = 0;
      animId = requestAnimationFrame(draw);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (prefersReduced.matches) {
    draw(0);
  } else {
    animId = requestAnimationFrame(draw);
  }
}

function initCosmicNebula() {
  const canvas = document.getElementById('cosmic-nebula-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;

  let isVisible = false;
  let animId = null;
  let lastTime = 0;
  let timeCount = 0;
  let mouseParallaxX = 0;
  let mouseParallaxY = 0;
  let targetParallaxX = 0;
  let targetParallaxY = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    targetParallaxX = nx * 18;
    targetParallaxY = ny * 12;
  }, { passive: true });

  const gasBanks = [
    { ox: -75, oy: -30, rx: 160, ry: 105, angle: -0.22, color1: 'rgba(236, 72, 153, 0.22)', color2: 'rgba(168, 85, 247, 0.1)', speed: 0.8 },
    { ox: 50, oy: -40, rx: 175, ry: 115, angle: 0.35, color1: 'rgba(168, 85, 247, 0.24)', color2: 'rgba(99, 102, 241, 0.1)', speed: 1.0 },
    { ox: 15, oy: 35, rx: 190, ry: 120, angle: -0.15, color1: 'rgba(6, 182, 212, 0.2)', color2: 'rgba(56, 189, 248, 0.08)', speed: 0.7 },
    { ox: -40, oy: 45, rx: 135, ry: 85, angle: 0.28, color1: 'rgba(217, 70, 239, 0.18)', color2: 'rgba(139, 92, 246, 0.08)', speed: 1.1 },
    { ox: 80, oy: 25, rx: 145, ry: 90, angle: -0.32, color1: 'rgba(59, 130, 246, 0.18)', color2: 'rgba(6, 182, 212, 0.07)', speed: 0.9 },
    { ox: -10, oy: -15, rx: 110, ry: 70, angle: 0.1, color1: 'rgba(253, 224, 71, 0.12)', color2: 'rgba(245, 158, 11, 0.05)', speed: 1.3 }
  ];

  const protostars = [];
  for (let i = 0; i < 16; i++) {
    protostars.push({
      x: cx + (Math.random() - 0.5) * 360,
      y: cy + (Math.random() - 0.5) * 260,
      size: 1.2 + Math.random() * 2.2,
      rayLen: 6 + Math.random() * 12,
      twinkleSpeed: 0.7 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.5 ? 'rgba(254, 240, 138,' : (Math.random() > 0.5 ? 'rgba(186, 230, 253,' : 'rgba(244, 114, 182,')
    });
  }

  const section = document.getElementById('projects');
  if (section) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId && !prefersReduced.matches) {
          lastTime = 0;
          animId = requestAnimationFrame(draw);
        }
      });
    }, { rootMargin: '100px 0px 100px 0px' });
    observer.observe(section);
  } else {
    isVisible = true;
  }

  function draw(time) {
    if (!isVisible) {
      lastTime = 0;
      if (!prefersReduced.matches) animId = requestAnimationFrame(draw);
      return;
    }

    const curTime = time || performance.now();
    let deltaFactor = 1;
    if (!lastTime) {
      lastTime = curTime;
    } else {
      const dt = Math.min((curTime - lastTime) / 1000, 0.1);
      lastTime = curTime;
      deltaFactor = dt * 60;
    }

    timeCount += 0.01 * deltaFactor;
    mouseParallaxX += (targetParallaxX - mouseParallaxX) * 0.05 * deltaFactor;
    mouseParallaxY += (targetParallaxY - mouseParallaxY) * 0.05 * deltaFactor;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(cx + mouseParallaxX, cy + mouseParallaxY);

    ctx.globalCompositeOperation = 'screen';

    gasBanks.forEach((bank, idx) => {
      const pulsation = Math.sin(timeCount * bank.speed + idx * 1.3) * 8;
      const swirlAngle = bank.angle + Math.sin(timeCount * 0.4 + idx) * 0.05;
      const bx = bank.ox + Math.sin(timeCount * 0.35 + idx) * 6;
      const by = bank.oy + Math.cos(timeCount * 0.35 + idx) * 5;
      const rx = bank.rx + pulsation;
      const ry = bank.ry + pulsation * 0.65;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(swirlAngle);

      const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, rx);
      grad.addColorStop(0, bank.color1);
      grad.addColorStop(0.5, bank.color2);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    ctx.globalCompositeOperation = 'source-over';

    protostars.forEach(star => {
      star.phase += star.twinkleSpeed * 0.03 * deltaFactor;
      const alpha = 0.3 + (Math.sin(star.phase) + 1) * 0.35;
      const sx = star.x - cx;
      const sy = star.y - cy;

      const haloGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 5);
      haloGrad.addColorStop(0, `${star.hue} ${alpha * 0.9})`);
      haloGrad.addColorStop(0.4, `${star.hue} ${alpha * 0.3})`);
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size * 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `${star.hue} ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
      ctx.fill();

      const rLen = star.rayLen * (0.7 + Math.sin(star.phase) * 0.3);
      ctx.strokeStyle = `${star.hue} ${alpha * 0.75})`;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(sx - rLen, sy);
      ctx.lineTo(sx + rLen, sy);
      ctx.moveTo(sx, sy - rLen);
      ctx.lineTo(sx, sy + rLen);
      ctx.stroke();
    });

    ctx.restore();

    if (!prefersReduced.matches) {
      animId = requestAnimationFrame(draw);
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      lastTime = 0;
    } else if (!prefersReduced.matches && !animId) {
      lastTime = 0;
      animId = requestAnimationFrame(draw);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (prefersReduced.matches) {
    draw(0);
  } else {
    animId = requestAnimationFrame(draw);
  }
}

function initSpiralGalaxy() {
  const canvas = document.getElementById('spiral-galaxy-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;

  let isVisible = false;
  let animId = null;
  let lastTime = 0;
  let spin = 0;

  // 3D Celestial Orientation (Andromeda-like inclined perspective)
  let pitch = -0.62; // ~35 degrees from edge-on
  let yaw = 0.52;    // diagonal orientation
  let velPitch = 0;
  let velYaw = 0;
  let isDragging = false;
  let prevPointerX = 0;
  let prevPointerY = 0;

  let mouseParallaxX = 0;
  let mouseParallaxY = 0;
  let targetParallaxX = 0;
  let targetParallaxY = 0;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Deep space pointer parallax
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    targetParallaxX = nx * 9;
    targetParallaxY = ny * 6;
  }, { passive: true });

  // Interactive 3D drag rotation
  const wrapper = document.getElementById('distant-spiral-galaxy-wrapper');
  const dragTarget = wrapper || canvas;

  dragTarget.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;
    velYaw = 0;
    velPitch = 0;
    try { dragTarget.setPointerCapture(e.pointerId); } catch (_) {}
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevPointerX;
    const dy = e.clientY - prevPointerY;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;

    velYaw = dx * 0.007;
    velPitch = dy * 0.007;
    yaw += velYaw;
    pitch = Math.max(-1.42, Math.min(1.42, pitch + velPitch));
  });

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try { dragTarget.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  // IntersectionObserver on #about section where galaxy is now located
  const aboutSection = document.getElementById('about') || document.getElementById('distant-spiral-galaxy-wrapper');
  if (aboutSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId && !prefersReduced.matches) {
          lastTime = 0;
          animId = requestAnimationFrame(draw);
        }
      });
    }, { rootMargin: '150px 0px 150px 0px' });
    observer.observe(aboutSection);
  } else {
    isVisible = true;
  }

  // --- PARTICLE GENERATION ---
  // Authentic grand-design spiral galaxy with 360 star particles
  const particles = [];
  const Rcore = 14;
  const Rmax = 126;

  const youngOBStarHues = [
    'rgba(56, 189, 248,',   // Electric Cyan
    'rgba(96, 165, 250,',   // Deep Blue-White
    'rgba(224, 242, 254,',  // Diamond White
    'rgba(192, 132, 252,'   // Violet
  ];

  const hIIKnotHues = [
    'rgba(244, 114, 182,',  // Hot Pink Emission
    'rgba(251, 113, 133,',  // Magenta Nebula
    'rgba(244, 63, 94,'     // Crimson Starburst
  ];

  const solarDiskHues = [
    'rgba(254, 240, 138,',  // Solar Warm Gold
    'rgba(253, 224, 71,',   // Radiant Yellow
    'rgba(255, 255, 255,'   // Pure White
  ];

  // 1. Two Primary Grand-Design Logarithmic Spiral Arms (200 stars)
  for (let i = 0; i < 200; i++) {
    const arm = i % 2; // Arm 0 or Arm 1 (pi radians offset)
    const armOffset = arm * Math.PI;
    const u = Math.pow(Math.random(), 0.85); // denser toward center
    const rBase = Rcore + u * (Rmax - Rcore);

    const thetaBase = u * 3.7 + armOffset;
    const scatterAngle = (Math.random() - 0.5) * 0.42 * (0.3 + u * 0.7);
    const scatterR = (Math.random() - 0.5) * 16 * (0.2 + u * 0.8);
    const z = (Math.random() - 0.5) * 8 * (1 - u * 0.5);

    const r = Math.max(Rcore, rBase + scatterR);
    const phi = thetaBase + scatterAngle;

    let hue;
    const colorRoll = Math.random();
    if (colorRoll < 0.5) {
      hue = youngOBStarHues[Math.floor(Math.random() * youngOBStarHues.length)];
    } else if (colorRoll < 0.78) {
      hue = hIIKnotHues[Math.floor(Math.random() * hIIKnotHues.length)];
    } else {
      hue = solarDiskHues[Math.floor(Math.random() * solarDiskHues.length)];
    }

    particles.push({
      r,
      phi,
      z,
      speedFactor: Math.sqrt(85 / r), // Flat galactic rotation curve
      size: 0.8 + Math.random() * 1.5,
      hue,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 1.2 + Math.random() * 2.5
    });
  }

  // 2. High-Density Central Galactic Bulge (110 stars)
  for (let i = 0; i < 110; i++) {
    const u = Math.pow(Math.random(), 2.2); // dense core concentration
    const r = 2 + u * 28;
    const phi = Math.random() * Math.PI * 2;
    const z = (Math.random() - 0.5) * 12 * (1 - r / 30);

    const hue = Math.random() < 0.6
      ? 'rgba(255, 255, 255,'
      : (Math.random() < 0.5 ? 'rgba(254, 240, 138,' : 'rgba(253, 224, 71,');

    particles.push({
      r,
      phi,
      z,
      speedFactor: 1.8 / Math.sqrt(r + 3), // Keplerian core bulge speed
      size: 0.9 + Math.random() * 1.8,
      hue,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 1.5 + Math.random() * 3
    });
  }

  // 3. Outer Galactic Halo & Globular Clusters (50 stars)
  for (let i = 0; i < 50; i++) {
    const r = 105 + Math.random() * 35;
    const phi = Math.random() * Math.PI * 2;
    const z = (Math.random() - 0.5) * 18;

    particles.push({
      r,
      phi,
      z,
      speedFactor: 0.7,
      size: 0.7 + Math.random() * 1.2,
      hue: Math.random() < 0.5 ? 'rgba(192, 132, 252,' : 'rgba(96, 165, 250,',
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.8 + Math.random() * 1.6
    });
  }

  function draw(time) {
    if (!isVisible) {
      lastTime = 0;
      if (!prefersReduced.matches) animId = requestAnimationFrame(draw);
      return;
    }

    const curTime = time || performance.now();
    let deltaFactor = 1;
    if (!lastTime) {
      lastTime = curTime;
    } else {
      const dt = Math.min((curTime - lastTime) / 1000, 0.1);
      lastTime = curTime;
      deltaFactor = dt * 60;
    }

    ctx.clearRect(0, 0, width, height);

    // Continuous celestial rotation + inertial momentum decay
    yaw += (0.0018 + velYaw) * deltaFactor;
    pitch = Math.max(-1.42, Math.min(1.42, pitch + velPitch));
    velYaw *= Math.pow(0.94, deltaFactor);
    velPitch *= Math.pow(0.94, deltaFactor);
    spin += 0.0075 * deltaFactor;

    mouseParallaxX += (targetParallaxX - mouseParallaxX) * 0.04 * deltaFactor;
    mouseParallaxY += (targetParallaxY - mouseParallaxY) * 0.04 * deltaFactor;

    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    ctx.save();
    ctx.translate(cx + mouseParallaxX, cy + mouseParallaxY);

    // 1. GALAXY DIFFUSE NEBULAR HALO (Soft background glow)
    const haloGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 138);
    haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
    haloGrad.addColorStop(0.18, 'rgba(244, 114, 182, 0.26)');
    haloGrad.addColorStop(0.45, 'rgba(168, 85, 247, 0.16)');
    haloGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.07)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.rotate(yaw);
    ctx.scale(1, Math.max(0.2, Math.abs(cosP)));
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 138, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. VOLUMETRIC SPIRAL ARM RIBBONS (Gaseous Density Waves)
    const armRibbonSteps = 38;
    for (let arm = 0; arm < 2; arm++) {
      const armOffset = arm * Math.PI;
      const armColor = arm === 0 ? 'rgba(56, 189, 248,' : 'rgba(236, 72, 153,';

      ctx.beginPath();
      let first = true;
      for (let s = 0; s <= armRibbonSteps; s++) {
        const u = s / armRibbonSteps;
        const r = Rcore + u * (Rmax - Rcore);
        const theta = u * 3.7 + armOffset + spin * 0.6;

        const xDisk = r * Math.cos(theta);
        const yDisk = r * Math.sin(theta);
        const x1 = xDisk * cosY - yDisk * sinY;
        const y1 = xDisk * sinY + yDisk * cosY;

        const xScreen = x1;
        const yScreen = y1 * cosP;

        if (first) {
          ctx.moveTo(xScreen, yScreen);
          first = false;
        } else {
          ctx.lineTo(xScreen, yScreen);
        }
      }

      ctx.strokeStyle = `${armColor} 0.22)`;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.strokeStyle = `${armColor} 0.38)`;
      ctx.lineWidth = 5;
      ctx.stroke();

      // Dark interstellar dust rift weaving along the inner edge
      ctx.beginPath();
      let firstDust = true;
      for (let s = 4; s <= armRibbonSteps; s++) {
        const u = s / armRibbonSteps;
        const r = Rcore + u * (Rmax - Rcore) - 4;
        const theta = u * 3.7 + armOffset + spin * 0.6 - 0.12;

        const xDisk = r * Math.cos(theta);
        const yDisk = r * Math.sin(theta);
        const x1 = xDisk * cosY - yDisk * sinY;
        const y1 = xDisk * sinY + yDisk * cosY;

        const xScreen = x1;
        const yScreen = y1 * cosP;

        if (firstDust) {
          ctx.moveTo(xScreen, yScreen);
          firstDust = false;
        } else {
          ctx.lineTo(xScreen, yScreen);
        }
      }
      ctx.strokeStyle = 'rgba(10, 15, 29, 0.45)';
      ctx.lineWidth = 4.5;
      ctx.stroke();
    }

    // 3. 360-DEGREE STELLAR PARTICLES (Differential Orbital Motion)
    const projectedParticles = [];

    particles.forEach(p => {
      const currentPhi = p.phi + spin * p.speedFactor;
      const xDisk = p.r * Math.cos(currentPhi);
      const yDisk = p.r * Math.sin(currentPhi);
      const zDisk = p.z;

      const x1 = xDisk * cosY - yDisk * sinY;
      const y1 = xDisk * sinY + yDisk * cosY;
      const z1 = zDisk;

      const xCam = x1;
      const yCam = y1 * cosP - z1 * sinP;
      const zCam = y1 * sinP + z1 * cosP;

      p.twinklePhase += p.twinkleSpeed * 0.03 * deltaFactor;
      const twinkle = 0.65 + Math.sin(p.twinklePhase) * 0.35;
      const depthAlpha = zCam > 0 ? 1.0 : 0.75;

      projectedParticles.push({
        x: xCam,
        y: yCam,
        z: zCam,
        size: p.size * (zCam > 0 ? 1.1 : 0.9),
        hue: p.hue,
        alpha: twinkle * depthAlpha
      });
    });

    projectedParticles.sort((a, b) => a.z - b.z);

    projectedParticles.forEach(p => {
      ctx.fillStyle = `${p.hue} ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.size > 1.4) {
        ctx.fillStyle = `${p.hue} ${p.alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 4. SUPER-LUMINOUS GALACTIC CORE & CENTRAL SUPERMASSIVE BULGE
    const corePulse = Math.sin(spin * 2.5) * 1.5;
    const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 24 + corePulse);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    coreGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.90)');
    coreGrad.addColorStop(0.55, 'rgba(253, 224, 71, 0.65)');
    coreGrad.addColorStop(0.85, 'rgba(244, 114, 182, 0.30)');
    coreGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

    ctx.save();
    ctx.rotate(yaw);
    ctx.scale(1, Math.max(0.35, Math.abs(cosP)));
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 24 + corePulse, 0, Math.PI * 2);
    ctx.fill();

    // Searing pinpoint core beacon
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();

    if (!prefersReduced.matches) {
      animId = requestAnimationFrame(draw);
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      lastTime = 0;
    } else if (!prefersReduced.matches && !animId) {
      lastTime = 0;
      animId = requestAnimationFrame(draw);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (prefersReduced.matches) {
    draw(0);
  } else {
    animId = requestAnimationFrame(draw);
  }
}

function initCartwheelGalaxy() {
  const canvas = document.getElementById('contact-cartwheel-galaxy-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;

  let isVisible = false;
  let animId = null;
  let lastTime = 0;
  let spin = 0;

  // 3D Celestial Orientation (tilted ring perspective)
  let pitch = -0.68;
  let yaw = 0.48;
  let velPitch = 0;
  let velYaw = 0;
  let isDragging = false;
  let prevPointerX = 0;
  let prevPointerY = 0;

  let mouseParallaxX = 0;
  let mouseParallaxY = 0;
  let targetParallaxX = 0;
  let targetParallaxY = 0;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    targetParallaxX = nx * 12;
    targetParallaxY = ny * 8;
  }, { passive: true });

  const wrapper = document.getElementById('contact-cartwheel-galaxy-wrapper');
  const dragTarget = wrapper || canvas;

  dragTarget.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;
    velYaw = 0;
    velPitch = 0;
    try { dragTarget.setPointerCapture(e.pointerId); } catch (_) {}
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevPointerX;
    const dy = e.clientY - prevPointerY;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;

    velYaw = dx * 0.007;
    velPitch = dy * 0.007;
    yaw += velYaw;
    pitch = Math.max(-1.42, Math.min(1.42, pitch + velPitch));
  });

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try { dragTarget.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  const contactSection = document.getElementById('contact');
  if (contactSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId && !prefersReduced.matches) {
          lastTime = 0;
          animId = requestAnimationFrame(draw);
        }
      });
    }, { rootMargin: '120px 0px 120px 0px' });
    observer.observe(contactSection);
  } else {
    isVisible = true;
  }

  // --- CARTWHEEL RING PROCEDURAL PARTICLES ---
  const cyanHues = [
    'rgba(56, 189, 248,',
    'rgba(125, 211, 252,',
    'rgba(224, 242, 254,',
    'rgba(147, 197, 253,'
  ];
  const pinkHues = [
    'rgba(244, 114, 182,',
    'rgba(236, 72, 153,',
    'rgba(251, 113, 133,'
  ];
  const goldHues = [
    'rgba(254, 240, 138,',
    'rgba(253, 224, 71,',
    'rgba(255, 255, 255,'
  ];

  const particles = [];

  // 1. Central Core Hub (90 particles)
  for (let i = 0; i < 90; i++) {
    const u = Math.pow(Math.random(), 2.2);
    const r = 2 + u * 24;
    const phi = Math.random() * Math.PI * 2;
    const z = (Math.random() - 0.5) * 10 * (1 - r / 26);
    particles.push({
      type: 'core',
      r,
      phi,
      z,
      speed: 1.4 / Math.sqrt(r + 3),
      size: 0.8 + Math.random() * 1.6,
      hue: goldHues[Math.floor(Math.random() * goldHues.length)],
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 1.5 + Math.random() * 2.5
    });
  }

  // 2. 8 Delicate Radial Spoke Streams (120 particles)
  for (let i = 0; i < 120; i++) {
    const spokeIndex = i % 8;
    const baseAngle = (spokeIndex / 8) * Math.PI * 2;
    const u = 0.2 + Math.random() * 0.75;
    const r = 24 + u * (108 - 24);
    const spokeTwist = Math.sin(u * Math.PI) * 0.22;
    const scatter = (Math.random() - 0.5) * 0.16;
    const phi = baseAngle + spokeTwist + scatter;
    const z = (Math.random() - 0.5) * 6;
    particles.push({
      type: 'spoke',
      r,
      phi,
      z,
      speed: 0.65,
      size: 0.7 + Math.random() * 1.3,
      hue: Math.random() < 0.65 ? cyanHues[Math.floor(Math.random() * cyanHues.length)] : goldHues[0],
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 1.2 + Math.random() * 2
    });
  }

  // 3. The Great Outer Shockwave Ring (240 particles)
  for (let i = 0; i < 240; i++) {
    const phi = Math.random() * Math.PI * 2;
    const dispersion = (Math.random() - 0.5) * 14;
    const r = 108 + dispersion;
    const z = (Math.random() - 0.5) * 7;
    const isKnot = Math.random() < 0.35;
    const hue = isKnot
      ? pinkHues[Math.floor(Math.random() * pinkHues.length)]
      : cyanHues[Math.floor(Math.random() * cyanHues.length)];

    particles.push({
      type: 'ring',
      r,
      phi,
      z,
      speed: 0.65,
      size: isKnot ? 1.4 + Math.random() * 1.8 : 0.8 + Math.random() * 1.4,
      hue,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 1.8 + Math.random() * 3,
      isBright: Math.random() < 0.22
    });
  }

  function draw(time) {
    if (!isVisible) {
      lastTime = 0;
      if (!prefersReduced.matches) animId = requestAnimationFrame(draw);
      return;
    }

    const curTime = time || performance.now();
    let deltaFactor = 1;
    if (!lastTime) {
      lastTime = curTime;
    } else {
      const dt = Math.min((curTime - lastTime) / 1000, 0.1);
      lastTime = curTime;
      deltaFactor = dt * 60;
    }

    ctx.clearRect(0, 0, width, height);

    yaw += (0.0020 + velYaw) * deltaFactor;
    pitch = Math.max(-1.42, Math.min(1.42, pitch + velPitch));
    velYaw *= Math.pow(0.94, deltaFactor);
    velPitch *= Math.pow(0.94, deltaFactor);
    spin += 0.0085 * deltaFactor;

    mouseParallaxX += (targetParallaxX - mouseParallaxX) * 0.04 * deltaFactor;
    mouseParallaxY += (targetParallaxY - mouseParallaxY) * 0.04 * deltaFactor;

    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    ctx.save();
    ctx.translate(cx + mouseParallaxX, cy + mouseParallaxY);

    // 1. NEBULAR VOLUMETRIC GLOW
    const haloGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 130);
    haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    haloGrad.addColorStop(0.18, 'rgba(251, 146, 60, 0.22)');
    haloGrad.addColorStop(0.48, 'rgba(56, 189, 248, 0.08)');
    haloGrad.addColorStop(0.82, 'rgba(56, 189, 248, 0.22)');
    haloGrad.addColorStop(0.95, 'rgba(236, 72, 153, 0.12)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.rotate(yaw);
    ctx.scale(1, Math.max(0.22, Math.abs(cosP)));
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 130, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. VOLUMETRIC SHOCKWAVE RING
    ctx.beginPath();
    const ringSteps = 48;
    for (let i = 0; i <= ringSteps; i++) {
      const theta = (i / ringSteps) * Math.PI * 2;
      const xDisk = 108 * Math.cos(theta);
      const yDisk = 108 * Math.sin(theta);
      const x1 = xDisk * cosY - yDisk * sinY;
      const y1 = xDisk * sinY + yDisk * cosY;
      const xScreen = x1;
      const yScreen = y1 * cosP;

      if (i === 0) ctx.moveTo(xScreen, yScreen);
      else ctx.lineTo(xScreen, yScreen);
    }
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(224, 242, 254, 0.55)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3. RENDER 3D PROJECTED PARTICLES
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.twinkle += p.twinkleSpeed * 0.02 * deltaFactor;

      const angle = p.phi + spin * p.speed;
      const xDisk = p.r * Math.cos(angle);
      const yDisk = p.r * Math.sin(angle);
      const zDisk = p.z;

      const x1 = xDisk * cosY - yDisk * sinY;
      const y1 = xDisk * sinY + yDisk * cosY;
      const z1 = zDisk;

      const x2 = x1;
      const y2 = y1 * cosP - z1 * sinP;
      const z2 = y1 * sinP + z1 * cosP;

      const fov = 340;
      const scale = fov / (fov + z2 * 0.85);
      const xScreen = x2 * scale;
      const yScreen = y2 * scale;

      const alphaBase = Math.sin(p.twinkle) * 0.25 + 0.72;
      const alpha = Math.max(0.1, Math.min(1, alphaBase * Math.min(1.2, scale)));

      ctx.beginPath();
      ctx.arc(xScreen, yScreen, p.size * scale, 0, Math.PI * 2);
      ctx.fillStyle = `${p.hue} ${alpha})`;
      ctx.fill();

      // Bright star spikes
      if (p.isBright && scale > 0.95) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.55})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(xScreen - 5 * scale, yScreen);
        ctx.lineTo(xScreen + 5 * scale, yScreen);
        ctx.moveTo(xScreen, yScreen - 5 * scale);
        ctx.lineTo(xScreen, yScreen + 5 * scale);
        ctx.stroke();
      }
    }

    // 4. RADIANT CENTRAL CORE BULGE
    ctx.beginPath();
    ctx.arc(0, 0, 11 * Math.max(0.3, Math.abs(cosP)), 0, Math.PI * 2);
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 11);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, '#fef08a');
    coreGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = coreGrad;
    ctx.fill();

    ctx.restore();

    if (!prefersReduced.matches) {
      animId = requestAnimationFrame(draw);
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      lastTime = 0;
    } else if (!prefersReduced.matches && !animId) {
      lastTime = 0;
      animId = requestAnimationFrame(draw);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (prefersReduced.matches) {
    draw(0);
  } else {
    animId = requestAnimationFrame(draw);
  }
}

/* ==========================================================================
   ORBITAL SPACE STATION AEGIS-01 (INTERACTIVE 3D THREE.JS SIMULATION)
   ========================================================================== */

function initSpaceStation3D() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('space-station-3d-canvas');
  const wrapper = document.getElementById('distant-space-station-wrapper');
  if (!canvas || !wrapper) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 1. Scene, Camera, Renderer Setup
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });

  const updateSize = () => {
    const width = wrapper.clientWidth || 240;
    const height = wrapper.clientHeight || 160;
    const isMobile = window.innerWidth <= 768;
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
    if (camera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };

  const initialWidth = wrapper.clientWidth || 240;
  const initialHeight = wrapper.clientHeight || 160;
  const camera = new THREE.PerspectiveCamera(34, initialWidth / initialHeight, 0.1, 100);
  camera.position.set(0, 0.45, 9.6);
  camera.lookAt(0, 0, 0);

  updateSize();
  window.addEventListener('resize', updateSize, { passive: true });

  // 2. High-Key Celestial Sunlight (Interstellar cinematic lighting: crisp directional light)
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
  sunLight.position.set(4.5, 5, 5); // Crisp sunlight striking the front-facing rotating modules
  scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.65); // Soft cyan ambient glow from surrounding space
  scene.add(ambientLight);

  const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.9);
  rimLight.position.set(-5, -2, -3); // Edge rim light
  scene.add(rimLight);

  const hubLight = new THREE.PointLight(0x38bdf8, 1.2, 4);
  hubLight.position.set(0, 0, 0.6);
  scene.add(hubLight);

  // 3. Authentic Spacecraft Materials (Interstellar Endurance white thermal tiles, dark graphite joints)
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Crisp off-white thermal ceramic hull
    roughness: 0.42,
    metalness: 0.16
  });

  const darkJointMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Dark titanium structural joint collars
    roughness: 0.48,
    metalness: 0.32
  });

  const spokeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Metallic titanium structural tubes
    roughness: 0.40,
    metalness: 0.36
  });

  const solarFacetMat = new THREE.MeshStandardMaterial({
    color: 0x0f294d, // Deep cosmic blue solar/radiator panels on outer facets
    roughness: 0.35,
    metalness: 0.38
  });

  const windowCyanMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.85
  });

  const windowAmberMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.80
  });

  const nozzleMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.55
  });

  const ionPlumeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });

  // 4. Construct Interstellar Endurance Rotating Artificial Gravity Ring
  const stationRoot = new THREE.Group();
  scene.add(stationRoot);

  // Cinematic 3D angle so the ring and its rotation are clearly visible in perspective
  stationRoot.rotation.x = 0.42;
  stationRoot.rotation.y = -0.34;
  stationRoot.rotation.z = -0.06;

  // The rotating artificial gravity ring assembly (rotates as a single unit)
  const ringGroup = new THREE.Group();
  stationRoot.add(ringGroup);

  const ringRadius = 2.25;
  const moduleCount = 12; // 12 distinct modular compartments like the Endurance
  const plumes = [];

  for (let i = 0; i < moduleCount; i++) {
    const theta = (i / moduleCount) * Math.PI * 2;
    const modGroup = new THREE.Group();
    modGroup.position.set(Math.cos(theta) * ringRadius, Math.sin(theta) * ringRadius, 0);
    modGroup.rotation.z = theta + Math.PI / 2; // Tangent to circular perimeter

    // Main boxy module container
    const isEngine = (i % 3 === 0); // 4 engine/docking modules at 0, 90, 180, 270 deg
    const boxGeo = new THREE.BoxGeometry(0.72, 0.30, 0.42);
    const boxMesh = new THREE.Mesh(boxGeo, hullMat);
    modGroup.add(boxMesh);

    // Outer face heat-shield / solar facet
    const facetGeo = new THREE.BoxGeometry(0.64, 0.02, 0.36);
    const facet = new THREE.Mesh(facetGeo, isEngine ? darkJointMat : solarFacetMat);
    facet.position.y = 0.155;
    modGroup.add(facet);

    // Inter-module connector joint cylinder leading to adjacent module
    const jointGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.34, 12);
    jointGeo.rotateZ(Math.PI / 2);
    const joint = new THREE.Mesh(jointGeo, darkJointMat);
    joint.position.x = 0.44;
    modGroup.add(joint);

    if (isEngine) {
      // Twin propulsion nozzles on the rear of the module
      [-0.10, 0.10].forEach(zOff => {
        const nozGeo = new THREE.CylinderGeometry(0.07, 0.045, 0.18, 12);
        nozGeo.rotateZ(Math.PI / 2);
        const noz = new THREE.Mesh(nozGeo, nozzleMat);
        noz.position.set(-0.42, 0, zOff);
        modGroup.add(noz);

        const plumeGeo = new THREE.ConeGeometry(0.06, 0.35, 10);
        plumeGeo.rotateZ(-Math.PI / 2);
        const plume = new THREE.Mesh(plumeGeo, ionPlumeMat);
        plume.position.set(-0.64, 0, zOff);
        modGroup.add(plume);
        plumes.push(plume);
      });
    } else {
      // Habitation & Lab modules: illuminated observation window slits on the inner face
      [-0.15, 0.15].forEach(xOff => {
        const wGeo = new THREE.BoxGeometry(0.08, 0.02, 0.04);
        const wMat = (i % 2 === 0) ? windowAmberMat : windowCyanMat;
        const wMesh = new THREE.Mesh(wGeo, wMat);
        wMesh.position.set(xOff, -0.155, 0);
        modGroup.add(wMesh);
      });
    }

    ringGroup.add(modGroup);
  }

  // --- CENTRAL DOCKING HUB & SPOKES ---
  const hubGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.75, 24);
  const hubMesh = new THREE.Mesh(hubGeo, hullMat);
  hubMesh.rotation.x = Math.PI / 2; // Aligned along rotation axis
  ringGroup.add(hubMesh);

  // Forward & Aft Docking Rings on the Hub
  [-0.4, 0.4].forEach(z => {
    const dockGeo = new THREE.TorusGeometry(0.32, 0.035, 10, 24);
    const dock = new THREE.Mesh(dockGeo, darkJointMat);
    dock.position.z = z;
    ringGroup.add(dock);
  });

  // Forward Observation Cupola on the Hub
  const hubCupolaGeo = new THREE.SphereGeometry(0.20, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  hubCupolaGeo.rotateX(-Math.PI / 2);
  const hubCupola = new THREE.Mesh(hubCupolaGeo, windowCyanMat);
  hubCupola.position.z = 0.42;
  ringGroup.add(hubCupola);

  // 4 Structural Tubular Spokes connecting Hub to the 4 Engine Nodes
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const spokeGeo = new THREE.CylinderGeometry(0.032, 0.032, ringRadius, 8);
    const spoke = new THREE.Mesh(spokeGeo, spokeMat);
    spoke.position.x = (Math.cos(angle) * ringRadius) / 2;
    spoke.position.y = (Math.sin(angle) * ringRadius) / 2;
    spoke.rotation.z = angle - Math.PI / 2;
    ringGroup.add(spoke);
  }

  // Docked Explorer Craft (Ranger silhouette docked at the hub)
  const rangerGroup = new THREE.Group();
  rangerGroup.position.set(0, 0, 0.55);
  const rangerBodyGeo = new THREE.ConeGeometry(0.16, 0.46, 4);
  rangerBodyGeo.rotateZ(Math.PI / 4);
  const rangerMesh = new THREE.Mesh(rangerBodyGeo, hullMat);
  rangerGroup.add(rangerMesh);
  ringGroup.add(rangerGroup);

  // 5. Non-Interactable Purely Ambient Motion (Endurance continuous artificial gravity spin)
  let animId = null;
  let lastTime = 0;

  function render(time) {
    const curTime = time || performance.now();
    const dt = lastTime ? Math.min((curTime - lastTime) / 1000, 0.1) : 0.016;
    lastTime = curTime;
    const delta = dt * 60;

    // Continuous artificial gravity spin of the ring assembly (Interstellar style)
    if (!prefersReduced.matches) {
      ringGroup.rotation.z += 0.0085 * delta;

      // Serene, slow celestial orientation drift in space
      stationRoot.rotation.y += 0.0006 * delta;
      stationRoot.rotation.x = 0.42 + Math.sin(curTime * 0.0003) * 0.02;

      // Gentle ion thruster breathing
      const pulse = 1.0 + Math.sin(curTime * 0.006) * 0.08;
      plumes.forEach(p => p.scale.set(pulse, pulse, pulse));
    }

    renderer.render(scene, camera);
    animId = requestAnimationFrame(render);
  }

  // 8. Performance & Visibility Lifecycle
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animId) {
          lastTime = performance.now();
          animId = requestAnimationFrame(render);
        }
      } else {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }
    });
  }, { threshold: 0.05 });

  obs.observe(wrapper);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      lastTime = 0;
    } else if (!animId) {
      lastTime = performance.now();
      animId = requestAnimationFrame(render);
    }
  });

  animId = requestAnimationFrame(render);
}

