/* =============================================
   DHANANJAY BHUSARI — PORTFOLIO SCRIPT (V2)
   Design System: Technical Precision & Masterclass UX
   ============================================= */

'use strict';

// ─── 1. PROGRESSIVE ENHANCEMENT & BG VIDEO AUTOPLAY ────────
document.body.classList.add('js-ready');

// ─── 1. OPTION 3: LIQUID MERCURY AURORA (LINEAR / VERCEL AMBIENT SUBSTRATE) ───
class LiquidMercuryAurora {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) return;

    this.isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
    this.dpr = this.isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = 0;
    this.height = 0;
    this.time = 0;
    this.isPaused = false;
    this.isScrolling = false;
    this.scrollTimeout = null;

    this.mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      vx: 0,
      vy: 0,
      active: false,
      rippleRadius: 0,
      rippleAlpha: 0
    };

    this.noisePattern = this.isMobile ? null : this.createNoisePattern();
    this.init();
  }

  createNoisePattern() {
    const size = 128;
    const nCanvas = document.createElement('canvas');
    nCanvas.width = size;
    nCanvas.height = size;
    const nCtx = nCanvas.getContext('2d');
    if (!nCtx) return null;

    const imgData = nCtx.createImageData(size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 13; // 5% fine tactile grain
    }
    nCtx.putImageData(imgData, 0, 0);
    return this.ctx.createPattern(nCanvas, 'repeat');
  }

  init() {
    this.resize();

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
      this.dpr = this.isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      this.resize();
    }, { passive: true });

    // Pause canvas computation during scroll for maximum 120fps scrolling smoothness
    window.addEventListener('scroll', () => {
      this.isScrolling = true;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
        if (!this.isPaused) {
          this.lastTime = performance.now();
          requestAnimationFrame(this.render.bind(this));
        }
      }, 90);
    }, { passive: true });

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = e.clientX;
        this.mouse.targetY = e.clientY;
        this.mouse.active = true;
      }, { passive: true });

      window.addEventListener('mouseleave', () => {
        this.mouse.active = false;
      });

      window.addEventListener('click', (e) => {
        this.mouse.targetX = e.clientX;
        this.mouse.targetY = e.clientY;
        this.mouse.rippleRadius = 20;
        this.mouse.rippleAlpha = 0.25;
      });
    }

    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
      if (!this.isPaused && !this.isScrolling) {
        this.lastTime = performance.now();
        requestAnimationFrame(this.render.bind(this));
      }
    });

    this.lastTime = performance.now();
    requestAnimationFrame(this.render.bind(this));
  }

  resize() {
    this.width = document.documentElement.clientWidth || window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (!this.mouse.active) {
      this.mouse.x = this.width * 0.65;
      this.mouse.y = this.height * 0.45;
      this.mouse.targetX = this.mouse.x;
      this.mouse.targetY = this.mouse.y;
    }
  }

  render(now) {
    if (this.isPaused || this.isScrolling) return;

    const dt = Math.min((now - (this.lastTime || now)) / 1000, 0.1);
    this.lastTime = now;
    this.time += dt * 0.35;

    const { ctx, width, height, time, mouse } = this;

    // Fluid spring physics for cursor tracking
    const prevMx = mouse.x;
    const prevMy = mouse.y;
    mouse.x += (mouse.targetX - mouse.x) * 0.055;
    mouse.y += (mouse.targetY - mouse.y) * 0.055;
    mouse.vx = (mouse.x - prevMx);
    mouse.vy = (mouse.y - prevMy);

    // 1. Deep Obsidian Vacuum Base
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#040507';
    ctx.fillRect(0, 0, width, height);

    // 2. Optical Volumetric Additive Blending for Molten Mercury Aurora
    ctx.globalCompositeOperation = 'screen';

    // Volumetric Pools of Liquid Silver Light
    const pools = [
      // Pool 0: Primary Hero Light Mass (Behind Terminal Card & Center-Right)
      {
        x: width * (0.64 + Math.sin(time * 0.38) * 0.10),
        y: height * (0.44 + Math.cos(time * 0.30) * 0.12),
        radius: Math.min(width, height) * (0.42 + Math.sin(time * 0.5) * 0.05),
        colorInner: 'rgba(255, 255, 255, 0.12)',
        colorMid: 'rgba(160, 165, 185, 0.035)',
        colorOuter: 'rgba(0, 0, 0, 0)'
      },
      // Pool 1: Left Atmosphere Mass (Soft Glow behind Hero Name Typography)
      {
        x: width * (0.28 + Math.cos(time * 0.44) * 0.08),
        y: height * (0.50 + Math.sin(time * 0.36) * 0.10),
        radius: Math.min(width, height) * (0.36 + Math.cos(time * 0.42) * 0.04),
        colorInner: 'rgba(235, 240, 250, 0.095)',
        colorMid: 'rgba(140, 145, 165, 0.025)',
        colorOuter: 'rgba(0, 0, 0, 0)'
      },
      // Pool 2: Top Refraction Mass (Illuminates Frosted Glass Dock Navbar)
      {
        x: width * (0.50 + Math.sin(time * 0.28) * 0.16),
        y: height * (0.10 + Math.cos(time * 0.24) * 0.05),
        radius: Math.min(width, height) * (0.30 + Math.sin(time * 0.35) * 0.03),
        colorInner: 'rgba(255, 255, 255, 0.09)',
        colorMid: 'rgba(180, 185, 200, 0.02)',
        colorOuter: 'rgba(0, 0, 0, 0)'
      },
      // Pool 3: Deep Horizon Swell (Creates grounding depth along the lower viewport)
      {
        x: width * (0.72 + Math.cos(time * 0.32) * 0.18),
        y: height * (0.80 + Math.sin(time * 0.26) * 0.08),
        radius: Math.min(width, height) * (0.48 + Math.cos(time * 0.38) * 0.05),
        colorInner: 'rgba(200, 205, 220, 0.075)',
        colorMid: 'rgba(120, 125, 140, 0.018)',
        colorOuter: 'rgba(0, 0, 0, 0)'
      }
    ];

    // Render Ambient Liquid Pools
    pools.forEach((p) => {
      const grad = ctx.createRadialGradient(p.x, p.y, 20, p.x, p.y, p.radius);
      grad.addColorStop(0, p.colorInner);
      grad.addColorStop(0.45, p.colorMid);
      grad.addColorStop(1, p.colorOuter);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Dynamic Interactive Cursor Fluid Spotlight
    if (mouse.active || mouse.x > 0) {
      const cursorRadius = Math.min(width, height) * 0.38;
      const speed = Math.hypot(mouse.vx, mouse.vy);
      const stretch = Math.min(speed * 1.5, 30);

      const cursorGrad = ctx.createRadialGradient(
        mouse.x, mouse.y, 15,
        mouse.x - mouse.vx * 0.4, mouse.y - mouse.vy * 0.4, cursorRadius + stretch
      );
      cursorGrad.addColorStop(0, 'rgba(255, 255, 255, 0.11)');
      cursorGrad.addColorStop(0.35, 'rgba(200, 205, 225, 0.035)');
      cursorGrad.addColorStop(0.75, 'rgba(140, 145, 165, 0.008)');
      cursorGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = cursorGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, cursorRadius + stretch, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Click Liquid Ripple Pulse
    if (mouse.rippleAlpha > 0.005) {
      const ripGrad = ctx.createRadialGradient(
        mouse.x, mouse.y, Math.max(0, mouse.rippleRadius - 40),
        mouse.x, mouse.y, mouse.rippleRadius + 40
      );
      ripGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      ripGrad.addColorStop(0.5, `rgba(255, 255, 255, ${mouse.rippleAlpha})`);
      ripGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = ripGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.rippleRadius + 40, 0, Math.PI * 2);
      ctx.fill();

      mouse.rippleRadius += dt * 380;
      mouse.rippleAlpha *= 0.94;
    }

    // 5. In-Memory Procedural Film Grain (Eliminates Banding & Adds Tactile Depth)
    ctx.globalCompositeOperation = 'source-over';
    if (this.noisePattern) {
      ctx.fillStyle = this.noisePattern;
      ctx.fillRect(0, 0, width, height);
    }

    requestAnimationFrame(this.render.bind(this));
  }
}

const canvasEl = document.getElementById('bgCanvas');
if (canvasEl) {
  new LiquidMercuryAurora(canvasEl);
}

// ─── 2. CURSOR GLOW (THROTTLED WITH RAF) ─────────────
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;
let isMoving = false;

if (cursorGlow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(renderGlow);
    }
  }, { passive: true });

  function renderGlow() {
    glowX += (mouseX - glowX) * 0.2;
    glowY += (mouseY - glowY) * 0.2;
    cursorGlow.style.left = `${glowX}px`;
    cursorGlow.style.top = `${glowY}px`;

    if (Math.abs(mouseX - glowX) > 0.5 || Math.abs(mouseY - glowY) > 0.5) {
      requestAnimationFrame(renderGlow);
    } else {
      isMoving = false;
    }
  }
}


