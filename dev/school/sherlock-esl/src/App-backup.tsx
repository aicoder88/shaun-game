import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { TrainProgress } from './components/TrainProgress';
import { TrainCarriage } from './components/TrainCarriage';
import { CharacterCustomization } from './components/CharacterCustomization';
import { NarrativeSystem } from './components/NarrativeSystem';
import { LetterReconstruction } from './components/MiniGames/LetterReconstruction';
import { EvidenceSearch } from './components/MiniGames/EvidenceSearch';
import { DeductionGame } from './components/MiniGames/DeductionGame';

type GameView = 'story' | 'train' | 'carriage' | 'customize';
type MiniGame = 'letter' | 'search' | 'deduction' | null;

function App() {
  const [currentView, setCurrentView] = useState<GameView>('story');
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGame>(null);

  return (
    <GameProvider>
      <div className="App">
        <header className="game-header">
          <div className="title-section">
            <h1>🚂 The Mystery Express</h1>
            <p>A Sherlock Holmes ESL Adventure</p>
          </div>
          
          <nav className="game-navigation">
            <button 
              className={`steampunk-btn ${currentView === 'story' ? 'active' : ''}`}
              onClick={() => setCurrentView('story')}
            >
              📖 Story
            </button>
            <button 
              className={`steampunk-btn ${currentView === 'train' ? 'active' : ''}`}
              onClick={() => setCurrentView('train')}
            >
              🚂 Train Map
            </button>
            <button 
              className={`steampunk-btn ${currentView === 'carriage' ? 'active' : ''}`}
              onClick={() => setCurrentView('carriage')}
            >
              🔍 Investigate
            </button>
            <button 
              className={`steampunk-btn ${currentView === 'customize' ? 'active' : ''}`}
              onClick={() => setCurrentView('customize')}
            >
              👤 Character
            </button>
          </nav>
        </header>

        <main className="game-content">
          {currentView === 'story' && <NarrativeSystem />}
          {currentView === 'train' && <TrainProgress />}
          {currentView === 'carriage' && <TrainCarriage carriageNumber={1} />}
          {currentView === 'customize' && <CharacterCustomization />}
        </main>

        <aside className="mini-game-launcher">
          <h3>🎮 Mini Games</h3>
          <div className="mini-game-buttons">
            <button 
              className="steampunk-btn"
              onClick={() => setActiveMiniGame('letter')}
            >
              🧩 Letter Puzzle
            </button>
            <button 
              className="steampunk-btn"
              onClick={() => setActiveMiniGame('search')}
            >
              🔍 Evidence Hunt
            </button>
            <button 
              className="steampunk-btn"
              onClick={() => setActiveMiniGame('deduction')}
            >
              🕵️ Deduction Challenge
            </button>
          </div>
        </aside>

        {activeMiniGame === 'letter' && (
          <LetterReconstruction
            onComplete={(message) => {
              console.log('Letter reconstructed:', message);
              setActiveMiniGame(null);
            }}
            onClose={() => setActiveMiniGame(null)}
          />
        )}

        {activeMiniGame === 'search' && (
          <EvidenceSearch
            location="First Class Carriage"
            onComplete={(items) => {
              console.log('Evidence found:', items);
              setActiveMiniGame(null);
            }}
            onClose={() => setActiveMiniGame(null)}
          />
        )}

        {activeMiniGame === 'deduction' && (
          <DeductionGame
            suspects={[]}
            evidence={['Golden button', 'Torn fabric', 'Secret Note', 'Brass Key']}
            onComplete={(suspect, isCorrect) => {
              console.log('Accusation:', suspect, 'Correct:', isCorrect);
              setActiveMiniGame(null);
            }}
            onClose={() => setActiveMiniGame(null)}
          />
        )}

        <footer className="game-footer">
          <div className="educational-info">
            <p>🎓 <strong>Educational Focus:</strong> English vocabulary, deductive reasoning, and critical thinking</p>
            <p>👥 <strong>Target Age:</strong> 12-15 years old</p>
            <p>🌟 <strong>Learning Goals:</strong> Language skills through immersive storytelling</p>
          </div>
        </footer>
      </div>
    </GameProvider>
  );
}

export default App;