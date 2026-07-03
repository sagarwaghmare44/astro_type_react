// ===== COSMIC TYPER — Sound Engine =====
// Synthesized audio using Web Audio API (no external files needed)

let audioCtx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let isMuted = false;
let musicOsc = null;
let musicLfo = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.08;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(masterGain);
  }
  return audioCtx;
}

export function initAudio() {
  getCtx();
}

export function setMuted(muted) {
  isMuted = muted;
  if (masterGain) {
    masterGain.gain.setTargetAtTime(muted ? 0 : 0.5, audioCtx.currentTime, 0.05);
  }
}

export function isSoundMuted() {
  return isMuted;
}

// ===== Background Music (Ambient Space Hum) =====
export function startMusic() {
  const ctx = getCtx();
  if (musicOsc) stopMusic();

  // Deep drone
  musicOsc = ctx.createOscillator();
  musicOsc.type = 'sine';
  musicOsc.frequency.value = 55; // Low A

  // LFO for subtle movement
  musicLfo = ctx.createOscillator();
  musicLfo.type = 'sine';
  musicLfo.frequency.value = 0.1;

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 5;

  musicLfo.connect(lfoGain);
  lfoGain.connect(musicOsc.frequency);

  // Filter for warmth
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  filter.Q.value = 2;

  musicOsc.connect(filter);
  filter.connect(musicGain);

  musicOsc.start();
  musicLfo.start();
}

export function stopMusic() {
  try {
    if (musicOsc) { musicOsc.stop(); musicOsc = null; }
    if (musicLfo) { musicLfo.stop(); musicLfo = null; }
  } catch (e) { /* ignore */ }
}

// ===== Sound Effects =====

function playTone(freq, duration, type = 'sine', volume = 0.3, detune = 0) {
  if (isMuted) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(sfxGain);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration, volume = 0.1, filterFreq = 2000) {
  if (isMuted) return;
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;

  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);

  source.start();
}

// Keystroke click
export function playKeystroke() {
  playTone(800 + Math.random() * 400, 0.05, 'square', 0.08);
}

// Laser fire
export function playLaser() {
  if (isMuted) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(sfxGain);

  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

// Explosion
export function playExplosion() {
  playNoise(0.5, 0.4, 800);
  playTone(80, 0.4, 'sine', 0.3);
  playTone(60, 0.6, 'sine', 0.2);
}

// Power-up collect
export function playPowerUp() {
  if (isMuted) return;
  const ctx = getCtx();
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.2);
  });
}

// Combo milestone chime
export function playComboChime(comboLevel) {
  if (isMuted) return;
  const baseFreq = 400 + comboLevel * 100;
  playTone(baseFreq, 0.15, 'sine', 0.25);
  setTimeout(() => playTone(baseFreq * 1.5, 0.15, 'sine', 0.2), 80);
  setTimeout(() => playTone(baseFreq * 2, 0.2, 'sine', 0.15), 160);
}

// Shield hit
export function playShieldHit() {
  playTone(300, 0.3, 'triangle', 0.3);
  playNoise(0.2, 0.15, 1500);
}

// Damage / life lost
export function playDamage() {
  if (isMuted) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);

  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(sfxGain);

  osc.start();
  osc.stop(ctx.currentTime + 0.5);

  playNoise(0.3, 0.3, 500);
}

// Game over
export function playGameOver() {
  if (isMuted) return;
  const notes = [400, 350, 300, 200];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.6, 'sine', 0.25), i * 200);
  });
}

// Menu click
export function playMenuClick() {
  playTone(600, 0.08, 'sine', 0.15);
}

// Nuke
export function playNuke() {
  if (isMuted) return;
  playNoise(1.2, 0.5, 3000);
  playTone(40, 1.5, 'sine', 0.4);
  setTimeout(() => playTone(80, 0.8, 'sine', 0.3), 200);
}

// Slow time activation
export function playSlowTime() {
  if (isMuted) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.8);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

  osc.connect(gain);
  gain.connect(sfxGain);

  osc.start();
  osc.stop(ctx.currentTime + 0.8);
}
