// ===== COSMIC TYPER — Word Bank =====
// Curated word lists organized by difficulty

const WORDS_EASY = [
  'sun', 'sky', 'fly', 'jet', 'gas', 'orb', 'red', 'aim', 'zap', 'arc',
  'ion', 'ray', 'pod', 'hub', 'neo', 'glow', 'core', 'warp', 'beam', 'flux',
  'nova', 'star', 'moon', 'fire', 'burn', 'dust', 'void', 'dark', 'spin',
  'zoom', 'bolt', 'wave', 'fuel', 'tank', 'gate', 'ship', 'deep', 'fast',
  'mars', 'ring', 'rock', 'iron', 'gold', 'blue', 'cold', 'heat', 'lift',
  'drop', 'dock', 'land', 'wing', 'tail', 'nose', 'crew', 'plan', 'path',
];

const WORDS_MEDIUM = [
  'orbit', 'comet', 'flare', 'laser', 'gamma', 'delta', 'alpha', 'bravo',
  'quasar', 'solar', 'lunar', 'space', 'stars', 'light', 'speed', 'force',
  'power', 'phase', 'surge', 'blast', 'probe', 'radar', 'cargo', 'astro',
  'nebula', 'pluto', 'titan', 'venom', 'pulse', 'drift', 'wield', 'guard',
  'pilot', 'cadet', 'valor', 'medal', 'honor', 'brave', 'sharp', 'swift',
  'hyper', 'ultra', 'turbo', 'rapid', 'sonic', 'blaze', 'storm', 'crash',
  'giant', 'dwarf', 'black', 'white', 'omega', 'sigma', 'theta', 'cyber',
  'metal', 'steel', 'alloy', 'torch', 'flame', 'ignit', 'boost', 'drive',
];

const WORDS_HARD = [
  'galaxy', 'cosmos', 'rocket', 'meteor', 'planet', 'saturn', 'oxygen',
  'photon', 'proton', 'carbon', 'helium', 'plasma', 'shield', 'engine',
  'thrust', 'vector', 'matrix', 'vortex', 'zenith', 'cipher', 'fusion',
  'fission', 'gravity', 'command', 'shuttle', 'capsule', 'docking', 'landing',
  'mission', 'voyager', 'horizon', 'eclipse', 'nuclear', 'reactor', 'booster',
  'crystal', 'quantum', 'neutron', 'element', 'orbital', 'descent', 'reentry',
  'payload', 'cockpit', 'impulse', 'torpedo', 'defense', 'stealth', 'fighter',
  'missile', 'scanner', 'tracker', 'antenna', 'station', 'complex', 'cluster',
];

const WORDS_EXPERT = [
  'asteroid', 'starship', 'nebulosa', 'supernova', 'blackhole', 'wormhole',
  'interstellar', 'astronaut', 'satellite', 'telescope', 'magnetosphere',
  'atmosphere', 'cosmonaut', 'spaceship', 'hyperdrive', 'lightspeed',
  'antimatter', 'propulsion', 'trajectory', 'radiation', 'frequency',
  'combustion', 'navigation', 'expedition', 'dimension', 'coordinate',
  'astronomer', 'exoplanet', 'cataclysm', 'stardust', 'moonlight',
  'starfield', 'afterburn', 'blastwave', 'shockwave', 'thunderbolt',
  'graviton', 'jumpgate', 'starcraft', 'warpdrive', 'superlaser',
];

export function getWordForWave(wave) {
  if (wave <= 3) {
    return pickRandom(WORDS_EASY);
  } else if (wave <= 6) {
    return Math.random() < 0.3 ? pickRandom(WORDS_EASY) : pickRandom(WORDS_MEDIUM);
  } else if (wave <= 9) {
    return Math.random() < 0.2 ? pickRandom(WORDS_MEDIUM) : pickRandom(WORDS_HARD);
  } else {
    const r = Math.random();
    if (r < 0.15) return pickRandom(WORDS_MEDIUM);
    if (r < 0.55) return pickRandom(WORDS_HARD);
    return pickRandom(WORDS_EXPERT);
  }
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getAllWords() {
  return [...WORDS_EASY, ...WORDS_MEDIUM, ...WORDS_HARD, ...WORDS_EXPERT];
}
