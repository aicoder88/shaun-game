import { useState } from 'react';
import { useGame } from '../hooks/useGame';
import type { Evidence } from '../types/game';

interface ClickableItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  evidence?: Evidence;
  description: string;
  requiresTool?: string;
}

interface TrainCarriageProps {
  carriageNumber: number;
}

export function TrainCarriage({ carriageNumber }: TrainCarriageProps) {
  const { state, dispatch } = useGame();
  const [selectedItem, setSelectedItem] = useState<ClickableItem | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [cursorTool, setCursorTool] = useState<string>('pointer');

  const clickableItems: ClickableItem[] = [
    {
      id: 'suitcase',
      x: 20,
      y: 60,
      width: 15,
      height: 20,
      description: 'A suspicious leather suitcase. It looks like it has been tampered with.',
      evidence: {
        id: 'suitcase_evidence',
        name: 'Torn fabric',
        description: 'A piece of expensive silk fabric, torn at the edges',
        location: 'Inside suitcase',
        found: false
      }
    },
    {
      id: 'window',
      x: 70,
      y: 30,
      width: 20,
      height: 25,
      description: 'The carriage window shows the steampunk landscape rushing by.',
    },
    {
      id: 'trash_bin',
      x: 85,
      y: 70,
      width: 10,
      height: 15,
      description: 'A waste bin that might contain discarded evidence.',
      requiresTool: 'magnifying_glass',
      evidence: {
        id: 'letter_pieces',
        name: 'Torn letter pieces',
        description: 'Fragments of a threatening letter that needs to be reconstructed',
        location: 'Trash bin',
        found: false,
        piecesTogether: false
      }
    },
    {
      id: 'seat_cushion',
      x: 35,
      y: 50,
      width: 25,
      height: 15,
      description: 'Plush velvet seats where passengers sit during their journey.',
      evidence: {
        id: 'button',
        name: 'Golden button',
        description: 'An ornate button that seems to have fallen from someone\'s coat',
        location: 'Under seat cushion',
        found: false
      }
    }
  ];

  const handleItemClick = (item: ClickableItem) => {
    if (item.requiresTool && !state.player.avatar.accessories.includes(item.requiresTool)) {
      setSelectedItem({
        ...item,
        description: `You need a ${item.requiresTool.replace('_', ' ')} to examine this properly.`
      });
      setShowDialog(true);
      return;
    }

    setSelectedItem(item);
    setShowDialog(true);

    if (item.evidence && !item.evidence.found) {
      const foundEvidence = { ...item.evidence, found: true };
      dispatch({ type: 'COLLECT_EVIDENCE', payload: foundEvidence });
    }
  };

  const handleToolSelect = (tool: string) => {
    setCursorTool(tool);
  };

  return (
    <div className="train-carriage">
      <div className="carriage-header">
        <h2>Carriage {carriageNumber}</h2>
        <div className="character-info">
          <div className="player-avatar">
            🕵️ Detective Holmes
          </div>
          <div className="teacher-avatar">
            👨‍✈️ Dr. Watson (Conductor)
          </div>
        </div>
      </div>

      <div className="tool-selector">
        <button 
          className={`tool-btn ${cursorTool === 'pointer' ? 'active' : ''}`}
          onClick={() => handleToolSelect('pointer')}
        >
          👆 Point
        </button>
        {state.player.avatar.magnifyingGlass && (
          <button 
            className={`tool-btn ${cursorTool === 'magnifying_glass' ? 'active' : ''}`}
            onClick={() => handleToolSelect('magnifying_glass')}
          >
            🔍 Examine
          </button>
        )}
        {state.player.avatar.accessories.includes('laser_scanner') && (
          <button 
            className={`tool-btn ${cursorTool === 'laser_scanner' ? 'active' : ''}`}
            onClick={() => handleToolSelect('laser_scanner')}
          >
            🔬 Scan
          </button>
        )}
      </div>

      <div className="carriage-scene" style={{ position: 'relative', cursor: cursorTool === 'magnifying_glass' ? 'zoom-in' : 'pointer' }}>
        <div className="scene-background">
          {/* ASCII art representation of train carriage */}
          <pre style={{ fontSize: '12px', lineHeight: '1' }}>
{`
╭─────────────────────────────────────────────────────╮
│  🪟                                         🪟      │
│                                                     │
│     🧳        🪑🪑🪑🪑        🪑🪑🪑🪑           │
│              ╱═══════════╲  ╱═══════════╲           │
│             ╱             ╲╱             ╲          │
│            │  💺  💺  💺  💺  💺  💺  │         │
│            │                               │         │
│             ╲             ╱╲             ╱          │
│              ╲═══════════╱  ╲═══════════╱           │
│                                                🗑️   │
│                                                     │
│═════════════════════════════════════════════════════│
`}
          </pre>
        </div>

        {/* Clickable hotspots */}
        {clickableItems.map((item) => (
          <div
            key={item.id}
            className="clickable-item"
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `${item.width}%`,
              height: `${item.height}%`,
              cursor: 'pointer',
              border: '2px solid transparent',
              borderRadius: '4px',
            }}
            onClick={() => handleItemClick(item)}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = '2px solid #ffd700';
              e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = '2px solid transparent';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          />
        ))}
      </div>

      {showDialog && selectedItem && (
        <div className="evidence-dialog">
          <div className="dialog-content">
            <h3>Investigation</h3>
            <p>{selectedItem.description}</p>
            {selectedItem.evidence && selectedItem.evidence.found && (
              <div className="evidence-found">
                <h4>Evidence Collected:</h4>
                <p><strong>{selectedItem.evidence.name}</strong></p>
                <p>{selectedItem.evidence.description}</p>
                {selectedItem.evidence.piecesTogether === false && (
                  <button className="mini-game-btn">
                    🧩 Reconstruct Letter
                  </button>
                )}
              </div>
            )}
            <button onClick={() => setShowDialog(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="inventory-bar">
        <h4>Evidence Collected:</h4>
        <div className="evidence-items">
          {state.inventory.map((evidence) => (
            <div key={evidence.id} className="evidence-item">
              🔍 {evidence.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}