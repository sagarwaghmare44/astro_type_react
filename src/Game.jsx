// ===== COSMIC TYPER — Game Component =====
import { useRef, useEffect, useCallback, useState } from 'react';
import { renderGame } from './renderer.js';
import {
  createInitialState, initStars, spawnAsteroid,
  createParticles, createLaser, POWER_UPS, getWaveConfig,
} from './engine.js';
import { calculateScore } from './scores.js';
import {
  playKeystroke, playLaser, playExplosion, playPowerUp,
  playComboChime, playShieldHit, playDamage, playNuke,
  playSlowTime, startMusic, stopMusic,
} from './audio.js';
import './Game.css';

export default function Game({ onGameOver }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(createInitialState());
  const animRef = useRef(null);
  const [hud, setHud] = useState({ score: 0, lives: 3, wave: 1, combo: 0, input: '', effects: {} });
  const [notification, setNotification] = useState(null);
  const notifTimer = useRef(null);

  const showNotif = useCallback((text, color = '#00d4ff') => {
    setNotification({ text, color });
    clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(null), 1500);
  }, []);

  // Init
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const s = stateRef.current;
      s.ship.x = canvas.width / 2;
      s.ship.y = canvas.height - 80;
      if (s.stars.length === 0) s.stars = initStars(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);
    startMusic();

    let lastTime = 0;
    let spawnAcc = 0;

    const loop = (time) => {
      const dt = lastTime ? time - lastTime : 16;
      lastTime = time;
      const s = stateRef.current;

      if (!s.isPaused) {
        s.gameTime += dt;
        const config = getWaveConfig(s.wave);
        const speedMult = s.activeEffects.slow ? 0.4 : 1;

        // Spawn asteroids
        spawnAcc += dt;
        if (spawnAcc >= config.spawnInterval) {
          spawnAcc = 0;
          if (s.asteroids.length < 8 + s.wave) {
            s.asteroids.push(spawnAsteroid(s, canvas.width, canvas.height));
          }
        }

        // Update stars
        s.stars.forEach(star => {
          star.y += star.speed * speedMult;
          if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; }
        });

        // Update asteroids
        for (let i = s.asteroids.length - 1; i >= 0; i--) {
          const ast = s.asteroids[i];
          ast.y += ast.speed * speedMult;
          ast.rotation += ast.rotSpeed;

          // Reached bottom
          if (ast.y > canvas.height + ast.size) {
            s.asteroids.splice(i, 1);
            if (s.lockedAsteroid === ast.id) {
              s.lockedAsteroid = null;
              s.currentInput = '';
            }

            if (s.activeEffects.shield) {
              s.activeEffects.shield = false;
              playShieldHit();
              showNotif('Shield Absorbed!', '#00d4ff');
            } else {
              s.lives--;
              s.combo = 0;
              s.screenShake = 1;
              playDamage();
              if (s.lives <= 0) {
                stopMusic();
                onGameOver({
                  score: s.score, wave: s.wave, wordsTyped: s.wordsTyped,
                  maxCombo: s.maxCombo, accuracy: s.totalAttempts > 0 ? Math.round((s.correctChars / s.totalAttempts) * 100) : 100,
                  gameTime: s.gameTime,
                });
                return;
              }
            }
          }
        }

        // Update particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05;
          p.life -= p.decay;
          if (p.life <= 0) s.particles.splice(i, 1);
        }

        // Update lasers
        for (let i = s.lasers.length - 1; i >= 0; i--) {
          s.lasers[i].life -= s.lasers[i].decay;
          if (s.lasers[i].life <= 0) s.lasers.splice(i, 1);
        }

        // Screen shake decay
        if (s.screenShake > 0) s.screenShake *= 0.9;
        if (s.screenShake < 0.01) s.screenShake = 0;

        // Effect timers
        Object.keys(s.effectTimers).forEach(key => {
          if (s.effectTimers[key] > 0) {
            s.effectTimers[key] -= dt;
            if (s.effectTimers[key] <= 0) {
              s.activeEffects[key] = false;
              delete s.effectTimers[key];
            }
          }
        });

        // Wave progression
        s.waveTimer += dt;
        if (s.waveTimer >= 25000) {
          s.wave++;
          s.waveTimer = 0;
          showNotif(`Wave ${s.wave}`, '#ffd93d');
        }

        // Update HUD
        setHud({
          score: s.score, lives: s.lives, wave: s.wave,
          combo: s.combo, input: s.currentInput, effects: { ...s.activeEffects },
        });
      }

      renderGame(ctx, canvas, s, time);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      stopMusic();
    };
  }, [onGameOver, showNotif]);

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e) => {
      if (e.repeat) return;
      const s = stateRef.current;
      const key = e.key;

      if (key === 'Escape') {
        if (s.lockedAsteroid) {
          s.lockedAsteroid = null;
          s.currentInput = '';
        } else {
          s.isPaused = !s.isPaused;
        }
        return;
      }

      if (s.isPaused) return;
      if (key === 'Backspace') {
        if (s.currentInput.length > 0) {
          s.currentInput = s.currentInput.slice(0, -1);
          // Find locked asteroid and un-type
          const ast = s.asteroids.find(a => a.id === s.lockedAsteroid);
          if (ast && ast.typed > 0) ast.typed--;
          if (s.currentInput.length === 0) s.lockedAsteroid = null;
        }
        return;
      }

      if (key.length !== 1 || !key.match(/[a-zA-Z]/)) return;

      const typed = key.toLowerCase();
      playKeystroke();
      s.totalAttempts++;

      // If no asteroid locked, try to lock one
      if (!s.lockedAsteroid) {
        const target = s.asteroids.find(a => a.word[0] === typed && a.typed === 0);
        if (target) {
          s.lockedAsteroid = target.id;
          s.currentInput = typed;
          target.typed = 1;
          s.correctChars++;
          // Check if single letter word
          if (target.typed >= target.word.length) {
            destroyAsteroid(s, target);
          }
        }
        return;
      }

      // Continue typing locked asteroid
      const ast = s.asteroids.find(a => a.id === s.lockedAsteroid);
      if (!ast) {
        s.lockedAsteroid = null;
        s.currentInput = '';
        return;
      }

      const expected = ast.word[ast.typed];
      if (typed === expected) {
        ast.typed++;
        s.currentInput += typed;
        s.correctChars++;
        if (ast.typed >= ast.word.length) {
          destroyAsteroid(s, ast);
        }
      }
      // Wrong key doesn't break lock, just doesn't advance
    };

    const destroyAsteroid = (s, ast) => {
      const canvas = canvasRef.current;
      // Laser
      s.lasers.push(createLaser(s.ship.x, s.ship.y - 25, ast.x, ast.y));
      playLaser();

      // Particles
      const colors = ['#00d4ff', '#7b2ff7', '#ff2d8a', '#ffd93d', '#6bcb77'];
      s.particles.push(...createParticles(ast.x, ast.y, 25, colors[Math.floor(Math.random() * colors.length)], 4));
      s.particles.push(...createParticles(ast.x, ast.y, 15, '#ffffff', 2));
      playExplosion();

      // Score
      s.combo++;
      if (s.combo > s.maxCombo) s.maxCombo = s.combo;
      const points = calculateScore(ast.word.length, s.combo, s.activeEffects.multiplier);
      s.score += points;
      s.wordsTyped++;
      s.totalChars += ast.word.length;
      s.asteroidsDestroyed++;
      s.screenShake = 0.3;

      // Combo milestones
      if (s.combo > 0 && s.combo % 5 === 0) {
        playComboChime(s.combo / 5);
        showNotif(`🔥 ${s.combo}x Combo!`, '#ff9f43');
      }

      // Power-up
      if (ast.isPowerUp) {
        activatePowerUp(s, ast.powerUpType);
      }

      // Remove asteroid
      const idx = s.asteroids.indexOf(ast);
      if (idx >= 0) s.asteroids.splice(idx, 1);
      s.lockedAsteroid = null;
      s.currentInput = '';
    };

    const activatePowerUp = (s, type) => {
      const pu = POWER_UPS[type];
      playPowerUp();
      showNotif(`${pu.icon} ${pu.name}!`, pu.color);

      switch (type) {
        case 'SHIELD':
          s.activeEffects.shield = true;
          break;
        case 'SLOW':
          s.activeEffects.slow = true;
          s.effectTimers.slow = pu.duration;
          playSlowTime();
          break;
        case 'NUKE': {
          playNuke();
          const colors = ['#ff6b6b', '#ff9f43', '#ffd93d'];
          s.asteroids.forEach(a => {
            s.particles.push(...createParticles(a.x, a.y, 15, colors[Math.floor(Math.random() * 3)], 5));
            s.score += 5;
          });
          s.asteroids = [];
          s.lockedAsteroid = null;
          s.currentInput = '';
          s.screenShake = 1.5;
          break;
        }
        case 'MULTIPLIER':
          s.activeEffects.multiplier = true;
          s.effectTimers.multiplier = pu.duration;
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showNotif]);

  return (
    <div className="game-container" id="game-screen">
      <canvas ref={canvasRef} className="game-canvas" />

      {/* HUD */}
      <div className="hud" id="game-hud">
        <div className="hud-left">
          <div className="hud-score">
            <span className="hud-label">SCORE</span>
            <span className="hud-value" id="score-display">{hud.score.toLocaleString()}</span>
          </div>
          <div className="hud-combo">
            <span className="hud-label">COMBO</span>
            <span className="hud-value combo-val" style={{ color: hud.combo >= 5 ? '#ff9f43' : '#e8e8ff' }}>
              {hud.combo > 0 ? `${hud.combo}x` : '-'}
            </span>
          </div>
        </div>

        <div className="hud-center">
          <div className="hud-wave">WAVE {hud.wave}</div>
          <div className="hud-input" id="typing-display">
            {hud.input ? (
              <span className="typed-text">{hud.input}<span className="cursor">|</span></span>
            ) : (
              <span className="input-hint">Type to destroy asteroids...</span>
            )}
          </div>
        </div>

        <div className="hud-right">
          <div className="hud-lives" id="lives-display">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className={`life-icon ${i < hud.lives ? 'active' : 'lost'}`}>♥</span>
            ))}
          </div>
          <div className="hud-effects">
            {hud.effects.shield && <span className="effect-badge" style={{ borderColor: '#00d4ff' }}>🛡️</span>}
            {hud.effects.slow && <span className="effect-badge" style={{ borderColor: '#ffd93d' }}>⏱️</span>}
            {hud.effects.multiplier && <span className="effect-badge" style={{ borderColor: '#6bcb77' }}>⭐2x</span>}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="game-notif animate-fade-in" style={{ color: notification.color, textShadow: `0 0 20px ${notification.color}` }}>
          {notification.text}
        </div>
      )}

      {/* Pause Overlay */}
      {stateRef.current.isPaused && (
        <div className="pause-overlay">
          <div className="pause-text">PAUSED</div>
          <div className="pause-hint">Press ESC to resume</div>
        </div>
      )}
    </div>
  );
}
