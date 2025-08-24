import { useState, useEffect } from 'react';

interface LetterPiece {
  id: string;
  text: string;
  correctPosition: number;
  currentPosition?: number;
}

interface LetterReconstructionProps {
  onComplete: (message: string) => void;
  onClose: () => void;
}

export function LetterReconstruction({ onComplete, onClose }: LetterReconstructionProps) {
  const originalMessage = "MEET ME AT MIDNIGHT IN THE CARGO HOLD - THE DIAMOND IS HIDDEN BENEATH THE FLOOR";
  
  const letterPieces: LetterPiece[] = [
    { id: '1', text: 'MEET ME AT', correctPosition: 0 },
    { id: '2', text: 'MIDNIGHT IN', correctPosition: 1 },
    { id: '3', text: 'THE CARGO', correctPosition: 2 },
    { id: '4', text: 'HOLD - THE', correctPosition: 3 },
    { id: '5', text: 'DIAMOND IS', correctPosition: 4 },
    { id: '6', text: 'HIDDEN BENEATH', correctPosition: 5 },
    { id: '7', text: 'THE FLOOR', correctPosition: 6 },
  ];

  const [shuffledPieces, setShuffledPieces] = useState<LetterPiece[]>([]);
  const [reconstructedMessage, setReconstructedMessage] = useState<(LetterPiece | null)[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const shuffled = [...letterPieces].sort(() => Math.random() - 0.5);
    setShuffledPieces(shuffled);
    setReconstructedMessage(new Array(letterPieces.length).fill(null));
  }, []);

  const handlePieceClick = (piece: LetterPiece) => {
    if (piece.currentPosition !== undefined) {
      const newReconstructed = [...reconstructedMessage];
      newReconstructed[piece.currentPosition] = null;
      setReconstructedMessage(newReconstructed);

      const newShuffled = [...shuffledPieces];
      const pieceIndex = newShuffled.findIndex(p => p.id === piece.id);
      newShuffled[pieceIndex] = { ...piece, currentPosition: undefined };
      setShuffledPieces(newShuffled);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    const availablePiece = shuffledPieces.find(p => p.currentPosition === undefined);
    if (!availablePiece || reconstructedMessage[slotIndex] !== null) return;

    const newReconstructed = [...reconstructedMessage];
    newReconstructed[slotIndex] = { ...availablePiece, currentPosition: slotIndex };
    setReconstructedMessage(newReconstructed);

    const newShuffled = [...shuffledPieces];
    const pieceIndex = newShuffled.findIndex(p => p.id === availablePiece.id);
    newShuffled[pieceIndex] = { ...availablePiece, currentPosition: slotIndex };
    setShuffledPieces(newShuffled);
  };

  const checkSolution = () => {
    const isCorrect = reconstructedMessage.every((piece, index) => 
      piece && piece.correctPosition === index
    );
    
    if (isCorrect) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete(originalMessage);
      }, 2000);
    }
  };

  useEffect(() => {
    if (reconstructedMessage.every(piece => piece !== null)) {
      checkSolution();
    }
  }, [reconstructedMessage]);

  return (
    <div className="mini-game-modal">
      <div className="mini-game-content letter-reconstruction">
        <div className="game-header">
          <h3>🧩 Letter Reconstruction</h3>
          <p>Piece together the torn letter to reveal the hidden message!</p>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="reconstruction-area">
          <h4>Reconstructed Message:</h4>
          <div className="message-slots">
            {reconstructedMessage.map((piece, index) => (
              <div
                key={index}
                className={`message-slot ${piece ? 'filled' : 'empty'}`}
                onClick={() => handleSlotClick(index)}
              >
                {piece ? (
                  <div 
                    className="placed-piece"
                    onClick={() => handlePieceClick(piece)}
                  >
                    {piece.text}
                  </div>
                ) : (
                  <div className="slot-placeholder">Drop piece {index + 1}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pieces-area">
          <h4>Letter Pieces:</h4>
          <div className="letter-pieces">
            {shuffledPieces
              .filter(piece => piece.currentPosition === undefined)
              .map((piece) => (
                <div
                  key={piece.id}
                  className="letter-piece"
                  onClick={() => handlePieceClick(piece)}
                >
                  <div className="piece-content">
                    {piece.text}
                  </div>
                  <div className="piece-number">#{piece.id}</div>
                </div>
              ))}
          </div>
        </div>

        {isComplete && (
          <div className="completion-message">
            <h3>✅ Letter Reconstructed!</h3>
            <p className="revealed-message">"{originalMessage}"</p>
            <p>This is crucial evidence! The mystery deepens...</p>
          </div>
        )}

        <div className="game-instructions">
          <p>💡 <strong>Instructions:</strong> Click on letter pieces to select them, then click on numbered slots to place them. Click placed pieces to remove them.</p>
        </div>
      </div>
    </div>
  );
}