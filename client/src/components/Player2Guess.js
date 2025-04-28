import { useState } from 'react';

function Player2Guess({ hints, guessType, guessWord, guessSentence, gameStatus, resetGame, updateGameStatus, roomId }) {
  const [guessedType, setGuessedType] = useState('');
  const [typeGuessed, setTypeGuessed] = useState(false);
  const [word, setWord] = useState('');
  const [sentence, setSentence] = useState('');
  const [typeResult, setTypeResult] = useState('');
  const [sentenceResult, setSentenceResult] = useState('');

  const handleGuessType = async () => {
    const response = await guessType(guessedType);
    setTypeResult(response.isCorrect ? 'Правильно!' : 'Неправильно, попробуй ещё!');
    setTypeGuessed(true);
  };

  const handleGuessWord = async () => {
    if (word.trim()) {
      await guessWord(word);
      setWord('');
    }
  };

  const handleGuessSentence = async () => {
    if (sentence.trim()) {
      const response = await fetch('https://smoke-of-deceit.onrender.com/api/guess-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence }),
      });
      const data = await response.json();
      setSentenceResult(data.isCorrect ? 'Поздравляем! Предложение угадано!' : 'Неправильно, попробуй ещё!');
      await updateGameStatus(); // Trigger status update to refresh isGameOver
    }
  };

  if (gameStatus.isGameOver) {
    return (
      <div className="card congrats-block">
        <h2>Поздравляем! 🎉</h2>
        <p>Вы угадали предложение Игрока 1! Чтобы сыграть ещё, нажмите кнопку "Сыграть ещё".</p>
        <button onClick={resetGame}>Сыграть ещё</button>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2>Игрок 2: Угадай предложение</h2>
        {!typeGuessed ? (
          <div>
            <label>Угадай тип предложения:</label>
            <select
              value={guessedType}
              onChange={(e) => setGuessedType(e.target.value)}
            >
              <option value="">Выбери тип</option>
              <option value="question">Вопрос</option>
              <option value="statement">Утверждение</option>
              <option value="exclamation">Восклицание</option>
            </select>
            <button onClick={handleGuessType}>Угадать тип</button>
          </div>
        ) : (
          <div>
            <p>{typeResult}</p>
            <label>Угадай слово:</label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Введи слово"
            />
            <button onClick={handleGuessWord}>Угадать слово</button>
            <label>Угадай предложение:</label>
            <input
              type="text"
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="Введи полное предложение"
            />
            <button onClick={handleGuessSentence}>Угадать предложение</button>
            {sentenceResult && !gameStatus.isGameOver && (
              <p className="success">{sentenceResult}</p>
            )}
          </div>
        )}
      </div>
      <div className="sidebar">
        <div className="hint-block">
          <h3>Подсказки:</h3>
          <ul>
            {hints.map((hint, index) => (
              <li key={`hint-${index}`}>{hint}</li>
            ))}
          </ul>
        </div>
        <div className="guessed-block">
          <h3>Угаданные слова:</h3>
          <ul>
            {gameStatus.guessedWords.map((word, index) => (
              <li key={`guessed-${word}-${index}`}>{word}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Player2Guess;
