import { useState } from 'react';

function Player1Input({ startGame }) {
  const [sentence, setSentence] = useState('');
  const [sentenceType, setSentenceType] = useState('question');
  const [hints, setHints] = useState(['']);

  const addHint = () => setHints([...hints, '']);
  const updateHint = (index, value) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
  };

  const handleStart = () => {
    if (sentence.trim() && hints.every((hint) => hint.trim())) {
      startGame({ sentence, sentenceType, hints });
    } else {
      alert('Пожалуйста, заполните все поля!');
    }
  };

  return (
    <div className="card">
      <h2>Игрок 1: Настройка игры</h2>
      <div>
        <label>Введите предложение:</label>
        <input
          type="text"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="Например: Кто украл мои пирожки?"
        />
      </div>
      <div>
        <label>Тип предложения:</label>
        <select
          value={sentenceType}
          onChange={(e) => setSentenceType(e.target.value)}
        >
          <option value="question">Вопрос</option>
          <option value="statement">Утверждение</option>
          <option value="exclamation">Восклицание</option>
        </select>
      </div>
      <div>
        <label>Подсказки:</label>
        {hints.map((hint, index) => (
          <input
            key={index}
            type="text"
            value={hint}
            onChange={(e) => updateHint(index, e.target.value)}
            placeholder={`Подсказка ${index + 1}`}
          />
        ))}
        <button onClick={addHint}>Добавить подсказку</button>
        <button onClick={handleStart}>Начать игру</button>
      </div>
    </div>
  );
}

export default Player1Input;