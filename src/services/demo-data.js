/**
 * CarbonLedger — Demo Data Seeder
 * Populates IndexedDB with 2 weeks of realistic activity data so judges
 * see a lush, alive app instead of an empty dashboard.
 */
import { set, createStore } from 'idb-keyval';

const store = createStore('carbon-ledger-db', 'carbon-ledger-store');
function idbSet(key, value) {
  return set(key, value, store);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a timestamp for N days ago at the given hour */
function daysAgo(n, hour = 12, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

// ── Demo Profile ──────────────────────────────────────────────────────────────

const DEMO_PROFILE = {
  baseline: 14.2,
  goalPercent: 15,
  onboardingComplete: true,
  avatar: '🌍',
  answers: {
    transport: 'car_small',
    home: 'apartment_lg',
    diet: 'light_meat',
    shopping: 'occasional',
    lifestyle: 'no_pets',
  },
  createdAt: daysAgo(14),
  updatedAt: Date.now(),
};

// ── Demo Activities (14 days of realistic logging) ────────────────────────────

function buildActivities() {
  const acts = [];
  let idCounter = 1;
  const uid = () => `demo-${idCounter++}`;

  // Day 14 ago
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Car drive to work',
    kgCO2: 3.84,
    timestamp: daysAgo(14, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Beef meal',
    kgCO2: 6.61,
    timestamp: daysAgo(14, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'energy',
    label: 'Home electricity (5 kWh)',
    kgCO2: 2.1,
    timestamp: daysAgo(14, 20),
    source: 'manual',
  });

  // Day 13
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Bus ride (30 min)',
    kgCO2: 0.8,
    timestamp: daysAgo(13, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Vegetarian meal',
    kgCO2: 0.4,
    timestamp: daysAgo(13, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Coffee',
    kgCO2: 0.21,
    timestamp: daysAgo(13, 9),
    source: 'manual',
  });

  // Day 12
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Car drive to work',
    kgCO2: 3.84,
    timestamp: daysAgo(12, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Chicken meal',
    kgCO2: 1.38,
    timestamp: daysAgo(12, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'shopping',
    label: 'Online order (small)',
    kgCO2: 3.5,
    timestamp: daysAgo(12, 17),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'energy',
    label: 'Hot shower (10 min)',
    kgCO2: 0.74,
    timestamp: daysAgo(12, 7),
    source: 'manual',
  });

  // Day 11
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Biked instead',
    kgCO2: 0,
    timestamp: daysAgo(11, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Vegan meal',
    kgCO2: 0.2,
    timestamp: daysAgo(11, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Vegetarian meal',
    kgCO2: 0.4,
    timestamp: daysAgo(11, 19),
    source: 'manual',
  });

  // Day 10
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Car drive to work',
    kgCO2: 3.84,
    timestamp: daysAgo(10, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Beef meal',
    kgCO2: 6.61,
    timestamp: daysAgo(10, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'energy',
    label: 'Laundry load',
    kgCO2: 0.6,
    timestamp: daysAgo(10, 16),
    source: 'manual',
  });

  // Day 9
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Train commute',
    kgCO2: 0.62,
    timestamp: daysAgo(9, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Fish meal',
    kgCO2: 1.22,
    timestamp: daysAgo(9, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Coffee',
    kgCO2: 0.21,
    timestamp: daysAgo(9, 9),
    source: 'manual',
  });

  // Day 8
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Bus ride (30 min)',
    kgCO2: 0.8,
    timestamp: daysAgo(8, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Chicken meal',
    kgCO2: 1.38,
    timestamp: daysAgo(8, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'energy',
    label: 'Dishwasher cycle',
    kgCO2: 0.76,
    timestamp: daysAgo(8, 20),
    source: 'manual',
  });

  // Day 7 — milestone day (7-day streak if clean)
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Biked instead',
    kgCO2: 0,
    timestamp: daysAgo(7, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Vegetarian meal',
    kgCO2: 0.4,
    timestamp: daysAgo(7, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Vegan meal',
    kgCO2: 0.2,
    timestamp: daysAgo(7, 19),
    source: 'manual',
  });

  // Day 6
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Car drive to work',
    kgCO2: 3.84,
    timestamp: daysAgo(6, 8),
    source: 'ai',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Beef meal',
    kgCO2: 6.61,
    timestamp: daysAgo(6, 13),
    source: 'ai',
  });
  acts.push({
    id: uid(),
    category: 'shopping',
    label: 'T-shirt / top',
    kgCO2: 5.5,
    timestamp: daysAgo(6, 17),
    source: 'manual',
  });

  // Day 5
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Rideshare / Uber',
    kgCO2: 2.1,
    timestamp: daysAgo(5, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Chicken meal',
    kgCO2: 1.38,
    timestamp: daysAgo(5, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'energy',
    label: 'Home electricity (5 kWh)',
    kgCO2: 2.1,
    timestamp: daysAgo(5, 20),
    source: 'manual',
  });

  // Day 4
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Bus ride (30 min)',
    kgCO2: 0.8,
    timestamp: daysAgo(4, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Fish meal',
    kgCO2: 1.22,
    timestamp: daysAgo(4, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Coffee',
    kgCO2: 0.21,
    timestamp: daysAgo(4, 9),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'energy',
    label: 'Hot shower (10 min)',
    kgCO2: 0.74,
    timestamp: daysAgo(4, 7),
    source: 'manual',
  });

  // Day 3
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Biked instead',
    kgCO2: 0,
    timestamp: daysAgo(3, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Vegan meal',
    kgCO2: 0.2,
    timestamp: daysAgo(3, 13),
    source: 'ai',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Vegetarian meal',
    kgCO2: 0.4,
    timestamp: daysAgo(3, 19),
    source: 'ai',
  });

  // Day 2
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Train commute',
    kgCO2: 0.62,
    timestamp: daysAgo(2, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Chicken meal',
    kgCO2: 1.38,
    timestamp: daysAgo(2, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'energy',
    label: 'Laundry load',
    kgCO2: 0.6,
    timestamp: daysAgo(2, 16),
    source: 'manual',
  });

  // Day 1 (yesterday)
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Car drive to work',
    kgCO2: 3.84,
    timestamp: daysAgo(1, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Beef meal',
    kgCO2: 6.61,
    timestamp: daysAgo(1, 13),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Coffee',
    kgCO2: 0.21,
    timestamp: daysAgo(1, 9),
    source: 'manual',
  });

  // Today — a few activities already logged
  acts.push({
    id: uid(),
    category: 'transport',
    label: 'Bus ride (30 min)',
    kgCO2: 0.8,
    timestamp: daysAgo(0, 8),
    source: 'manual',
  });
  acts.push({
    id: uid(),
    category: 'food',
    label: 'Coffee',
    kgCO2: 0.21,
    timestamp: daysAgo(0, 9),
    source: 'manual',
  });

  // Sort newest first (how storage.js stores them)
  return acts.sort((a, b) => b.timestamp - a.timestamp);
}

