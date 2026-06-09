/**
 * CarbonLedger — Storage Service
 * IndexedDB wrapper using idb-keyval for all persistent data.
 */
import { get, set, del, createStore } from 'idb-keyval';

// Custom store to namespace our data
const store = createStore('carbon-ledger-db', 'carbon-ledger-store');

// ── Helpers ───────────────────────────────────────────────────────────────────

function idbGet(key)        { return get(key, store); }
function idbSet(key, value) { return set(key, value, store); }
function idbDel(key)        { return del(key, store); }

// ── User Profile ──────────────────────────────────────────────────────────────

/** @returns {Promise<Object|undefined>} */
export async function getProfile() {
  return idbGet('userProfile');
}

/** @param {Object} data */
export async function setProfile(data) {
  return idbSet('userProfile', { ...data, updatedAt: Date.now() });
}

// ── Activities ────────────────────────────────────────────────────────────────

/**
 * Add a logged activity
 * @param {{ id: string, category: string, label: string, kgCO2: number, timestamp: number, source: 'manual'|'ai' }} activity
 */
export async function addActivity(activity) {
  const activities = (await idbGet('activities')) || [];
  activities.unshift(activity); // newest first
  return idbSet('activities', activities);
}

/**
 * Get activities, optionally filtered by date range
 * @param {{ from?: number, to?: number }} [range]
 * @returns {Promise<Array>}
 */
export async function getActivities(range = {}) {
  const activities = (await idbGet('activities')) || [];
  if (!range.from && !range.to) return activities;
  return activities.filter(a => {
    if (range.from && a.timestamp < range.from) return false;
    if (range.to   && a.timestamp > range.to)   return false;
    return true;
  });
}

/**
 * Get today's activities
 * @returns {Promise<Array>}
 */
export async function getTodayActivities() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return getActivities({ from: start.getTime() });
}

/**
 * Get total kg CO₂ logged today
 * @returns {Promise<number>}
 */
export async function getTodayTotal() {
  const activities = await getTodayActivities();
  return activities.reduce((sum, a) => sum + (a.kgCO2 || 0), 0);
}

/**
 * Delete an activity by id
 * @param {string} id
 */
export async function deleteActivity(id) {
  const activities = (await idbGet('activities')) || [];
  return idbSet('activities', activities.filter(a => a.id !== id));
}

// ── Streaks ───────────────────────────────────────────────────────────────────

/**
 * @returns {Promise<{ current: number, longest: number, lastLogDate: string, freezes: number }>}
 */
export async function getStreak() {
  return (await idbGet('streak')) || { current: 0, longest: 0, lastLogDate: null, freezes: 1 };
}

/** @param {Object} data */
export async function setStreak(data) {
  return idbSet('streak', data);
}

/**
 * Update streak based on today's activity
 * Call this after each activity log.
 * @param {boolean} underBudget - whether user is under budget today
 */
export async function updateStreak(underBudget) {
  const streak = await getStreak();
  const today  = new Date().toDateString();

  if (streak.lastLogDate === today) return streak; // already updated today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = streak.lastLogDate === yesterday.toDateString();

  if (wasYesterday && underBudget) {
    streak.current += 1;
  } else if (!wasYesterday && streak.lastLogDate !== null) {
    // Missed a day — use freeze if available
    if (streak.freezes > 0) {
      streak.freezes -= 1;
      streak.current += 1; // freeze saves streak
    } else {
      streak.current = underBudget ? 1 : 0;
    }
  } else if (underBudget) {
    streak.current = Math.max(streak.current + 1, 1);
  }

  streak.longest    = Math.max(streak.longest, streak.current);
  streak.lastLogDate = today;

  await setStreak(streak);
  return streak;
}

// ── Goals / Challenges ────────────────────────────────────────────────────────

/**
 * @returns {Promise<Array>}
 */
export async function getGoals() {
  return (await idbGet('goals')) || [];
}

/**
 * Start a challenge
 * @param {Object} challengePack - from CHALLENGE_PACKS
 */
export async function startChallenge(challengePack) {
  const goals = await getGoals();
  if (goals.find(g => g.id === challengePack.id)) return; // already active

  goals.push({
    id:         challengePack.id,
    title:      challengePack.title,
    emoji:      challengePack.emoji,
    duration:   challengePack.duration,
    totalSavingKg: challengePack.totalSavingKg,
    startDate:  Date.now(),
    completedItems: [], // array of item ids completed
    completed:  false,
  });

  return idbSet('goals', goals);
}

/**
 * Check off a checklist item
 * @param {string} goalId
 * @param {string} itemId
 */
export async function completeGoalItem(goalId, itemId) {
  const goals = await getGoals();
  const goal  = goals.find(g => g.id === goalId);
  if (!goal || goal.completedItems.includes(itemId)) return;

  goal.completedItems.push(itemId);
  return idbSet('goals', goals);
}

/**
 * Mark a challenge as completed
 * @param {string} goalId
 */
export async function markGoalComplete(goalId) {
  const goals = await getGoals();
  const goal  = goals.find(g => g.id === goalId);
  if (!goal) return;
  goal.completed = true;
  goal.completedAt = Date.now();
  return idbSet('goals', goals);
}

// ── Achievements ──────────────────────────────────────────────────────────────

/** @returns {Promise<string[]>} Array of unlocked achievement IDs */
export async function getAchievements() {
  return (await idbGet('achievements')) || [];
}

/**
 * Unlock an achievement
 * @param {string} id
 */
export async function unlockAchievement(id) {
  const achievements = await getAchievements();
  if (achievements.includes(id)) return false; // already unlocked
  achievements.push(id);
  await idbSet('achievements', achievements);
  return true; // newly unlocked
}

// ── Green Tickets (Lottery) ───────────────────────────────────────────────────

export async function getTickets() {
  return (await idbGet('tickets')) || { count: 0, lastEarnedDate: null };
}

export async function earnTicket() {
  const tickets = await getTickets();
  const today   = new Date().toDateString();
  if (tickets.lastEarnedDate === today) return tickets; // one per day

  tickets.count += 1;
  tickets.lastEarnedDate = today;
  await idbSet('tickets', tickets);
  return tickets;
}

export async function spendTicket() {
  const tickets = await getTickets();
  if (tickets.count <= 0) return false;
  tickets.count -= 1;
  await idbSet('tickets', tickets);
  return true;
}

// ── Data Export / Reset ───────────────────────────────────────────────────────

/** Export all data as JSON blob */
export async function getAllData() {
  const [profile, activities, streak, goals, achievements, tickets] = await Promise.all([
    getProfile(),
    getActivities(),
    getStreak(),
    getGoals(),
    getAchievements(),
    getTickets(),
  ]);
  return { profile, activities, streak, goals, achievements, tickets, exportedAt: Date.now() };
}

/** Clear all user data (reset app) */
export async function clearAllData() {
  await Promise.all([
    idbDel('userProfile'),
    idbDel('activities'),
    idbDel('streak'),
    idbDel('goals'),
    idbDel('achievements'),
    idbDel('tickets'),
  ]);
}
