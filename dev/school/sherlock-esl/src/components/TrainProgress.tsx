import { useGame } from '../hooks/useGame';

interface CarriageInfo {
  number: number;
  name: string;
  mysteryType: string;
  unlocked: boolean;
  completed: boolean;
  phase: 'steampunk' | 'space' | 'cyborg';
}

export function TrainProgress() {
  const { state, dispatch } = useGame();
  
  const carriages: CarriageInfo[] = [
    { number: 1, name: 'First Class', mysteryType: 'Murder Mystery', unlocked: true, completed: false, phase: 'steampunk' },
    { number: 2, name: 'Dining Car', mysteryType: 'Theft Case', unlocked: false, completed: false, phase: 'steampunk' },
    { number: 3, name: 'Passenger Car', mysteryType: 'Missing Person', unlocked: false, completed: false, phase: 'steampunk' },
    { number: 4, name: 'Cargo Hold', mysteryType: 'Smuggling Ring', unlocked: false, completed: false, phase: 'steampunk' },
    { number: 5, name: 'Engine Room', mysteryType: 'Sabotage', unlocked: false, completed: false, phase: 'steampunk' },
    { number: 6, name: 'Observatory Car', mysteryType: 'Space Anomaly', unlocked: false, completed: false, phase: 'space' },
    { number: 7, name: 'Laboratory', mysteryType: 'Alien Artifact', unlocked: false, completed: false, phase: 'space' },
    { number: 8, name: 'Control Bridge', mysteryType: 'Navigation Error', unlocked: false, completed: false, phase: 'space' },
    { number: 9, name: 'AI Core', mysteryType: 'System Malfunction', unlocked: false, completed: false, phase: 'cyborg' },
    { number: 10, name: 'Final Destination', mysteryType: 'The Ultimate Mystery', unlocked: false, completed: false, phase: 'cyborg' },
  ];

  const getCarriageIcon = (carriage: CarriageInfo) => {
    if (carriage.phase === 'steampunk') {
      switch (carriage.number) {
        case 1: return '🚂';
        case 2: return '🍽️';
        case 3: return '🪑';
        case 4: return '📦';
        case 5: return '⚙️';
        default: return '🚃';
      }
    } else if (carriage.phase === 'space') {
      switch (carriage.number) {
        case 6: return '🔭';
        case 7: return '🧪';
        case 8: return '🛸';
        default: return '🚀';
      }
    } else {
      return '🤖';
    }
  };

  const handleCarriageClick = (carriage: CarriageInfo) => {
    if (!carriage.unlocked) return;
    
    dispatch({ type: 'SET_CURRENT_CARRIAGE', payload: carriage.number });
    
    if (carriage.phase !== state.gamePhase) {
      dispatch({ type: 'ADVANCE_GAME_PHASE', payload: carriage.phase });
    }
  };

  const getPhaseTitle = (phase: string) => {
    switch (phase) {
      case 'steampunk': return '🎭 The Victorian Express';
      case 'space': return '🌌 Journey to Space';
      case 'cyborg': return '🤖 The Cyborg Encounter';
      default: return '';
    }
  };

  const groupedCarriages = carriages.reduce((acc, carriage) => {
    if (!acc[carriage.phase]) acc[carriage.phase] = [];
    acc[carriage.phase].push(carriage);
    return acc;
  }, {} as Record<string, CarriageInfo[]>);

  return (
    <div className="train-progress">
      <h2>🚂 The Mystery Express</h2>
      <p>Progress through each carriage solving mysteries and uncovering the truth!</p>
      
      {Object.entries(groupedCarriages).map(([phase, phaseCarriages]) => (
        <div key={phase} className="phase-section">
          <h3 className={`phase-title ${phase}`}>
            {getPhaseTitle(phase)}
          </h3>
          
          <div className="train-track">
            {phaseCarriages.map((carriage, index) => (
              <div key={carriage.number} className="carriage-container">
                <div
                  className={`carriage ${carriage.unlocked ? 'unlocked' : 'locked'} ${
                    carriage.completed ? 'completed' : ''
                  } ${state.currentCarriage === carriage.number ? 'current' : ''}`}
                  onClick={() => handleCarriageClick(carriage)}
                >
                  <div className="carriage-icon">
                    {getCarriageIcon(carriage)}
                  </div>
                  <div className="carriage-info">
                    <h4>{carriage.name}</h4>
                    <p className="mystery-type">{carriage.mysteryType}</p>
                    <div className="carriage-status">
                      {carriage.completed && <span className="completed-badge">✅ Solved</span>}
                      {!carriage.unlocked && <span className="locked-badge">🔒 Locked</span>}
                      {state.currentCarriage === carriage.number && <span className="current-badge">📍 Current</span>}
                    </div>
                  </div>
                </div>
                
                {index < phaseCarriages.length - 1 && (
                  <div className="track-connector">
                    {phase === 'steampunk' && '═══'}
                    {phase === 'space' && '∼∼∼'}
                    {phase === 'cyborg' && '▓▓▓'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="progress-stats">
        <div className="stat">
          <span className="stat-label">Current Phase:</span>
          <span className="stat-value">{getPhaseTitle(state.gamePhase)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Mysteries Solved:</span>
          <span className="stat-value">{state.mysteries.filter(m => m.completed).length}/{state.mysteries.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Evidence Collected:</span>
          <span className="stat-value">{state.inventory.length}</span>
        </div>
      </div>
    </div>
  );
}