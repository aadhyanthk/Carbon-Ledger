/**
 * CarbonLedger — Streaks & Achievements Component
 */
import { getStreak, getAchievements, getTickets, getActivities } from '../services/storage.js';
import { fireConfetti } from '../utils/confetti.js';
import { playSound } from '../utils/audio.js';

// Pre-defined achievements
const BADGES = [
  { id: 'first_log',     icon: '🌱', name: 'First Log',         desc: 'Log your very first carbon activity.' },
  { id: 'streak_3',      icon: '🔥', name: '3-Day Streak',      desc: 'Stay under budget for 3 days in a row.' },
  { id: 'streak_7',      icon: '☄️', name: '7-Day Streak',      desc: 'A full week under budget!' },
  { id: 'streak_30',     icon: '🌟', name: '30-Day Streak',     desc: 'A full month under budget.' },
  { id: 'budget_master', icon: '🎯', name: 'Budget Master',     desc: 'Finish a week exactly on budget.' },
  { id: 'ton_saved',     icon: '🐘', name: '1 Ton Saved',       desc: 'Accumulate 1,000 kg of CO₂ savings.' },
  { id: 'green_warrior', icon: '⚔️', name: 'Green Warrior',     desc: 'Complete 3 challenge packs.' },
  { id: 'forest_guard',  icon: '🦌', name: 'Forest Guardian',   desc: 'Unlock all forest animals.' },
  { id: 'lucky_draw',    icon: '🎫', name: 'Lucky Winner',      desc: 'Win a reward from the daily lottery.' }
];

export async function render() {
  const [streak, achievements, tickets, activities] = await Promise.all([
    getStreak(),
    getAchievements(),
    getTickets(),
    getActivities()
  ]);

  // Check simple achievements on render
  checkAchievements(streak, activities, achievements);

  return `
    <div class="page-header">
      <button class="back-btn" onclick="window.carbonNavigate('/')" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1>Achievements</h1>
    </div>

    <div class="achievements-wrap fade-in">
      
      <div class="card mb-24 text-center">
        <div class="section-title">Current Streak</div>
        <div style="font-size:4rem; margin: 10px 0;">${streak.current > 0 ? '🔥' : '🧊'}</div>
        <h2>${streak.current} Days</h2>
        <p class="text-muted mt-8">Longest streak: ${streak.longest} days</p>
        
        <div class="mt-16 flex justify-between items-center" style="background:rgba(34, 197, 94, 0.1); padding: 12px; border-radius: var(--radius-sm);">
          <div class="flex items-center gap-8">
            <span>❄️</span>
            <span style="font-weight:600; font-size:0.875rem;">Streak Freezes</span>
          </div>
          <div style="font-weight:700; color:var(--text-primary);">${streak.freezes}</div>
        </div>
      </div>

      <div class="card mb-24">
        <div class="flex items-center justify-between mb-16">
          <div class="section-title" style="margin:0;">Daily Lottery</div>
          <div style="font-weight:700; color:var(--green-700);">🎟️ x${tickets.count}</div>
        </div>
        <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom: 16px;">
          Earn 1 green ticket every day you stay under budget. Spend them for a chance to win streak freezes!
        </p>
        <button class="btn btn-secondary btn-full" id="btn-lottery" ${tickets.count === 0 ? 'disabled' : ''}>
          ${tickets.count === 0 ? 'No tickets yet' : 'Spin the Lottery (1 Ticket)'}
        </button>
      </div>

      <div class="section-title">Trophy Wall</div>
      <div class="badge-grid mt-16">
        ${BADGES.map(badge => {
          const isUnlocked = achievements.includes(badge.id);
          return `
            <div class="badge-card ${isUnlocked ? '' : 'locked'}">
              <span class="badge-icon">${badge.icon}</span>
              <div class="badge-name">${badge.name}</div>
              <div class="badge-desc">${badge.desc}</div>
              ${!isUnlocked ? '<div style="font-size:0.8rem; margin-top:8px;">🔒</div>' : ''}
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

// Simple passive checks
async function checkAchievements(streak, activities, unlockedList) {
  import('../services/storage.js').then(async ({ unlockAchievement }) => {
    if (activities.length > 0 && !unlockedList.includes('first_log')) {
      if (await unlockAchievement('first_log')) { playSound('fanfare'); fireConfetti(); window.showToast('Achievement Unlocked: First Log! 🌱', 'success'); }
    }
    if (streak.current >= 3 && !unlockedList.includes('streak_3')) {
      if (await unlockAchievement('streak_3')) { playSound('fanfare'); fireConfetti(); window.showToast('Achievement Unlocked: 3-Day Streak! 🔥', 'success'); }
    }
    if (streak.current >= 7 && !unlockedList.includes('streak_7')) {
      if (await unlockAchievement('streak_7')) { playSound('fanfare'); fireConfetti(); window.showToast('Achievement Unlocked: 7-Day Streak! ☄️', 'success'); }
    }
    if (streak.current >= 30 && !unlockedList.includes('streak_30')) {
      if (await unlockAchievement('streak_30')) { playSound('fanfare'); fireConfetti(); window.showToast('Achievement Unlocked: 30-Day Streak! 🌟', 'success'); }
    }
  });
}

export function init() {
  const btnLottery = document.getElementById('btn-lottery');
  
  if (btnLottery) {
    btnLottery.addEventListener('click', async () => {
      const { spendTicket, setStreak, getStreak, unlockAchievement } = await import('../services/storage.js');
      const success = await spendTicket();
      
      if (success) {
        // Lottery spin visual
        btnLottery.disabled = true;
        btnLottery.textContent = 'Spinning... 🎰';
        playSound('spin');
        
        setTimeout(async () => {
          // 30% chance to win a freeze
          if (Math.random() < 0.3) {
            const streak = await getStreak();
            streak.freezes += 1;
            await setStreak(streak);
            playSound('fanfare');
            fireConfetti();
            window.showToast('🎉 You won a Streak Freeze! ❄️', 'success');
            await unlockAchievement('lucky_draw');
          } else {
            window.showToast('No luck this time! Try again tomorrow.', 'info');
          }
          // Re-render
          window.carbonNavigate('/achievements');
        }, 1500);
      }
    });
  }
}
