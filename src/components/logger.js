/**
 * CarbonLedger — Activity Logger
 */
import {
  PRESETS,
  CATEGORY_ICONS,
  getDailyBudget,
} from '../services/carbon-data.js';
import {
  addActivity,
  updateStreak,
  getProfile,
  getTodayTotal,
} from '../services/storage.js';
import { parseActivity } from '../services/gemini.js';
import { escapeHtml } from '../utils/sanitize.js';
import { playSound } from '../utils/audio.js';

let currentTab = 'quick'; // 'quick' | 'smart'
let selectedCategory = 'transport'; // for quick log

/**
 * @returns {string} The quick log HTML view
 */
function renderQuickLog() {
  const cats = [
    { id: 'transport', icon: '🚗', name: 'Transport' },
    { id: 'food', icon: '🍔', name: 'Food' },
    { id: 'energy', icon: '⚡', name: 'Energy' },
    { id: 'shopping', icon: '🛒', name: 'Shopping' },
  ];

  const categoryGrid = cats
    .map(
      (c) => `
    <div class="category-card ${selectedCategory === c.id ? 'active' : ''}" data-cat="${c.id}" role="button" tabindex="0" aria-label="${c.name} Category">
      <span class="cat-icon" aria-hidden="true">${c.icon}</span>
      <span class="cat-name">${c.name}</span>
    </div>
  `
    )
    .join('');

  const presetList = (PRESETS[selectedCategory] || [])
    .map(
      (p) => `
    <div class="preset-item" data-id="${p.id}" data-label="${p.label}" data-co2="${p.kgCO2}" role="button" tabindex="0" aria-label="Log ${p.label}">
      <span class="preset-icon" aria-hidden="true">${p.icon}</span>
      <span class="preset-label">${p.label}</span>
      <span class="preset-co2">+${p.kgCO2} kg</span>
    </div>
  `
    )
    .join('');

  return `
    <div class="category-grid">
      ${categoryGrid}
    </div>
    <div class="section-title">Presets</div>
    <div class="preset-list">
      ${presetList}
    </div>
  `;
}

/**
 * @returns {string} The smart log HTML view
 */
function renderSmartLog() {
  return `
    <div class="ai-input-wrap">
      <label for="ai-text" class="sr-only">Describe your activity to parse with AI</label>
      <textarea id="ai-text" class="ai-input" placeholder="e.g., I drove 15km to work and had a beef burger for lunch..." rows="3"></textarea>
      <button class="ai-send-btn" id="ai-submit" aria-label="Parse with AI">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
    
    <div id="ai-loading" class="hidden mt-16 text-center text-muted" aria-live="polite">
      <div class="spinner"></div>
      <div class="mt-8">Analyzing your day...</div>
    </div>

    <div id="ai-results-container" class="ai-results" aria-live="polite"></div>
  `;
}

/**
 * Renders the Logger UI components.
 * @returns {Promise<string>}
 */
export async function render() {
  return `
    <div class="page-header">
      <button id="btn-logger-back" class="back-btn" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1>Log Activity</h1>
    </div>

    <div class="logger-wrap fade-in">
      <div class="tab-bar">
        <button class="tab-btn ${currentTab === 'quick' ? 'active' : ''}" data-tab="quick">Quick Log</button>
        <button class="tab-btn ${currentTab === 'smart' ? 'active' : ''}" data-tab="smart">Smart Log ✨</button>
      </div>

      <div id="logger-content">
        ${currentTab === 'quick' ? renderQuickLog() : renderSmartLog()}
      </div>
    </div>
  `;
}

/**
 * Save an activity directly to IndexedDB and update streak state.
 * @param {string} category 
 * @param {string} label 
 * @param {number|string} kgCO2 
 * @param {'manual'|'ai'} source 
 */
async function handleSaveActivity(category, label, kgCO2, source = 'manual') {
  const activity = {
    id: crypto.randomUUID(),
    category,
    label,
    kgCO2: parseFloat(kgCO2),
    timestamp: Date.now(),
    source,
  };

  await addActivity(activity);

  const [profile, todayTotal] = await Promise.all([
    getProfile(),
    getTodayTotal(),
  ]);
  const budget = getDailyBudget(profile);
  const underBudget = todayTotal <= budget;

  await updateStreak(underBudget);

  playSound('ching');
  window.showToast(`Logged: ${label} (+${kgCO2} kg)`, 'success');
}

