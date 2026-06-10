/**
 * CarbonLedger — Dashboard Component
 */
import { initForest, updateForestHealth, cleanupForest } from './forest.js';
import {
  getProfile,
  getTodayTotal,
  getTodayActivities,
  getStreak,
  getGoals,
} from '../services/storage.js';
import { getDailyBudget, CATEGORY_ICONS } from '../services/carbon-data.js';
import { escapeHtml } from '../utils/sanitize.js';

let profile, budget, todayTotal, streak, goals;

/**
 * @param {number} pctUsed
 * @returns {string}
 */
function getBarClass(pctUsed) {
  let barClass = 'budget-bar-fill';
  if (pctUsed > 100) barClass += ' danger';
  else if (pctUsed > 80) barClass += ' warn';
  return barClass;
}

/**
 * @param {number} pctUsed
 * @param {number} currentStreak
 * @param {number} completedGoals
 * @returns {number}
 */
function calculateHealthScore(pctUsed, currentStreak, completedGoals) {
  let healthScore = 1 - pctUsed / 100;
  if (healthScore < 0) healthScore = 0;
  return Math.min(1, healthScore + currentStreak * 0.05 + completedGoals * 0.1);
}

/**
 * @returns {string}
 */
function renderForestHeader() {
  return `
    <div class="forest-container">
      <canvas id="forest-canvas" role="img" aria-label="Living forest visualization reflecting your carbon health"></canvas>
      <div id="btn-settings-nav" style="position: absolute; top: 20px; left: 20px; z-index: 10; cursor:pointer;" role="button" tabindex="0" aria-label="Settings">
        <div style="display:inline-flex; align-items:center; justify-content:center; width:44px; height:44px; background:rgba(255,255,255,0.2); backdrop-filter:blur(4px); border-radius:50%; color:white; font-size:1.5rem; text-shadow: 0 1px 2px rgba(0,0,0,0.3); border:1.5px solid rgba(255,255,255,0.4);">
          ${profile.avatar || '🌍'}
        </div>
      </div>
    </div>
  `;
}

/**
 * @param {number} pctUsed
 * @param {string} barClass
 * @returns {string}
 */
function renderBudgetCard(pctUsed, barClass) {
  return `
    <div class="card budget-card">
      <div class="section-title">Today's Budget</div>
      <div class="budget-numbers">
        <div class="budget-used">${todayTotal.toFixed(1)} <span>kg</span></div>
        <div class="budget-total">Target: <strong>${budget.toFixed(1)} kg</strong></div>
      </div>
      <div class="budget-bar-wrap">
        <div class="${barClass}" style="width: ${pctUsed}%"></div>
      </div>
    </div>
  `;
}

/**
 * @returns {string}
 */
function renderStreakCard() {
  return `
    <div class="card" style="padding: 12px 20px;">
      <div class="flex items-center justify-between">
        <div>
          <div class="section-title" style="margin:0;">Current Streak</div>
          <button class="btn btn-ghost btn-sm mt-8" id="btn-share-impact" style="padding: 4px 8px; font-size: 0.75rem;" aria-label="Share your carbon impact streak">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;margin-right:4px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share impact
          </button>
        </div>
        <div class="streak-badge" aria-live="polite">
          ${streak.current} ${streak.current > 0 ? '🔥' : '🧊'}
        </div>
      </div>
    </div>
  `;
}

/**
 * @param {import('../services/storage.js').Activity[]} activities
 * @returns {string}
 */
function renderActivityCard(activities) {
  const content =
    activities.length === 0
      ? `<div class="empty-state" style="padding: 20px 0;">
          <span class="empty-icon" style="font-size:2rem;">🍃</span>
          <p>No activity logged yet today.</p>
         </div>`
      : `<ul class="activity-list">
          ${activities
            .slice(0, 5)
            .map(
              (a) => `
            <li class="activity-item">
              <div class="activity-icon" aria-hidden="true">${escapeHtml(CATEGORY_ICONS[a.category] || '🌱')}</div>
              <div class="activity-label">${escapeHtml(a.label)}</div>
              <div class="activity-co2">${a.kgCO2.toFixed(1)} kg</div>
            </li>
          `
            )
            .join('')}
         </ul>`;

  return `
    <div class="card">
      <div class="flex items-center justify-between mb-12">
        <div class="section-title" style="margin:0;">Today's Activity</div>
        <a href="#/history" class="text-green font-outfit fw-semibold" style="text-decoration:none;font-size:0.875rem;" aria-label="See all activities">See all</a>
      </div>
      ${content}
    </div>
  `;
}

/**
 * @returns {string}
 */
