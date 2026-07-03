// ===== COSMIC TYPER — Leaderboard =====
import { useState, useEffect } from 'react';
import { getScores, clearScores, formatScore } from './scores.js';
import { playMenuClick } from './audio.js';
import './Leaderboard.css';

export default function Leaderboard({ onBack }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    setScores(getScores());
  }, []);

  const handleClear = () => {
    if (confirm('Clear all scores?')) {
      clearScores();
      setScores([]);
    }
  };

  return (
    <div className="lb-container" id="leaderboard-screen">
      <div className="lb-content animate-fade-in">
        <h1 className="lb-title">LEADERBOARD</h1>

        {scores.length === 0 ? (
          <div className="lb-empty glass-panel">
            <p>No missions completed yet.</p>
            <p className="lb-empty-hint">Play a game to see your scores here!</p>
          </div>
        ) : (
          <div className="lb-table glass-panel">
            <div className="lb-header">
              <span className="lb-col-rank">#</span>
              <span className="lb-col-score">Score</span>
              <span className="lb-col-wave">Wave</span>
              <span className="lb-col-combo">Combo</span>
              <span className="lb-col-acc">Acc</span>
              <span className="lb-col-date">Date</span>
            </div>
            {scores.map((s, i) => (
              <div key={s.id} className={`lb-row ${i === 0 ? 'lb-gold' : i === 1 ? 'lb-silver' : i === 2 ? 'lb-bronze' : ''}`}>
                <span className="lb-col-rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <span className="lb-col-score">{formatScore(s.score)}</span>
                <span className="lb-col-wave">{s.wave || '-'}</span>
                <span className="lb-col-combo">{s.maxCombo || 0}x</span>
                <span className="lb-col-acc">{s.accuracy || '-'}%</span>
                <span className="lb-col-date">{new Date(s.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        <div className="lb-actions">
          <button className="btn btn-primary" id="back-button" onClick={() => { playMenuClick(); onBack(); }}>
            Back
          </button>
          {scores.length > 0 && (
            <button className="btn btn-danger" id="clear-scores-button" onClick={handleClear}>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
