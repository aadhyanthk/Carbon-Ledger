/**
 * CarbonLedger — Settings / Profile Component
 */
import { clearAllData, getProfile } from '../services/storage.js';

export async function render() {
  const profile = await getProfile();
  
  return `
    <div class="page-header">
      <button class="back-btn" onclick="window.history.back()" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1>Profile & Settings</h1>
    </div>

    <div class="settings-wrap fade-in">
      
      <div class="card mb-24 text-center">
        <div style="font-size:3rem; margin-bottom:8px;">🧑‍🌾</div>
        <h2 style="margin-bottom:4px;">Carbon Guardian</h2>
        <p class="text-muted" style="font-size:0.875rem;">Member since ${new Date(profile?.createdAt || Date.now()).toLocaleDateString()}</p>
        
        <div class="mt-16 flex justify-between items-center" style="background:var(--green-50); padding: 12px; border-radius: var(--radius-sm); text-align:left;">
          <div>
            <div style="font-size:0.8125rem; color:var(--text-muted);">Daily Baseline</div>
            <div style="font-weight:700; color:var(--text-primary); font-size:1.125rem;">${profile?.baseline?.toFixed(1) || '--'} kg</div>
          </div>
          <div>
            <div style="font-size:0.8125rem; color:var(--text-muted);">Reduction Goal</div>
            <div style="font-weight:700; color:var(--green-700); font-size:1.125rem; text-align:right;">${profile?.goalPercent || 0}%</div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>Preferences</h3>
        
        <div class="settings-row" id="btn-recalibrate" role="button" tabindex="0">
          <div class="row-label">Recalibrate Baseline</div>
          <div class="row-chevron">›</div>
        </div>
        
        <div class="settings-row" onclick="window.carbonNavigate('/simulator')" role="button" tabindex="0">
          <div class="row-label">What-If Simulator</div>
          <div class="row-chevron">›</div>
        </div>
      </div>

      <div class="settings-section">
        <h3>Data</h3>
        
        <div class="settings-row" id="btn-export-data" role="button" tabindex="0">
          <div class="row-label">Export Data (JSON)</div>
          <div class="row-chevron">›</div>
        </div>
        
        <div class="settings-row" id="btn-clear-data" role="button" tabindex="0" style="color: var(--red-500);">
          <div class="row-label">Delete All Data</div>
          <div class="row-chevron">›</div>
        </div>
      </div>
      
      <div class="text-center text-muted mt-24" style="font-size: 0.75rem;">
        CarbonLedger v1.0.0<br>
        Open Source & Privacy First
      </div>

    </div>
  `;
}

export function init() {
  document.getElementById('btn-recalibrate')?.addEventListener('click', () => {
    if (confirm('This will restart the onboarding quiz to set a new baseline. Your logged activities and streaks will be kept. Continue?')) {
      window.carbonNavigate('/onboarding');
    }
  });

  document.getElementById('btn-export-data')?.addEventListener('click', async () => {
    const { getAllData } = await import('../services/storage.js');
    const data = await getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon_ledger_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('Data exported successfully', 'success');
  });

  document.getElementById('btn-clear-data')?.addEventListener('click', async () => {
    if (confirm('⚠️ WARNING: This will permanently delete all your logged activities, streaks, goals, and profile data from this device. This cannot be undone. Are you absolutely sure?')) {
      await clearAllData();
      window.showToast('All data cleared.', 'info');
      setTimeout(() => {
        window.location.hash = '/onboarding';
        window.location.reload();
      }, 1000);
    }
  });
}
