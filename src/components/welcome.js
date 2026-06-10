/**
 * CarbonLedger — Welcome Screen
 */
import { seedDemoData } from '../services/demo-data.js';

export async function render() {
  return `
    <div class="welcome-wrap">
      <div class="welcome-hero">
        <div class="welcome-globe" aria-hidden="true">🌍</div>
        <h1 class="welcome-title">Carbon<span class="welcome-accent">Ledger</span></h1>
        <p class="welcome-tagline">
          Track your carbon like you track your money.<br>
          Budget it. Spend it wisely. Watch your world grow.
        </p>
      </div>

      <div class="welcome-features" aria-label="Key features">
        <div class="welcome-feature">
          <span class="wf-icon">🌳</span>
          <span class="wf-text">Living forest that responds to your choices</span>
        </div>
        <div class="welcome-feature">
          <span class="wf-icon">✨</span>
          <span class="wf-text">AI-powered activity logging — just describe your day</span>
        </div>
        <div class="welcome-feature">
          <span class="wf-icon">📊</span>
          <span class="wf-text">Bank-statement style carbon reports</span>
        </div>
        <div class="welcome-feature">
          <span class="wf-icon">🔒</span>
          <span class="wf-text">100% private — all data stays on your device</span>
        </div>
      </div>

      <div class="welcome-actions">
        <button class="btn btn-primary btn-lg btn-full" id="btn-get-started">
          Get Started
        </button>
        <button class="btn btn-secondary btn-full" id="btn-try-demo">
          <span style="font-size:1.1em;">🎮</span> Try Demo
        </button>
        <p class="welcome-hint">Demo loads 2 weeks of sample data so you can explore right away</p>
      </div>
    </div>
  `;
}

export function init() {
  document.getElementById('bottom-nav')?.classList.add('hidden');

  document.getElementById('btn-get-started')?.addEventListener('click', () => {
    window.carbonNavigate('/onboarding');
  });

  document.getElementById('btn-try-demo')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto;"></div>';

    try {
      await seedDemoData();
      window.showToast('Demo loaded! Explore CarbonLedger 🌿', 'success');
      setTimeout(() => window.carbonNavigate('/'), 400);
    } catch (err) {
      console.error('Demo seed failed:', err);
      window.showToast('Could not load demo. Try again.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span style="font-size:1.1em;">🎮</span> Try Demo';
    }
  });
}
