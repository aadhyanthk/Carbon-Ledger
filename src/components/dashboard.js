/**
 * CarbonLedger — Dashboard Component
 */
import { initForest, updateForestHealth, cleanupForest } from './forest.js';
import { getProfile, getTodayTotal, getTodayActivities, getStreak, getGoals } from '../services/storage.js';
import { getDailyBudget, CATEGORY_ICONS } from '../services/carbon-data.js';
import { escapeHtml } from '../utils/sanitize.js';

let profile, budget, todayTotal, streak, goals;

export async function render() {
  profile = await getProfile();
  todayTotal = await getTodayTotal();
  streak = await getStreak();
  goals = await getGoals();
  
  if (!profile) return '<div>Error loading profile</div>';

  budget = getDailyBudget(profile);
  const remaining = budget - todayTotal;
  const pctUsed = Math.min((todayTotal / budget) * 100, 100);
  
  let barClass = 'budget-bar-fill';
  if (pctUsed > 100) barClass += ' danger';
  else if (pctUsed > 80) barClass += ' warn';

  // Calculate health score (0-1) for forest
  let healthScore = 1 - (pctUsed / 100);
  if (healthScore < 0) healthScore = 0;
  // Boost health if streak is high or goals are completed
  const completedGoals = goals.filter(g => g.completed).length;
  healthScore = Math.min(1, healthScore + (streak.current * 0.05) + (completedGoals * 0.1));

  const activities = await getTodayActivities();

  return `
    <div class="dashboard-wrap page-enter">
      <div class="forest-container">
        <canvas id="forest-canvas"></canvas>
        <div style="position: absolute; top: 20px; left: 20px; z-index: 10; cursor:pointer;" onclick="window.carbonNavigate('/settings')">
          <div style="display:inline-flex; align-items:center; justify-content:center; width:44px; height:44px; background:rgba(255,255,255,0.2); backdrop-filter:blur(4px); border-radius:50%; color:white; font-size:1.5rem; text-shadow: 0 1px 2px rgba(0,0,0,0.3); border:1.5px solid rgba(255,255,255,0.4);">
            ${profile.avatar || '🌍'}
          </div>
        </div>
      </div>

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

      <div class="dashboard-content">
        <div class="card mb-16" style="padding: 12px 20px;">
          <div class="flex items-center justify-between">
            <div class="section-title" style="margin:0;">Current Streak</div>
            <div class="streak-badge">
              ${streak.current} ${streak.current > 0 ? '🔥' : '🧊'}
            </div>
          </div>
        </div>

        <div class="card mb-24">
          <div class="flex items-center justify-between mb-12">
            <div class="section-title" style="margin:0;">Today's Activity</div>
            <a href="#/history" class="text-green font-outfit fw-semibold" style="text-decoration:none;font-size:0.875rem;">See all</a>
          </div>
          
          ${activities.length === 0 ? 
            `<div class="empty-state" style="padding: 20px 0;">
              <span class="empty-icon" style="font-size:2rem;">🍃</span>
              <p>No activity logged yet today.</p>
            </div>` 
            : 
            `<ul class="activity-list">
              ${activities.slice(0, 5).map(a => `
                <li class="activity-item">
                  <div class="activity-icon">${escapeHtml(CATEGORY_ICONS[a.category] || '🌱')}</div>
                  <div class="activity-label">${escapeHtml(a.label)}</div>
                  <div class="activity-co2">${a.kgCO2.toFixed(1)} kg</div>
                </li>
              `).join('')}
            </ul>`
          }
        </div>

        <div class="card mb-24">
          <div class="section-title">Quick Scenarios</div>
          <p class="text-muted" style="font-size:0.875rem; margin-bottom:16px;">Move sliders to see impact on your annual footprint.</p>

          <div class="sim-slider-wrap">
            <div class="sim-slider-label"><span>🚲 Transit / bike</span><span class="sim-val" id="val-transit">0 days/wk</span></div>
            <input type="range" id="sim-transit" min="0" max="7" value="0" data-saving="3.84">
          </div>
          <div class="sim-slider-wrap">
            <div class="sim-slider-label"><span>🥗 Meat-free</span><span class="sim-val" id="val-meat">0 days/wk</span></div>
            <input type="range" id="sim-meat" min="0" max="7" value="0" data-saving="5.23">
          </div>
          <div class="sim-slider-wrap mb-16">
            <div class="sim-slider-label"><span>❄️ Lower temp</span><span class="sim-val" id="val-thermo">0°C</span></div>
            <input type="range" id="sim-thermo" min="0" max="5" value="0" data-saving="0.86">
          </div>

          <div class="sim-comparison">
            <div class="sim-row">
              <div class="sim-row-label">Current</div>
              <div class="sim-bar-wrap"><div class="sim-bar-fill current" style="width:100%"></div></div>
              <div class="sim-val-right">${Math.round(budget * 365)} kg</div>
            </div>
            <div class="sim-row">
              <div class="sim-row-label">Projected</div>
              <div class="sim-bar-wrap"><div class="sim-bar-fill projected" id="sim-bar" style="width:100%"></div></div>
              <div class="sim-val-right text-green" id="sim-total-val">${Math.round(budget * 365)} kg</div>
            </div>
          </div>

          <div class="equivalents-row">
            <div class="equivalent-chip"><span class="eq-icon">🌳</span><span class="eq-val" id="eq-trees">0</span><span class="eq-label">trees planted</span></div>
            <div class="equivalent-chip"><span class="eq-icon">✈️</span><span class="eq-val" id="eq-flights">0</span><span class="eq-label">flights offset</span></div>
          </div>
        </div>

        <div class="card mb-24">
          <div class="section-title">Ask AI Anything</div>
          <p class="text-muted mb-12" style="font-size:0.875rem;">Type any scenario to see its impact.</p>
          <div class="ai-input-wrap">
            <textarea id="whatif-text" class="ai-input" placeholder="What if I installed solar panels?" rows="2"></textarea>
            <button class="ai-send-btn" id="whatif-submit" aria-label="Calculate Scenario">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div id="whatif-loading" class="hidden mt-16 text-center text-muted"><div class="spinner"></div><div class="mt-8">Calculating impact...</div></div>
          <div id="whatif-result" class="mt-16"></div>
        </div>
      </div>

      <button class="fab" onclick="window.carbonNavigate('/log')" aria-label="Log new activity">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
  `;
}

