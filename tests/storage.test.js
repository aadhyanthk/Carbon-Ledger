import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock idb-keyval
vi.mock('idb-keyval', () => {
  let mockStore = {};
  return {
    createStore: () => ({}),
    get: async (key) => mockStore[key],
    set: async (key, val) => { mockStore[key] = val; },
    del: async (key) => { delete mockStore[key]; },
    _reset: () => { mockStore = {}; } // helper for tests
  };
});

import { getProfile, setProfile, addActivity, getActivities } from '../src/services/storage.js';
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
});
