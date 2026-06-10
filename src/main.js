/**
 * CarbonLedger — App Entry & Hash Router
 */
import './style.css';
import { getProfile } from './services/storage.js';
import { showToast } from './utils/toast.js';

// ── Theme (Dark Mode) ─────────────────────────────────────────────────────────

function applyTheme() {
  const saved = localStorage.getItem('carbon-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
  // If no preference stored, system media query handles it via CSS
}

window.toggleTheme = function() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let next;
  if (!current) {
    // No explicit override — flip against system
    next = systemDark ? 'light' : 'dark';
  } else {
    next = current === 'dark' ? 'light' : 'dark';
  }

  html.setAttribute('data-theme', next);
  localStorage.setItem('carbon-theme', next);
  return next;
};

applyTheme();

// ── Router ────────────────────────────────────────────────────────────────────

const routes = {
  '/welcome':      () => import('./components/welcome.js'),
  '/onboarding':   () => import('./components/onboarding.js'),
  '/':             () => import('./components/dashboard.js'),
  '/log':          () => import('./components/logger.js'),
  '/history':      () => import('./components/history.js'),
  '/goals':        () => import('./components/goals.js'),
  '/reports':      () => import('./components/reports.js'),
  '/achievements': () => import('./components/streaks.js'),
  '/settings':     () => import('./components/settings.js'),
};

const viewRoot  = document.getElementById('view-root');
const bottomNav = document.getElementById('bottom-nav');
const navItems  = document.querySelectorAll('.nav-item');

const NAV_ROUTES = ['/', '/log', '/goals', '/reports', '/achievements'];

// ── Skeleton Screens ──────────────────────────────────────────────────────────

const SKEL_BLOCK = `<div class="skel-block"></div>`;
const SKEL_LINE  = (w = '100%') => `<div class="skel-line" style="width:${w}"></div>`;

function getSkeletonFor(path) {
  const wrap = (inner) => `<div class="page-enter" style="padding:16px;">${inner}</div>`;

  switch (path) {
    case '/':
      return wrap(`
        <div class="skel-forest"></div>
        <div style="margin-top:16px;">
          ${SKEL_BLOCK}
          <div style="padding:20px;">
            ${SKEL_LINE('60%')} ${SKEL_LINE('40%')}
            <div class="skel-bar" style="margin-top:16px;"></div>
          </div>
        </div>
        <div style="margin-top:16px;">
          ${SKEL_BLOCK}
          <div style="padding:20px;">
            ${SKEL_LINE('50%')}
            ${[1,2,3].map(() => `<div class="skel-row">${SKEL_LINE('70%')}</div>`).join('')}
          </div>
        </div>
      `);

    case '/reports':
      return wrap(`
        <div style="display:flex;gap:8px;margin-bottom:16px;">${[1,2,3].map(()=>`<div class="skel-pill"></div>`).join('')}</div>
        <div class="skel-block" style="height:180px;border-radius:20px;"></div>
        <div style="margin-top:12px;" class="skel-block" style="height:200px;border-radius:20px;"></div>
      `);

    case '/goals':
      return wrap(`
        ${SKEL_LINE('40%')}
        ${[1,2].map(() => `
          <div class="skel-block" style="height:100px;border-radius:20px;margin-top:12px;"></div>
        `).join('')}
      `);

    case '/achievements':
      return wrap(`
        <div class="skel-block" style="height:160px;border-radius:20px;margin-bottom:16px;"></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
          ${[1,2,3,4,5,6].map(() => `<div class="skel-block" style="height:100px;border-radius:16px;"></div>`).join('')}
        </div>
      `);

    case '/log':
      return wrap(`
        <div class="skel-bar" style="height:44px;border-radius:12px;margin-bottom:20px;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
          ${[1,2,3,4].map(() => `<div class="skel-block" style="height:90px;border-radius:20px;"></div>`).join('')}
        </div>
        ${[1,2,3,4].map(() => `<div class="skel-block" style="height:52px;border-radius:12px;margin-bottom:8px;"></div>`).join('')}
      `);

    default:
      return `<div class="loading-wrap"><div class="spinner"></div></div>`;
  }
}

async function navigate(path) {

  // Normalize
  if (!routes[path]) path = '/';

  // Update nav state
  const showNav = NAV_ROUTES.includes(path);
  bottomNav.classList.toggle('hidden', !showNav);

  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.route === path);
  });

  // ── Animated page transition ──────────────────────────────────────────────
  const outgoing = viewRoot.firstElementChild;

  // 1. Fade out current page (skip if nothing is there yet)
  if (outgoing) {
    outgoing.classList.add('page-exit');
    await new Promise(r => setTimeout(r, 180)); // match CSS duration
  }

  // 2. Show route-matched skeleton while fetching
  viewRoot.innerHTML = getSkeletonFor(path);

  // 3. Load & render component
  try {
    const mod = await routes[path]();
    const html = await mod.render();
    viewRoot.innerHTML = html;

    // 4. Fade in new page
    const incoming = viewRoot.firstElementChild;
    if (incoming) {
      incoming.classList.add('page-enter');
    }

    if (typeof mod.init === 'function') mod.init();
  } catch (err) {
    console.error('Navigation error:', err);
    viewRoot.innerHTML = `<div class="empty-state"><span class="empty-icon">⚠️</span><p>Something went wrong. Please try again.</p></div>`;
  }
}


function getPath() {
  return window.location.hash.slice(1) || '/';
}

window.addEventListener('hashchange', () => navigate(getPath()));

// ── Nav click handlers ────────────────────────────────────────────────────────

navItems.forEach(item => {
  item.addEventListener('click', () => {
    window.location.hash = item.dataset.route;
  });
});

// ── Global navigation helper (used by components) ────────────────────────────

window.carbonNavigate = (path) => {
  window.location.hash = path;
};

// Expose toast globally for components
window.showToast = showToast;

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function bootstrap() {
  const profile = await getProfile();
  if (!profile || !profile.onboardingComplete) {
    const path = getPath();
    // Allow going to onboarding if already clicked get started, else welcome
    if (path === '/onboarding') {
      navigate('/onboarding');
    } else {
      window.location.hash = '/welcome';
    }
  } else {
    const path = getPath();
    navigate(path === '/onboarding' || path === '/welcome' ? '/' : path);
  }
}

bootstrap();