export function init() {
  const canvas = document.getElementById('forest-canvas');
  if (canvas) {
    const pctUsed = Math.min((todayTotal / budget) * 100, 100);
    let healthScore = 1 - (pctUsed / 100);
    if (healthScore < 0) healthScore = 0;
    
    // Boost based on streaks & goals
    const completedGoals = goals.filter(g => g.completed).length;
    healthScore = Math.min(1, healthScore + (streak.current * 0.05) + (completedGoals * 0.1));

    initForest(canvas, healthScore, streak.current);
  }

  // Simulator Initialization
  initSimulator();
}

function initSimulator() {
  const currentAnnual = budget * 365;
  const sliders = [
    { el: document.getElementById('sim-transit'), val: document.getElementById('val-transit'), suffix: ' days/wk' },
    { el: document.getElementById('sim-meat'), val: document.getElementById('val-meat'), suffix: ' days/wk' },
    { el: document.getElementById('sim-thermo'), val: document.getElementById('val-thermo'), suffix: '°C' }
  ];

  function updateSimulation() {
    let dailySavings = 0;
    sliders.forEach(s => {
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
      document.getElementById('sim-total-val').textContent = Math.round(newAnnual) + ' kg';
      document.getElementById('sim-bar').style.width = Math.max(10, (newAnnual / currentAnnual) * 100) + '%';
      document.getElementById('eq-trees').textContent = savings.trees;
      document.getElementById('eq-flights').textContent = savings.flights;
    });
  }

  sliders.forEach(s => {
    if (s.el) s.el.addEventListener('input', updateSimulation);
  });

  const submitBtn = document.getElementById('whatif-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const text = document.getElementById('whatif-text').value.trim();
      if (!text) return;

      const loader = document.getElementById('whatif-loading');
      const resultDiv = document.getElementById('whatif-result');
      
      loader.classList.remove('hidden');
      resultDiv.innerHTML = '';
      submitBtn.disabled = true;

      const { whatIf } = await import('../services/gemini.js');
      const res = await whatIf(text, { baseline: profile?.baseline || 16.3 });

      loader.classList.add('hidden');
      submitBtn.disabled = false;

      if (!res || !res.summary) {
        window.showToast('Calculation failed. Try again.', 'error');
        return;
      }

      const isPositive = res.annualSavingKg > 0;
      
      resultDiv.innerHTML = `
        <div class="ai-result-card" style="align-items:flex-start;">
          <div class="activity-icon" style="background: ${isPositive ? 'var(--green-100)' : '#fee2e2'}">${isPositive ? '🌿' : '⚠️'}</div>
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
    });
  }
}

// Ensure forest loop is killed if we navigate away
window.addEventListener('hashchange', () => {
  if (window.location.hash.slice(1) !== '/' && window.location.hash.slice(1) !== '/dashboard') {
    cleanupForest();
  }
});
