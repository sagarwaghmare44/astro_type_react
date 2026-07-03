// ===== COSMIC TYPER — Main Menu =====
import { useEffect, useRef, useState } from 'react';
import { getHighScore, getStats } from './scores.js';
import { playMenuClick, initAudio } from './audio.js';
import './Menu.css';

export default function Menu({ onStart, onShowScores }) {
  const canvasRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    setHighScore(getHighScore());
    setStats(getStats());
  }, []);

  // Animated starfield background
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
      });
    }
    let anim;
    const draw = () => {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#aaccff';
      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        ctx.globalAlpha = 0.3 + Math.random() * 0.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, []);

  const handleStart = () => {
    initAudio();
    playMenuClick();
    onStart();
  };

  return (
    <div className="menu-container" id="main-menu">
      <canvas ref={canvasRef} className="menu-bg-canvas" />
      <div className="menu-content animate-fade-in">
        <div className="menu-logo-wrap">
          <div className="menu-ship">🚀</div>
          <h1 className="menu-title">
            <span className="title-cosmic">COSMIC</span>
            <span className="title-typer">TYPER</span>
          </h1>
          <p className="menu-subtitle">Space Typing Defense</p>
        </div>

        <div className="menu-actions">
          <button className="btn btn-primary menu-start-btn" id="start-button" onClick={handleStart}>
            Launch Mission
          </button>
          <button className="btn btn-secondary" id="scores-button" onClick={() => { playMenuClick(); onShowScores(); }}>
            Leaderboard
          </button>
        </div>

        {highScore > 0 && (
          <div className="menu-high-score glass-panel">
            <span className="hs-label">HIGH SCORE</span>
            <span className="hs-value">{highScore.toLocaleString()}</span>
          </div>
        )}

        {stats && (
          <div className="menu-stats glass-panel">
            <div className="stat-item">
              <span className="stat-num">{stats.totalGames}</span>
              <span className="stat-label">Games</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{stats.totalWords}</span>
              <span className="stat-label">Words</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{stats.bestCombo}x</span>
              <span className="stat-label">Best Combo</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{stats.bestWave}</span>
              <span className="stat-label">Best Wave</span>
            </div>
          </div>
        )}

        <div className="menu-controls glass-panel">
          <h3>How to Play</h3>
          <ul>
            <li><kbd>A-Z</kbd> Type the first letter to lock on an asteroid</li>
            <li><kbd>Complete</kbd> the word to fire your laser</li>
            <li><kbd>Backspace</kbd> to correct mistakes</li>
            <li><kbd>ESC</kbd> to cancel lock / pause</li>
            <li>⭐ Destroy glowing asteroids for power-ups!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
