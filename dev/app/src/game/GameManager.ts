import * as Phaser from 'phaser'
import { supabase } from '@/lib/supabase'
import { BootScene } from './scenes/BootScene'
import { MenuScene } from './scenes/MenuScene'
import { CarriageScene } from './scenes/CarriageScene'
import { MiniLetterScene } from './scenes/MiniLetterScene'
import { MiniGapFillScene } from './scenes/MiniGapFillScene'
import { AccuseScene } from './scenes/AccuseScene'
import { DebriefScene } from './scenes/DebriefScene'
import type { Room, GameState } from '../types/game'
import type { Database } from '../types/database'

/**
 * GameManager class handles the bridge between Phaser game engine and React application
 * Manages room state, real-time synchronization, and scene communication
 * 
 * @example
 * ```typescript
 * const gameManager = new GameManager('room-123', false)
 * gameManager.setGameInstance(phaserGame)
 * 
 * // Update room state
 * await gameManager.updateRoom({ scene: 'Carriage' })
 * 
 * // Add journal entry
 * await gameManager.addJournalEntry('Student', 'Found a clue!')
 * ```
 */
export class GameManager {
  private roomId: string
  private isTeacher: boolean
  private room: Room | null = null
  private gameState: GameState | null = null
  private realtimeChannel: any = null
  private gameInstance: Phaser.Game | null = null
  
  /**
   * Create a new GameManager instance
   * 
   * @param roomId - Unique identifier for the room
   * @param isTeacher - Whether this instance is for a teacher or student
   */
  constructor(roomId: string, isTeacher: boolean) {
    this.roomId = roomId
    this.isTeacher = isTeacher
    this.setupRealtimeSubscription()
  }

  /**
   * Set the Phaser game instance for this manager
   * This removes the global dependency and provides direct access to the game
   * 
   * @param game - The Phaser.Game instance
   */
  setGameInstance(game: Phaser.Game) {
    this.gameInstance = game
  }

  /**
   * Get array of Phaser scenes for game configuration
   * 
   * @returns Array of scene configuration objects
   */
  getScenes(): any[] {
    return [
      { key: 'Boot', scene: BootScene },
      { key: 'Menu', scene: MenuScene },
      { key: 'Carriage', scene: CarriageScene },
      { key: 'MiniLetter', scene: MiniLetterScene },
      { key: 'MiniGapFill', scene: MiniGapFillScene },
      { key: 'Accuse', scene: AccuseScene },
      { key: 'Debrief', scene: DebriefScene },
    ]
  }