// ─── 2.5 DYNAMIC HERO SPOTLIGHT (NEXT.JS / VERCEL STYLE) ─────
const heroSection = document.getElementById('hero');
if (heroSection && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    heroSection.style.setProperty('--hero-mouse-x', `${x}px`);
    heroSection.style.setProperty('--hero-mouse-y', `${y}px`);
  }, { passive: true });
}

// ─── 3. GLASS DOCK SCROLLSPY (ZERO-LAYOUT REFLOW OPTIMIZED) ───
const dockItems = document.querySelectorAll('.dock-item');
const sections = document.querySelectorAll('section[id], header[id]');
const backTop = document.getElementById('backTop');

let sectionBounds = [];
function cacheSectionBounds() {
  sectionBounds = Array.from(sections).map((sec) => {
    const top = sec.offsetTop - 180;
    return {
      id: sec.getAttribute('id'),
      top: top,
      bottom: top + sec.offsetHeight
    };
  });
}
cacheSectionBounds();
window.addEventListener('resize', cacheSectionBounds, { passive: true });

let scrollTick = false;
function handleScrollOptimized() {
  if (!scrollTick) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      let currentSectionId = 'hero';

      if ((window.innerHeight + scrollY) >= document.documentElement.scrollHeight - 60) {
        currentSectionId = 'contact';
      } else {
        for (let i = 0; i < sectionBounds.length; i++) {
          const s = sectionBounds[i];
          if (scrollY >= s.top && scrollY < s.bottom) {
            currentSectionId = s.id;
            break;
          }
        }
      }

      dockItems.forEach((item) => {
        item.classList.toggle('active', item.getAttribute('data-section') === currentSectionId);
      });

      if (backTop) {
        if (scrollY > 400) {
          backTop.classList.add('visible');
        } else {
          backTop.classList.remove('visible');
        }
      }

      scrollTick = false;
    });
    scrollTick = true;
  }
}

