import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Room, GameState, JournalEntry, ChatMessage, StudentAnalytics, GrammarMistake, DifficultyLevel, DifficultySettings, Achievement, ProgressCheckpoint } from '../types/game'
import type { Database } from '../types/database'
import { getDifficultyManager } from '@/lib/DifficultyManager'
import caseData from '../data/case_01.json'
import achievementsData from '../data/achievements.json'

/**
 * Game store interface for managing application state
 * Handles room state, real-time subscriptions, and database operations
 */
interface GameStore {
  // Room state
  /** Current room data */
  room: Room | null
  /** Loading state for UI feedback */
  loading: boolean
  /** Error message for user display */
  error: string | null
  
  // Game state
  /** Current game state (scene, inventory, etc.) */
  gameState: GameState | null
  /** List of journal entries for current room */
  journalEntries: JournalEntry[]
  /** List of chat messages for current room */
  chatMessages: ChatMessage[]
  /** Grammar mistakes made by students for analytics */
  grammarMistakes: GrammarMistake[]
  /** Vocabulary words discovered by students */
  discoveredWords: string[]
  /** Student analytics data */
  analytics: StudentAnalytics | null
  /** Session start time */
  sessionStartTime: number
  /** Difficulty settings */
  difficultySettings: DifficultySettings
  /** Last difficulty check timestamp */
  lastDifficultyCheck: number
  /** Achievements earned by student */
  achievements: Achievement[]
  /** Progress checkpoints */
  checkpoints: ProgressCheckpoint[]
  /** Pending achievement to show */
  pendingAchievement: Achievement | null
  /** Perfect grammar streak counter */
  perfectGrammarStreak: number

  // User state
  /** Whether current user is a teacher or student */
  isTeacher: boolean
  /** Current user's ID */
  userId: string | null
  
  // State setters
  /** Set the current room data */
  setRoom: (room: Room | null) => void
  /** Set loading state */
  setLoading: (loading: boolean) => void
  /** Set error message */
  setError: (error: string | null) => void
  /** Set current game state */
  setGameState: (gameState: GameState | null) => void
  /** Add a new journal entry to local state */
  addJournalEntry: (entry: JournalEntry) => void
  /** Add a new chat message to local state */
  addChatMessage: (message: ChatMessage) => void
  /** Replace all journal entries */
  setJournalEntries: (entries: JournalEntry[]) => void
  /** Replace all chat messages */
  setChatMessages: (messages: ChatMessage[]) => void
  /** Add a grammar mistake for tracking */
  addGrammarMistake: (mistake: GrammarMistake) => void
  /** Add a discovered vocabulary word */
  addDiscoveredWord: (word: string) => void
  /** Update analytics with new data */
  updateAnalytics: () => void
  /** Track clue discovery */
  trackClueDiscovered: () => void
  /** Track dialogue completion */
  trackDialogueCompleted: (suspectId: string) => void
  /** Track mini-game completion */
  trackMinigameCompleted: (gameId: string, score: number) => void
  /** Track lens charge used */
  trackLensUsed: () => void
  /** Check and adjust difficulty based on performance */
  checkDifficultyAdjustment: () => void
  /** Set difficulty level */
  setDifficultyLevel: (level: DifficultyLevel) => void
  /** Get filtered vocabulary based on difficulty */
  getFilteredVocabulary: () => any[]
  /** Check and award achievements */
  checkAchievements: () => void
  /** Clear pending achievement */
  clearPendingAchievement: () => void
  /** Track correct grammar attempt */
  trackCorrectGrammar: () => void
  /** Update checkpoints based on progress */
  updateCheckpoints: () => void
  /** Set whether user is teacher */
  setIsTeacher: (isTeacher: boolean) => void
  /** Set current user ID */
  setUserId: (userId: string | null) => void
  
