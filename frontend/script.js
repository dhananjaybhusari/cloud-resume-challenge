/* =============================================
   DHANANJAY BHUSARI — PORTFOLIO SCRIPT
   ============================================= */

'use strict';

// ─── PROGRESSIVE ENHANCEMENT ───────────────────────
// Mark body as JS-ready so reveal animations activate.
// Content is ALWAYS visible without JS (opacity:1 by default in CSS).
document.body.classList.add('js-ready');

// ─── CURSOR GLOW ───────────────────────────────────
const cursorGlow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});

// ─── NAVBAR SCROLL EFFECT ──────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ─── HAMBURGER MENU ────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  // Animate hamburger spans
  const spans = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Close menu on nav link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity   = '';
    });
  });
});

// ─── TYPEWRITER EFFECT ─────────────────────────────
const roles = [
  'Cloud Support Engineer',
  'Linux Sysadmin',
  'SysOps Engineer',
  'Junior DevOps Engineer',
  'AWS Practitioner',
];

const typewriterEl = document.getElementById('typewriter');
let roleIndex  = 0;
let charIndex  = 0;
let isDeleting = false;
let typeDelay  = 100;

function type() {
  const current = roles[roleIndex];

  if (!isDeleting) {
    typewriterEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      isDeleting = true;
      typeDelay  = 2000; // pause before deleting
    } else {
      typeDelay = 80;
    }
  } else {
    typewriterEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      roleIndex  = (roleIndex + 1) % roles.length;
      typeDelay  = 300;
    } else {
      typeDelay = 40;
    }
  }

  setTimeout(type, typeDelay);
}

// Start after page load delay
setTimeout(type, 800);

// ─── SCROLL REVEAL ─────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger sibling reveals
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const idx      = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

// ─── BACK TO TOP ───────────────────────────────────
const backTop = document.getElementById('backTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backTop.classList.add('visible');
  } else {
    backTop.classList.remove('visible');
  }
}, { passive: true });

backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── ACTIVE NAV LINK ON SCROLL ─────────────────────
const sections    = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        allNavLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${id}`) {
            link.style.color = 'var(--accent)';
          }
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));

const contactForm = document.getElementById('contactForm');
const result = document.getElementById('result');

contactForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(contactForm);
  const json = JSON.stringify(Object.fromEntries(formData));
  const btn = contactForm.querySelector('button[type="submit"]');
  const origText = btn.innerHTML;

  result.innerHTML = "Sending...";
  btn.disabled = true;

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: json
  })
  .then(async (response) => {
    let res = await response.json();
    if (response.status == 200) {
      result.innerHTML = "Message sent successfully!";
      btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
      contactForm.reset();
    } else {
      result.innerHTML = res.message;
    }
  })
  .catch(() => { result.innerHTML = "Something went wrong!"; })
  .finally(() => {
    setTimeout(() => {
      result.innerHTML = "";
      btn.innerHTML = origText;
      btn.disabled = false;
    }, 5000);
  });
});
// ─── SKILL CARD GLOW ON HOVER ──────────────────────
document.querySelectorAll('.sk-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width)  * 100;
    const y    = ((e.clientY - rect.top)  / rect.height) * 100;
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
});


// ─── PROJECT CARD TILT ─────────────────────────────
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left - rect.width  / 2;
    const y      = e.clientY - rect.top  - rect.height / 2;
    const tiltX  = (y / rect.height) * 3;
    const tiltY  = (x / rect.width)  * -3;
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-3px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── TERMINAL TYPING ANIMATION ─────────────────────
// Animate terminal lines on load
const termLines = document.querySelectorAll('.terminal-body p');
termLines.forEach((line, i) => {
  line.style.opacity   = '0';
  line.style.transform = 'translateX(-10px)';
  line.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  setTimeout(() => {
    line.style.opacity   = '1';
    line.style.transform = '';
  }, 900 + i * 200);
});

// ─── SMOOTH SCROLL FOR ALL ANCHOR LINKS ────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // navbar height
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── STATS COUNTER ANIMATION ───────────────────────
const statNums = document.querySelectorAll('.stat-num');

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = el.textContent.replace(/\D/g, '');
        if (!target) return; // skip ∞ and +-free values

        const suffix = el.textContent.replace(/[\d]/g, '');
        let current  = 0;
        const inc    = Math.ceil(parseInt(target) / 40);
        const timer  = setInterval(() => {
          current += inc;
          if (current >= parseInt(target)) {
            el.textContent = target + suffix;
            clearInterval(timer);
          } else {
            el.textContent = current + suffix;
          }
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

statNums.forEach(n => {
  if (n.textContent !== '∞') counterObserver.observe(n);
});

// ─── PERFORMANCE: PAUSE ANIMATIONS WHEN HIDDEN ─────
document.addEventListener('visibilitychange', () => {
  const orbs = document.querySelectorAll('.orb');
  orbs.forEach(orb => {
    orb.style.animationPlayState = document.hidden ? 'paused' : 'running';
  });
});

// ─── PROJECT ACCORDION TOGGLE ──────────────────────
document.querySelectorAll('.proj-toggle-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    // Toggle active state on button (flips the chevron)
    this.classList.toggle('active');
    
    // Change text contextually
    const textSpan = this.querySelector('.toggle-text');
    if (this.classList.contains('active')) {
      textSpan.textContent = 'Hide Details';
      this.setAttribute('aria-expanded', 'true');
    } else {
      textSpan.textContent = 'View Architecture & Details';
      this.setAttribute('aria-expanded', 'false');
    }

    // Toggle the open class on the next element (the expandable wrapper)
    const expandable = this.nextElementSibling;
    expandable.classList.toggle('open');
  });
});

// ─── PROJECT MODAL LOGIC ───────────────────────────
const projectData = {
  runbooks: {
    title: "cloud-incident-runbooks",
    problem: "Cloud engineers get paged at 3 AM for incidents they've never seen. Without practice, the first real incident becomes a learning exercise at the worst possible time.",
    solution: "A scenario-based CLI simulator that reproduces real production failures — disk pressure, OOM kills, zombie processes, network partition — with standardized runbooks and automated verify scripts.",
    learnings: ["Idempotent scripts using --reset flags and set -euo pipefail", "CI pipeline with shellcheck linting on every push", "Structured incident response methodology (observe → diagnose → remediate → verify)"]
  },
  monitoring: {
    title: "Linux Server Monitoring & Automation",
    problem: "Manual server health checks are reactive. By the time you notice disk is full or a service crashed, the damage is done. SysAdmins need eyes everywhere, all the time.",
    solution: "An automated monitoring suite that checks CPU, memory, disk usage, and service health on configurable intervals. Sends email/log alerts when thresholds breach and auto-restarts failed systemd services.",
    learnings: ["systemd unit files and service management at depth", "Shell arithmetic, conditional alerting, and log rotation", "Building operational tooling that SysAdmins actually use"]
  },
  serverless: {
    title: "Serverless Resume — Cloud Resume Challenge",
    problem: "Most cloud freshers can't demonstrate real AWS production experience. The Cloud Resume Challenge forces you to build and wire together the actual services cloud engineers use daily.",
    solution: "A fully serverless web application deployed on AWS: static frontend on S3 + CloudFront with HTTPS, a visitor counter backed by Lambda + API Gateway + DynamoDB, and a full CI/CD pipeline via GitHub Actions.",
    learnings: ["End-to-end AWS service integration — not isolated tutorials", "IAM least-privilege policies, CORS configuration, CloudFront cache invalidation", "Infrastructure as Code with Terraform for reproducible deploys", "Full CI/CD: test → build → deploy on every commit"]
  }
};

const modal = document.getElementById('projectModal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.getElementById('modalClose');

document.querySelectorAll('.open-modal-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const projId = btn.getAttribute('data-project');
    const data = projectData[projId];

    if(data) {
      modalBody.innerHTML = `
        <h3>${data.title}</h3>
        <h4><i class="fas fa-triangle-exclamation"></i> Problem</h4>
        <p>${data.problem}</p>
        <h4><i class="fas fa-lightbulb"></i> Solution</h4>
        <p>${data.solution}</p>
        <h4><i class="fas fa-brain"></i> Key Learnings</h4>
        <ul>
          ${data.learnings.map(item => `<li>${item}</li>`).join('')}
        </ul>
      `;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Locks background scrolling
    }
  });
});

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Unlocks background scrolling
}

// Close Triggers
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal(); // Click outside to close
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

// Example adjustment configuration if using odometer frameworks
window.odometerOptions = {
  format: '(,ddd).dd' // Enforces the decimal to stay explicitly where intended
};


// ─── VISITOR COUNTER LOGIC ─────────────────────────
const statCounterEl = document.getElementById('visitor-count-stats');
const footerCounterEl = document.getElementById('visitor-count-footer');

// Only fetch if at least one of the counters exists on the page
if (statCounterEl || footerCounterEl) {
  fetch('https://7eok0ntilf.execute-api.us-east-1.amazonaws.com/prod/count', {
    method: 'POST', 
  })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      // Update both HTML elements simultaneously with the exact count
      if (statCounterEl) statCounterEl.textContent = data.count;
      if (footerCounterEl) footerCounterEl.textContent = data.count;
    })
    .catch(error => {
      console.error('Error fetching visitor count:', error);
      if (statCounterEl) statCounterEl.textContent = "Offline";
      if (footerCounterEl) footerCounterEl.textContent = "Offline";
    });
}