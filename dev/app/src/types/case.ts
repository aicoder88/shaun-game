export interface CaseData {
  id: string
  title: string
  description: string
  setting: string
  suspects: CaseSuspect[]
  clues: CaseClue[]
  scenes: CaseScene[]
  minigames: CaseMiniGame[]
  eslFocus: ESLFocus[]
}

export interface CaseSuspect {
  id: string
  name: string
  age: number
  occupation: string
  description: string
  appearance: string
  personality: string
  alibi: string
  motive?: string
  secretHistory: string
  dialogue: CaseDialogue[]
  sprite: string
}

export interface CaseClue {
  id: string
  name: string
  description: string
  location: string
  difficulty: number
  requiredItems?: string[]
  requiredInsight?: boolean
  revealsInfo: string
  eslGrammarPoint?: string
}

export interface CaseScene {
  id: string
  name: string
  description: string
  background: string
  hotspots: CaseHotspot[]
  ambientSound?: string
}

export interface CaseHotspot {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  description: string
  interactionType: 'examine' | 'pickup' | 'dialogue' | 'minigame'
  targetId?: string
  requiredItem?: string
  requiredInsight?: boolean
}

export interface CaseDialogue {
  id: string
  trigger: string
  nodes: CaseDialogueNode[]
}

export interface CaseDialogueNode {
  id: string
  speaker: string
  text: string
  responses?: CaseDialogueResponse[]
  grammarFocus?: string
  vocabulary?: string[]
  reveals?: string
}

export interface CaseDialogueResponse {
  id: string
  text: string
  nextNodeId?: string
  requires?: string
  reveals?: string
  grammarCorrect?: boolean
}

export interface CaseMiniGame {
  id: string
  type: 'letter-reconstruction' | 'gap-fill' | 'confession-patchwork'
  name: string
  description: string
  difficulty: number
  data: LetterReconstructionData | GapFillData | ConfessionPatchworkData
}

export interface LetterReconstructionData {
  originalText: string
  pieces: LetterPiece[]
  solution: string
}

export interface LetterPiece {
  id: string
  text: string
  x: number
  y: number
  rotation: number
  width: number
  height: number
}

export interface GapFillData {
  audioFile: string
  transcript: string
  gaps: Gap[]
  vocabulary: string[]
}

export interface Gap {
  id: string
  position: number
  correctAnswer: string
  options: string[]
  grammarPoint: string
}

export interface ConfessionPatchworkData {
  confessionText: string
  segments: ConfessionSegment[]
  fragments: ConfessionFragment[]
  vocabularyFocus?: string[]
  rewardClueId?: string
}

export interface ConfessionSegment {
  id: string
  label: string
  prompt: string
  grammarHint: string
  order: number
}

export interface ConfessionFragment {
  id: string
  text: string
  correctSegmentId: string
  hint: string
  isDecoy?: boolean
}

export interface ESLFocus {
  id: string
  type: 'grammar' | 'vocabulary' | 'listening' | 'reading'
  topic: string
  description: string
  examples: string[]
  difficulty: number
}
