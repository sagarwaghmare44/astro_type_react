// ===== COSMIC TYPER — Score Manager =====

const STORAGE_KEY = 'cosmicTyper_scores';

export function saveScore(scoreData) {
  const scores = getScores();
  scores.push({
    ...scoreData,
    date: new Date().toISOString(),
    id: Date.now(),
  });
  scores.sort((a, b) => b.score - a.score);
  const top20 = scores.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top20));
  return top20;
}

export function getScores() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getHighScore() {
  const scores = getScores();
  return scores.length > 0 ? scores[0].score : 0;
}

export function clearScores() {
  localStorage.removeItem(STORAGE_KEY);
}

export function calculateScore(wordLength, combo, hasMultiplier) {
  const base = wordLength * 10;
  const comboBonus = Math.floor(combo * 0.5);
  const multiplier = hasMultiplier ? 2 : 1;
  return (base + comboBonus) * multiplier;
}

export function formatScore(score) {
  return score.toLocaleString();
}

export function getStats() {
  const scores = getScores();
  if (scores.length === 0) return null;
  return {
    totalGames: scores.length,
    highScore: scores[0].score,
    avgScore: Math.round(scores.reduce((s, g) => s + g.score, 0) / scores.length),
    totalWords: scores.reduce((s, g) => s + (g.wordsTyped || 0), 0),
    bestCombo: Math.max(...scores.map(g => g.maxCombo || 0)),
    bestWave: Math.max(...scores.map(g => g.wave || 1)),
  };
}
