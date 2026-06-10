/**
 * CarbonLedger — Dashboard Component
 */
import { initForest, updateForestHealth, cleanupForest } from './forest.js';
import { getProfile, getTodayTotal, getTodayActivities, getStreak, getGoals } from '../services/storage.js';
import { getDailyBudget, CATEGORY_ICONS } from '../services/carbon-data.js';

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
          <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.2); backdrop-filter:blur(4px); padding:6px 12px; border-radius:20px; color:white; font-weight:600; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
            <span>${profile.avatar || '🧑‍🌾'}</span>
            <span>${profile.name || 'Set Name'} ›</span>
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
        <div class="flex items-center justify-between mb-16">
          <div class="section-title" style="margin:0;">Current Streak</div>
          <div class="streak-badge">
            ${streak.current} ${streak.current > 0 ? '🔥' : '🧊'}
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
                  <div class="activity-icon">${CATEGORY_ICONS[a.category] || '🌱'}</div>
                  <div class="activity-label">${a.label}</div>
                  <div class="activity-co2">${a.kgCO2.toFixed(1)} kg</div>
                </li>
              `).join('')}
            </ul>`
          }
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

    // Wait a tick for CSS layout to apply before measuring canvas container
    requestAnimationFrame(() => {
      initForest(canvas, healthScore);
    });
  }
}

// Ensure forest loop is killed if we navigate away
window.addEventListener('hashchange', () => {
  if (window.location.hash.slice(1) !== '/' && window.location.hash.slice(1) !== '/dashboard') {
    cleanupForest();
  }
});
