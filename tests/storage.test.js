import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock idb-keyval
vi.mock('idb-keyval', () => {
  let mockStore = {};
  return {
    createStore: () => ({}),
    get: async (key) => mockStore[key],
    set: async (key, val) => {
      mockStore[key] = val;
    },
    del: async (key) => {
      delete mockStore[key];
    },
    _reset: () => {
      mockStore = {};
    }, // helper for tests
  };
});

import {
  getProfile,
  setProfile,
  addActivity,
  getActivities,
  updateStreak,
  getStreak,
  setStreak,
} from '../src/services/storage.js';
import * as idb from 'idb-keyval';

describe('Storage Service', () => {
  beforeEach(() => {
    idb._reset();
  });

  it('gets and sets user profile', async () => {
    let p = await getProfile();
    expect(p).toBeUndefined();

    await setProfile({ name: 'Test', baseline: 10 });
    p = await getProfile();
    expect(p.name).toBe('Test');
    expect(p.baseline).toBe(10);
    expect(p.updatedAt).toBeDefined();
  });

  it('adds and retrieves activities', async () => {
    await addActivity({ id: '1', kgCO2: 5 });
    await addActivity({ id: '2', kgCO2: 3 });

    const acts = await getActivities();
    expect(acts.length).toBe(2);
    // added to front
    expect(acts[0].id).toBe('2');
    expect(acts[1].id).toBe('1');
  });

  describe('Streak Logic', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('increments streak on consecutive days under budget', async () => {
      const day1 = new Date('2026-06-10T10:00:00Z');
      vi.setSystemTime(day1);
      await updateStreak(true); // Day 1, under budget
      let s = await getStreak();
      expect(s.current).toBe(1);

      const day2 = new Date('2026-06-11T10:00:00Z');
      vi.setSystemTime(day2);
      await updateStreak(true); // Day 2, under budget
      s = await getStreak();
      expect(s.current).toBe(2);
      expect(s.longest).toBe(2);
    });

    it('resets streak if missed a day and no freezes', async () => {
      // Seed a 3 day streak on June 10
      await setStreak({
        current: 3,
        longest: 3,
        freezes: 0,
        lastLogDate: new Date('2026-06-10T10:00:00Z').toDateString(),
      });

      // Skip June 11, log on June 12
      const day3 = new Date('2026-06-12T10:00:00Z');
      vi.setSystemTime(day3);
      await updateStreak(true);

      const s = await getStreak();
      expect(s.current).toBe(1); // Reset back to 1
    });

    it('uses freeze to maintain streak if missed a day', async () => {
      await setStreak({
        current: 3,
        longest: 3,
        freezes: 1,
        lastLogDate: new Date('2026-06-10T10:00:00Z').toDateString(),
      });

      // Skip June 11, log on June 12
      const day3 = new Date('2026-06-12T10:00:00Z');
      vi.setSystemTime(day3);
      await updateStreak(true);

      const s = await getStreak();
      expect(s.current).toBe(4); // 3 + missed day (freeze) + 1 = 4? No, the logic says if freeze > 0, current += 1, and today we add another? Wait, actually the logic just adds 1.
      // Let's check storage.js:
      // if (streak.freezes > 0) { streak.freezes -= 1; streak.current += 1; }
      // So current becomes 4.
      expect(s.current).toBe(4);
      expect(s.freezes).toBe(0);
    });
  });
});
