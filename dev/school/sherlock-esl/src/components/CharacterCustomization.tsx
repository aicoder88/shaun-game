import { useGame } from '../hooks/useGame';
import type { Character } from '../types/game';

interface CustomizationOption {
  id: string;
  name: string;
  type: 'hat' | 'coat' | 'accessory';
  unlockLevel: number;
  image: string;
}

const CUSTOMIZATION_OPTIONS: CustomizationOption[] = [
  { id: 'deerstalker', name: 'Deerstalker Hat', type: 'hat', unlockLevel: 1, image: '🎩' },
  { id: 'top_hat', name: 'Top Hat', type: 'hat', unlockLevel: 2, image: '🎭' },
  { id: 'bowler', name: 'Bowler Hat', type: 'hat', unlockLevel: 3, image: '👒' },
  { id: 'space_helmet', name: 'Space Helmet', type: 'hat', unlockLevel: 8, image: '🚀' },
  
  { id: 'brown_coat', name: 'Brown Coat', type: 'coat', unlockLevel: 1, image: '🧥' },
  { id: 'black_coat', name: 'Black Coat', type: 'coat', unlockLevel: 2, image: '🎓' },
  { id: 'space_suit', name: 'Space Suit', type: 'coat', unlockLevel: 8, image: '👨‍🚀' },
  
  { id: 'magnifying_glass', name: 'Magnifying Glass', type: 'accessory', unlockLevel: 1, image: '🔍' },
  { id: 'pocket_watch', name: 'Pocket Watch', type: 'accessory', unlockLevel: 3, image: '⏰' },
  { id: 'pipe', name: 'Detective Pipe', type: 'accessory', unlockLevel: 4, image: '🪄' },
  { id: 'laser_scanner', name: 'Laser Scanner', type: 'accessory', unlockLevel: 9, image: '🔬' },
];

export function CharacterCustomization() {
  const { state, dispatch } = useGame();
  const { player } = state;

  const handleItemSelect = (option: CustomizationOption) => {
    if (!player.unlockedItems.includes(option.id)) return;

    const updates: Partial<Character> = {};
    
    if (option.type === 'hat') {
      updates.avatar = { ...player.avatar, hat: option.id };
    } else if (option.type === 'coat') {
      updates.avatar = { ...player.avatar, coat: option.id };
    } else if (option.type === 'accessory') {
      const accessories = player.avatar.accessories.includes(option.id)
        ? player.avatar.accessories.filter(a => a !== option.id)
        : [...player.avatar.accessories, option.id];
      updates.avatar = { ...player.avatar, accessories };
    }

    dispatch({ type: 'CUSTOMIZE_CHARACTER', payload: updates });
  };

  const isUnlocked = (option: CustomizationOption) => 
    player.unlockedItems.includes(option.id);

  const isEquipped = (option: CustomizationOption) => {
    if (option.type === 'hat') return player.avatar.hat === option.id;
    if (option.type === 'coat') return player.avatar.coat === option.id;
    return player.avatar.accessories.includes(option.id);
  };

  return (
    <div className="character-customization">
      <div className="character-preview">
        <h2>Detective {player.name}</h2>
        <div className="character-avatar">
          <div className="avatar-display">
            {CUSTOMIZATION_OPTIONS.find(o => o.id === player.avatar.hat)?.image}
            {CUSTOMIZATION_OPTIONS.find(o => o.id === player.avatar.coat)?.image}
            {player.avatar.accessories.map(acc => 
              CUSTOMIZATION_OPTIONS.find(o => o.id === acc)?.image
            ).join(' ')}
          </div>
          <p>Level {player.level}</p>
        </div>
      </div>

      <div className="customization-options">
        <h3>Hats</h3>
        <div className="option-grid">
          {CUSTOMIZATION_OPTIONS.filter(o => o.type === 'hat').map(option => (
            <button
              key={option.id}
              className={`customization-item ${!isUnlocked(option) ? 'locked' : ''} ${isEquipped(option) ? 'equipped' : ''}`}
              onClick={() => handleItemSelect(option)}
              disabled={!isUnlocked(option)}
            >
              <span className="item-icon">{option.image}</span>
              <span className="item-name">{option.name}</span>
              {!isUnlocked(option) && <span className="unlock-level">Level {option.unlockLevel}</span>}
            </button>
          ))}
        </div>

        <h3>Coats</h3>
        <div className="option-grid">
          {CUSTOMIZATION_OPTIONS.filter(o => o.type === 'coat').map(option => (
            <button
              key={option.id}
              className={`customization-item ${!isUnlocked(option) ? 'locked' : ''} ${isEquipped(option) ? 'equipped' : ''}`}
              onClick={() => handleItemSelect(option)}
              disabled={!isUnlocked(option)}
            >
              <span className="item-icon">{option.image}</span>
              <span className="item-name">{option.name}</span>
              {!isUnlocked(option) && <span className="unlock-level">Level {option.unlockLevel}</span>}
            </button>
          ))}
        </div>

        <h3>Accessories</h3>
        <div className="option-grid">
          {CUSTOMIZATION_OPTIONS.filter(o => o.type === 'accessory').map(option => (
            <button
              key={option.id}
              className={`customization-item ${!isUnlocked(option) ? 'locked' : ''} ${isEquipped(option) ? 'equipped' : ''}`}
              onClick={() => handleItemSelect(option)}
              disabled={!isUnlocked(option)}
            >
              <span className="item-icon">{option.image}</span>
              <span className="item-name">{option.name}</span>
              {!isUnlocked(option) && <span className="unlock-level">Level {option.unlockLevel}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}