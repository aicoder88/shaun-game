import { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';

interface StoryScene {
  id: string;
  title: string;
  narration: string;
  dialogue: DialogueLine[];
  choices?: Choice[];
  autoAdvance?: boolean;
  backgroundMusic?: string;
  phase: 'steampunk' | 'space' | 'cyborg';
}

interface DialogueLine {
  character: 'watson' | 'holmes' | 'narrator' | 'npc';
  text: string;
  emotion?: 'excited' | 'concerned' | 'mysterious' | 'confident';
}

interface Choice {
  id: string;
  text: string;
  consequence: string;
  nextScene?: string;
}

export function NarrativeSystem() {
  const { state, dispatch } = useGame();
  const [currentScene, setCurrentScene] = useState<StoryScene | null>(null);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  // const [isTyping, setIsTyping] = useState(false);

  const storyScenes: StoryScene[] = [
    {
      id: 'opening',
      title: 'All Aboard the Mystery Express',
      narration: 'The year is 1887. Steam hisses from the great locomotives as the most extraordinary train in the British Empire prepares for its maiden voyage...',
      dialogue: [
        {
          character: 'narrator',
          text: 'The Mystery Express stands gleaming in the gaslight, its brass fittings reflecting the flickering flames of the platform torches.'
        },
        {
          character: 'watson',
          text: 'Holmes, my dear fellow! Welcome aboard! As the conductor of this magnificent vessel, I must say this journey promises to be most... educational.',
          emotion: 'excited'
        },
        {
          character: 'holmes',
          text: 'Indeed, Watson. I can already sense that mysteries abound on this curious contraption. The very air thrums with secrets.',
          emotion: 'confident'
        },
        {
          character: 'narrator',
          text: 'As the train begins to move, you notice other passengers boarding. Each one seems to harbor their own secrets...'
        }
      ],
      choices: [
        {
          id: 'investigate_passengers',
          text: 'Observe the other passengers carefully',
          consequence: 'You gain insight into potential suspects',
          nextScene: 'first_mystery_intro'
        },
        {
          id: 'explore_train',
          text: 'Explore the magnificent train carriages',
          consequence: 'You discover hidden areas and clues',
          nextScene: 'first_mystery_intro'
        }
      ],
      phase: 'steampunk'
    },
    {
      id: 'first_mystery_intro',
      title: 'A Cry in the Night',
      narration: 'As the train chugs through the countryside, a bloodcurdling scream echoes from the first-class carriage...',
      dialogue: [
        {
          character: 'narrator',
          text: 'CLANG! CLANG! The train\'s bell rings urgently as passengers rush about in panic.'
        },
        {
          character: 'watson',
          text: 'Holmes! There\'s been a most terrible incident in the first-class carriage. Lady Pemberton\'s precious diamond necklace has vanished!',
          emotion: 'concerned'
        },
        {
          character: 'holmes',
          text: 'Fascinating! Our first case presents itself. Watson, we must examine the scene immediately. The game is afoot!',
          emotion: 'excited'
        },
        {
          character: 'narrator',
          text: 'You enter the luxurious first-class carriage. Velvet seats, crystal chandeliers, and... evidence of a struggle.'
        }
      ],
      choices: [
        {
          id: 'examine_scene',
          text: 'Examine the crime scene thoroughly',
          consequence: 'Begin your investigation with careful observation',
          nextScene: 'investigation_phase'
        },
        {
          id: 'question_witnesses',
          text: 'Question the witnesses immediately',
          consequence: 'Gather testimonies from frightened passengers',
          nextScene: 'investigation_phase'
        }
      ],
      phase: 'steampunk'
    },
    {
      id: 'space_transition',
      title: 'Journey Beyond the Stars',
      narration: 'As the mysteries of the earthbound carriages are solved, the train begins an impossible transformation...',
      dialogue: [
        {
          character: 'narrator',
          text: 'Steam gives way to stellar fire as the Mystery Express breaks free from earthly constraints, soaring into the cosmic void.'
        },
        {
          character: 'watson',
          text: 'Good heavens, Holmes! The train... it\'s flying through space itself! How is this possible?',
          emotion: 'excited'
        },
        {
          character: 'holmes',
          text: 'My dear Watson, the impossible becomes merely improbable when one applies the proper scientific principles. We\'ve entered a realm where new mysteries await.',
          emotion: 'confident'
        },
        {
          character: 'narrator',
          text: 'Through the windows, you see nebulae swirling with impossible colors, distant planets, and... something else moving among the stars.'
        }
      ],
      choices: [
        {
          id: 'investigate_space_anomaly',
          text: 'Investigate the mysterious object in space',
          consequence: 'Discover alien artifacts and new evidence',
          nextScene: 'space_mystery'
        },
        {
          id: 'study_transformation',
          text: 'Study how the train achieved space flight',
          consequence: 'Uncover advanced technology and its implications',
          nextScene: 'space_mystery'
        }
      ],
      phase: 'space'
    },
    {
      id: 'cyborg_revelation',
      title: 'The Mechanical Mind',
      narration: 'In the deepest part of the space-faring express, you discover that not all passengers are what they seem...',
      dialogue: [
        {
          character: 'narrator',
          text: 'Whirring gears and pulsing lights reveal the truth: some passengers are not entirely human.'
        },
        {
          character: 'watson',
          text: 'Holmes, this passenger... they\'re part machine! How do we solve mysteries when the suspects might not even be human?',
          emotion: 'concerned'
        },
        {
          character: 'holmes',
          text: 'Fascinating! The principles of deduction remain the same, Watson. Logic, evidence, and reasoning apply whether the suspect has flesh, gears, or both.',
          emotion: 'mysterious'
        },
        {
          character: 'npc',
          text: 'SYSTEM ALERT: DETECTIVE PROTOCOLS ENGAGED. I AM... WAS... AM HUMAN. THE MEMORIES ARE CONFLICTED.',
          emotion: 'mysterious'
        }
      ],
      choices: [
        {
          id: 'communicate_with_cyborg',
          text: 'Attempt to communicate with the cyborg',
          consequence: 'Learn about the fusion of human and machine',
          nextScene: 'final_mystery'
        },
        {
          id: 'analyze_technology',
          text: 'Analyze the cybernetic technology',
          consequence: 'Discover the scientific principles behind the transformation',
          nextScene: 'final_mystery'
        }
      ],
      phase: 'cyborg'
    }
  ];

  useEffect(() => {
    const scene = storyScenes.find(s => s.id === state.narrative.currentScene) || storyScenes[0];
    setCurrentScene(scene);
    setCurrentDialogueIndex(0);
    setShowChoices(false);
  }, [state.narrative.currentScene]);

  const handleNextDialogue = () => {
    if (!currentScene) return;

    if (currentDialogueIndex < currentScene.dialogue.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1);
    } else {
      setShowChoices(true);
    }
  };

  const handleChoice = (choice: Choice) => {
    if (choice.nextScene) {
      dispatch({ type: 'PROGRESS_NARRATIVE', payload: choice.nextScene });
    }
    
    dispatch({
      type: 'PROGRESS_NARRATIVE',
      payload: `Player chose: ${choice.text} - ${choice.consequence}`
    });
  };

  const getCharacterStyle = (character: string) => {
    const baseStyle = {
      padding: '15px 20px',
      borderRadius: '10px',
      margin: '10px 0',
      border: '2px solid',
    };

    switch (character) {
      case 'watson':
        return {
          ...baseStyle,
          background: 'linear-gradient(145deg, #8b4513, #cd7f32)',
          borderColor: '#b8860b',
          color: '#f5f5dc',
        };
      case 'holmes':
        return {
          ...baseStyle,
          background: 'linear-gradient(145deg, #2c2c2c, #708090)',
          borderColor: '#cd7f32',
          color: '#f5f5dc',
        };
      case 'narrator':
        return {
          ...baseStyle,
          background: 'linear-gradient(145deg, rgba(44,44,44,0.8), rgba(112,128,144,0.8))',
          borderColor: '#b8860b',
          color: '#f5f5dc',
          fontStyle: 'italic',
        };
      case 'npc':
        return {
          ...baseStyle,
          background: 'linear-gradient(145deg, #663399, #4682b4)',
          borderColor: '#00ff00',
          color: '#c0c0c0',
        };
      default:
        return baseStyle;
    }
  };

  const getCharacterName = (character: string) => {
    switch (character) {
      case 'watson': return '🚂 Dr. Watson (Conductor)';
      case 'holmes': return '🕵️ Detective Holmes';
      case 'narrator': return '📖 Narrator';
      case 'npc': return '🤖 Mysterious Figure';
      default: return character;
    }
  };

  if (!currentScene) return null;

  return (
    <div className="narrative-system">
      <div className={`story-container ${currentScene.phase}`}>
        <div className="story-header">
          <h2>{currentScene.title}</h2>
          <div className="phase-indicator">
            {currentScene.phase === 'steampunk' && '🎭 Victorian Era'}
            {currentScene.phase === 'space' && '🌌 Space Journey'}
            {currentScene.phase === 'cyborg' && '🤖 Cyborg Encounter'}
          </div>
        </div>

        <div className="story-narration">
          <p>{currentScene.narration}</p>
        </div>

        <div className="dialogue-container">
          {currentScene.dialogue.slice(0, currentDialogueIndex + 1).map((line, index) => (
            <div 
              key={index}
              className="dialogue-line"
              style={getCharacterStyle(line.character)}
            >
              <div className="character-name">
                {getCharacterName(line.character)}
              </div>
              <div className="dialogue-text">
                {line.text}
              </div>
            </div>
          ))}
        </div>

        {!showChoices && (
          <div className="dialogue-controls">
            <button 
              className="steampunk-btn next-btn"
              onClick={handleNextDialogue}
            >
              {currentDialogueIndex < currentScene.dialogue.length - 1 ? 'Continue' : 'Make Your Choice'}
            </button>
          </div>
        )}

        {showChoices && currentScene.choices && (
          <div className="story-choices">
            <h3>What do you choose to do?</h3>
            <div className="choices-container">
              {currentScene.choices.map((choice) => (
                <button
                  key={choice.id}
                  className="story-choice steampunk-btn"
                  onClick={() => handleChoice(choice)}
                >
                  <div className="choice-text">{choice.text}</div>
                  <div className="choice-consequence">→ {choice.consequence}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="narrative-progress">
          <div className="progress-indicator">
            Scene {storyScenes.findIndex(s => s.id === currentScene.id) + 1} of {storyScenes.length}
          </div>
          <div className="current-phase">
            Current Phase: {currentScene.phase.charAt(0).toUpperCase() + currentScene.phase.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
}