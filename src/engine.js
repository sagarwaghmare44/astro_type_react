// ===== COSMIC TYPER — Game Engine =====
import { getWordForWave } from './words.js';

// Power-up types
export const POWER_UPS = {
  SHIELD: { name: 'Shield', icon: '🛡️', color: '#00d4ff', duration: 0 },
  SLOW: { name: 'Slow Time', icon: '⏱️', color: '#ffd93d', duration: 5000 },
  NUKE: { name: 'Nuke', icon: '💥', color: '#ff6b6b', duration: 0 },
  MULTIPLIER: { name: '2x Score', icon: '⭐', color: '#6bcb77', duration: 10000 },
};

export function createInitialState() {
  return {
    ship: { x: 0, y: 0, width: 50, height: 60 },
    asteroids: [],
    particles: [],
    lasers: [],
    stars: [],
    powerUpItems: [],
    score: 0,
    lives: 3,
    wave: 1,
    combo: 0,
    maxCombo: 0,
    wordsTyped: 0,
    totalChars: 0,
    accuracy: 100,
    correctChars: 0,
    totalAttempts: 0,
    currentInput: '',
    lockedAsteroid: null,
    activeEffects: { shield: false, slow: false, multiplier: false },
    effectTimers: {},
    spawnTimer: 0,
    waveTimer: 0,
    asteroidsDestroyed: 0,
    screenShake: 0,
    gameTime: 0,
    isPaused: false,
  };
}

export function initStars(width, height) {
  const stars = [];
  for (let layer = 0; layer < 3; layer++) {
    const count = 60 + layer * 40;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: (3 - layer) * 0.8 + Math.random() * 0.5,
        speed: (3 - layer) * 0.3 + 0.1,
        brightness: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.5 + Math.random() * 2,
        layer,
      });
    }
  }
  return stars;
}

function getSpawnInterval(wave) {
  return Math.max(800, 3000 - wave * 200);
}

function getAsteroidSpeed(wave) {
  return 0.3 + wave * 0.08 + Math.random() * 0.15;
}

export function spawnAsteroid(state, canvasW, canvasH) {
  const word = getWordForWave(state.wave);
  // Avoid duplicate first letters with existing asteroids when possible
  const existing = state.asteroids.map(a => a.word[0]);
  let finalWord = word;
  if (existing.includes(word[0])) {
    for (let tries = 0; tries < 5; tries++) {
      const alt = getWordForWave(state.wave);
      if (!existing.includes(alt[0])) { finalWord = alt; break; }
    }
  }

  const size = 30 + finalWord.length * 6;
  const x = size + Math.random() * (canvasW - size * 2);
  const speed = getAsteroidSpeed(state.wave);

  return {
    id: Date.now() + Math.random(),
    word: finalWord,
    typed: 0,
    x,
    y: -size,
    size,
    speed,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.02,
    opacity: 1,
    isPowerUp: Math.random() < 0.12,
    powerUpType: Object.keys(POWER_UPS)[Math.floor(Math.random() * 4)],
  };
}

export function createParticles(x, y, count, color, speed = 3) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const vel = speed * (0.5 + Math.random());
    particles.push({
      x, y,
      vx: Math.cos(angle) * vel,
      vy: Math.sin(angle) * vel,
      size: 1 + Math.random() * 3,
      life: 1,
      decay: 0.015 + Math.random() * 0.02,
      color,
    });
  }
  return particles;
}

export function createLaser(fromX, fromY, toX, toY) {
  return { fromX, fromY, toX, toY, life: 1, decay: 0.06 };
}

export function getWaveConfig(wave) {
  return {
    spawnInterval: getSpawnInterval(wave),
    asteroidSpeed: getAsteroidSpeed(wave),
    asteroidsPerWave: 5 + wave * 2,
  };
}