window.addEventListener('scroll', handleScrollOptimized, { passive: true });
window.addEventListener('load', () => {
  cacheSectionBounds();
  handleScrollOptimized();
}, { passive: true });

// Smooth Click Navigation for Dock Items
dockItems.forEach((item) => {
  item.addEventListener('click', (e) => {
    const href = item.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetEl = document.querySelector(href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        dockItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      }
    }
  });
});


// ─── 5. TYPEWRITER EFFECT ─────────────────────────────
const roles = [
  'Cloud & DevOps Engineer',
  'AWS Cloud Practitioner',
  'Linux Systems Engineer',
  'Resilient System Architect'
];

const typewriterEl = document.getElementById('typewriter');
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeDelay = 100;

function type() {
  if (!typewriterEl) return;
  const current = roles[roleIndex];

  if (!isDeleting) {
    typewriterEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      isDeleting = true;
      typeDelay = 2200;
    } else {
      typeDelay = 65;
    }
  } else {
    typewriterEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeDelay = 400;
    } else {
      typeDelay = 35;
    }
  }

  setTimeout(type, typeDelay);
}

setTimeout(type, 600);

// ─── 6. SCROLL REVEAL OBSERVER ────────────────────────
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}



// ─── 8. BACK TO TOP BUTTON ────────────────────────────
if (backTop) {
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── 9. SMOOTH SCROLL ANCHOR CLICKS ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── 9.5 GLASS CARD MOUSE SPOTLIGHT & 3D TILT ────────
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      if (card.classList.contains('project-card')) {
        const centerX = x - rect.width / 2;
        const centerY = y - rect.height / 2;
        const tiltX = (centerY / rect.height) * 3.5;
        const tiltY = (centerX / rect.width) * -3.5;
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      if (card.classList.contains('project-card')) {
        card.style.transform = '';
      }
    });
  });
}

