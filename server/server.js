const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

const port = process.env.PORT || 5000;

// Хранилище комнат
const rooms = {};

// Генерация уникального ID комнаты
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Socket.IO логика
io.on('connection', (socket) => {
  socket.on('createRoom', (callback) => {
    const roomId = generateRoomId();
    rooms[roomId] = { players: [socket.id], gameState: null };
    socket.join(roomId);
    callback(roomId);
  });

  socket.on('joinRoom', (roomId, callback) => {
    if (rooms[roomId] && rooms[roomId].players.length < 2) {
      rooms[roomId].players.push(socket.id);
      socket.join(roomId);
      callback({ success: true });
    } else {
      callback({ success: false });
    }
  });

  socket.on('gameStarted', (roomId) => {
    io.to(roomId).emit('startGame');
  });

  socket.on('updateGameStatus', (roomId) => {
    io.to(roomId).emit('updateGameStatus');
  });

  socket.on('resetGame', (roomId) => {
    if (rooms[roomId]) {
      io.to(roomId).emit('gameReset');
      delete rooms[roomId];
    }
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter((id) => id !== socket.id);
      if (room.players.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit('gameReset');
      }
    }
  });
});

// API для сохранения предложения и параметров
app.post('/api/start', (req, res) => {
  const { sentence, sentenceType, hints, roomId } = req.body;
  if (!sentence || !sentenceType || !hints || !roomId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!rooms[roomId]) {
    return res.status(400).json({ error: 'Room does not exist' });
  }
  rooms[roomId].gameState = {
    sentence: sentence.toLowerCase(),
    sentenceType,
    hints,
    guessedWords: [],
    isGameOver: false,
  };
  res.json({ message: 'Game started' });
});

// Остальные API остаются без изменений, но добавляем roomId
app.get('/api/hints', (req, res) => {
  const { roomId } = req.query;
  if (!rooms[roomId] || !rooms[roomId].gameState) {
    return res.status(400).json({ error: 'Room or game not found' });
  }
  res.json({ hints: rooms[roomId].gameState.hints });
});

app.post('/api/guess-type', (req, res) => {
  const { guessedType, roomId } = req.body;
  if (!guessedType || !roomId || !rooms[roomId]?.gameState) {
    return res.status(400).json({ error: 'Missing data or room not found' });
  }
  const isCorrect = guessedType === rooms[roomId].gameState.sentenceType;
  res.json({ isCorrect });
});

app.post('/api/guess-word', async (req, res) => {
  const { word, roomId } = req.body;
  if (!word || !roomId || !rooms[roomId]?.gameState) {
    return res.status(400).json({ error: 'Missing data or room not found' });
  }
  const words = rooms[roomId].gameState.sentence
    .split(' ')
    .map((w) => w.replace(/[^a-zа-я]/gi, ''));
  let isCorrect = false;

  if (
    words.includes(word.toLowerCase()) &&
    !rooms[roomId].gameState.guessedWords.includes(word.toLowerCase())
  ) {
    rooms[roomId].gameState.guessedWords.push(word.toLowerCase());
    isCorrect = true;
    io.to(roomId).emit('updateGameStatus');
  }

  res.json({
    isCorrect,
    guessedWords: rooms[roomId].gameState.guessedWords,
    isGameOver: rooms[roomId].gameState.isGameOver,
  });
});

app.post('/api/guess-sentence', async (req, res) => {
  const { sentence, roomId } = req.body;
  if (!sentence || !roomId || !rooms[roomId]?.gameState) {
    return res.status(400).json({ error: 'Missing data or room not found' });
  }
  const isCorrect = sentence.toLowerCase() === rooms[roomId].gameState.sentence;
  if (isCorrect) {
    rooms[roomId].gameState.isGameOver = true;
    io.to(roomId).emit('updateGameStatus');
  }
  res.json({
    isCorrect,
    isGameOver: rooms[roomId].gameState.isGameOver,
  });
});

app.get('/api/status', (req, res) => {
  const { roomId } = req.query;
  if (!roomId || !rooms[roomId]?.gameState) {
    return res.status(400).json({ error: 'Room or game not found' });
  }
  res.json({
    guessedWords: rooms[roomId].gameState.guessedWords,
    isGameOver: rooms[roomId].gameState.isGameOver,
  });
});

app.post('/api/reset', (req, res) => {
  const { roomId } = req.body;
  if (!roomId || !rooms[roomId]) {
    return res.status(400).json({ error: 'Room not found' });
  }
  delete rooms[roomId];
  res.json({ message: 'Game reset' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(port, () => {
  console.log(`Server running at https://smoke-of-deceit.onrender.com`);
});