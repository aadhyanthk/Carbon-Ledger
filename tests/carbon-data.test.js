import { describe, it, expect } from 'vitest';
import { calculateBaseline, calcSavings, getDailyBudget } from '../src/services/carbon-data.js';

describe('Carbon Data Logic', () => {
  
  it('calculates a baseline correctly from answers', () => {
    // A mid-range persona
    const answers = {
      transport: 'car_small', // 2.84
      home: 'apartment_lg',   // 2.10
      diet: 'vegetarian',     // 3.81
      shopping: 'occasional', // 1.50
      lifestyle: 'dog'        // 2.47
    };
    // Expected total = 2.84 + 2.10 + 3.81 + 1.50 + 2.47 = 12.72
    // Plus base 1.2 = 13.92 -> round to 13.9
    const baseline = calculateBaseline(answers);
    expect(baseline).toBe(13.9);
  });

  it('handles missing answers gracefully', () => {
    const answers = {
      transport: 'car_ev' // 0.85
    };
    // 0.85 + 1.2 (base) = 2.05 -> round 2.1
    const baseline = calculateBaseline(answers);
    expect(baseline).toBe(2.1);
  });

  it('calculates annual savings correctly', () => {
    const res = calcSavings(1.5); // 1.5 kg/day saved
    // 1.5 * 365 = 547.5 -> 548 annual
    // trees = 548 / 21.7 = 25.25 -> 25
    // flights = 548 / 255 = 2.149 -> 2.1
    expect(res.annual).toBe(548);
    expect(res.trees).toBe(25);
    expect(res.flights).toBe(2.1);
  });

  it('calculates daily budget correctly based on goal', () => {
    const profile = {
      baseline: 20,
      goalPercent: 15 // 15% reduction
    };
    // 15% of 20 = 3
    // budget = 20 - 3 = 17
    const budget = getDailyBudget(profile);
    expect(budget).toBe(17);
  });

  it('handles a 0% goal reduction', () => {
    const profile = { baseline: 15, goalPercent: 0 };
    expect(getDailyBudget(profile)).toBe(15);
  });

  it('handles negative or extreme goal percentages gracefully', () => {
    // If someone wants to increase their emissions by 50% (negative reduction)
    const profileIncrease = { baseline: 10, goalPercent: -50 };
    expect(getDailyBudget(profileIncrease)).toBe(15); // 10 - (-5) = 15

    // If someone wants to reduce by 100% (zero emissions)
    const profileZero = { baseline: 10, goalPercent: 100 };
    expect(getDailyBudget(profileZero)).toBe(0);
  });

  it('handles empty answers object returning the base emission', () => {
    expect(calculateBaseline({})).toBe(1.2);
  });

});
