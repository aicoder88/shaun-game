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
  type: 'letter-reconstruction' | 'gap-fill'
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