// ── Demo Streak ───────────────────────────────────────────────────────────────

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const DEMO_STREAK = {
  current: 7,
  longest: 7,
  lastLogDate: yesterday.toDateString(),
  freezes: 2,
};

// ── Demo Goals ────────────────────────────────────────────────────────────────

const DEMO_GOALS = [
  {
    id: 'green_week',
    title: 'Green Week',
    emoji: '🌿',
    duration: 7,
    totalSavingKg: 14.0,
    startDate: daysAgo(5),
    completedItems: ['gw1', 'gw2', 'gw3', 'gw4'],
    completed: false,
  },
  {
    id: 'commute_shift',
    title: 'Commute Shift',
    emoji: '🚲',
    duration: 14,
    totalSavingKg: 53.0,
    startDate: daysAgo(10),
    completedItems: ['cs1', 'cs2'],
    completed: false,
  },
  {
    id: 'meatless_month',
    title: 'Meatless Month',
    emoji: '🥗',
    duration: 30,
    totalSavingKg: 45.0,
    startDate: daysAgo(14),
    completedItems: ['mm1', 'mm2', 'mm3', 'mm4', 'mm5'],
    completed: true,
    completedAt: daysAgo(2),
  },
];

// ── Demo Achievements ─────────────────────────────────────────────────────────

const DEMO_ACHIEVEMENTS = [
  'first_log',
  'streak_3',
  'streak_7',
  'green_warrior',
];

// ── Demo Tickets ──────────────────────────────────────────────────────────────

const DEMO_TICKETS = { count: 3, lastEarnedDate: new Date().toDateString() };

// ── Main Seed Function ────────────────────────────────────────────────────────

/**
 * Seeds IndexedDB with realistic demo data.
 * Safe to call even if data already exists — it overwrites.
 */
export async function seedDemoData() {
  await Promise.all([
    idbSet('userProfile', DEMO_PROFILE),
    idbSet('activities', buildActivities()),
    idbSet('streak', DEMO_STREAK),
    idbSet('goals', DEMO_GOALS),
    idbSet('achievements', DEMO_ACHIEVEMENTS),
    idbSet('tickets', DEMO_TICKETS),
  ]);
}
