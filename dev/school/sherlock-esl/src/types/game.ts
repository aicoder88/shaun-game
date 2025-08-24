export interface Character {
  id: string;
  name: string;
  avatar: {
    hat: string;
    coat: string;
    accessories: string[];
    magnifyingGlass: boolean;
  };
  level: number;
  unlockedItems: string[];
}

export interface Evidence {
  id: string;
  name: string;
  description: string;
  location: string;
  found: boolean;
  piecesTogether?: boolean;
}

export interface Mystery {
  id: string;
  title: string;
  description: string;
  carriageNumber: number;
  suspects: Suspect[];
  evidence: Evidence[];
  solution: string;
  completed: boolean;
}

export interface Suspect {
  id: string;
  name: string;
  description: string;
  alibi: string;
  suspicious: boolean;
}

export interface GameState {
  player: Character;
  teacher: Character;
  currentCarriage: number;
  currentMystery: Mystery | null;
  mysteries: Mystery[];
  inventory: Evidence[];
  gamePhase: 'steampunk' | 'space' | 'cyborg';
  narrative: {
    currentScene: string;
    dialogueHistory: string[];
  };
}

export interface MiniGame {
  id: string;
  type: 'letterReconstruction' | 'evidenceSearch' | 'deduction';
  difficulty: number;
  completed: boolean;
}