/**
 * Process text input with Gemini to generate activities.
 */
async function handleSmartLogSubmit() {
  const submitBtn = document.getElementById('ai-submit');
  const textEl = document.getElementById('ai-text');
  const text = textEl.value.trim();
  if (!text) return;

  const loader = document.getElementById('ai-loading');
  const resultsDiv = document.getElementById('ai-results-container');

  loader.classList.remove('hidden');
  resultsDiv.innerHTML = '';
  textEl.disabled = true;
  submitBtn.disabled = true;

  try {
    const results = await parseActivity(text);
    if (!results) throw new Error('API failure');

    if (results.length === 0) {
      resultsDiv.innerHTML = '<div class="text-center text-muted">No carbon-emitting activities found in that text.</div>';
      return;
    }

    resultsDiv.innerHTML = results
      .map(
        (res, i) => `
      <div class="ai-result-card" id="ai-res-${i}">
        <div class="activity-icon" aria-hidden="true">${escapeHtml(CATEGORY_ICONS[res.category] || '🌱')}</div>
        <div class="ai-res-info">
          <div class="ai-res-label">${escapeHtml(res.label)}</div>
          <div class="ai-res-co2">+${escapeHtml(res.kgCO2)} kg CO₂</div>
        </div>
        <div class="ai-result-actions">
          <button class="ai-result-btn confirm" data-idx="${i}" data-cat="${escapeHtml(res.category)}" data-lbl="${escapeHtml(res.label)}" data-co2="${escapeHtml(res.kgCO2)}" aria-label="Confirm">✓</button>
          <button class="ai-result-btn reject" data-idx="${i}" aria-label="Reject">✗</button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (error) {
    console.error(error);
    window.showToast('Failed to connect to AI. Please try again.', 'error');
  } finally {
    loader.classList.add('hidden');
    textEl.disabled = false;
    submitBtn.disabled = false;
  }
}

/**
 * Attaches event listeners for the Logger page.
 */
export function init() {
  const content = document.getElementById('logger-content');
  const wrap = document.querySelector('.logger-wrap');
  const backBtn = document.getElementById('btn-logger-back');

  if (backBtn) {
    backBtn.addEventListener('click', () => window.carbonNavigate('/'));
  }

  wrap.addEventListener('click', async (e) => {
    if (e.target.classList.contains('tab-btn')) {
      const tabBtns = wrap.querySelectorAll('.tab-btn');
      tabBtns.forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');

      currentTab = e.target.dataset.tab;
      content.innerHTML = currentTab === 'quick' ? renderQuickLog() : renderSmartLog();
    }
  });

  // Handle keyboard events for accessibility
  content.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      
      const catCard = e.target.closest('.category-card');
      if (catCard && currentTab === 'quick') {
        selectedCategory = catCard.dataset.cat;
        content.innerHTML = renderQuickLog();
        return;
      }

      const presetCard = e.target.closest('.preset-item');
      if (presetCard) {
        const { label, co2 } = presetCard.dataset;
        await handleSaveActivity(selectedCategory, label, co2, 'manual');
        return;
      }
    }
  });

  content.addEventListener('click', async (e) => {
    // Quick Log events
    const catCard = e.target.closest('.category-card');
    if (catCard && currentTab === 'quick') {
      selectedCategory = catCard.dataset.cat;
      content.innerHTML = renderQuickLog();
      return;
    }

    const presetCard = e.target.closest('.preset-item');
    if (presetCard) {
      const { label, co2 } = presetCard.dataset;
      await handleSaveActivity(selectedCategory, label, co2, 'manual');
      return;
    }

    // Smart Log events
    const submitBtn = e.target.closest('#ai-submit');
    if (submitBtn) {
      await handleSmartLogSubmit();
      return;
    }

    const confirmBtn = e.target.closest('.ai-result-btn.confirm');
    const rejectBtn = e.target.closest('.ai-result-btn.reject');

    if (confirmBtn) {
      const { cat, lbl, co2, idx } = confirmBtn.dataset;
      await handleSaveActivity(cat, lbl, co2, 'ai');
      document.getElementById(`ai-res-${idx}`)?.remove();
    } else if (rejectBtn) {
      const idx = rejectBtn.dataset.idx;
      document.getElementById(`ai-res-${idx}`)?.remove();
    }
  });
}
