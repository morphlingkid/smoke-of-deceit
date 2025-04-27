import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import MainMenu from './components/MainMenu';
import Player1Input from './components/Player1Input';
import Player2Guess from './components/Player2Guess';
import './index.css';

const socket = io(process.env.REACT_APP_WS_URL, {
  transports: ['websocket'],
  withCredentials: true,
});
console.log(socket);

socket.on('connect', () => {
  console.log('WebSocket connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection failed:', error);
});


function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [hints, setHints] = useState([]);
  const [gameStatus, setGameStatus] = useState({ guessedWords: [], isGameOver: false });
  const [roomId, setRoomId] = useState(null);
  const [playerRole, setPlayerRole] = useState(null); // 'player1' или 'player2'
  const [view, setView] = useState('menu'); // 'menu', 'player1', 'player2'

  const startGame = async (data) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, roomId }),
    });
    if (response.ok) {
      setHints(data.hints);
      setGameStarted(true);
      socket.emit('gameStarted', roomId);
    }
  };

  const guessType = async (guessedType) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/guess-type`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guessedType, roomId }),
    });
    return await response.json();
  };

  const guessWord = async (word) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/guess-word`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, roomId }),
    });
    await updateGameStatus();
  };

  const resetGame = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId }),
    });
    socket.emit('resetGame', roomId);
    setGameStarted(false);
    setHints([]);
    setGameStatus({ guessedWords: [], isGameOver: false });
    setView('menu');
    setRoomId(null);
    setPlayerRole(null);
  };

  const updateGameStatus = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/status?roomId=${roomId}`);
    const data = await response.json();
    setGameStatus(data);
  };

  const handleCreateRoom = (newRoomId) => {
    setRoomId(newRoomId);
    setPlayerRole('player1');
    setView('player1');
  };

  const handleJoinRoom = (joinedRoomId) => {
    setRoomId(joinedRoomId);
    setPlayerRole('player2');
    setView('player2');
  };

  useEffect(() => {
    socket.on('startGame', () => {
      if (playerRole === 'player2') {
        setGameStarted(true);
        updateGameStatus();
      }
    });

    socket.on('updateGameStatus', () => {
      updateGameStatus();
    });

    socket.on('gameReset', () => {
      setGameStarted(false);
      setHints([]);
      setGameStatus({ guessedWords: [], isGameOver: false });
      setView('menu');
      setRoomId(null);
      setPlayerRole(null);
    });

    return () => {
      socket.off('startGame');
      socket.off('updateGameStatus');
      socket.off('gameReset');
    };
  }, [playerRole]);

  return (
    <div className="container">
      {view !== 'menu' && <h1>Smoke Of Deceit</h1>}
      <div className={view === 'menu' ? 'main-menu' : 'game-container'}>
        {view === 'menu' && (
          <MainMenu onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        )}
        {view === 'player1' && !gameStarted && (
          <Player1Input startGame={startGame} />
        )}
        {view === 'player2' && (
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