function renderQuickScenarios() {
  const annual = Math.round(budget * 365);
  return `
    <div class="card mb-24">
      <div class="section-title">Quick Scenarios</div>
      <p class="text-muted" style="font-size:0.875rem; margin-bottom:16px;">Move sliders to see impact on your annual footprint.</p>

      <div class="sim-slider-wrap">
        <label for="sim-transit" class="sim-slider-label"><span>🚲 Transit / bike</span><span class="sim-val" id="val-transit">0 days/wk</span></label>
        <input type="range" id="sim-transit" min="0" max="7" value="0" data-saving="3.84" aria-label="Transit or bike days per week">
      </div>
      <div class="sim-slider-wrap">
        <label for="sim-meat" class="sim-slider-label"><span>🥗 Meat-free</span><span class="sim-val" id="val-meat">0 days/wk</span></label>
        <input type="range" id="sim-meat" min="0" max="7" value="0" data-saving="5.23" aria-label="Meat-free days per week">
      </div>
      <div class="sim-slider-wrap mb-16">
        <label for="sim-thermo" class="sim-slider-label"><span>❄️ Lower temp</span><span class="sim-val" id="val-thermo">0°C</span></label>
        <input type="range" id="sim-thermo" min="0" max="5" value="0" data-saving="0.86" aria-label="Degrees to lower thermostat">
      </div>

      <div class="sim-comparison">
        <div class="sim-row">
          <div class="sim-row-label">Current</div>
          <div class="sim-bar-wrap"><div class="sim-bar-fill current" style="width:100%"></div></div>
          <div class="sim-val-right">${annual} kg</div>
        </div>
        <div class="sim-row">
          <div class="sim-row-label">Projected</div>
          <div class="sim-bar-wrap"><div class="sim-bar-fill projected" id="sim-bar" style="width:100%"></div></div>
          <div class="sim-val-right text-green" id="sim-total-val" aria-live="polite">${annual} kg</div>
        </div>
      </div>

      <div class="equivalents-row">
        <div class="equivalent-chip" aria-label="Trees planted equivalent"><span class="eq-icon" aria-hidden="true">🌳</span><span class="eq-val" id="eq-trees">0</span><span class="eq-label">trees planted</span></div>
        <div class="equivalent-chip" aria-label="Flights offset equivalent"><span class="eq-icon" aria-hidden="true">✈️</span><span class="eq-val" id="eq-flights">0</span><span class="eq-label">flights offset</span></div>
      </div>
    </div>
  `;
}

/**
 * @returns {string}
 */
function renderAskAI() {
  return `
    <div class="card mb-24">
      <div class="section-title">Ask AI Anything</div>
      <p class="text-muted mb-12" style="font-size:0.875rem;">Type any scenario to see its impact.</p>
      <div class="ai-input-wrap">
        <label for="whatif-text" class="sr-only">Ask AI anything about your carbon footprint</label>
        <textarea id="whatif-text" class="ai-input" placeholder="What if I installed solar panels?" rows="2"></textarea>
        <button class="ai-send-btn" id="whatif-submit" aria-label="Calculate Scenario">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <div id="whatif-loading" class="hidden mt-16 text-center text-muted" aria-live="polite"><div class="spinner"></div><div class="mt-8">Calculating impact...</div></div>
      <div id="whatif-result" class="mt-16" aria-live="polite"></div>
    </div>
  `;
}

/**
 * Renders the full dashboard view.
 * @returns {Promise<string>}
 */
export async function render() {
  profile = await getProfile();
  todayTotal = await getTodayTotal();
  streak = await getStreak();
  goals = await getGoals();

  if (!profile) return '<div>Error loading profile</div>';

  budget = getDailyBudget(profile);
  const pctUsed = Math.min((todayTotal / budget) * 100, 100);
  const barClass = getBarClass(pctUsed);
  const activities = await getTodayActivities();

  return `
    <div class="dashboard-wrap page-enter">
      ${renderForestHeader()}
      ${renderBudgetCard(pctUsed, barClass)}
      <div class="dashboard-content">
        ${renderStreakCard()}
        ${renderActivityCard(activities)}
        ${renderQuickScenarios()}
        ${renderAskAI()}
      </div>
      <button id="btn-fab-log" class="fab" aria-label="Log new activity" tabindex="0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
  `;
}

/**
 * Initializes dashboard interactions.
 */
export function init() {
  const canvas = document.getElementById('forest-canvas');
  if (canvas) {
    const pctUsed = Math.min((todayTotal / budget) * 100, 100);
    const completedGoals = goals.filter((g) => g.completed).length;
    const healthScore = calculateHealthScore(pctUsed, streak.current, completedGoals);
    initForest(canvas, healthScore, streak.current);
  }

  initSimulator();
  initShareButton();
  initNavigation();
}

/**
 * Setup navigation handlers.
 */
function initNavigation() {
  const settingsBtn = document.getElementById('btn-settings-nav');
  if (settingsBtn) {
    const navToSettings = () => window.carbonNavigate('/settings');
    settingsBtn.addEventListener('click', navToSettings);
    settingsBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navToSettings();
      }
    });
  }

  const logBtn = document.getElementById('btn-fab-log');
  if (logBtn) {
    logBtn.addEventListener('click', () => window.carbonNavigate('/log'));
  }
}

