import { useState, useEffect } from 'react';
import Player1Input from './components/Player1Input';
import Player2Guess from './components/Player2Guess';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [hints, setHints] = useState([]);
  const [gameStatus, setGameStatus] = useState({ guessedWords: [], isGameOver: false });

  const startGame = async (data) => {
    await fetch('process.env.REACT_APP_API_URL/api/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setHints(data.hints);
    setGameStarted(true);
  };

  const guessType = async (guessedType) => {
    const response = await fetch('process.env.REACT_APP_API_URL/api/guess-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guessedType }),
    });
    return await response.json();
  };

  const guessWord = async (word) => {
    await fetch('process.env.REACT_APP_API_URL/api/guess-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word }),
    });
    await updateGameStatus();
  };

  const resetGame = async () => {
    await fetch('process.env.REACT_APP_API_URL/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    setGameStarted(false);
    setHints([]);
    setGameStatus({ guessedWords: [], isGameOver: false });
  };

  const updateGameStatus = async () => {
    const response = await fetch('process.env.REACT_APP_API_URL/api/status');
    const data = await response.json();
    setGameStatus(data);
  };

  useEffect(() => {
    if (gameStarted) {
      updateGameStatus();
    }
  }, [gameStarted]);

  return (
    <div className="container">
      {gameStarted && <h1>Smoke Of Deceit</h1>}
      <div className="game-container">
        {!gameStarted ? (
          <Player1Input startGame={startGame} />
        ) : (
          <Player2Guess
            hints={hints}
            guessType={guessType}
            guessWord={guessWord}
            gameStatus={gameStatus}
            resetGame={resetGame}
            updateGameStatus={updateGameStatus}
          />
        )}
      </div>
    </div>
  );
}

export default App;