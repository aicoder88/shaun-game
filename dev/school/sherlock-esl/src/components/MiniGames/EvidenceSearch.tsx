import React, { useState, useEffect } from 'react';

interface SearchableItem {
  id: string;
  name: string;
  x: number;
  y: number;
  found: boolean;
  isEvidence: boolean;
  emoji: string;
}

interface EvidenceSearchProps {
  onComplete: (foundItems: string[]) => void;
  onClose: () => void;
  location: string;
}

export function EvidenceSearch({ onComplete, onClose, location }: EvidenceSearchProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [magnifierPos, setMagnifierPos] = useState({ x: 50, y: 50 });
  const [foundItems, setFoundItems] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const searchItems: SearchableItem[] = [
    { id: 'coin', name: 'Gold Coin', x: 15, y: 25, found: false, isEvidence: true, emoji: '🪙' },
    { id: 'key', name: 'Brass Key', x: 80, y: 40, found: false, isEvidence: true, emoji: '🗝️' },
    { id: 'note', name: 'Secret Note', x: 45, y: 70, found: false, isEvidence: true, emoji: '📝' },
    { id: 'button', name: 'Coat Button', x: 70, y: 15, found: false, isEvidence: true, emoji: '🔘' },
    { id: 'dust', name: 'Dust Bunny', x: 30, y: 80, found: false, isEvidence: false, emoji: '🐰' },
    { id: 'crumb', name: 'Bread Crumb', x: 60, y: 60, found: false, isEvidence: false, emoji: '🍞' },
    { id: 'lint', name: 'Pocket Lint', x: 20, y: 50, found: false, isEvidence: false, emoji: '🧶' },
  ];

  const [items, setItems] = useState<SearchableItem[]>(searchItems);

  useEffect(() => {
    if (timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleGameEnd();
    }
  }, [timeLeft, isComplete]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMagnifierPos({ x, y });
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const clickedItem = items.find(item => 
      !item.found &&
      Math.abs(item.x - clickX) < 5 && 
      Math.abs(item.y - clickY) < 5
    );

    if (clickedItem) {
      const updatedItems = items.map(item => 
        item.id === clickedItem.id ? { ...item, found: true } : item
      );
      setItems(updatedItems);

      if (clickedItem.isEvidence) {
        setFoundItems([...foundItems, clickedItem.name]);
      }

      const evidenceItems = updatedItems.filter(item => item.isEvidence);
      const foundEvidenceCount = evidenceItems.filter(item => item.found).length;
      
      if (foundEvidenceCount === evidenceItems.length) {
        setIsComplete(true);
        setTimeout(() => handleGameEnd(), 2000);
      }
    }
  };

  const handleGameEnd = () => {
    const evidenceFound = items.filter(item => item.isEvidence && item.found).map(item => item.name);
    onComplete(evidenceFound);
  };

  const evidenceCount = items.filter(item => item.isEvidence).length;
  const foundEvidenceCount = items.filter(item => item.isEvidence && item.found).length;

  return (
    <div className="mini-game-modal">
      <div className="mini-game-content evidence-search">
        <div className="game-header">
          <h3 className="holographic-text">🔍 Evidence Search</h3>
          <p className="pulse-glow">Search the {location} for hidden evidence!</p>
          <button className="close-btn ripple" onClick={onClose}>✕</button>
        </div>

        <div className="game-stats">
          <div className={`stat ${timeLeft < 20 ? 'pulse-glow' : ''}`}>⏰ Time: {timeLeft}s</div>
          <div className="stat pulse-glow">🔍 Evidence: {foundEvidenceCount}/{evidenceCount}</div>
        </div>

        <div 
          className="search-area"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ 
            position: 'relative', 
            background: 'linear-gradient(45deg, #8B4513, #D2B48C)',
            cursor: 'none',
            overflow: 'hidden'
          }}
        >
          {/* Search area background */}
          <div className="search-background">
            <pre style={{ fontSize: '8px', opacity: 0.3 }}>
{`
████████████████████████████████████████████████████████████████
█  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  █
█ ░                                                            ░ █
█░   📚    🗞️     📦      🧳        ⚙️      🕯️     ⚖️     ░█
█░                                                              ░█
█░     🪑      📜     🎩     💍      📝     🔍     📞      ░█
█░                                                              ░█
█░  🕯️    📦      🪙     🗝️     ⚱️     📚     🎭       ░█
█░                                                              ░█
█░     📝     🧸     🎪     📷     🎼     🎨     🎲       ░█
█░                                                              ░█
█ ░                                                            ░ █
█  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  █
████████████████████████████████████████████████████████████████
`}
            </pre>
          </div>

          {/* Hidden items */}
          {items.map((item) => (
            !item.found && (
              <div
                key={item.id}
                className={`hidden-item ${item.isEvidence ? 'evidence' : 'distraction'}`}
                style={{
                  position: 'absolute',
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  fontSize: '12px',
                  opacity: Math.abs(magnifierPos.x - item.x) < 10 && Math.abs(magnifierPos.y - item.y) < 10 ? 0.8 : 0.1,
                  transition: 'opacity 0.2s',
                }}
              >
                {item.emoji}
              </div>
            )
          ))}

          {/* Magnifying glass */}
          <div
            className="magnifier pulse-glow"
            style={{
              position: 'absolute',
              left: `${magnifierPos.x}%`,
              top: `${magnifierPos.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              border: '3px solid #FFD700',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)',
              pointerEvents: 'none',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.1)',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '20px',
              }}
            >
              🔍
            </div>
          </div>
        </div>

        <div className="found-items">
          <h4 className="holographic-text">Evidence Found:</h4>
          <div className="found-list">
            {foundItems.map((item, index) => (
              <span key={index} className="found-item pulse-glow floating-icon">✅ {item}</span>
            ))}
          </div>
        </div>

        {isComplete && (
          <div className="completion-message pulse-glow">
            <h3 className="holographic-text floating-icon">🎉 Search Complete!</h3>
            <p className="holographic-text">You found all the evidence in the {location}!</p>
            <p>These clues will help solve the mystery...</p>
          </div>
        )}

        <div className="game-instructions">
          <p>💡 <strong>Instructions:</strong> Move your mouse to control the magnifying glass. Click when you spot evidence!</p>
        </div>
      </div>
    </div>
  );
}