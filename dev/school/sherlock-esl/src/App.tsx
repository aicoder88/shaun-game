import { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { useGame } from './hooks/useGame';
import { DeductionGame } from './components/MiniGames/DeductionGame';
import { EvidenceSearch } from './components/MiniGames/EvidenceSearch';
import { LetterReconstruction } from './components/MiniGames/LetterReconstruction';
import { VocabularyLearning } from './components/VocabularyLearning';
import { CharacterAvatar } from './components/CharacterAvatar';
import { AudioControls } from './components/AudioControls';
import { audioManager } from './utils/AudioManager';
import { getMysteryByCarriage } from './data/mysteries';
import type { Evidence } from './types/game';

type GameView = 'story' | 'train' | 'carriage' | 'customize';
type ActiveMiniGame = 'letterReconstruction' | 'evidenceSearch' | 'deduction' | 'vocabulary' | null;

// Enhanced Particle component with sparkles and interactive effects
const Particles = () => {
  useEffect(() => {
    const particleCount = 80;
    
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        
        // Add sparkle effect occasionally
        if (Math.random() > 0.7) {
          particle.innerHTML = '✨';
          particle.style.fontSize = '8px';
        }
        
        document.querySelector('.particles')?.appendChild(particle);
        
        setTimeout(() => particle.remove(), 30000);
      }, i * 200);
    }
    
    // Add magical sparkle effects
    const addSparkle = () => {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.innerHTML = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      document.querySelector('.particles')?.appendChild(sparkle);
      
      setTimeout(() => sparkle.remove(), 2000);
    };
    
    const sparkleInterval = setInterval(addSparkle, 3000);
    return () => clearInterval(sparkleInterval);
  }, []);
  
  return <div className="particles"></div>;
};

// Interactive sound effect component
const InteractiveSounds = () => {
  const playHoverSound = () => {
    // Create a subtle hover sound effect
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };
  
  useEffect(() => {
    const buttons = document.querySelectorAll('.glass-btn, .carriage-visual.clickable');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', playHoverSound);
    });
    
    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', playHoverSound);
      });
    };
  }, []);
  
  return null;
};

