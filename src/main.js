/**
 * CarbonLedger — App Entry & Hash Router
 */
import './style.css';
import { getProfile } from './services/storage.js';
import { showToast } from './utils/toast.js';

// ── Router ────────────────────────────────────────────────────────────────────

const routes = {
  '/onboarding':   () => import('./components/onboarding.js'),
  '/':             () => import('./components/dashboard.js'),
  '/log':          () => import('./components/logger.js'),
  '/goals':        () => import('./components/goals.js'),
  '/reports':      () => import('./components/reports.js'),
  '/simulator':    () => import('./components/simulator.js'),
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

  // Load & render component
  try {
    viewRoot.innerHTML = '<div class="loading-wrap"><div class="spinner"></div><span>Loading…</span></div>';
    const mod = await routes[path]();
    const html = await mod.render();
    viewRoot.innerHTML = html;
    viewRoot.firstElementChild?.classList.add('page-enter');
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
    window.location.hash = '/onboarding';
  } else {
    const path = getPath();
    navigate(path === '/onboarding' ? '/' : path);
  }
}

bootstrap();
