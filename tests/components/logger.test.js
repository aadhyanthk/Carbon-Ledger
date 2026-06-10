import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../../src/components/logger.js';
import * as carbonData from '../../src/services/carbon-data.js';

vi.mock('../../src/services/carbon-data.js', () => ({
  CATEGORY_ICONS: { transport: '🚗' },
  PRESETS: {
    transport: [{ id: 'p1', label: 'Car ride', kgCO2: 5, icon: '🚗' }]
  },
  getDailyBudget: () => 15
}));

describe('Logger Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders quick log presets correctly', async () => {
    const html = await render();
    expect(html).toContain('Quick Log');
    expect(html).toContain('Smart Log');
    expect(html).toContain('Car ride');
    expect(html).toContain('+5 kg');
    expect(html).toContain('🚗');
  });
});
