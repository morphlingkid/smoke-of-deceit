const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Простой маршрут для проверки, что сервер работает
app.get('/', (req, res) => {
  res.json({ message: 'Smoke Of Deceit server is running!' });
});

// Заглушка для favicon.ico, чтобы убрать ошибку 404
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Хранилище данных игры
let gameState = {
  sentence: '',
  sentenceType: '',
  hints: [],
  guessedWords: [],
  isGameOver: false
};

// API для сохранения предложения и параметров (Игрок 1)
app.post('/api/start', (req, res) => {
  const { sentence, sentenceType, hints } = req.body;
  if (!sentence || !sentenceType || !hints) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  gameState = {
    sentence: sentence.toLowerCase(),
    sentenceType,
    hints,
    guessedWords: [],
    isGameOver: false
  };
  console.log('Game started:', gameState);
  res.json({ message: 'Game started' });
});

// API для получения подсказок
app.get('/api/hints', (req, res) => {
  res.json({ hints: gameState.hints });
});

// API для проверки типа предложения (Игрок 2)
app.post('/api/guess-type', (req, res) => {
  const { guessedType } = req.body;
  if (!guessedType) {
    return res.status(400).json({ error: 'Missing guessedType' });
  }
  const isCorrect = guessedType === gameState.sentenceType;
  res.json({ isCorrect });
});

// API для проверки слова (Игрок 2)
app.post('/api/guess-word', (req, res) => {
  const { word } = req.body;
  if (!word) {
    return res.status(400).json({ error: 'Missing word' });
  }
  const words = gameState.sentence.split(' ').map(w => w.replace(/[^a-zа-я]/gi, ''));
  let isCorrect = false;

  if (words.includes(word.toLowerCase()) && !gameState.guessedWords.includes(word.toLowerCase())) {
    gameState.guessedWords.push(word.toLowerCase());
    isCorrect = true;
  }

  console.log('Guess word:', { word, isCorrect, guessedWords: gameState.guessedWords, isGameOver: gameState.isGameOver });
  res.json({
    isCorrect,
    guessedWords: gameState.guessedWords,
    isGameOver: gameState.isGameOver
  });
});

// API для проверки полного предложения (Игрок 2)
app.post('/api/guess-sentence', (req, res) => {
  const { sentence } = req.body;
  if (!sentence) {
    return res.status(400).json({ error: 'Missing sentence' });
  }
  const isCorrect = sentence.toLowerCase() === gameState.sentence;
  if (isCorrect) {
    gameState.isGameOver = true;
  }
  console.log('Guess sentence:', { sentence, isCorrect, isGameOver: gameState.isGameOver });
  res.json({
    isCorrect,
    isGameOver: gameState.isGameOver
  });
});

// API для получения статуса игры
app.get('/api/status', (req, res) => {
  res.json({
    guessedWords: gameState.guessedWords,
    isGameOver: gameState.isGameOver
  });
});

// API для сброса игры
app.post('/api/reset', (req, res) => {
  gameState = {
    sentence: '',
    sentenceType: '',
    hints: [],
    guessedWords: [],
    isGameOver: false
  };
  console.log('Game reset');
  res.json({ message: 'Game reset' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});