  // Database operations
  /** Update room data in Supabase */
  updateRoom: (roomId: string, updates: Partial<any>) => Promise<void>
  /** Send a chat message to Supabase */
  sendChatMessage: (roomId: string, sender: string, message: string) => Promise<void>
  /** Add a journal entry to Supabase */
  addJournalEntryToDb: (roomId: string, actor: string, text: string) => Promise<void>
  
  // Real-time subscriptions
  /** Map of active Supabase subscriptions */
  subscriptions: Map<string, any>
  /** Set up real-time subscriptions for a room */
  setupRealTimeSubscription: (roomId: string) => void
  /** Clean up all real-time subscriptions */
  cleanupSubscriptions: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  room: null,
  loading: false,
  error: null,
  gameState: null,
  journalEntries: [],
  chatMessages: [],
  grammarMistakes: [],
  discoveredWords: [],
  analytics: null,
  sessionStartTime: Date.now(),
  difficultySettings: getDifficultyManager().getSettings(),
  lastDifficultyCheck: Date.now(),
  achievements: achievementsData.achievements as Achievement[],
  checkpoints: achievementsData.checkpoints as ProgressCheckpoint[],
  pendingAchievement: null,
  perfectGrammarStreak: 0,
  isTeacher: false,
  userId: null,
  subscriptions: new Map(),

