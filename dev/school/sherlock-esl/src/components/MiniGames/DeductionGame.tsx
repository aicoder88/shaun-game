import { useState } from 'react';

interface Suspect {
  id: string;
  name: string;
  description: string;
  alibi: string;
  evidence: string[];
  isGuilty: boolean;
}

interface DeductionGameProps {
  suspects: Suspect[];
  evidence: string[];
  onComplete: (accusedSuspect: string, isCorrect: boolean) => void;
  onClose: () => void;
}

export function DeductionGame({ suspects, evidence, onComplete, onClose }: DeductionGameProps) {
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [accusationMade, setAccusationMade] = useState(false);

  const defaultSuspects: Suspect[] = [
    {
      id: 'lady_pemberton',
      name: 'Lady Pemberton',
      description: 'A wealthy passenger traveling to London with expensive jewelry',
      alibi: 'Was in the dining car during the incident',
      evidence: ['Golden button', 'Torn fabric'],
      isGuilty: false
    },
    {
      id: 'mr_blackwood',
      name: 'Mr. Blackwood',
      description: 'A mysterious gentleman with a suspicious past',
      alibi: 'Claims to have been reading in his compartment',
      evidence: ['Secret Note', 'Brass Key'],
      isGuilty: true
    },
    {
      id: 'conductor_williams',
      name: 'Conductor Williams',
      description: 'The train conductor who has access to all carriages',
      alibi: 'Was checking tickets in the passenger cars',
      evidence: ['Gold Coin'],
      isGuilty: false
    }
  ];

  const gameSuspects = suspects.length > 0 ? suspects : defaultSuspects;

  const handleEvidenceToggle = (evidenceItem: string) => {
    setSelectedEvidence(prev => 
      prev.includes(evidenceItem)
        ? prev.filter(e => e !== evidenceItem)
        : [...prev, evidenceItem]
    );
  };

  const analyzeEvidence = () => {
    setShowAnalysis(true);
  };

  const makeAccusation = () => {
    if (!selectedSuspect) return;

    const accused = gameSuspects.find(s => s.id === selectedSuspect);
    const isCorrect = accused?.isGuilty || false;
    
    setAccusationMade(true);
    
    setTimeout(() => {
      onComplete(selectedSuspect, isCorrect);
    }, 3000);
  };

  const getEvidenceAgainstSuspect = (suspect: Suspect) => {
    return selectedEvidence.filter(evidence => suspect.evidence.includes(evidence));
  };

  return (
    <div className="mini-game-modal">
      <div className="mini-game-content deduction-game">
        <div className="game-header">
          <h3>🕵️ Deduction Challenge</h3>
          <p>Analyze the evidence and identify the culprit!</p>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="evidence-section">
          <h4>🔍 Available Evidence:</h4>
          <div className="evidence-grid">
            {evidence.map((item, index) => (
              <button
                key={index}
                className={`evidence-item ${selectedEvidence.includes(item) ? 'selected' : ''}`}
                onClick={() => handleEvidenceToggle(item)}
              >
                <span className="evidence-icon">🔎</span>
                <span className="evidence-name">{item}</span>
              </button>
            ))}
          </div>
          <button 
            className="analyze-btn"
            onClick={analyzeEvidence}
            disabled={selectedEvidence.length === 0}
          >
            🧠 Analyze Evidence
          </button>
        </div>

        <div className="suspects-section">
          <h4>👥 Suspects:</h4>
          <div className="suspects-grid">
            {gameSuspects.map((suspect) => {
              const matchingEvidence = getEvidenceAgainstSuspect(suspect);
              return (
                <div
                  key={suspect.id}
                  className={`suspect-card ${selectedSuspect === suspect.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSuspect(suspect.id)}
                >
                  <div className="suspect-header">
                    <h5>{suspect.name}</h5>
                    {showAnalysis && matchingEvidence.length > 0 && (
                      <span className="evidence-count">{matchingEvidence.length} matches</span>
                    )}
                  </div>
                  <p className="suspect-description">{suspect.description}</p>
                  <div className="suspect-alibi">
                    <strong>Alibi:</strong> {suspect.alibi}
                  </div>
                  {showAnalysis && (
                    <div className="evidence-analysis">
                      <strong>Evidence against:</strong>
                      {matchingEvidence.length > 0 ? (
                        <ul>
                          {matchingEvidence.map((evidence, idx) => (
                            <li key={idx} className="matching-evidence">🔍 {evidence}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-evidence">No direct evidence found</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="accusation-section">
          {selectedSuspect && (
            <div className="accusation-panel">
              <h4>⚖️ Make Your Accusation:</h4>
              <p>You are about to accuse <strong>{gameSuspects.find(s => s.id === selectedSuspect)?.name}</strong> of the crime.</p>
              <p className="warning">⚠️ Choose carefully! You only get one chance.</p>
              <button 
                className="accuse-btn"
                onClick={makeAccusation}
                disabled={accusationMade}
              >
                🎯 Accuse {gameSuspects.find(s => s.id === selectedSuspect)?.name}
              </button>
            </div>
          )}
        </div>

        {accusationMade && (
          <div className="accusation-result">
            {(() => {
              const accused = gameSuspects.find(s => s.id === selectedSuspect);
              const isCorrect = accused?.isGuilty || false;
              return (
                <div className={`result-panel ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? (
                    <>
                      <h3>🎉 Brilliant Deduction!</h3>
                      <p>You correctly identified <strong>{accused?.name}</strong> as the culprit!</p>
                      <p>Your logical reasoning and attention to detail led to justice!</p>
                    </>
                  ) : (
                    <>
                      <h3>🤔 Not Quite Right...</h3>
                      <p><strong>{accused?.name}</strong> was innocent.</p>
                      <p>The real culprit was <strong>{gameSuspects.find(s => s.isGuilty)?.name}</strong>!</p>
                      <p>Sometimes the evidence can be misleading. Keep practicing your deduction skills!</p>
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        <div className="game-instructions">
          <p>💡 <strong>Instructions:</strong></p>
          <ol>
            <li>Select evidence items to analyze</li>
            <li>Click "Analyze Evidence" to see connections</li>
            <li>Choose your suspect based on the evidence</li>
            <li>Make your accusation!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}