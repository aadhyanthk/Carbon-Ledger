import { describe, it, expect } from 'vitest';
import { playSound } from '../../src/utils/audio.js';

describe('Audio Utility', () => {
  it('does not throw when AudioContext is unavailable', () => {
    // By default jsdom does not implement AudioContext
    expect(() => playSound('pop')).not.toThrow();
  });
});
