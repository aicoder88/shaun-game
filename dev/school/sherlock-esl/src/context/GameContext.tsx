import React, { createContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Mystery, Evidence, Character } from '../types/game';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

type GameAction =
  | { type: 'SET_CURRENT_CARRIAGE'; payload: number }
  | { type: 'START_MYSTERY'; payload: Mystery }
  | { type: 'CLEAR_MYSTERY' }
  | { type: 'COMPLETE_MYSTERY'; payload: string }
  | { type: 'COLLECT_EVIDENCE'; payload: Evidence }
  | { type: 'CUSTOMIZE_CHARACTER'; payload: Partial<Character> }
  | { type: 'UNLOCK_ITEM'; payload: string }
  | { type: 'PROGRESS_NARRATIVE'; payload: string }
  | { type: 'ADVANCE_GAME_PHASE'; payload: 'steampunk' | 'space' | 'cyborg' };

const initialState: GameState = {
  player: {
    id: 'player',
    name: 'Sherlock Holmes',
    avatar: {
      hat: 'deerstalker',
      coat: 'brown',
      accessories: [],
      magnifyingGlass: true,
    },
    level: 1,
    unlockedItems: ['deerstalker', 'brown_coat', 'magnifying_glass'],
  },
  teacher: {
    id: 'teacher',
    name: 'Dr. Watson (Conductor)',
    avatar: {
      hat: 'conductor_cap',
      coat: 'conductor_uniform',
      accessories: ['pocket_watch'],
      magnifyingGlass: false,
    },
    level: 1,
    unlockedItems: [],
  },
  currentCarriage: 1,
  currentMystery: null,
  mysteries: [],
  inventory: [],
  gamePhase: 'steampunk',
  narrative: {
    currentScene: 'boarding_train',
    dialogueHistory: [],
  },
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CURRENT_CARRIAGE':
      return { ...state, currentCarriage: action.payload };
    
    case 'START_MYSTERY':
      return { ...state, currentMystery: action.payload };
    
    case 'CLEAR_MYSTERY':
      return { ...state, currentMystery: null };
    
    case 'COMPLETE_MYSTERY':
      return {
        ...state,
        currentMystery: null,
        mysteries: state.mysteries.map(m => 
          m.id === action.payload ? { ...m, completed: true } : m
        ),
      };
    
    case 'COLLECT_EVIDENCE':
      return {
        ...state,
        inventory: [...state.inventory, action.payload],
      };
    
    case 'CUSTOMIZE_CHARACTER':
      return {
        ...state,
        player: { ...state.player, ...action.payload },
      };
    
    case 'UNLOCK_ITEM':
      return {
        ...state,
        player: {
          ...state.player,
          unlockedItems: [...state.player.unlockedItems, action.payload],
        },
      };
    
    case 'PROGRESS_NARRATIVE':
      return {
        ...state,
        narrative: {
          ...state.narrative,
          currentScene: action.payload,
          dialogueHistory: [...state.narrative.dialogueHistory, action.payload],
        },
      };
    
    case 'ADVANCE_GAME_PHASE':
      return { ...state, gamePhase: action.payload };
    
    default:
      return state;
  }
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

