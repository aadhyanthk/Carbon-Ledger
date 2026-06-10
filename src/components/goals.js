/**
 * CarbonLedger — Goals & Challenges Component
 */
import { CHALLENGE_PACKS } from '../services/carbon-data.js';
import { playSound } from '../utils/audio.js';
import { fireConfetti } from '../utils/confetti.js';
import {
  getGoals,
  startChallenge,
  completeGoalItem,
  markGoalComplete,
  deleteGoal,
  getStreak,
} from '../services/storage.js';
import { escapeHtml } from '../utils/sanitize.js';

/** @type {import('../services/storage.js').Goal[]} */
let goals = [];
/** @type {import('../services/storage.js').Streak} */
let streak = null;

/**
 * Render the entire Goals page.
 * @returns {Promise<string>}
 */
export async function render() {
  goals = await getGoals();
  streak = await getStreak();

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  const activeIds = goals.map((g) => g.id);
  const availablePacks = CHALLENGE_PACKS.filter(
    (p) => !activeIds.includes(p.id)
  );

  return `
    <div class="page-header">
      <button id="btn-goals-back" class="back-btn" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1>Goals</h1>
    </div>

    <div class="goals-wrap fade-in">
      ${
        activeGoals.length > 0
          ? `
        <div class="section-title">Active Challenges</div>
        ${activeGoals.map(renderActiveGoal).join('')}
      `
          : ''
      }

      ${
        availablePacks.length > 0
          ? `
        <div class="section-title mt-24">Available Challenges</div>
        ${availablePacks.map(renderAvailablePack).join('')}
      `
          : ''
      }

      ${
        completedGoals.length > 0
          ? `
        <div class="section-title mt-24">Completed</div>
        ${completedGoals
          .map(
            (g) => `
          <div class="challenge-card" style="opacity:0.7">
            <span style="font-size:1.5rem; margin-right:12px;" aria-hidden="true">✅</span>
            <div>
              <div class="challenge-title">${escapeHtml(g.title)}</div>
              <div class="challenge-meta">Saved ${g.totalSavingKg} kg CO₂</div>
              <button class="btn btn-secondary btn-sm mt-8 btn-retake" data-goal="${g.id}">Retake Challenge</button>
            </div>
          </div>
        `
          )
          .join('')}
      `
          : ''
      }
    </div>
  `;
}

/**
 * Renders an active goal card.
 * @param {Object} goal - The active goal object.
 * @returns {string}
 */
function renderActiveGoal(goal) {
  const pack = CHALLENGE_PACKS.find((p) => p.id === goal.id);
  if (!pack) return '';

  const total = pack.items.length;
  const completed = goal.completedItems.length;
  const pct = Math.round((completed / total) * 100);

  // SVG Ring calculation
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return `
    <div class="challenge-card" data-id="${goal.id}">
      <div class="challenge-ring">
        <svg width="50" height="50" class="progress-ring">
          <circle class="progress-ring-track" stroke-width="4" fill="transparent" r="${radius}" cx="25" cy="25"/>
          <circle class="progress-ring-fill" stroke-width="4" fill="transparent" r="${radius}" cx="25" cy="25" 
                  stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
        </svg>
        <div style="position:absolute; margin-top:-35px; margin-left:14px; font-size:1rem;" aria-hidden="true">${pack.emoji}</div>
      </div>
      
      <div class="challenge-info">
        <div class="challenge-title">${escapeHtml(goal.title)}</div>
        <div class="challenge-meta">${completed} / ${total} days completed</div>
        
        <ul class="checklist mt-12">
          ${pack.items
            .map((item, i) => {
              const isDone = goal.completedItems.includes(item.id);
              // Show up to the first uncompleted item
              if (!isDone && i > completed) return '';

              return `
              <li class="checklist-item ${isDone ? 'done' : ''}">
                <input type="checkbox" id="${item.id}" data-goal="${goal.id}" ${isDone ? 'checked disabled' : ''}>
                <label for="${item.id}">${escapeHtml(item.label)}</label>
              </li>
            `;
            })
            .join('')}
        </ul>
        
        ${pct === 100 ? `<button class="btn btn-primary btn-sm mt-12 btn-claim" data-goal="${goal.id}">Claim Reward</button>` : ''}
      </div>
    </div>
  `;
}

/**
 * Renders an available challenge pack.
 * @param {Object} pack - The challenge pack.
 * @returns {string}
 */
function renderAvailablePack(pack) {
  return `
    <div class="challenge-card pack-card" data-pack="${pack.id}" role="button" tabindex="0" aria-label="Start ${pack.title}">
      <div style="font-size:2rem; margin-right:12px;" aria-hidden="true">${pack.emoji}</div>
      <div class="challenge-info">
        <div class="challenge-title">${escapeHtml(pack.title)}</div>
        <div class="challenge-meta">${escapeHtml(pack.description)}</div>
        <div class="challenge-savings">Saves ~${pack.totalSavingKg} kg CO₂</div>
      </div>
      <div style="align-self:center; color:var(--green-600);">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      </div>
    </div>
  `;
}

/**
 * Initializes goals event handlers.
 */
export function init() {
  const wrap = document.querySelector('.goals-wrap');
  const backBtn = document.getElementById('btn-goals-back');

  if (backBtn) {
    backBtn.addEventListener('click', () => window.carbonNavigate('/'));
  }

  if (!wrap) return;

  wrap.addEventListener('change', async (e) => {
    if (e.target.type === 'checkbox' && e.target.checked) {
      const goalId = e.target.dataset.goal;
      const itemId = e.target.id;

      e.target.disabled = true; // disable immediately
      await completeGoalItem(goalId, itemId);

      playSound('pop');

      // Re-render to update rings
      const mod = await import('./goals.js');
      const root = document.getElementById('view-root');
      if (root) root.innerHTML = await mod.render();
      mod.init();
      window.showToast('Great job!', 'info', 1500);
    }
  });

  wrap.addEventListener('click', async (e) => {
    // Start pack
    const packCard = e.target.closest('.pack-card');
    if (packCard) {
      const packId = packCard.dataset.pack;
      const pack = CHALLENGE_PACKS.find((p) => p.id === packId);
      if (pack) {
        await startChallenge(pack);
        window.showToast(`Started challenge: ${pack.title}`, 'success');
        const mod = await import('./goals.js');
        const root = document.getElementById('view-root');
        if (root) root.innerHTML = await mod.render();
        mod.init();
      }
      return;
    }

    // Claim reward
    if (e.target.classList.contains('btn-claim')) {
      const goalId = e.target.dataset.goal;
      await markGoalComplete(goalId);

      // Earn a freeze reward for completing a pack
      const { setStreak } = await import('../services/storage.js');
      streak.freezes += 1;
      await setStreak(streak);

      window.showToast('Pack completed! +1 Streak Freeze earned.', 'success');
      playSound('fanfare');
      fireConfetti();

      // Re-render
      const mod = await import('./goals.js');
      const root = document.getElementById('view-root');
      if (root) root.innerHTML = await mod.render();
      mod.init();
    } 
    // Retake challenge
    else if (e.target.classList.contains('btn-retake')) {
      const goalId = e.target.dataset.goal;
      await deleteGoal(goalId);
      window.showToast('Challenge available to retake!', 'info');

      const mod = await import('./goals.js');
      const root = document.getElementById('view-root');
      if (root) root.innerHTML = await mod.render();
      mod.init();
    }
  });

  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const packCard = e.target.closest('.pack-card');
      if (packCard) {
        e.preventDefault();
        packCard.click();
      }
    }
  });
}