  // Setters
  setRoom: (room) => set({ room }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setGameState: (gameState) => set({ gameState }),
  addJournalEntry: (entry) => 
    set((state) => ({ journalEntries: [...state.journalEntries, entry] })),
  addChatMessage: (message) => 
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setJournalEntries: (entries) => set({ journalEntries: entries }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addGrammarMistake: (mistake) =>
    set((state) => ({ grammarMistakes: [...state.grammarMistakes, mistake] })),
  addDiscoveredWord: (word) =>
    set((state) => {
      const normalized = word.toLowerCase()
      if (state.discoveredWords.includes(normalized)) {
        return state
      }
      const newState = { discoveredWords: [...state.discoveredWords, normalized] }
      get().updateAnalytics()
      return newState
    }),

  updateAnalytics: () =>
    set((state) => {
      const sessionDuration = Math.floor((Date.now() - state.sessionStartTime) / 1000)
      const totalVocab = (caseData.vocabulary as any[]).length
      const totalClues = (caseData.clues as any[]).length

      const analytics: StudentAnalytics = {
        sessionStartTime: new Date(state.sessionStartTime).toISOString(),
        sessionDuration,
        currentScene: state.gameState?.scene || 'menu',

        grammarMistakes: state.grammarMistakes,
        grammarAccuracy: state.grammarMistakes.length > 0
          ? Math.round((1 - state.grammarMistakes.length / (state.grammarMistakes.length * 2)) * 100)
          : 100,
        totalGrammarAttempts: state.grammarMistakes.length * 2,
        correctGrammarAttempts: state.grammarMistakes.length,

        discoveredWords: state.discoveredWords,
        vocabularyProgress: totalVocab > 0
          ? Math.round((state.discoveredWords.length / totalVocab) * 100)
          : 0,
        totalVocabularyWords: totalVocab,

        cluesDiscovered: state.analytics?.cluesDiscovered || 0,
        totalClues,
        lensChargesUsed: state.analytics?.lensChargesUsed || 0,
        dialoguesCompleted: state.analytics?.dialoguesCompleted || [],
        minigamesCompleted: state.analytics?.minigamesCompleted || [],
        minigameScores: state.analytics?.minigameScores || {},

        journalEntries: state.journalEntries.length,
        chatMessages: state.chatMessages.filter(m => m.sender !== 'Conductor Whibury').length,
        suspectInteractions: state.analytics?.suspectInteractions || 0,

        caseProgress: Math.round(
          ((state.analytics?.cluesDiscovered || 0) / totalClues) * 100
        ),
        estimatedCompletionTime: sessionDuration * 2
      }

      // Trigger difficulty check and achievement check after updating analytics
      setTimeout(() => {
        get().checkDifficultyAdjustment()
        get().checkAchievements()
        get().updateCheckpoints()
      }, 0)

      return { analytics }
    }),

  trackClueDiscovered: () =>
    set((state) => {
      const newAnalytics = state.analytics ? {
        ...state.analytics,
        cluesDiscovered: state.analytics.cluesDiscovered + 1
      } : null
      get().updateAnalytics()
      return { analytics: newAnalytics }
    }),

  trackDialogueCompleted: (suspectId) =>
    set((state) => {
      if (!state.analytics) {
        get().updateAnalytics()
        return state
      }

      if (state.analytics.dialoguesCompleted.includes(suspectId)) {
        return state
      }

      const newAnalytics = {
        ...state.analytics,
        dialoguesCompleted: [...state.analytics.dialoguesCompleted, suspectId],
        suspectInteractions: state.analytics.suspectInteractions + 1
      }

      return { analytics: newAnalytics }
    }),

  trackMinigameCompleted: (gameId, score) =>
    set((state) => {
      if (!state.analytics) {
        get().updateAnalytics()
        return state
      }

      const newAnalytics = {
        ...state.analytics,
        minigamesCompleted: state.analytics.minigamesCompleted.includes(gameId)
          ? state.analytics.minigamesCompleted
          : [...state.analytics.minigamesCompleted, gameId],
        minigameScores: {
          ...state.analytics.minigameScores,
          [gameId]: score
        }
      }

      return { analytics: newAnalytics }
    }),

  trackLensUsed: () =>
    set((state) => {
      if (!state.analytics) {
        get().updateAnalytics()
        return state
      }

      const newAnalytics = {
        ...state.analytics,
        lensChargesUsed: state.analytics.lensChargesUsed + 1
      }

      return { analytics: newAnalytics }
    }),

  checkDifficultyAdjustment: () => {
    const state = get()

    // Check every 2 minutes
    if (Date.now() - state.lastDifficultyCheck < 120000) {
      return
    }

    if (!state.analytics || state.isTeacher) {
      return
    }

    const manager = getDifficultyManager()
    const result = manager.analyzePerformance(state.analytics)

    if (result.shouldAdjust) {
      console.log(`[Difficulty] ${result.reason}`)
      manager.setDifficulty(result.recommendedLevel)

      set({
        difficultySettings: manager.getSettings(),
        lastDifficultyCheck: Date.now()
      })

      // Notify student of adjustment
      get().addJournalEntry({
        id: `${Date.now()}`,
        room_id: state.room?.id || '',
        actor: 'System',
        text: `Difficulty adjusted to ${result.recommendedLevel}. ${result.reason}`,
        created_at: new Date().toISOString()
      })
    } else {
      set({ lastDifficultyCheck: Date.now() })
    }
  },

  setDifficultyLevel: (level: DifficultyLevel) => {
    const manager = getDifficultyManager()
    manager.setDifficulty(level)
    set({ difficultySettings: manager.getSettings() })
  },

  getFilteredVocabulary: () => {
    const state = get()
    const vocabulary = caseData.vocabulary as any[]
    const manager = getDifficultyManager()

    return vocabulary.filter(word =>
      manager.shouldShowVocabulary(word.difficulty)
    )
  },

  checkAchievements: () => {
    const state = get()
    if (!state.analytics) return

    const newAchievements = state.achievements.map(achievement => {
      // Already earned
      if (achievement.earnedAt) return achievement

      let earned = false

      // Check requirement
      switch (achievement.requirement.type) {
        case 'grammar_accuracy':
          earned = state.analytics!.grammarAccuracy >= achievement.requirement.threshold
          break
        case 'vocabulary_count':
          earned = state.discoveredWords.length >= achievement.requirement.threshold
          break
        case 'clues_found':
          earned = state.analytics!.cluesDiscovered >= achievement.requirement.threshold
          break
        case 'dialogues_completed':
          earned = state.analytics!.dialoguesCompleted.length >= achievement.requirement.threshold
          break
        case 'minigame_score':
          earned = Object.values(state.analytics!.minigameScores).some(
            score => score >= achievement.requirement.threshold
          )
          break
        case 'case_progress':
          earned = state.analytics!.caseProgress >= achievement.requirement.threshold
          break
        case 'perfect_grammar':
          earned = state.perfectGrammarStreak >= achievement.requirement.threshold
          break
        case 'chat_messages':
          earned = state.analytics!.chatMessages >= achievement.requirement.threshold
          break
      }

      if (earned) {
        const updatedAchievement = {
          ...achievement,
          earnedAt: new Date().toISOString()
        }

        // Set as pending to show animation
        setTimeout(() => set({ pendingAchievement: updatedAchievement }), 100)

        // Log to journal
        get().addJournalEntry({
          id: `${Date.now()}-achievement`,
          room_id: state.room?.id || '',
          actor: 'System',
          text: `Achievement Unlocked: ${achievement.title} - ${achievement.description}`,
          created_at: new Date().toISOString()
        })

        return updatedAchievement
      }

      return achievement
    })

    set({ achievements: newAchievements })
  },

  clearPendingAchievement: () => set({ pendingAchievement: null }),

  trackCorrectGrammar: () => {
    set((state) => ({
      perfectGrammarStreak: state.perfectGrammarStreak + 1
    }))
    // Check for perfect grammar achievement
    get().checkAchievements()
  },

  updateCheckpoints: () => {
    const state = get()
    if (!state.analytics) return

    const updatedCheckpoints = state.checkpoints.map(checkpoint => {
      if (checkpoint.completed) return checkpoint

      const shouldComplete = state.analytics!.caseProgress >= checkpoint.progress

      if (shouldComplete) {
        const completed = {
          ...checkpoint,
          completed: true,
          completedAt: new Date().toISOString()
        }

        // Award checkpoint rewards
        if (checkpoint.rewards) {
          // Award achievements
          if (checkpoint.rewards.achievements) {
            checkpoint.rewards.achievements.forEach(achievementId => {
              const achievement = state.achievements.find(a => a.id === achievementId)
              if (achievement && !achievement.earnedAt) {
                get().checkAchievements()
              }
            })
          }

          // Award lens charges
          if (checkpoint.rewards.lensCharges && state.room) {
            const newCharges = (state.room.lens_charges || 0) + checkpoint.rewards.lensCharges
            get().updateRoom(state.room.id, { lens_charges: newCharges })
          }

          // Show message
          if (checkpoint.rewards.message) {
            get().addJournalEntry({
              id: `${Date.now()}-checkpoint`,
              room_id: state.room?.id || '',
              actor: 'Conductor Whibury',
              text: checkpoint.rewards.message,
              created_at: new Date().toISOString()
            })
          }
        }

        return completed
      }

      return checkpoint
    })

    set({ checkpoints: updatedCheckpoints })
  },

  setIsTeacher: (isTeacher) => set({ isTeacher }),
  setUserId: (userId) => set({ userId }),

  // API actions
  updateRoom: async (roomId, updates) => {
    if (!supabase) {
      set({ error: 'Database not available' })
      return
    }

    try {
      set({ error: null })
      const { error } = await (supabase as any)
        .from('rooms')
        .update(updates)
        .eq('id', roomId)

      if (error) {
        console.error('Supabase error updating room:', error)
        throw new Error(`Failed to update room: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to update room:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      set({ error: `Update failed: ${errorMessage}` })
    }
  },

  sendChatMessage: async (roomId, sender, message) => {
    if (!supabase) {
      set({ error: 'Database not available' })
      return
    }

    try {
      set({ error: null })
      
      // Sanitize message input
      const sanitizedMessage = message.trim().slice(0, 1000) // Limit to 1000 chars
      if (!sanitizedMessage) {
        throw new Error('Message cannot be empty')
      }

      const { error } = await (supabase as any)
        .from('chat')
        .insert({
          room_id: roomId,
          sender: sender.slice(0, 100), // Limit sender name
          message: sanitizedMessage
        })

      if (error) {
        console.error('Supabase error sending chat:', error)
        throw new Error(`Failed to send message: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to send chat message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      set({ error: `Message failed: ${errorMessage}` })
    }
  },

  addJournalEntryToDb: async (roomId, actor, text) => {
    if (!supabase) {
      set({ error: 'Database not available' })
      return
    }

    try {
      set({ error: null })
      
      // Sanitize inputs
      const sanitizedActor = actor.trim().slice(0, 100)
      const sanitizedText = text.trim().slice(0, 2000)
      
      if (!sanitizedText) {
        throw new Error('Journal entry cannot be empty')
      }

      const { error } = await (supabase as any)
        .from('journal_entries')
        .insert({
          room_id: roomId,
          actor: sanitizedActor,
          text: sanitizedText
        })

      if (error) {
        console.error('Supabase error adding journal entry:', error)
        throw new Error(`Failed to add journal entry: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to add journal entry:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      set({ error: `Journal update failed: ${errorMessage}` })
    }
  },

  // Real-time subscriptions
  setupRealTimeSubscription: (roomId) => {
    const { subscriptions, cleanupSubscriptions } = get()
    
    // Clean up existing subscriptions
    cleanupSubscriptions()

    if (!supabase) {
      console.error('Database not available')
      return
    }

    // Room updates
    const roomChannel = supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const room = payload.new as any
          set({ room })
          
          // Update game state
          const gameState: GameState = {
            scene: room.scene || 'menu',
            inventory: room.inventory?.items || [],
            suspects: room.suspects?.list || [],
            clues: room.suspects?.clues || [],
            lensCharges: room.lens_charges || 3,
            locked: room.locked || false
          }
          set({ gameState })
        }
      )
      .subscribe()

    // Journal entries
    const journalChannel = supabase
      .channel(`journal_${roomId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'journal_entries', filter: `room_id=eq.${roomId}` },
        (payload) => {
          get().addJournalEntry(payload.new as JournalEntry)
        }
      )
      .subscribe()

    // Chat messages
    const chatChannel = supabase
      .channel(`chat_${roomId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat', filter: `room_id=eq.${roomId}` },
        (payload) => {
          get().addChatMessage(payload.new as ChatMessage)
        }
      )
      .subscribe()

    // Store subscriptions for cleanup
    subscriptions.set('room', roomChannel)
    subscriptions.set('journal', journalChannel)
    subscriptions.set('chat', chatChannel)
  },

  cleanupSubscriptions: () => {
    const { subscriptions } = get()
    
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe()
    })
    
    subscriptions.clear()
  }
}))

/**
 * Hook for easy access to common game actions
 * Provides a simplified interface to the most frequently used store actions
 * 
 * @returns Object containing commonly used store actions
 * @example
 * ```tsx
 * const { updateRoom, sendChatMessage, addJournalEntry } = useGameActions()
 * 
 * // Update room state
 * await updateRoom(roomId, { locked: true })
 * 
 * // Send a chat message
 * await sendChatMessage(roomId, 'Teacher', 'Hello students!')
 * ```
 */
export const useGameActions = () => {
  const store = useGameStore()
  
  return {
    /** Update room data in database */
    updateRoom: store.updateRoom,
    /** Send a chat message */
    sendChatMessage: store.sendChatMessage,
    /** Add a journal entry */
    addJournalEntry: store.addJournalEntryToDb,
    /** Set up real-time subscriptions */
    setupRealtimeSubscription: store.setupRealTimeSubscription,
    /** Clean up subscriptions */
    cleanupSubscriptions: store.cleanupSubscriptions
  }
}