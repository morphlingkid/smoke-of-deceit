import React, { useState } from 'react';

function Player2Guess({ hints, guessType, guessWord, guessSentence, gameStatus, resetGame, updateGameStatus, roomId }) {
  const [typeGuess, setTypeGuess] = useState('');
  const [wordGuess, setWordGuess] = useState('');
  const [sentenceGuess, setSentenceGuess] = useState('');
  const [message, setMessage] = useState('');
  const [typeGuessed, setTypeGuessed] = useState(false);

  const handleTypeGuess = async () => {
    try {
      const result = await guessType(typeGuess);
      setMessage(result.isCorrect ? 'Тип предложения угадано верно!' : 'Неверный тип предложения.');
      if (result.isCorrect) setTypeGuessed(true);
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

  if (gameStatus.isGameOver) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Поздравляем! 🎉</h2>
        <p className="mb-4">Вы угадали предложение Игрока 1! Чтобы сыграть ещё, нажмите кнопку "Сыграть ещё".</p>
        <button
          onClick={resetGame}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Сыграть ещё
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 max-w-4xl mx-auto">
      <div className="flex-1 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Игрок 2: Угадай предложение</h2>
        {!typeGuessed ? (
          <div className="mb-4">
            <label className="block text-lg mb-2">Угадай тип предложения:</label>
            <select
              value={typeGuess}
              onChange={(e) => setTypeGuess(e.target.value)}
              className="border rounded p-2 w-full mb-2"
            >
              <option value="">Выбери тип</option>
              <option value="утвердительное">Утвердительное</option>
              <option value="вопросительное">Вопросительное</option>
              <option value="восклицательное">Восклицательное</option>
            </select>
            <button
              onClick={handleTypeGuess}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Угадать тип
            </button>
          </div>
        ) : (
          <div>
            {message && <p className="text-green-600 mb-4">{message}</p>}
            <div className="mb-4">
              <label className="block text-lg mb-2">Угадай слово:</label>
              <input
                type="text"
                value={wordGuess}
                onChange={(e) => setWordGuess(e.target.value)}
                placeholder="Введи слово"
                className="border rounded p-2 w-full mb-2"
              />
              <button
                onClick={handleWordGuess}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Угадать слово
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-2">Угадай предложение:</label>
              <input
                type="text"
                value={sentenceGuess}
                onChange={(e) => setSentenceGuess(e.target.value)}
                placeholder="Введи полное предложение"
                className="border rounded p-2 w-full mb-2"
              />
              <button
                onClick={handleSentenceGuess}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Угадать предложение
              </button>
            </div>
            {message && !gameStatus.isGameOver && (
              <p className={message.includes('верно') ? 'text-green-600' : 'text-red-600'}>{message}</p>
            )}
          </div>
        )}
      </div>
      <div className="w-full md:w-1/3 bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Подсказки:</h3>
          <ul className="list-disc pl-5">
            {hints.map((hint, index) => (
              <li key={`hint-${index}`} className="mb-1">{hint}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Угаданные слова:</h3>
          <ul className="list-disc pl-5">
            {gameStatus.guessedWords.map((word, index) => (
              <li key={`guessed-${word}-${index}`} className="mb-1">{word}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Player2Guess;