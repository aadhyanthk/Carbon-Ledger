/**
 * CarbonLedger — Welcome Screen
 * Awareness-first landing with carbon facts, educational content, and sharing.
 */
import { seedDemoData } from '../services/demo-data.js';

const SHARE_TEXT = `🌍 I just discovered CarbonLedger — it tracks your carbon footprint like a bank statement, with AI insights and a living forest that grows with your progress. Try it free: https://co-ledger.vercel.app/`;

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

      <div class="welcome-awareness">
        <div class="awareness-header">
          <span class="awareness-icon">🌡️</span>
          <h2>Why Track Your Carbon?</h2>
        </div>
        <div class="awareness-reason">
          <span class="awareness-emoji">🔥</span>
          <p>Earth has already warmed <strong>1.2°C</strong> since pre-industrial times. Every fraction of a degree matters.</p>
        </div>
        <div class="awareness-reason">
          <span class="awareness-emoji">🏭</span>
          <p>Individual consumption drives <strong>~72%</strong> of global greenhouse gas emissions.</p>
        </div>
        <div class="awareness-reason">
          <span class="awareness-emoji">📉</span>
          <p>You can't reduce what you don't measure. <strong>Tracking is the first step.</strong></p>
        </div>
      </div>

      <div class="welcome-facts">
        <h2 class="facts-title">Did You Know?</h2>
        <div class="fact-cards">
          <div class="fact-card">
            <div class="fact-number">16.3 <span>kg</span></div>
            <div class="fact-desc">CO₂ the average person emits <strong>every single day</strong></div>
          </div>
          <div class="fact-card">
            <div class="fact-number">5.5 <span>kg</span></div>
            <div class="fact-desc">CO₂ from a single <strong>beef burger</strong> — same as driving 29 km</div>
          </div>
          <div class="fact-card">
            <div class="fact-number">1.8 <span>tonnes</span></div>
            <div class="fact-desc">CO₂ from a round-trip <strong>NYC ↔ London</strong> flight — one person's entire month</div>
          </div>
          <div class="fact-card">
            <div class="fact-number">6B <span>tonnes</span></div>
            <div class="fact-desc">CO₂ saved per year if everyone reduced just <strong>15%</strong></div>
          </div>
        </div>
      </div>

      <div class="welcome-equivalents">
        <h2 class="facts-title">The Hidden Cost of Everyday Habits</h2>
        <div class="equiv-row">
          <span class="equiv-item-icon">☕</span>
          <div class="equiv-item-info">
            <div class="equiv-item-label">Daily coffee</div>
            <div class="equiv-item-co2">0.21 kg CO₂ per cup</div>
          </div>
          <div class="equiv-item-trees">🌳 <strong>4</strong> trees/yr to offset</div>
        </div>
        <div class="equiv-row">
          <span class="equiv-item-icon">🚗</span>
          <div class="equiv-item-info">
            <div class="equiv-item-label">10 km car commute</div>
            <div class="equiv-item-co2">1.92 kg CO₂ each way</div>
          </div>
          <div class="equiv-item-trees">🌳 <strong>32</strong> trees/yr to offset</div>
        </div>
        <div class="equiv-row">
          <span class="equiv-item-icon">🥩</span>
          <div class="equiv-item-info">
            <div class="equiv-item-label">Beef steak dinner</div>
            <div class="equiv-item-co2">6.61 kg CO₂ per serving</div>
          </div>
          <div class="equiv-item-trees">🌳 <strong>111</strong> trees/yr to offset</div>
        </div>
      </div>

      <div class="welcome-share">
        <div class="share-card">
          <span class="share-icon">🌱</span>
          <h3>Spread the Word</h3>
          <p>Help your friends track their carbon footprint too.</p>
          <button class="btn btn-primary btn-full" id="btn-share-app">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share CarbonLedger
          </button>
        </div>
      </div>

    </div>
  `;
}

export function init() {
  document.getElementById('bottom-nav')?.classList.add('hidden');

  document.getElementById('btn-get-started')?.addEventListener('click', () => {
    window.carbonNavigate('/onboarding');
  });

  document
    .getElementById('btn-try-demo')
    ?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML =
        '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto;"></div>';

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

  // Share button — Web Share API with clipboard fallback
  document
    .getElementById('btn-share-app')
    ?.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'CarbonLedger — Track Your Carbon Footprint',
            text: SHARE_TEXT,
            url: 'https://co-ledger.vercel.app/',
          });
          window.showToast('Thanks for sharing! 🌿', 'success');
        } catch (err) {
          if (err.name !== 'AbortError') {
            fallbackCopy();
          }
        }
      } else {
        fallbackCopy();
      }
    });
}

function fallbackCopy() {
  navigator.clipboard
    .writeText(SHARE_TEXT)
    .then(() => {
      window.showToast(
        'Link copied to clipboard! Share it with friends.',
        'success'
      );
    })
    .catch(() => {
      window.showToast('Could not copy link. Please share manually.', 'error');
    });
}
