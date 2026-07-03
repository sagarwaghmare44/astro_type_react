// ===== COSMIC TYPER — App Root =====
import { useState, useCallback } from 'react';
import Menu from './Menu.jsx';
import Game from './Game.jsx';
import GameOver from './GameOver.jsx';
import Leaderboard from './Leaderboard.jsx';

// Screens: menu, game, gameover, leaderboard
export default function App() {
  const [screen, setScreen] = useState('menu');
  const [gameOverData, setGameOverData] = useState(null);

  const handleStart = useCallback(() => setScreen('game'), []);

  const handleGameOver = useCallback((data) => {
    setGameOverData(data);
    setScreen('gameover');
  }, []);

  const handleRestart = useCallback(() => setScreen('game'), []);
  const handleMenu = useCallback(() => setScreen('menu'), []);
  const handleShowScores = useCallback(() => setScreen('leaderboard'), []);

  return (
    <>
      {screen === 'menu' && (
        <Menu onStart={handleStart} onShowScores={handleShowScores} />
      )}
      {screen === 'game' && (
        <Game key={Date.now()} onGameOver={handleGameOver} />
      )}
      {screen === 'gameover' && gameOverData && (
        <GameOver data={gameOverData} onRestart={handleRestart} onMenu={handleMenu} />
      )}
      {screen === 'leaderboard' && (
        <Leaderboard onBack={handleMenu} />
      )}
    </>
  );
}
