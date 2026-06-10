import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../../src/components/dashboard.js';
import * as storage from '../../src/services/storage.js';
import * as carbonData from '../../src/services/carbon-data.js';

vi.mock('../../src/services/storage.js');
vi.mock('../../src/services/carbon-data.js');

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.getProfile.mockResolvedValue({ baseline: 20 });
    storage.getTodayTotal.mockResolvedValue(5);
    storage.getStreak.mockResolvedValue({ current: 3 });
    storage.getGoals.mockResolvedValue([]);
    storage.getTodayActivities.mockResolvedValue([
      { id: '1', category: 'transport', label: 'Bus', kgCO2: 2.5 }
    ]);
    carbonData.getDailyBudget.mockReturnValue(15);
  });

  it('renders correctly with mocked data', async () => {
    const html = await render();
    expect(html).toContain("Today's Budget");
    expect(html).toContain('5.0 <span>kg</span>');
    expect(html).toContain('Target: <strong>15.0 kg</strong>');
    expect(html).toContain('Bus');
    expect(html).toContain('2.5 kg');
    expect(html).toContain('3 🔥');
  });

  it('handles empty profile gracefully', async () => {
    storage.getProfile.mockResolvedValue(null);
    const html = await render();
    expect(html).toContain('Error loading profile');
  });
});
