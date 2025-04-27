import { useState } from 'react';
import io from 'socket.io-client';
import '../index.css';

const socket = io(process.env.REACT_APP_WS_URL, {
  transports: ['websocket'],
  withCredentials: true,
});

function MainMenu({ onCreateRoom, onJoinRoom }) {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    socket.emit('createRoom', (newRoomId) => {
      onCreateRoom(newRoomId);
    });
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      setError('Введите ID комнаты!');
      return;
    }
    socket.emit('joinRoom', roomId, (response) => {
      if (response.success) {
        onJoinRoom(roomId);
      } else {
        setError('Комната не найдена или уже занята!');
      }
    });
  };

  return (
    <div className="card">
      <h2>Smoke Of Deceit</h2>
      <button onClick={handleCreateRoom}>Создать комнату</button>
      <div>
        <input
          type="text"
          value={roomId}
          onChange={(e) => {
            setRoomId(e.target.value);
            setError('');
          }}
          placeholder="Введите ID комнаты"
        />
        <button onClick={handleJoinRoom}>Подключиться к комнате</button>
      </div>
      {error && <p className="success">{error}</p>}
    </div>
  );
}

export default MainMenu;