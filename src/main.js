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

  // 2. Show loading skeleton while fetching
  viewRoot.innerHTML = '<div class="loading-wrap"><div class="spinner"></div><span>Loading…</span></div>';

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
