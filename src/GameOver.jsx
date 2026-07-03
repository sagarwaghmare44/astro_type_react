// ===== COSMIC TYPER — Game Over Screen =====
import { useEffect, useState } from 'react';
import { saveScore, getHighScore, formatScore } from './scores.js';
import { playGameOver, playMenuClick } from './audio.js';
import './GameOver.css';

export default function GameOver({ data, onRestart, onMenu }) {
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    playGameOver();
    const prevHigh = getHighScore();
    if (data.score > prevHigh) setIsNewHigh(true);

    if (!saved) {
      saveScore({
        score: data.score,
        wave: data.wave,
        wordsTyped: data.wordsTyped,
        maxCombo: data.maxCombo,
        accuracy: data.accuracy,
      });
      setSaved(true);
    }
  }, [data, saved]);

  const minutes = Math.floor(data.gameTime / 60000);
  const seconds = Math.floor((data.gameTime % 60000) / 1000);

  return (
    <div className="go-container" id="gameover-screen">
      <div className="go-content animate-slide-up">
        {isNewHigh && <div className="go-new-high animate-fade-in">🏆 NEW HIGH SCORE! 🏆</div>}

        <h1 className="go-title">MISSION OVER</h1>

        <div className="go-score">
          <span className="go-score-label">FINAL SCORE</span>
          <span className="go-score-value">{formatScore(data.score)}</span>
        </div>

        <div className="go-stats glass-panel">
          <div className="go-stat">
            <span className="go-stat-value">{data.wave}</span>
            <span className="go-stat-label">Wave</span>
          </div>
          <div className="go-stat">
            <span className="go-stat-value">{data.wordsTyped}</span>
            <span className="go-stat-label">Words</span>
          </div>
          <div className="go-stat">
            <span className="go-stat-value">{data.maxCombo}x</span>
            <span className="go-stat-label">Max Combo</span>
          </div>
          <div className="go-stat">
            <span className="go-stat-value">{data.accuracy}%</span>
            <span className="go-stat-label">Accuracy</span>
          </div>
          <div className="go-stat">
            <span className="go-stat-value">{minutes}:{seconds.toString().padStart(2, '0')}</span>
            <span className="go-stat-label">Time</span>
          </div>
        </div>

        <div className="go-actions">
          <button className="btn btn-primary" id="restart-button" onClick={() => { playMenuClick(); onRestart(); }}>
            Retry Mission
          </button>
          <button className="btn btn-secondary" id="menu-button" onClick={() => { playMenuClick(); onMenu(); }}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
