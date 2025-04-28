import React, { useState } from 'react';

function Player2Guess({ hints, guessType, guessWord, guessSentence, gameStatus, resetGame, updateGameStatus, roomId }) {
  const [typeGuess, setTypeGuess] = useState('');
  const [wordGuess, setWordGuess] = useState('');
  const [sentenceGuess, setSentenceGuess] = useState('');
  const [message, setMessage] = useState('');

  const handleTypeGuess = async () => {
    try {
      const result = await guessType(typeGuess);
      setMessage(result.isCorrect ? 'Тип предложения угадано верно!' : 'Неверный тип предложения.');
    } catch (error) {
      console.error('Error guessing type:', error);
      setMessage('Ошибка при проверке типа предложения.');
    }
  };

  const handleWordGuess = async () => {
    try {
      await guessWord(wordGuess);
      setWordGuess('');
      await updateGameStatus();
    } catch (error) {
      console.error('Error guessing word:', error);
      setMessage('Ошибка при проверке слова.');
    }
  };

  const handleSentenceGuess = async () => {
    try {
      if (!roomId) {
        console.error('roomId is not provided in handleSentenceGuess');
        setMessage('Ошибка: ID комнаты отсутствует.');
        return;
      }
      if (!sentenceGuess) {
        console.error('sentenceGuess is empty');
        setMessage('Пожалуйста, введите предложение.');
        return;
      }
      console.log('Sending guessSentence request:', { sentence: sentenceGuess, roomId });
      const result = await guessSentence(sentenceGuess);
      if (result.error) {
        console.error('Server error:', result.error);
        setMessage(`Ошибка: ${result.error}`);
        if (result.error.includes('Room')) {
          setMessage('Комната не найдена. Возможно, игра была сброшена. Вернитесь в главное меню.');
        }
      } else if (result.isCorrect) {
        setMessage('Предложение угадано верно! Поздравляем!');
      } else {
        setMessage('Предложение угадано неверно. Продолжайте пытаться!');
      }
      setSentenceGuess('');
      await updateGameStatus();
    } catch (error) {
      console.error('Error guessing sentence:', error);
      setMessage('Ошибка при проверке предложения. Попробуйте снова.');
    }
  };

  return (
    <div className="player2-guess">
      <h2>Игрок 2: Угадайте предложение</h2>
      {hints.length > 0 && (
        <div>
          <h3>Подсказки:</h3>
          <ul>
            {hints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h3>Угадайте тип предложения:</h3>
        <select value={typeGuess} onChange={(e) => setTypeGuess(e.target.value)}>
          <option value="">Выберите тип</option>
          <option value="утвердительное">Утвердительное</option>
          <option value="вопросительное">Вопросительное</option>
          <option value="восклицательное">Восклицательное</option>
        </select>
        <button onClick={handleTypeGuess}>Проверить тип</button>
      </div>
      <div>
        <h3>Угадайте слово:</h3>
        <input
          type="text"
          value={wordGuess}
          onChange={(e) => setWordGuess(e.target.value)}
          placeholder="Введите слово"
        />
        <button onClick={handleWordGuess}>Проверить слово</button>
      </div>
      <div>
        <h3>Угадайте предложение:</h3>
        <input
          type="text"
          value={sentenceGuess}
          onChange={(e) => setSentenceGuess(e.target.value)}
          placeholder="Введите предложение"
        />
        <button onClick={handleSentenceGuess}>Проверить предложение</button>
      </div>
      {message && <p>{message}</p>}
      {gameStatus.guessedWords.length > 0 && (
        <div>
          <h3>Угаданные слова:</h3>
          <ul>
            {gameStatus.guessedWords.map((word, index) => (
              <li key={index}>{word}</li>
            ))}
          </ul>
        </div>
      )}
      {gameStatus.isGameOver && (
        <div>
          <p>Игра завершена!</p>
          <button onClick={resetGame}>Начать заново</button>
        </div>
      )}
    </div>
  );
}

export default Player2Guess;