// ─── 10. RECRUITER-FOCUSED PROJECT MODAL DIALOG ───────
const projectData = {
  serverless: {
    title: "Serverless Resume & Global Telemetry Architecture",
    diagram: "assets/images/architecture.svg",
    problem: "Most cloud applicants can recite AWS service definitions, but cannot demonstrate how services integrate with production security (least-privilege IAM, CORS, edge TLS), automated CI/CD pipelines, and reproducible Infrastructure as Code.",
    solution: "An enterprise-pattern serverless application hosted on AWS. Static assets are delivered globally through Route 53 DNS, CloudFront edge caching, and a private S3 bucket secured with Origin Access Control (OAC). The visitor analytics pipeline is decoupled via Amazon API Gateway, a Python Lambda microservice, and Amazon DynamoDB with atomic counter incrementing.",
    tradeoffs: [
      "Why DynamoDB instead of RDS? Zero-maintenance serverless scalability, sub-10ms single-digit read/write latency, and $0 idle cost on Pay-Per-Request billing mode.",
      "Why CloudFront OAC over Public S3? Guarantees S3 bucket is completely private with no direct public access, mitigating data exfiltration risks.",
      "Why Terraform IaC? Decouples configuration from AWS Console clicks, enabling automated validation, linting, and drift detection in version control."
    ],
    learnings: [
      "Wrote modular Terraform files for reproducible multi-region provisioning and remote S3 state locking",
      "Configured automated GitHub Actions workflows with secret scanning, automated unit tests, and automatic CloudFront cache invalidation",
      "Achieved sub-45ms worldwide median response times through CloudFront edge points of presence (PoPs)"
    ]
  },
  runbooks: {
    title: "Production Incident Simulator & SRE Runbooks",
    diagram: "assets/images/sre-lifecycle.svg",
    problem: "Engineers are frequently paged at 3 AM for critical outages they have never experienced in staging. Unpracticed incident triage results in prolonged downtime, panic-driven guessing, and high MTTR (Mean Time to Resolution).",
    solution: "A scenario-based Linux CLI simulator reproducing realistic production failure modes (storage partition exhaustion, OOM kills, zombie child processes, dropped network packets), accompanied by standardized SRE runbooks and automated verification scripts.",
    tradeoffs: [
      "Why strict POSIX Bash? Eliminates external runtime dependencies, ensuring diagnostic scripts execute reliably on minimal recovery kernels and production containers.",
      "Why set -euo pipefail? Guarantees scripts terminate immediately on unhandled pipeline errors, avoiding destructive partial-execution in production.",
      "Standard SRE Incident Lifecycle: Observe (telemetry) → Diagnose (journalctl/top) → Remediate (idempotent runbook) → Verify (health script)."
    ],
    learnings: [
      "Integrated ShellCheck static analysis into CI to catch variable quoting errors, subshell leaks, and portability bugs before merge",
      "Designed idempotent recovery scripts using --verify and --reset flags for zero-side-effect drills",
      "Reduced simulated MTTR from 15+ minutes of manual debugging to under 30 seconds of automated remediation"
    ]
  },
  monitoring: {
    title: "Linux Server Monitoring & Auto-Healing Daemon",
    problem: "Manual infrastructure health checks are fundamentally reactive. By the time an engineer notices a saturated disk or a crashed NGINX/database service, downtime has already impacted users and broken SLAs.",
    solution: "A lightweight Linux monitoring suite that continuously audits CPU utilization, memory thresholds, disk quotas, and systemd service health. It dispatches immediate webhook alerts and automatically triggers self-healing service restarts.",
    tradeoffs: [
      "Why native systemd instead of third-party agents? Minimal resource footprint (<8MB RAM overhead), zero external agent daemon licensing, and native integration with Linux kernel cgroups and journald.",
      "Configurable Exponential Alert Dampening: Prevents alert fatigue and pager storms during transient system spikes."
    ],
    learnings: [
      "Engineered robust systemd unit service files with Restart=on-failure directives and health-check timers",
      "Implemented log rotation policies and non-blocking alerting via HTTPS webhooks (Slack/Discord/Email)",
      "Automated auto-remediation scripts that revive critical background services without human intervention"
    ]
  }
};

