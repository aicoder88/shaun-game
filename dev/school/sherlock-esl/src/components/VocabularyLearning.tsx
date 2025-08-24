import { useState, useEffect } from 'react';
import type { VocabularyWord } from '../data/vocabulary';
import { getPhaseVocabulary } from '../data/vocabulary';

interface VocabularyLearningProps {
  gamePhase: 'steampunk' | 'space' | 'cyborg';
  onComplete: (learnedWords: string[]) => void;
  onClose: () => void;
}

export function VocabularyLearning({ gamePhase, onComplete, onClose }: VocabularyLearningProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [wordsToLearn, setWordsToLearn] = useState<VocabularyWord[]>([]);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [gameMode, setGameMode] = useState<'learn' | 'quiz' | 'complete'>('learn');
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const phaseWords = getPhaseVocabulary(gamePhase);
    // Select 5 random words for this learning session
    const shuffled = [...phaseWords].sort(() => 0.5 - Math.random());
    setWordsToLearn(shuffled.slice(0, 5));
  }, [gamePhase]);

  const currentWord = wordsToLearn[currentWordIndex];

  const handleWordLearned = () => {
    if (currentWord) {
      setLearnedWords(prev => new Set([...prev, currentWord.id]));
      
      if (currentWordIndex < wordsToLearn.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setShowDefinition(false);
      } else {
        setGameMode('quiz');
        setCurrentWordIndex(0);
      }
    }
  };

  const handleQuizAnswer = (wordId: string, isCorrect: boolean) => {
    setQuizAnswers(prev => ({ ...prev, [wordId]: isCorrect }));
    
    if (currentWordIndex < wordsToLearn.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setGameMode('complete');
    }
  };

  const renderLearningMode = () => (
    <div className="vocabulary-learning">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((currentWordIndex + 1) / wordsToLearn.length) * 100}%` }} />
        <span className="progress-text">{currentWordIndex + 1} of {wordsToLearn.length}</span>
      </div>

      {currentWord && (
        <div className="word-card">
          <div className="word-header">
            <h2 className="vocabulary-word">{currentWord.word}</h2>
            <div className="word-meta">
              <span className={`difficulty ${currentWord.difficulty}`}>
                {currentWord.difficulty.toUpperCase()}
              </span>
              <span className={`theme ${currentWord.theme}`}>
                {currentWord.theme.toUpperCase()}
              </span>
            </div>
          </div>

          {currentWord.pronunciation && (
            <div className="pronunciation">
              🔊 /{currentWord.pronunciation}/
            </div>
          )}

          {!showDefinition ? (
            <div className="learning-actions">
              <p className="instruction">📚 Try to guess the meaning, then click to reveal:</p>
              <button 
                className="reveal-btn"
                onClick={() => setShowDefinition(true)}
              >
                🔍 Show Definition
              </button>
            </div>
          ) : (
            <div className="word-details">
              <div className="definition">
                <h4>Definition:</h4>
                <p>{currentWord.definition}</p>
              </div>

              <div className="context">
                <h4>Used in context:</h4>
                <p className="context-sentence">"{currentWord.contextSentence}"</p>
              </div>

              {currentWord.synonyms && (
                <div className="synonyms">
                  <h4>Similar words:</h4>
                  <div className="word-tags">
                    {currentWord.synonyms.map((synonym, idx) => (
                      <span key={idx} className="word-tag synonym">{synonym}</span>
                    ))}
                  </div>
                </div>
              )}

              {currentWord.antonyms && (
                <div className="antonyms">
                  <h4>Opposite words:</h4>
                  <div className="word-tags">
                    {currentWord.antonyms.map((antonym, idx) => (
                      <span key={idx} className="word-tag antonym">{antonym}</span>
                    ))}
                  </div>
                </div>
              )}

              <button 
                className="learned-btn"
                onClick={handleWordLearned}
              >
                ✅ I understand this word
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderQuizMode = () => {
    const word = wordsToLearn[currentWordIndex];
    if (!word) return null;

    // Generate quiz options (correct definition + 2 wrong ones)
    const otherWords = wordsToLearn.filter(w => w.id !== word.id);
    const wrongOptions = otherWords.slice(0, 2).map(w => w.definition);
    const options = [word.definition, ...wrongOptions].sort(() => 0.5 - Math.random());

    return (
      <div className="vocabulary-quiz">
        <div className="quiz-header">
          <h3>📝 Quick Quiz Time!</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentWordIndex + 1) / wordsToLearn.length) * 100}%` }} />
            <span className="progress-text">{currentWordIndex + 1} of {wordsToLearn.length}</span>
          </div>
        </div>

        <div className="quiz-question">
          <h2>What does "<span className="quiz-word">{word.word}</span>" mean?</h2>
          <div className="quiz-options">
            {options.map((option, idx) => (
              <button
                key={idx}
                className="quiz-option"
                onClick={() => handleQuizAnswer(word.id, option === word.definition)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCompletionMode = () => {
    const correctAnswers = Object.values(quizAnswers).filter(Boolean).length;
    const totalQuestions = Object.keys(quizAnswers).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className="vocabulary-complete">
        <h2>🎉 Vocabulary Session Complete!</h2>
        
        <div className="quiz-results">
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{percentage}%</span>
              <span className="score-label">Correct</span>
            </div>
          </div>
          
          <p className="score-description">
            You got {correctAnswers} out of {totalQuestions} definitions correct!
          </p>
        </div>

        <div className="learned-summary">
          <h3>📚 Words you learned today:</h3>
          <div className="learned-words">
            {wordsToLearn.map(word => (
              <div key={word.id} className="learned-word-item">
                <span className="word-name">{word.word}</span>
                <span className="word-brief">{word.definition}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="completion-actions">
          <button 
            className="continue-btn"
            onClick={() => onComplete(Array.from(learnedWords))}
          >
            🚂 Continue Your Adventure
          </button>
          <button 
            className="review-btn"
            onClick={() => {
              setGameMode('learn');
              setCurrentWordIndex(0);
              setShowDefinition(false);
              setQuizAnswers({});
            }}
          >
            📖 Review Words Again
          </button>
        </div>
      </div>
    );
  };

  if (!wordsToLearn.length) {
    return <div className="loading">Loading vocabulary...</div>;
  }

  return (
    <div className="mini-game-modal">
      <div className="mini-game-content vocabulary-learning-content">
        <div className="game-header">
          <h3>📖 Vocabulary Learning</h3>
          <p>Learn new words from your {gamePhase} adventure!</p>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {gameMode === 'learn' && renderLearningMode()}
        {gameMode === 'quiz' && renderQuizMode()}
        {gameMode === 'complete' && renderCompletionMode()}
      </div>
    </div>
  );
}