function GameContent() {
  const { state, dispatch } = useGame();
  const [currentView, setCurrentView] = useState<GameView>('story');
  const [activeMiniGame, setActiveMiniGame] = useState<ActiveMiniGame>(null);
  const [selectedCarriage, setSelectedCarriage] = useState<number | null>(null);

  // Use the comprehensive mysteries database

  const carriages = [
    { id: 1, name: 'First Class', icon: '🚂', mystery: 'The Diamond Theft', unlocked: state.currentCarriage >= 1, phase: 'steampunk', mysteryData: getMysteryByCarriage(1) },
    { id: 2, name: 'Dining Car', icon: '🍽️', mystery: 'Poison at Dinner', unlocked: state.currentCarriage >= 2, phase: 'steampunk', mysteryData: getMysteryByCarriage(2) },
    { id: 3, name: 'Passenger Car', icon: '🪑', mystery: 'Missing Person', unlocked: state.currentCarriage >= 3, phase: 'steampunk', mysteryData: getMysteryByCarriage(3) },
    { id: 4, name: 'Cargo Hold', icon: '📦', mystery: 'Smuggling Ring', unlocked: state.currentCarriage >= 4, phase: 'steampunk', mysteryData: null },
    { id: 5, name: 'Engine Room', icon: '⚙️', mystery: 'Sabotage Plot', unlocked: state.currentCarriage >= 5, phase: 'steampunk', mysteryData: null },
    { id: 6, name: 'Observatory', icon: '🔭', mystery: 'Alien Signal', unlocked: state.currentCarriage >= 6, phase: 'space', mysteryData: null },
    { id: 7, name: 'Laboratory', icon: '🧪', mystery: 'Quantum Experiment', unlocked: state.currentCarriage >= 7, phase: 'space', mysteryData: null },
    { id: 8, name: 'Control Bridge', icon: '🛸', mystery: 'Navigation Error', unlocked: state.currentCarriage >= 8, phase: 'space', mysteryData: null },
    { id: 9, name: 'AI Core', icon: '🤖', mystery: 'System Malfunction', unlocked: state.currentCarriage >= 9, phase: 'cyborg', mysteryData: null },
    { id: 10, name: 'Final Destination', icon: '🌟', mystery: 'The Ultimate Truth', unlocked: state.currentCarriage >= 10, phase: 'cyborg', mysteryData: null },
  ];

  const investigations = [
    { icon: '🧩', name: 'Letter Reconstruction', description: 'Piece together torn evidence to reveal hidden messages' },
    { icon: '🔍', name: 'Evidence Search', description: 'Hunt for clues using your detective tools and keen observation' },
    { icon: '🕵️', name: 'Deduction Challenge', description: 'Analyze evidence and interrogate suspects to solve the mystery' },
    { icon: '📖', name: 'Vocabulary Learning', description: 'Learn new English words through mystery contexts and adventures' },
    { icon: '🎭', name: 'Character Analysis', description: 'Study suspect behavior and uncover their true motives' },
    { icon: '⚗️', name: 'Forensic Analysis', description: 'Use scientific methods to examine physical evidence' },
  ];

  const customizations = [
    { category: 'Hats', items: [
      { id: 'deerstalker', emoji: '🎩', name: 'Deerstalker', unlocked: state.player.unlockedItems.includes('deerstalker') },
      { id: 'top_hat', emoji: '👒', name: 'Top Hat', unlocked: state.player.unlockedItems.includes('top_hat') },
      { id: 'bowler', emoji: '🎭', name: 'Bowler', unlocked: state.player.unlockedItems.includes('bowler') },
      { id: 'space_helmet', emoji: '🚀', name: 'Space Helmet', unlocked: state.player.unlockedItems.includes('space_helmet') },
      { id: 'cyber_visor', emoji: '🤖', name: 'Cyber Visor', unlocked: state.player.unlockedItems.includes('cyber_visor') }
    ]},
    { category: 'Coats', items: [
      { id: 'brown_coat', emoji: '🧥', name: 'Brown Coat', unlocked: state.player.unlockedItems.includes('brown_coat') },
      { id: 'black_coat', emoji: '🎓', name: 'Black Coat', unlocked: state.player.unlockedItems.includes('black_coat') },
      { id: 'space_suit', emoji: '👨‍🚀', name: 'Space Suit', unlocked: state.player.unlockedItems.includes('space_suit') },
      { id: 'cyber_armor', emoji: '🦾', name: 'Cyber Armor', unlocked: state.player.unlockedItems.includes('cyber_armor') }
    ]},
    { category: 'Tools', items: [
      { id: 'magnifying_glass', emoji: '🔍', name: 'Magnifying Glass', unlocked: state.player.unlockedItems.includes('magnifying_glass') },
      { id: 'pocket_watch', emoji: '⏰', name: 'Pocket Watch', unlocked: state.player.unlockedItems.includes('pocket_watch') },
      { id: 'detective_pipe', emoji: '🪄', name: 'Detective Pipe', unlocked: state.player.unlockedItems.includes('detective_pipe') },
      { id: 'laser_scanner', emoji: '🔬', name: 'Laser Scanner', unlocked: state.player.unlockedItems.includes('laser_scanner') },
      { id: 'quantum_detector', emoji: '⚡', name: 'Quantum Detector', unlocked: state.player.unlockedItems.includes('quantum_detector') }
    ]}
  ];

  const startMystery = (carriageId: number) => {
    const carriage = carriages.find(c => c.id === carriageId);
    if (carriage && carriage.mysteryData) {
      dispatch({ type: 'START_MYSTERY', payload: carriage.mysteryData });
      setSelectedCarriage(carriageId);
      setCurrentView('carriage');
      // Play mystery sound when starting investigation
      audioManager.playMysterySound();
    }
  };

  const completeMystery = (mysteryId: string) => {
    dispatch({ type: 'COMPLETE_MYSTERY', payload: mysteryId });
    // Play success sound
    audioManager.playSuccessSound();
    // Unlock next carriage
    if (state.currentCarriage < 10) {
      dispatch({ type: 'SET_CURRENT_CARRIAGE', payload: state.currentCarriage + 1 });
    }
    // Unlock new customization items
    const itemsToUnlock = ['top_hat', 'black_coat', 'pocket_watch'];
    itemsToUnlock.forEach(item => {
      if (!state.player.unlockedItems.includes(item)) {
        dispatch({ type: 'UNLOCK_ITEM', payload: item });
      }
    });
    setSelectedCarriage(null);
    setActiveMiniGame(null);
  };

  const completeEvidenceSearch = (foundItems: string[]) => {
    foundItems.forEach(item => {
      const evidence: Evidence = {
        id: item.toLowerCase().replace(/\s/g, '_'),
        name: item,
        description: `Evidence found in carriage ${selectedCarriage}`,
        location: `Carriage ${selectedCarriage}`,
        found: true
      };
      dispatch({ type: 'COLLECT_EVIDENCE', payload: evidence });
    });
    setActiveMiniGame(null);
  };

  const completeLetterReconstruction = (message: string) => {
    const evidence: Evidence = {
      id: 'reconstructed_letter',
      name: 'Reconstructed Letter',
      description: message,
      location: `Carriage ${selectedCarriage}`,
      found: true,
      piecesTogether: true
    };
    dispatch({ type: 'COLLECT_EVIDENCE', payload: evidence });
    setActiveMiniGame(null);
  };

  const completeDeduction = (_accusedSuspect: string, isCorrect: boolean) => {
    if (isCorrect && state.currentMystery) {
      completeMystery(state.currentMystery.id);
    } else {
      // Play error sound for incorrect deduction
      audioManager.playErrorSound();
    }
    setActiveMiniGame(null);
  };

  const completeVocabulary = (learnedWords: string[]) => {
    // Award experience points for learning vocabulary
    learnedWords.forEach(wordId => {
      dispatch({ type: 'UNLOCK_ITEM', payload: `vocab_${wordId}` });
    });
    setActiveMiniGame(null);
  };

  return (
      <div className="App">
        <Particles />
        <InteractiveSounds />
        
        <header className="game-header">
          <div className="title-section">
            <h1 className="holographic-text floating-icon">✨ THE MYSTERY EXPRESS ✨</h1>
            <p>A Sherlock Holmes ESL Adventure</p>
          </div>
          
          <nav className="game-navigation">
            <button 
              className={`glass-btn ripple ${currentView === 'story' ? 'active pulse-glow' : ''}`}
              onClick={() => setCurrentView('story')}
            >
              <span className="btn-icon floating-icon">📖</span>
              Story
            </button>
            <button 
              className={`glass-btn ripple ${currentView === 'train' ? 'active pulse-glow' : ''}`}
              onClick={() => setCurrentView('train')}
            >
              <span className="btn-icon floating-icon">🚂</span>
              Train Map
            </button>
            <button 
              className={`glass-btn ripple ${currentView === 'carriage' ? 'active pulse-glow' : ''}`}
              onClick={() => setCurrentView('carriage')}
            >
              <span className="btn-icon floating-icon">🔍</span>
              Investigate
            </button>
            <button 
              className={`glass-btn ripple ${currentView === 'customize' ? 'active pulse-glow' : ''}`}
              onClick={() => setCurrentView('customize')}
            >
              <span className="btn-icon floating-icon">👤</span>
              Character
            </button>
          </nav>
        </header>

        <main className="game-content">
          {currentView === 'story' && (
            <div className="content-card">
              <h2>🎭 The Mystery Begins</h2>
              <p>Welcome aboard the Mystery Express, Detective Holmes! You are about to embark on the most extraordinary investigation of your career.</p>
              <p>This magnificent train will carry you through three incredible phases of adventure:</p>
              
              <ul>
                <li data-icon="🎭">
                  <strong>Victorian Steampunk Era</strong> - Solve classic mysteries aboard a luxurious steam train with brass fittings and velvet seats
                </li>
                <li data-icon="🌌">
                  <strong>Space Journey</strong> - Watch in awe as your train transforms and soars through the cosmos, encountering alien mysteries
                </li>
                <li data-icon="🤖">
                  <strong>Cyborg Encounter</strong> - Meet beings that blur the line between human and machine in the final phase of your adventure
                </li>
              </ul>
              
              <p>As you solve mysteries, you'll unlock new carriages, collect evidence, and customize your detective avatar. Each decision you make shapes the story and helps you develop your English vocabulary through immersive gameplay.</p>
              
              <p><strong>The game is afoot!</strong> Click the navigation buttons above to begin your investigation.</p>
              
              <AudioControls gamePhase={state.gamePhase} />
            </div>
          )}
          
          {currentView === 'train' && (
            <div className="content-card">
              <h2>🚂 Mystery Express Map</h2>
              <p>Navigate through 10 unique carriages, each hiding its own mystery. Progress from Victorian elegance to cosmic wonders!</p>
              
              <div className="train-visual">
                {carriages.map((carriage) => (
                  <div 
                    key={carriage.id} 
                    className={`carriage-visual ripple ${carriage.unlocked ? 'clickable' : ''} ${carriage.mysteryData?.completed ? 'pulse-glow' : ''}`}
                    onClick={() => carriage.unlocked && carriage.mysteryData ? startMystery(carriage.id) : null}
                  >
                    <div className={`carriage-status ${carriage.unlocked ? 'status-unlocked' : 'status-locked'}`}>
                      {carriage.unlocked ? (carriage.mysteryData?.completed ? 'Completed ✅' : 'Available') : 'Locked 🔒'}
                    </div>
                    <div className="carriage-icon floating-icon">{carriage.icon}</div>
                    <h3>Carriage {carriage.id}</h3>
                    <h4>{carriage.name}</h4>
                    <p>{carriage.mystery}</p>
                    <div className="phase-indicator">
                      {carriage.phase === 'steampunk' && '🎭 Victorian'}
                      {carriage.phase === 'space' && '🌌 Space'}
                      {carriage.phase === 'cyborg' && '🤖 Cyborg'}
                    </div>
                    {carriage.unlocked && carriage.mysteryData && !carriage.mysteryData.completed && (
                      <button className="start-mystery-btn">🕵️ Start Mystery</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {currentView === 'carriage' && !selectedCarriage && (
            <div className="content-card">
              <h2>🔍 Investigation Hub</h2>
              <p>Master the art of detection through interactive mini-games and visual puzzles that enhance your English learning experience.</p>
              
              <div className="train-visual">
                {investigations.map((investigation, index) => (
                  <div key={index} className="carriage-visual clickable ripple pulse-glow" onClick={() => setActiveMiniGame(
                    investigation.name.includes('Letter') ? 'letterReconstruction' : 
                    investigation.name.includes('Evidence') ? 'evidenceSearch' : 
                    investigation.name.includes('Vocabulary') ? 'vocabulary' :
                    'deduction'
                  )}>
                    <div className="carriage-icon floating-icon">{investigation.icon}</div>
                    <h3>{investigation.name}</h3>
                    <p>{investigation.description}</p>
                    <button className="play-mini-game-btn">▶️ Try This Game</button>
                  </div>
                ))}
              </div>
              
              <p>Each investigation type teaches different aspects of English:</p>
              <ul>
                <li data-icon="📖"><strong>Vocabulary Building</strong> - Learn new words in context through story elements</li>
                <li data-icon="🧠"><strong>Critical Thinking</strong> - Develop logical reasoning skills while solving puzzles</li>
                <li data-icon="💬"><strong>Reading Comprehension</strong> - Understand complex narratives and character motivations</li>
                <li data-icon="🎯"><strong>Decision Making</strong> - Choose your actions and see how they affect the story outcome</li>
              </ul>
            </div>
          )}

          {currentView === 'carriage' && selectedCarriage && state.currentMystery && (
            <div className="content-card">
              <h2>🕵️ {state.currentMystery.title}</h2>
              <p>{state.currentMystery.description}</p>
              
              <div className="mystery-status">
                <h3>📋 Investigation Progress</h3>
                <div className="evidence-collected">
                  <strong>Evidence Found:</strong> {state.inventory.filter(e => e.location.includes(`Carriage ${selectedCarriage}`)).length} items
                </div>
                <div className="suspects-identified">
                  <strong>Suspects:</strong> {state.currentMystery.suspects.length} individuals
                </div>
              </div>

              <div className="mystery-actions">
                <h3>🔍 Choose Your Investigation Method:</h3>
                <div className="train-visual">
                  <div className="carriage-visual clickable ripple" onClick={() => setActiveMiniGame('evidenceSearch')}>
                    <div className="carriage-icon floating-icon">🔍</div>
                    <h4>Search for Evidence</h4>
                    <p>Explore the scene for hidden clues</p>
                  </div>
                  <div className="carriage-visual clickable ripple" onClick={() => setActiveMiniGame('letterReconstruction')}>
                    <div className="carriage-icon floating-icon">🧩</div>
                    <h4>Reconstruct Letter</h4>
                    <p>Piece together torn documents</p>
                  </div>
                  <div className="carriage-visual clickable ripple" onClick={() => setActiveMiniGame('deduction')}>
                    <div className="carriage-icon floating-icon">🕵️</div>
                    <h4>Make Deduction</h4>
                    <p>Analyze evidence and accuse suspect</p>
                  </div>
                  <div className="carriage-visual clickable ripple" onClick={() => setActiveMiniGame('vocabulary')}>
                    <div className="carriage-icon floating-icon">📖</div>
                    <h4>Learn Vocabulary</h4>
                    <p>Master mystery-related English words</p>
                  </div>
                </div>
              </div>

              <button className="back-btn" onClick={() => { setSelectedCarriage(null); dispatch({ type: 'CLEAR_MYSTERY' }); }}>← Back to Train Map</button>
            </div>
          )}
          
          {currentView === 'customize' && (
            <div className="content-card">
              <h2>👤 Detective Customization</h2>
              <p>Transform your Sherlock Holmes avatar as you progress through the mysteries. Each unlocked item reflects your growing expertise!</p>
              
              <div className="character-customization">
                <div className="customization-preview">
                  <div className="current-outfit">
                    <h3>Current Detective</h3>
                    <CharacterAvatar character={state.player} size="large" showName={true} />
                    
                    <div className="outfit-stats">
                      <div className="stat-item">
                        <span className="stat-value">{state.player.level}</span>
                        <span className="stat-label">Level</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{state.inventory.length}</span>
                        <span className="stat-label">Evidence</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{state.player.unlockedItems.length}</span>
                        <span className="stat-label">Unlocked</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="current-outfit">
                    <h3>Your Companion</h3>
                    <CharacterAvatar character={state.teacher} size="medium" showName={true} />
                    <p style={{color: 'var(--copper)', fontSize: '14px', marginTop: '10px'}}>
                      Dr. Watson helps guide your adventure as the train conductor
                    </p>
                  </div>
                </div>

                <div className="customization-options">
                  {customizations.map((category, index) => (
                    <div key={index}>
                      <h3 style={{color: 'var(--brass)', marginTop: '32px', marginBottom: '16px'}}>
                        {category.category}
                      </h3>
                      <div className="train-visual">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className={`carriage-visual ${item.unlocked ? 'clickable' : ''}`}>
                            <div className="carriage-icon">{item.emoji}</div>
                            <h4>{item.name}</h4>
                            <div className={`carriage-status ${item.unlocked ? 'status-unlocked' : 'status-locked'}`}>
                              {item.unlocked ? 'Unlocked ✅' : `Unlock by solving mysteries`}
                            </div>
                            {item.unlocked && (
                              <button className="equip-btn" onClick={() => {
                                if (category.category === 'Hats') {
                                  dispatch({ type: 'CUSTOMIZE_CHARACTER', payload: { avatar: { ...state.player.avatar, hat: item.id } } });
                                } else if (category.category === 'Coats') {
                                  dispatch({ type: 'CUSTOMIZE_CHARACTER', payload: { avatar: { ...state.player.avatar, coat: item.id } } });
                                } else if (category.category === 'Tools') {
                                  const newAccessories = state.player.avatar.accessories.includes(item.id) 
                                    ? state.player.avatar.accessories.filter(acc => acc !== item.id)
                                    : [...state.player.avatar.accessories, item.id];
                                  dispatch({ type: 'CUSTOMIZE_CHARACTER', payload: { avatar: { ...state.player.avatar, accessories: newAccessories } } });
                                }
                              }}>
                                {category.category === 'Tools' && state.player.avatar.accessories.includes(item.id) ? 'Unequip' : 'Equip'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <p style={{marginTop: '32px', textAlign: 'center', fontSize: '1.2rem', color: 'var(--brass)'}}>
                <strong>✨ Unlock new items by solving mysteries and progressing through the story! ✨</strong>
              </p>
            </div>
          )}
        </main>

        {/* Mini-Game Modals */}
        {activeMiniGame === 'letterReconstruction' && (
          <LetterReconstruction
            onComplete={completeLetterReconstruction}
            onClose={() => setActiveMiniGame(null)}
          />
        )}
        
        {activeMiniGame === 'evidenceSearch' && (
          <EvidenceSearch
            onComplete={completeEvidenceSearch}
            onClose={() => setActiveMiniGame(null)}
            location={selectedCarriage ? `Carriage ${selectedCarriage}` : 'Investigation Hub'}
          />
        )}
        
        {activeMiniGame === 'deduction' && state.currentMystery && (
          <DeductionGame
            suspects={state.currentMystery.suspects.map(s => ({
              ...s,
              evidence: state.inventory.filter(e => e.location.includes(`Carriage ${selectedCarriage}`)).map(e => e.name),
              isGuilty: s.id === state.currentMystery?.solution
            }))}
            evidence={state.inventory.filter(e => e.location.includes(`Carriage ${selectedCarriage}`)).map(e => e.name)}
            onComplete={completeDeduction}
            onClose={() => setActiveMiniGame(null)}
          />
        )}
        
        {activeMiniGame === 'vocabulary' && (
          <VocabularyLearning
            gamePhase={state.gamePhase}
            onComplete={completeVocabulary}
            onClose={() => setActiveMiniGame(null)}
          />
        )}

        <footer className="game-footer">
          <div className="educational-info">
            <p>
              <strong>🎓 Educational Focus</strong><br/>
              English vocabulary, deductive reasoning, and critical thinking through immersive storytelling
            </p>
            <p>
              <strong>👥 Target Audience</strong><br/>
              ESL students aged 12-15 years old seeking engaging language learning experiences
            </p>
            <p>
              <strong>🌟 Learning Goals</strong><br/>
              Develop language skills through interactive mysteries, character development, and choice-driven narratives
            </p>
          </div>
        </footer>
      </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
