import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Room, GameState, JournalEntry, ChatMessage } from '@murder-express/shared'

interface GameStore {
  // Room state
  room: Room | null
  loading: boolean
  error: string | null
  
  // Game state
  gameState: GameState | null
  journalEntries: JournalEntry[]
  chatMessages: ChatMessage[]
  
  // User state
  isTeacher: boolean
  userId: string | null
  
  // Actions
  setRoom: (room: Room | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setGameState: (gameState: GameState | null) => void
  addJournalEntry: (entry: JournalEntry) => void
  addChatMessage: (message: ChatMessage) => void
  setJournalEntries: (entries: JournalEntry[]) => void
  setChatMessages: (messages: ChatMessage[]) => void
  setIsTeacher: (isTeacher: boolean) => void
  setUserId: (userId: string | null) => void
  
  // API actions
  updateRoom: (roomId: string, updates: Partial<any>) => Promise<void>
  sendChatMessage: (roomId: string, sender: string, message: string) => Promise<void>
  addJournalEntryToDb: (roomId: string, actor: string, text: string) => Promise<void>
  
  // Real-time subscriptions
  subscriptions: Map<string, any>
  setupRealTimeSubscription: (roomId: string) => void
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
    try {
      const { error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to update room:', error)
      set({ error: 'Failed to update room' })
    }
  },

  sendChatMessage: async (roomId, sender, message) => {
    try {
      const { error } = await supabase
        .from('chat')
        .insert({
          room_id: roomId,
          sender,
          message
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to send chat message:', error)
      set({ error: 'Failed to send message' })
    }
  },

  addJournalEntryToDb: async (roomId, actor, text) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          room_id: roomId,
          actor,
          text
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to add journal entry:', error)
      set({ error: 'Failed to add journal entry' })
    }
  },

  // Real-time subscriptions
  setupRealTimeSubscription: (roomId) => {
    const { subscriptions, cleanupSubscriptions } = get()
    
    // Clean up existing subscriptions
    cleanupSubscriptions()

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

// Hook for easy access to common actions
export const useGameActions = () => {
  const store = useGameStore()
  
  return {
    updateRoom: store.updateRoom,
    sendChatMessage: store.sendChatMessage,
    addJournalEntry: store.addJournalEntryToDb,
    setupRealtimeSubscription: store.setupRealTimeSubscription,
    cleanupSubscriptions: store.cleanupSubscriptions
  }
}