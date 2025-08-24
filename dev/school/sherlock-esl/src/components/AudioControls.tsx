import { useState, useEffect } from 'react';
import { audioManager } from '../utils/AudioManager';

interface AudioControlsProps {
  gamePhase: 'steampunk' | 'space' | 'cyborg';
}

export function AudioControls({ gamePhase }: AudioControlsProps) {
  const [volume, setVolume] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    setAudioEnabled(audioManager.isEnabled());
  }, []);

  useEffect(() => {
    audioManager.setMasterVolume(volume);
  }, [volume]);

  const playPhaseAmbient = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      switch (gamePhase) {
        case 'steampunk':
          await audioManager.playTrainSound(4000);
          break;
        case 'space':
          await audioManager.playSpaceAmbient(5000);
          break;
        case 'cyborg':
          await audioManager.playCyberSound(3000);
          break;
      }
    } finally {
      setTimeout(() => setIsPlaying(false), 1000);
    }
  };

  const testSuccessSound = () => {
    audioManager.playSuccessSound();
  };

  const testMysterySound = () => {
    audioManager.playMysterySound();
  };

  if (!audioEnabled) {
    return (
      <div className="audio-controls disabled">
        <div className="audio-status">
          🔇 Audio not available in this browser
        </div>
      </div>
    );
  }

  return (
    <div className="audio-controls">
      <div className="audio-header">
        <h4>🎵 Atmospheric Audio</h4>
        <div className="phase-indicator">
          {gamePhase === 'steampunk' && '🚂 Victorian Era'}
          {gamePhase === 'space' && '🌌 Space Journey'}
          {gamePhase === 'cyborg' && '🤖 Cyborg Future'}
        </div>
      </div>

      <div className="volume-control">
        <label htmlFor="volume-slider">Volume:</label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="volume-slider"
        />
        <span className="volume-value">{Math.round(volume * 100)}%</span>
      </div>

      <div className="audio-buttons">
        <button
          className="audio-btn primary"
          onClick={playPhaseAmbient}
          disabled={isPlaying}
        >
          {isPlaying ? '🎵 Playing...' : `🎵 Play ${gamePhase === 'steampunk' ? 'Train' : gamePhase === 'space' ? 'Space' : 'Cyber'} Ambient`}
        </button>
        
        <button
          className="audio-btn"
          onClick={testMysterySound}
        >
          🕵️ Mystery Sound
        </button>
        
        <button
          className="audio-btn"
          onClick={testSuccessSound}
        >
          ✅ Success Sound
        </button>
      </div>

      <div className="audio-info">
        <p style={{fontSize: '12px', color: 'var(--copper)', marginTop: '10px'}}>
          🎧 Immersive sounds enhance the detective experience. 
          Audio plays automatically during gameplay events.
        </p>
      </div>
    </div>
  );
}