const modal = document.getElementById('projectModal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.getElementById('modalClose');

document.querySelectorAll('.open-modal-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const projId = btn.getAttribute('data-project');
    const data = projectData[projId];

    if (data) {
      modalBody.innerHTML = `
        <h3>${data.title}</h3>
        ${data.diagram ? `
          <div class="modal-arch-container">
            <img src="${data.diagram}" alt="${data.title} Architecture Diagram" class="modal-arch-img" />
          </div>
        ` : ''}
        <h4><i class="fas fa-triangle-exclamation"></i> Operational Problem</h4>
        <p>${data.problem}</p>
        
        <h4><i class="fas fa-lightbulb"></i> Architectural Solution</h4>
        <p>${data.solution}</p>
        
        <h4><i class="fas fa-scale-balanced"></i> Architectural Decisions &amp; Trade-offs</h4>
        <ul>
          ${data.tradeoffs.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <h4><i class="fas fa-brain"></i> Key Engineering Learnings</h4>
        <ul>
          ${data.learnings.map(item => `<li>${item}</li>`).join('')}
        </ul>
      `;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  });
});

function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

// ─── 11. STATS COUNTER ANIMATION ──────────────────────
const statNums = document.querySelectorAll('.stat-num');

if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetStr = el.textContent.replace(/\D/g, '');
          if (!targetStr) return;

          const target = parseInt(targetStr, 10);
          const suffix = el.textContent.replace(/[\d]/g, '');
          let current = 0;
          const step = Math.max(1, Math.ceil(target / 30));

          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              el.textContent = target + suffix;
              clearInterval(timer);
            } else {
              el.textContent = current + suffix;
            }
          }, 35);

          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNums.forEach(n => {
    if (n.textContent !== '...' && n.textContent !== '∞') {
      counterObserver.observe(n);
    }
  });
}

// ─── 12. LIVE VISITOR COUNTER & TELEMETRY API ─────────
const statCounterEl = document.getElementById('visitor-count-stats');
const footerCounterEl = document.getElementById('visitor-count-footer');

if (statCounterEl || footerCounterEl) {
  const urlParams = new URLSearchParams(window.location.search);
  const srcTag = urlParams.get('src') || urlParams.get('utm_source') || '';

  // Silently clean address bar if someone arrived via tagged link
  if (srcTag) {
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {}
  }

  fetch('https://7eok0ntilf.execute-api.us-east-1.amazonaws.com/prod/count', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ref: document.referrer || '',
      src: srcTag,
      screen: `${window.innerWidth}x${window.innerHeight}`
    })
  })
    .then(response => {
      if (!response.ok) throw new Error('Network response not ok');
      return response.json();
    })
    .then(data => {
      const count = data.count || data.body || data;
      if (statCounterEl) statCounterEl.textContent = count;
      if (footerCounterEl) footerCounterEl.textContent = count;
    })
    .catch(error => {
      console.warn('Visitor counter offline:', error);
      if (statCounterEl) statCounterEl.textContent = "Live";
      if (footerCounterEl) footerCounterEl.textContent = "Live";
    });
}

// ─── 13. CONTACT FORM SUBMISSION ──────────────────────
const contactForm = document.getElementById('contactForm');
const resultEl = document.getElementById('result');

if (contactForm && resultEl) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const json = JSON.stringify(Object.fromEntries(formData));
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    resultEl.textContent = "Transmitting message...";
    submitBtn.disabled = true;

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: json
    })
      .then(async (response) => {
        const res = await response.json();
        if (response.status === 200) {
          resultEl.innerHTML = '<i class="fas fa-check-circle"></i> Message dispatched successfully! I will reply within 24 hours.';
          submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
          contactForm.reset();
        } else {
          resultEl.textContent = res.message || "Submission failed. Please email contact@dhananjay.app";
        }
      })
      .catch(() => {
        resultEl.textContent = "Connection error. Please email directly at contact@dhananjay.app";
      })
      .finally(() => {
        setTimeout(() => {
          resultEl.textContent = "";
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 6000);
      });
  });
}

