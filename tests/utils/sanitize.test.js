import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../../src/utils/sanitize.js';

describe('Sanitize Utility', () => {
  it('escapes basic html tags', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).not.toContain('<script>');
  });

  it('handles null and undefined safely', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('returns clean strings unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});
