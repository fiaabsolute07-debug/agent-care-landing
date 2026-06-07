/* ================================================================
   Agent Care — Landing Page JavaScript
   Matches agent-care.xyz structure
   ================================================================ */

/* ── Hamburger menu ─────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger-btn');
const drawer    = document.getElementById('mobile-drawer');
if (hamburger && drawer) {
  hamburger.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── FAQ accordion ──────────────────────────────────────────── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answerId = btn.getAttribute('aria-controls');
    const answer   = document.getElementById(answerId);
    const toggle   = btn.querySelector('.faq-toggle');
    const isOpen   = answer.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
    document.querySelectorAll('.faq-question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.querySelector('.faq-toggle').textContent = '+';
    });

    // Open clicked (if was closed)
    if (!isOpen) {
      answer.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      toggle.textContent = '−';
    }
  });
});

/* ── Waitlist form ──────────────────────────────────────────── */
const form    = document.getElementById('waitlist-form');
const success = document.getElementById('form-success');
if (form && success) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('wl-email').value.trim();
    if (!email || !email.includes('@')) {
      document.getElementById('wl-email').focus();
      return;
    }
    form.style.display = 'none';
    success.classList.add('show');
  });
}

/* ── Agent network: draw SVG lines between nodes ─────────── */
function drawConnections() {
  const svg   = document.getElementById('task-flow-svg');
  const scene = document.getElementById('network-scene');
  if (!svg || !scene) return;

  const nodes = {
    user:   document.getElementById('node-user'),
    router: document.getElementById('node-router'),
    diag:   document.getElementById('node-diag'),
    summ:   document.getElementById('node-summ'),
    notify: document.getElementById('node-notify'),
  };

  const sceneRect = scene.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${sceneRect.width} ${sceneRect.height}`);
  svg.style.width  = sceneRect.width  + 'px';
  svg.style.height = sceneRect.height + 'px';

  function center(node) {
    const r = node.getBoundingClientRect();
    return {
      x: r.left - sceneRect.left + r.width / 2,
      y: r.top  - sceneRect.top  + r.height / 2
    };
  }

  const connections = [
    { from:'user',   to:'router', color:'#1a6eb5', width:1.5, active:true },
    { from:'router', to:'diag',   color:'#1a6eb5', width:1.2, active:true },
    { from:'router', to:'summ',   color:'#9b9890', width:1,   active:false },
    { from:'diag',   to:'router', color:'#1a6eb5', width:0.8, active:true },
    { from:'summ',   to:'notify', color:'#9b9890', width:0.8, active:false },
  ];

  svg.innerHTML = '';
  connections.forEach((conn, i) => {
    const a = center(nodes[conn.from]);
    const b = center(nodes[conn.to]);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    line.setAttribute('stroke', conn.color);
    line.setAttribute('stroke-width', conn.width);
    line.setAttribute('stroke-dasharray', conn.active ? '6 4' : '3 6');
    line.setAttribute('opacity', conn.active ? '0.6' : '0.25');

    const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    anim.setAttribute('attributeName', 'stroke-dashoffset');
    anim.setAttribute('from', '0');
    anim.setAttribute('to', conn.active ? '-20' : '-18');
    anim.setAttribute('dur', conn.active ? '1s' : '2s');
    anim.setAttribute('repeatCount', 'indefinite');
    anim.setAttribute('begin', (i * 0.2) + 's');
    line.appendChild(anim);
    svg.appendChild(line);
  });
}

window.addEventListener('load', () => setTimeout(drawConnections, 100));
window.addEventListener('resize', drawConnections);

/* ── Activity feed animation ────────────────────────────────── */
const feedData = [
  { ts:'14:22:09', st:'ok',      msg:'<span class="agent-ref">SummaryBot</span> → generates → <span class="agent-ref">CareRouter</span>', cost:'0.02' },
  { ts:'14:22:11', st:'ok',      msg:'<span class="agent-ref">CareRouter</span> → dispatches → <span class="agent-ref">NotifyAgent</span>', cost:'0.005' },
  { ts:'14:22:13', st:'ok',      msg:'<span class="agent-ref">NotifyAgent</span> → sends email → user@clinic', cost:'—' },
  { ts:'14:22:15', st:'ok',      msg:'<span class="agent-ref">UserReq</span> → new task → <span class="agent-ref">CareRouter</span>', cost:'0.01' },
  { ts:'14:22:17', st:'pending', msg:'<span class="agent-ref">CareRouter</span> → queuing → <span class="agent-ref">DiagAgent</span>', cost:'0.04' },
  { ts:'14:22:19', st:'ok',      msg:'<span class="agent-ref">DiagAgent</span> → analysis done → <span class="agent-ref">CareRouter</span>', cost:'—' },
  { ts:'14:22:21', st:'ok',      msg:'<span class="agent-ref">CareRouter</span> → delegates → <span class="agent-ref">SummaryBot</span>', cost:'0.02' },
  { ts:'14:22:23', st:'pending', msg:'<span class="agent-ref">SummaryBot</span> → compiling pdf → pending', cost:'—' },
];
let feedIdx = 0;
const feedContainer = document.getElementById('feed-entries');
const MAX_FEED = 4;

function addFeedEntry() {
  if (!feedContainer) return;
  const entry = feedData[feedIdx % feedData.length];
  feedIdx++;
  const div = document.createElement('div');
  div.className = 'feed-entry new-entry';
  div.innerHTML = `
    <span class="feed-ts">${entry.ts}</span>
    <span class="feed-msg"><span class="feed-icon ${entry.st === 'ok' ? 'ok' : 'pending'}">${entry.st === 'ok' ? '✓' : '⟳'}</span> ${entry.msg}</span>
    <span class="feed-cost">${entry.cost}</span>`;
  feedContainer.insertBefore(div, feedContainer.firstChild);
  setTimeout(() => div.classList.remove('new-entry'), 250);
  while (feedContainer.children.length > MAX_FEED) {
    feedContainer.removeChild(feedContainer.lastChild);
  }
}
setInterval(addFeedEntry, 2500);

/* ── Smooth scroll for anchor links ────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior:'smooth', block:'start' });
    }
  });
});

/* ── Active nav link on scroll ──────────────────────────────── */
const sections = ['how-it-works', 'features', 'live-preview', 'waitlist', 'faq'];
const navLinks = document.querySelectorAll('.nav-links a');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const href = '#' + entry.target.id;
      const link = document.querySelector(`.nav-links a[href="${href}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.3 });

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) observer.observe(el);
});

/* ── Hero mascot face sequence ──────────────────────────────── */
const heroFace   = document.getElementById('hero-face');
const heroBubble = document.getElementById('mascot-bubble');
if (heroFace) {
  const faces   = ['._.', 'o_o', '^_^', 'o_o', '._.'];
  const bubbles = [
    'monitoring 247 agents... o_o',
    'all systems nominal ^_^',
    'routing 12 tasks... >_<',
    'idle. waiting for work ._.',
    'monitoring 247 agents... o_o',
  ];
  let fi = 0;
  setInterval(() => {
    fi = (fi + 1) % faces.length;
    heroFace.textContent = faces[fi];
    if (heroBubble) heroBubble.textContent = bubbles[fi];
  }, 3000);

  heroFace.addEventListener('click', () => {
    heroFace.textContent = '*_*';
    if (heroBubble) heroBubble.textContent = 'you clicked me! *_*';
    setTimeout(() => {
      heroFace.textContent = '^_^';
      if (heroBubble) heroBubble.textContent = 'hehe ^_^';
    }, 1500);
  });
}