// ─── 14. INTERACTIVE SRE TERMINAL SIMULATOR ──────────
const sreDrills = {
  disk: {
    cmd: "./drill-runner.sh --target disk-pressure --strict",
    lines: [
      { badge: "CRIT", cls: "badge-crit", text: "/dev/nvme0n1 space: 94.2% [CAPACITY BREACH]" },
      { badge: "EXEC", cls: "badge-exec", text: "runbooks/purge-nvme-spillover.sh --auto-verify", meter: { fill: "52%", label: "94% → 48%" } },
      { badge: "PASS", cls: "badge-pass", text: "42.8 GB purged · MTTR: 18.4s · exit: 0 (OK)" }
    ]
  },
  oom: {
    cmd: "./drill-runner.sh --target memory-leak --cgroups",
    lines: [
      { badge: "WARN", cls: "badge-crit", text: "cgroup: nginx-worker.slice at 98.6% RAM [OOM LIMIT]" },
      { badge: "EXEC", cls: "badge-exec", text: "kernel: invoked oom-killer (pid 18241) · auto-restarting" },
      { badge: "PASS", cls: "badge-pass", text: "systemd: nginx.service healthy [ACTIVE] · exit: 0" }
    ]
  },
  net: {
    cmd: "./drill-runner.sh --target packet-drop --iptables",
    lines: [
      { badge: "DROP", cls: "badge-crit", text: "iptables: simulated 35% packet loss on eth0 interface" },
      { badge: "EXEC", cls: "badge-exec", text: "runbooks/route-remediation.sh --flush-stale-conntrack" },
      { badge: "PASS", cls: "badge-pass", text: "latency: 1.2ms (p99) · 0% loss restored · exit: 0" }
    ]
  }
};

const sreScreen = document.getElementById('sreTermBody');
const sreButtons = document.querySelectorAll('.sre-pill-btn');

function renderSreDrill(scenarioKey) {
  const drill = sreDrills[scenarioKey];
  if (!drill || !sreScreen) return;

  sreScreen.style.opacity = '0';
  setTimeout(() => {
    sreScreen.innerHTML = `
      <div class="term-line">
        <span class="term-prompt">$</span>
        <span class="term-cmd">${drill.cmd}</span>
        <span class="term-cursor"></span>
      </div>
      ${drill.lines.map(line => `
        <div class="term-line">
          <span class="term-badge ${line.cls}">${line.badge}</span>
          <span class="term-text">${line.text}</span>
          ${line.meter ? `
            <span class="term-meter">
              <span class="meter-bar"><span class="meter-fill" style="width: ${line.meter.fill}"></span></span>
              <span>${line.meter.label}</span>
            </span>
          ` : ''}
        </div>
      `).join('')}
    `;
    sreScreen.style.opacity = '1';
  }, 160);

  sreButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-scenario') === scenarioKey);
  });
}

let activeDrillIdx = 0;
const drillKeys = ['disk', 'oom', 'net'];
let sreTimer = null;
let userInteracted = false;

function cycleSreDrill() {
  if (userInteracted) return;
  activeDrillIdx = (activeDrillIdx + 1) % drillKeys.length;
  renderSreDrill(drillKeys[activeDrillIdx]);
}

if (sreButtons.length > 0) {
  sreButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      userInteracted = true;
      clearInterval(sreTimer);
      const scenario = btn.getAttribute('data-scenario');
      renderSreDrill(scenario);
    });
  });

  const termContainer = document.querySelector('.sre-terminal-container');
  if (termContainer) {
    termContainer.addEventListener('mouseenter', () => clearInterval(sreTimer));
    termContainer.addEventListener('mouseleave', () => {
      if (!userInteracted) {
        clearInterval(sreTimer);
        sreTimer = setInterval(cycleSreDrill, 5000);
      }
    });
  }

  sreTimer = setInterval(cycleSreDrill, 5000);
}
