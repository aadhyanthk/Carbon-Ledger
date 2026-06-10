import { describe, it, expect } from 'vitest';
import { render } from '../../src/components/onboarding.js';

describe('Onboarding Component', () => {
  it('renders the initial setup correctly', async () => {
    const html = await render();
    expect(html).toContain('How do you get around?');
    expect(html).toContain('Walk / Bike');
  });
});
