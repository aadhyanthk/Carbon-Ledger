/**
 * CarbonLedger — Sound Effects
 * Uses the Web Audio API for lightweight, generated sound effects.
 */

let audioCtx = null;
let isMuted = false; // Add a toggle feature later if needed

function initAudio() {
  if (isMuted) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleMute() {
  isMuted = !isMuted;
  return isMuted;
}

export function playSound(type) {
  const ctx = initAudio();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'ching') {
    // Cash register ching
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc.start(t);
    osc.stop(t + 0.5);

    // Add a higher harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2400, t);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.1, t + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc2.start(t);
    osc2.stop(t + 0.3);
  } else if (type === 'pop') {
    // Satisfying pop
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);
  } else if (type === 'fanfare') {
    // Achievement unlock
    osc.type = 'square';
    // Note 1
    osc.frequency.setValueAtTime(440, t); // A4
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + 0.15);
    // Note 2
    osc.frequency.setValueAtTime(554.37, t + 0.15); // C#5
    gain.gain.setValueAtTime(0, t + 0.15);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.2);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);
    // Note 3
    osc.frequency.setValueAtTime(659.25, t + 0.3); // E5
    gain.gain.setValueAtTime(0, t + 0.3);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
    osc.start(t);
    osc.stop(t + 0.8);
  } else if (type === 'spin') {
    // Slot machine spinning (bloop bloop bloop)
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.2, t);

    for (let i = 0; i < 15; i++) {
      osc.frequency.setValueAtTime(300 + Math.random() * 200, t + i * 0.1);
      gain.gain.setValueAtTime(0.2, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.01, t + i * 0.1 + 0.08);
    }
    osc.start(t);
    osc.stop(t + 1.5);
  }
}
