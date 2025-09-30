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
  scene: string
  teacher_id: string | null
  student_id: string | null
  killer_id: string | null
  lens_charges: number
  inventory: Record<string, any>
  hotspots: Record<string, any>
  suspects: Record<string, any>
  locked: boolean
  created_at: string
  updated_at: string
}

export interface RoomInsert {
  id?: string
  code: string
  scene?: string
  teacher_id?: string | null
  student_id?: string | null
  killer_id?: string | null
  lens_charges?: number
  inventory?: Record<string, any>
  hotspots?: Record<string, any>
  suspects?: Record<string, any>
  locked?: boolean
  created_at?: string
  updated_at?: string
}

export interface RoomUpdate {
  id?: string
  code?: string
  scene?: string
  teacher_id?: string | null
  student_id?: string | null
  killer_id?: string | null
  lens_charges?: number
  inventory?: Record<string, any>
  hotspots?: Record<string, any>
  suspects?: Record<string, any>
  locked?: boolean
  created_at?: string
  updated_at?: string
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
  type: 'letter-reconstruction' | 'gap-fill' | 'confession-patchwork'
  difficulty: number
  data: any
}

export interface JournalEntry {
  id: string
  room_id: string
  actor: string
  text: string
  created_at: string
}

export interface ChatMessage {
  id: string
  room_id: string
  sender: string
  message: string
  created_at: string
}

export interface GrammarMistake {
  id: string
  timestamp: string
  suspect: string
  incorrectText: string
  correctForm: string
  grammarRule: string
  error: string
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface DifficultySettings {
  level: DifficultyLevel
  autoAdjust: boolean
  vocabularyMaxDifficulty: number
  grammarComplexity: number
  hintsEnabled: boolean
  hintDelay: number
  clueHighlighting: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'grammar' | 'vocabulary' | 'investigation' | 'engagement' | 'milestone'
  requirement: {
    type: 'grammar_accuracy' | 'vocabulary_count' | 'clues_found' | 'dialogues_completed' | 'minigame_score' | 'case_progress' | 'perfect_grammar' | 'chat_messages'
    threshold: number
  }
  earnedAt?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface ProgressCheckpoint {
  id: string
  name: string
  description: string
  progress: number
  completed: boolean
  completedAt?: string
  rewards?: {
    achievements?: string[]
    lensCharges?: number
    message?: string
  }
}

export interface StudentAnalytics {
  // Session info
  sessionStartTime: string
  sessionDuration: number
  currentScene: string

  // Grammar performance
  grammarMistakes: GrammarMistake[]
  grammarAccuracy: number
  totalGrammarAttempts: number
  correctGrammarAttempts: number

  // Vocabulary progress
  discoveredWords: string[]
  vocabularyProgress: number
  totalVocabularyWords: number

  // Investigation metrics
  cluesDiscovered: number
  totalClues: number
  lensChargesUsed: number
  dialoguesCompleted: string[]
  minigamesCompleted: string[]
  minigameScores: Record<string, number>

  // Engagement metrics
  journalEntries: number
  chatMessages: number
  suspectInteractions: number

  // Progress
  caseProgress: number
  estimatedCompletionTime: number
}