/**
 * Setup share button functionality.
 */
function initShareButton() {
  document.getElementById('btn-share-impact')?.addEventListener('click', async () => {
    const SHARE_TEXT = `🔥 I'm on a ${streak.current}-day streak on CarbonLedger, tracking my carbon footprint daily! Join me: https://co-ledger.vercel.app/`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My CarbonLedger Streak',
          text: SHARE_TEXT,
          url: 'https://co-ledger.vercel.app/',
        });
      } catch (e) {
        if (e.name !== 'AbortError') fallback();
      }
    } else {
      fallback();
    }
    function fallback() {
      navigator.clipboard.writeText(SHARE_TEXT).then(() => {
        window.showToast('Copied to clipboard!', 'success');
      });
    }
  });
}

/**
 * Setup simulator inputs and AI functionality.
 */
function initSimulator() {
  const currentAnnual = budget * 365;
  const sliders = [
    { el: document.getElementById('sim-transit'), val: document.getElementById('val-transit'), suffix: ' days/wk' },
    { el: document.getElementById('sim-meat'), val: document.getElementById('val-meat'), suffix: ' days/wk' },
    { el: document.getElementById('sim-thermo'), val: document.getElementById('val-thermo'), suffix: '°C' },
  ];

  function updateSimulation() {
    let dailySavings = 0;
    sliders.forEach((s) => {
      if (!s.el) return;
      const v = parseInt(s.el.value, 10);
      s.val.textContent = v + s.suffix;
      const kgPerUnit = parseFloat(s.el.dataset.saving);
      if (s.suffix.includes('wk')) {
        dailySavings += (v * kgPerUnit) / 7;
      } else {
        dailySavings += v * kgPerUnit;
      }
    });

    import('../services/carbon-data.js').then(({ calcSavings }) => {
      const savings = calcSavings(dailySavings);
      const newAnnual = Math.max(0, currentAnnual - savings.annual);
      const totalValEl = document.getElementById('sim-total-val');
      if (totalValEl) totalValEl.textContent = Math.round(newAnnual) + ' kg';
      const simBarEl = document.getElementById('sim-bar');
      if (simBarEl) simBarEl.style.width = Math.max(10, (newAnnual / currentAnnual) * 100) + '%';
      const treesEl = document.getElementById('eq-trees');
      if (treesEl) treesEl.textContent = String(savings.trees);
      const flightsEl = document.getElementById('eq-flights');
      if (flightsEl) flightsEl.textContent = String(savings.flights);
    });
  }

  sliders.forEach((s) => {
    if (s.el) s.el.addEventListener('input', updateSimulation);
  });

  initAIAskFeature();
}

/**
 * Setup AI submission functionality.
 */
function initAIAskFeature() {
  const submitBtn = document.getElementById('whatif-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', async () => {
    const textEl = document.getElementById('whatif-text');
    const text = textEl.value.trim();
    if (!text) return;

    const loader = document.getElementById('whatif-loading');
    const resultDiv = document.getElementById('whatif-result');

    loader.classList.remove('hidden');
    resultDiv.innerHTML = '';
    submitBtn.disabled = true;

    try {
      const { whatIf } = await import('../services/gemini.js');
      const res = await whatIf(text, { baseline: profile?.baseline || 16.3 });

      if (!res || !res.summary) {
        throw new Error('Invalid response');
      }

      const isPositive = res.annualSavingKg > 0;
      resultDiv.innerHTML = `
        <div class="ai-result-card" style="align-items:flex-start;">
          <div class="activity-icon" style="background: ${isPositive ? 'var(--green-100)' : '#fee2e2'}" aria-hidden="true">${isPositive ? '🌿' : '⚠️'}</div>
          <div class="ai-res-info">
            <p style="font-size:0.9rem; margin-bottom:8px;">${escapeHtml(res.summary)}</p>
            <div class="flex items-center gap-12 mt-8">
              <span style="font-family:'Outfit'; font-weight:700; color:${isPositive ? 'var(--green-700)' : 'var(--red-500)'}">
                ${isPositive ? '-' : '+'}${escapeHtml(Math.abs(res.annualSavingKg))} kg/yr
              </span>
              <span style="font-size:0.8rem; color:var(--text-muted)">${escapeHtml(res.equivalent)}</span>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error(error);
      window.showToast('Calculation failed. Try again.', 'error');
    } finally {
      loader.classList.add('hidden');
      submitBtn.disabled = false;
    }
  });
}

// Ensure forest loop is killed if we navigate away
window.addEventListener('hashchange', () => {
  if (
    window.location.hash.slice(1) !== '/' &&
    window.location.hash.slice(1) !== '/dashboard'
  ) {
    cleanupForest();
  }
});
