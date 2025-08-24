export interface GameState {
  scene: string
  inventory: InventoryItem[]
  suspects: Suspect[]
  clues: Clue[]
  lensCharges: number
  locked: boolean
}

export interface Room {
  id: string
  code: string
  teacherId?: string
  studentId?: string
  killerId?: string
  gameState: GameState
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  icon: string
  obtained: boolean
}

export interface Suspect {
  id: string
  name: string
  description: string
  dialogue: DialogueNode[]
  cluesFound: string[]
  suspicionLevel: number
  isKiller: boolean
}

export interface Clue {
  id: string
  name: string
  description: string
  location: string
  found: boolean
  requiredItems?: string[]
  requiredInsight?: boolean
}

export interface DialogueNode {
  id: string
  text: string
  responses: DialogueResponse[]
  englishFocus?: string
  grammarPoint?: string
}

export interface DialogueResponse {
  id: string
  text: string
  nextNodeId?: string
  requiresItem?: string
  requiresClue?: string
  revealsClue?: string
  addsInventory?: string
}

export interface Hotspot {
  id: string
  x: number
  y: number
  width: number
  height: number
  name: string
  description: string
  interactionType: 'examine' | 'pickup' | 'dialogue' | 'minigame'
  requiredItem?: string
  requiredInsight?: boolean
  discovered: boolean
}

export interface MiniGame {
  id: string
  type: 'letter-reconstruction' | 'gap-fill'
  difficulty: number
  data: any
}

export interface JournalEntry {
  id: string
  actor: string
  text: string
  timestamp: string
}

export interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
}