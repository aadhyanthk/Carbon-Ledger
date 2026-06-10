/**
 * CarbonLedger — Onboarding Component
 */
import {
  ONBOARDING_QUESTIONS,
  calculateBaseline,
  COUNTRY_BASELINES,
} from '../services/carbon-data.js';
import { setProfile } from '../services/storage.js';

let currentStep = 0;
let answers = {};
let baseline = 0;

/**
 * Render the entire onboarding wrapper.
 * @returns {Promise<string>}
 */
export async function render() {
  currentStep = 0;
  answers = {};
  baseline = 0;

  return `
    <div class="onboarding-wrap">
      <div class="onboarding-header">
        <div class="onboarding-progress" id="ob-progress" aria-label="Onboarding Progress">
          ${ONBOARDING_QUESTIONS.map((_, i) => `<div class="progress-dot ${i === 0 ? 'active' : ''}" data-step="${i}" aria-hidden="true"></div>`).join('')}
        </div>
      </div>
      <div id="ob-content" class="onboarding-step" aria-live="polite">
        ${renderStep(0)}
      </div>
    </div>
  `;
}

/**
 * Render a specific onboarding question step.
 * @param {number} index - The index of the question.
 * @returns {string}
 */
function renderStep(index) {
  const q = ONBOARDING_QUESTIONS[index];
  return `
    <span class="step-emoji" aria-hidden="true">${q.emoji}</span>
    <h2>${q.title}</h2>
    <p>${q.subtitle}</p>
    <div class="option-grid" role="radiogroup" aria-label="${q.title}">
      ${q.options
        .map(
          (opt) => `
        <div class="option-card" data-id="${opt.id}" data-step="${index}" role="radio" tabindex="0" aria-checked="false" aria-label="${opt.label}: ${opt.description}">
          <span class="option-icon" aria-hidden="true">${opt.icon}</span>
          <span class="option-label">${opt.label}</span>
          <span class="option-value">${opt.description}</span>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

/**
 * Render the baseline calculation results.
 * @returns {string}
 */
function renderResults() {
  return `
    <div class="baseline-result fade-in">
      <h2>Your Footprint</h2>
      <p>Based on your answers, your estimated daily carbon emissions are:</p>
      
      <div class="mt-24 mb-24">
        <div class="baseline-number">${baseline.toFixed(1)}</div>
        <div class="baseline-unit">kg CO₂ / day</div>
      </div>

      <div class="comparison-bar-wrap">
        <div class="section-title">How you compare</div>
        
        <div class="comparison-row">
          <div class="cmp-label">You</div>
          <div class="comparison-bar"><div class="comparison-bar-fill" style="width: ${Math.min((baseline / 50) * 100, 100)}%; background: var(--green-600)"></div></div>
          <div class="cmp-val">${baseline.toFixed(1)}</div>
        </div>
        
        <div class="comparison-row">
          <div class="cmp-label">Global Avg</div>
          <div class="comparison-bar"><div class="comparison-bar-fill" style="width: ${Math.min((COUNTRY_BASELINES.global / 50) * 100, 100)}%; background: var(--text-muted)"></div></div>
          <div class="cmp-val">${COUNTRY_BASELINES.global.toFixed(1)}</div>
        </div>
        
        <div class="comparison-row">
          <div class="cmp-label">US Avg</div>
          <div class="comparison-bar"><div class="comparison-bar-fill" style="width: ${Math.min((COUNTRY_BASELINES.us / 50) * 100, 100)}%; background: var(--text-muted)"></div></div>
          <div class="cmp-val">${COUNTRY_BASELINES.us.toFixed(1)}</div>
        </div>
      </div>

      <button class="btn btn-primary btn-full btn-lg mt-24" id="ob-next-goals">Set a Reduction Goal</button>
    </div>
  `;
}

/**
 * Render the goal selection screen.
 * @returns {string}
 */
function renderGoals() {
  return `
    <div class="fade-in">
      <h2>Choose your target</h2>
      <p>Set a daily carbon reduction goal. We'll build your daily budget around this.</p>

      <div class="goal-cards" role="radiogroup" aria-label="Carbon reduction targets">
        <div class="goal-card" data-pct="5" role="radio" tabindex="0" aria-checked="false" aria-label="5% reduction, casual">
          <span class="goal-icon" aria-hidden="true">🌱</span>
          <div class="goal-info">
            <h4>Casual</h4>
            <p>Easy start, small changes</p>
          </div>
          <div class="goal-pct">5%</div>
        </div>
        
        <div class="goal-card" data-pct="15" role="radio" tabindex="0" aria-checked="false" aria-label="15% reduction, committed">
          <span class="goal-icon" aria-hidden="true">🌿</span>
          <div class="goal-info">
            <h4>Committed</h4>
            <p>Noticeable impact</p>
          </div>
          <div class="goal-pct">15%</div>
        </div>
        
        <div class="goal-card" data-pct="30" role="radio" tabindex="0" aria-checked="false" aria-label="30% reduction, hardcore">
          <span class="goal-icon" aria-hidden="true">🌳</span>
          <div class="goal-info">
            <h4>Hardcore</h4>
            <p>Major lifestyle shifts</p>
          </div>
          <div class="goal-pct">30%</div>
        </div>
      </div>

      <button class="btn btn-primary btn-full btn-lg mt-24" id="ob-finish" disabled>Let's Begin</button>
    </div>
  `;
}

/**
 * Initializes onboarding event handlers.
 */
export function init() {
  const content = document.getElementById('ob-content');
  const progress = document.getElementById('ob-progress');
  let selectedGoalPct = null;

  function updateProgress() {
    if (!progress) return;
    const dots = progress.querySelectorAll('.progress-dot');
    dots.forEach((dot, i) => {
      dot.className = 'progress-dot';
      if (i < currentStep) dot.classList.add('done');
      if (i === currentStep) dot.classList.add('active');
    });
  }

  content.addEventListener('click', async (e) => {
    // Handle option selection
    const card = e.target.closest('.option-card');
    if (card) {
      const stepIdx = parseInt(card.dataset.step, 10);
      const q = ONBOARDING_QUESTIONS[stepIdx];

      // Highlight selected
      const cards = content.querySelectorAll('.option-card');
      cards.forEach((c) => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');

      // Save answer
      answers[q.id] = card.dataset.id;

      // Small delay for UX, then next step
      setTimeout(() => {
        currentStep++;
        if (currentStep < ONBOARDING_QUESTIONS.length) {
          content.innerHTML = renderStep(currentStep);
          updateProgress();
        } else {
          // Finished questions
          baseline = calculateBaseline(answers);
          progress.style.display = 'none'; // hide progress
          content.innerHTML = renderResults();

          // Trigger animations
          setTimeout(() => {
            const fills = content.querySelectorAll('.comparison-bar-fill');
            // Hack to trigger reflow and css transition if they don't play automatically
            fills.forEach((f) => {
              const w = f.style.width;
              f.style.width = '0%';
              setTimeout(() => (f.style.width = w), 50);
            });
          }, 10);
        }
      }, 400);
    }

    // Handle 'Set Goal' button
    if (e.target.id === 'ob-next-goals') {
      content.innerHTML = renderGoals();
    }

    // Handle Goal Selection
    const goalCard = e.target.closest('.goal-card');
    if (goalCard) {
      const cards = content.querySelectorAll('.goal-card');
      cards.forEach((c) => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      goalCard.classList.add('selected');
      goalCard.setAttribute('aria-checked', 'true');

      selectedGoalPct = parseInt(goalCard.dataset.pct, 10);
      document.getElementById('ob-finish').disabled = false;
    }

    // Handle Finish
    if (e.target.id === 'ob-finish') {
      await setProfile({
        baseline,
        goalPercent: selectedGoalPct,
        answers,
        createdAt: Date.now(),
        onboardingComplete: true,
      });
      window.carbonNavigate('/');
    }
  });

  // Handle keyboard events
  content.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.option-card') || e.target.closest('.goal-card');
      if (card) {
        e.preventDefault();
        card.click();
      }
    }
  });
}
