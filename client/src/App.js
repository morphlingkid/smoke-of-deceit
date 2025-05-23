import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import MainMenu from './components/MainMenu';
import Player1Input from './components/Player1Input';
import Player2Guess from './components/Player2Guess';
import './index.css';

console.log('REACT_APP_WS_URL:', process.env.REACT_APP_WS_URL);

const socket = io(process.env.REACT_APP_WS_URL, {
  transports: ['websocket'],
  withCredentials: true,
});

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
  const [playerRole, setPlayerRole] = useState(null);
  const [view, setView] = useState('menu');

  const startGame = async (data) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, roomId }),
      });
      if (response.ok) {
        setHints(data.hints);
        setGameStarted(true);
        socket.emit('gameStarted', roomId);
      } else {
        console.error('Failed to start game:', response.statusText);
        alert('Не удалось начать игру. Проверьте соединение с сервером.');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Ошибка: Не удалось подключиться к серверу. Попробуйте позже.');
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

  const guessSentence = async (sentence) => {
    console.log('guessSentence called with:', { sentence, roomId }); // Лог для отладки
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/guess-sentence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence, roomId }),
    });
    return await response.json();
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

  const updateGameStatus = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/status?roomId=${roomId}`);
      const data = await response.json();
      setGameStatus(data);
    } catch (error) {
      console.error('Error updating game status:', error);
    }
  }, [roomId]);

  const handleCreateRoom = (newRoomId) => {
    setRoomId(newRoomId);
    setPlayerRole('player1');
    setView('player1');
    console.info(`Player 1: Room ID created - ${newRoomId}`);
  };

  const handleJoinRoom = (joinedRoomId) => {
    console.log('handleJoinRoom called with joinedRoomId:', joinedRoomId); // Лог для отладки
    setRoomId(joinedRoomId);
    setPlayerRole('player2');
    setView('player2');
  };

  useEffect(() => {
    socket.on('startGame', () => {
      if (playerRole === 'player2') {
        setGameStarted(true);
        setView('player2');
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
  }, [playerRole, updateGameStatus]);

  return (
    <div className="container">
      {view !== 'menu' && <h1>Smoke Of Deceit</h1>}
      <div className={view === 'menu' ? 'main-menu' : 'game-container'}>
        {view === 'menu' && (
          <MainMenu onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} socket={socket} />
        )}
        {view === 'player1' && !gameStarted && (
          <Player1Input startGame={startGame} roomId={roomId} />
        )}
        {view === 'player2' && (
          <Player2Guess
            hints={hints}
            guessType={guessType}
            guessWord={guessWord}
            guessSentence={guessSentence}
            gameStatus={gameStatus}
            resetGame={resetGame}
            updateGameStatus={updateGameStatus}
            roomId={roomId}
          />
        )}
      </div>
    </div>
  );
}

export default App;