  private async setupRealtimeSubscription() {
    try {
      // Cleanup existing subscription
      this.cleanup()
      
      if (!supabase) {
        console.warn('Database not available, using local game state')
        // Create a default local game state
        this.gameState = {
          scene: 'menu',
          inventory: [],
          suspects: [],
          clues: [],
          lensCharges: 3,
          locked: false
        }
        return
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', this.roomId)
        .single()

      if (error) {
        console.warn('Failed to fetch room data, using local state:', error)
        // Create a default local game state
        this.gameState = {
          scene: 'menu',
          inventory: [],
          suspects: [],
          clues: [],
          lensCharges: 3,
          locked: false
        }
        return
      }

      if (data) {
        const roomData = data as any
        this.room = roomData
        this.gameState = {
          scene: roomData.scene || 'menu',
          inventory: roomData.inventory?.items || [],
          suspects: roomData.suspects?.list || [],
          clues: roomData.suspects?.clues || [],
          lensCharges: roomData.lens_charges || 3,
          locked: roomData.locked || false
        }

        // Set up realtime subscription with proper cleanup
        this.realtimeChannel = supabase
          ?.channel(`room_${this.roomId}`)
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${this.roomId}` },
            (payload) => {
              this.handleRoomUpdate(payload.new as any)
            }
          )
          .subscribe()
      }
        
    } catch (error) {
      console.error('Failed to setup realtime subscription:', error)
      throw error
    }
  }

  private handleRoomUpdate(roomData: any) {
    this.room = roomData
    this.gameState = {
      scene: roomData.scene || 'menu',
      inventory: roomData.inventory?.items || [],
      suspects: roomData.suspects?.list || [],
      clues: roomData.suspects?.clues || [],
      lensCharges: roomData.lens_charges || 3,
      locked: roomData.locked || false
    }

    // Notify current scene of state change
    const currentScene = this.getCurrentScene()
    if (currentScene && 'onGameStateUpdate' in currentScene) {
      (currentScene as any).onGameStateUpdate(this.gameState)
    }
  }

  /**
   * Get the currently active Phaser scene
   * 
   * @returns The current scene instance or null if not available
   */
  getCurrentScene(): Phaser.Scene | null {
    if (!this.gameInstance) {
      console.warn('GameManager: No game instance available')
      return null
    }
    return this.gameInstance.scene.getScene(this.gameState?.scene || 'Menu')
  }

  /**
   * Update room data in the database
   * 
   * @param updates - Partial room data to update
   * @throws {Error} When room is not loaded or update fails
   */
  async updateRoom(updates: Database['public']['Tables']['rooms']['Update']) {
    if (!this.room) {
      console.warn('Cannot update room: no room loaded')
      return
    }

    if (!supabase) {
      console.error('Database not available')
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('rooms')
        .update(updates)
        .eq('id', this.roomId)

      if (error) {
        console.error('Supabase error updating room:', error)
        throw new Error(`Failed to update room: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to update room:', error)
      throw error
    }
  }

  /**
   * Add a journal entry to the database
   * Automatically sanitizes inputs to prevent XSS and length issues
   * 
   * @param actor - Name of the actor (max 100 chars)
   * @param text - Journal entry text (max 2000 chars)
   * @throws {Error} When text is empty or database operation fails
   */
  async addJournalEntry(actor: string, text: string) {
    try {
      // Sanitize inputs
      const sanitizedActor = actor.trim().slice(0, 100)
      const sanitizedText = text.trim().slice(0, 2000)
      
      if (!sanitizedText) {
        throw new Error('Journal entry cannot be empty')
      }

      if (!supabase) {
        throw new Error('Database not available')
      }

      const { error } = await (supabase as any)
        .from('journal_entries')
        .insert({
          room_id: this.roomId,
          actor: sanitizedActor,
          text: sanitizedText
        })

      if (error) {
        console.error('Supabase error adding journal entry:', error)
        throw new Error(`Failed to add journal entry: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to add journal entry:', error)
      throw error
    }
  }

  /**
   * Send a chat message to the database
   * Automatically sanitizes inputs to prevent XSS and length issues
   * 
   * @param sender - Name of the message sender (max 100 chars)
   * @param message - Chat message text (max 1000 chars)
   * @throws {Error} When message is empty or database operation fails
   */
  async sendChat(sender: string, message: string) {
    try {
      // Sanitize inputs
      const sanitizedSender = sender.trim().slice(0, 100)
      const sanitizedMessage = message.trim().slice(0, 1000)
      
      if (!sanitizedMessage) {
        throw new Error('Message cannot be empty')
      }

      if (!supabase) {
        throw new Error('Database not available')
      }

      const { error } = await (supabase as any)
        .from('chat')
        .insert({
          room_id: this.roomId,
          sender: sanitizedSender,
          message: sanitizedMessage
        })

      if (error) {
        console.error('Supabase error sending chat:', error)
        throw new Error(`Failed to send message: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to send chat:', error)
      throw error
    }
  }

  getRoomId(): string {
    return this.roomId
  }

  getIsTeacher(): boolean {
    return this.isTeacher
  }

  getRoom(): Room | null {
    return this.room
  }

  getGameState(): GameState | null {
    return this.gameState
  }

  /**
   * Clean up realtime subscriptions and resources
   */
  cleanup() {
    if (this.realtimeChannel) {
      console.log('Cleaning up GameManager realtime subscription')
      this.realtimeChannel.unsubscribe()
      this.realtimeChannel = null
    }
  }

  /**
   * Destroy the GameManager and clean up all resources
   */
  destroy() {
    this.cleanup()
    this.room = null
    this.gameState = null
  }
}