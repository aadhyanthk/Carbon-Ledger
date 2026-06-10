/**
 * CarbonLedger — Activity History
 */
import { getTodayActivities, deleteActivity } from '../services/storage.js';
import { CATEGORY_ICONS } from '../services/carbon-data.js';

export async function render() {
  const activities = await getTodayActivities();

  return `
    <div class="page-header">
      <button class="back-btn" onclick="window.carbonNavigate('/')" aria-label="Go back to Dashboard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1>Today's Activity</h1>
    </div>

    <div class="history-wrap fade-in" style="padding: 16px;">
      ${activities.length === 0 ? `
        <div class="empty-state text-center mt-24">
          <div style="font-size:3rem; margin-bottom:12px;">🍃</div>
          <p class="text-muted">No activities logged today.</p>
        </div>
      ` : `
        <div class="card">
          <ul class="activity-list">
            ${activities.map(a => `
              <li class="activity-item" id="act-${a.id}">
                <div class="activity-icon">${CATEGORY_ICONS[a.category] || '📊'}</div>
                <div style="flex:1;">
                  <div class="activity-label">${a.label}</div>
                  <div class="activity-time">${new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div class="activity-co2">+${a.kgCO2.toFixed(1)}</div>
                <button class="btn-delete" data-id="${a.id}" aria-label="Delete Activity" style="background:transparent; border:none; cursor:pointer; padding:8px; color:var(--red-400);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </li>
            `).join('')}
          </ul>
        </div>
      `}
    </div>
  `;
}

export function init() {
  const wrap = document.querySelector('.history-wrap');
  if (!wrap) return;

  wrap.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-delete');
    if (btn) {
      if (confirm('Are you sure you want to delete this activity?')) {
        const id = btn.dataset.id;
        await deleteActivity(id);
        
        // Remove from UI immediately
        const li = document.getElementById(`act-${id}`);
        if (li) {
          li.style.opacity = '0';
          setTimeout(() => li.remove(), 300);
        }
        window.showToast('Activity deleted', 'info');
      }
    }
  });
}
