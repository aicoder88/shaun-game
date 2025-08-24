import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Room, GameState, JournalEntry, ChatMessage } from '../types/game'
import type { Database } from '../types/database'

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