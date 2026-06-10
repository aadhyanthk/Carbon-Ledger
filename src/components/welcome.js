/**
 * CarbonLedger — Welcome Screen
 */

export async function render() {
  return `
    <div class="onboarding-wrap" style="justify-content: center; align-items: center; text-align: center; padding: 24px;">
      <div style="font-size: 5rem; margin-bottom: 16px; animation: bounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);">🌍</div>
      <h1 style="font-size: 2.5rem; margin-bottom: 12px;">Carbon-Ledger</h1>
      <p style="font-size: 1.125rem; color: var(--text-secondary); margin-bottom: 40px; max-width: 320px;">
        Track your daily footprint, earn rewards, and grow your own virtual forest.
      </p>
      
      <button class="btn btn-primary btn-lg btn-full" onclick="window.carbonNavigate('/onboarding')" style="max-width: 320px;">
        Get Started
      </button>
      
      <p style="margin-top: 24px; font-size: 0.875rem; color: var(--text-muted);">
        100% Private & Local
      </p>
    </div>
  `;
}

export function init() {
  // Hide bottom nav if it somehow shows up
  document.getElementById('bottom-nav')?.classList.add('hidden');
}
