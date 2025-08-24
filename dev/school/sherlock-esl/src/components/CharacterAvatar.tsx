import type { Character } from '../types/game';

interface CharacterAvatarProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

export function CharacterAvatar({ character, size = 'medium', showName = false }: CharacterAvatarProps) {
  const getHatEmoji = (hat: string) => {
    switch (hat) {
      case 'deerstalker': return '🎩';
      case 'top_hat': return '🎭';
      case 'bowler': return '🎪';
      case 'space_helmet': return '👩‍🚀';
      case 'cyber_visor': return '🤖';
      case 'conductor_cap': return '🧑‍✈️';
      default: return '🎩';
    }
  };

  const getCoatEmoji = (coat: string) => {
    switch (coat) {
      case 'brown_coat': return '🧥';
      case 'black_coat': return '🥼';
      case 'space_suit': return '👨‍🚀';
      case 'cyber_armor': return '🦾';
      case 'conductor_uniform': return '👮‍♂️';
      default: return '🧥';
    }
  };

  const getAccessoryEmoji = (accessory: string) => {
    switch (accessory) {
      case 'pocket_watch': return '⏰';
      case 'magnifying_glass': return '🔍';
      case 'detective_pipe': return '🚬';
      case 'laser_scanner': return '🔬';
      case 'quantum_detector': return '⚡';
      default: return '';
    }
  };

  const sizeClass = {
    small: 'avatar-small',
    medium: 'avatar-medium', 
    large: 'avatar-large'
  }[size];

  return (
    <div className={`character-avatar ${sizeClass}`}>
      <div className="avatar-display">
        <div className="avatar-main">
          {/* Base character */}
          <div className="avatar-body">🕴️</div>
          
          {/* Hat */}
          <div className="avatar-hat">
            {getHatEmoji(character.avatar.hat)}
          </div>
          
          {/* Coat overlay */}
          <div className="avatar-coat">
            {getCoatEmoji(character.avatar.coat)}
          </div>
          
          {/* Accessories */}
          <div className="avatar-accessories">
            {character.avatar.magnifyingGlass && (
              <div className="accessory magnifying-glass">🔍</div>
            )}
            {character.avatar.accessories.map((accessory, index) => (
              <div key={index} className={`accessory ${accessory}`}>
                {getAccessoryEmoji(accessory)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Character level indicator */}
        <div className="avatar-level">
          <span className="level-badge">Lv.{character.level}</span>
        </div>
      </div>
      
      {showName && (
        <div className="avatar-name">
          <h4>{character.name}</h4>
          <div className="unlocked-items-count">
            {character.unlockedItems.length} items unlocked
          </div>
        </div>
      )}
    </div>
  );
}

interface AvatarPreviewProps {
  hat?: string;
  coat?: string;
  accessories?: string[];
  magnifyingGlass?: boolean;
}

export function AvatarPreview({ hat = 'deerstalker', coat = 'brown_coat', accessories = [], magnifyingGlass = true }: AvatarPreviewProps) {
  const previewCharacter: Character = {
    id: 'preview',
    name: 'Preview',
    avatar: {
      hat,
      coat,
      accessories,
      magnifyingGlass
    },
    level: 1,
    unlockedItems: []
  };

  return (
    <div className="avatar-preview">
      <CharacterAvatar character={previewCharacter} size="large" />
      <div className="preview-label">Preview</div>
    </div>
  );
}