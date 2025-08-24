import Phaser from 'phaser'
import { supabase } from '@/lib/supabase'
import { BootScene } from './scenes/BootScene'
import { MenuScene } from './scenes/MenuScene'
import { CarriageScene } from './scenes/CarriageScene'
import { MiniLetterScene } from './scenes/MiniLetterScene'
import { MiniGapFillScene } from './scenes/MiniGapFillScene'
import { AccuseScene } from './scenes/AccuseScene'
import { DebriefScene } from './scenes/DebriefScene'
import type { Room, GameState } from '../types/game'

export class GameManager {
  private roomId: string
  private isTeacher: boolean
  private room: Room | null = null
  private gameState: GameState | null = null
  
  constructor(roomId: string, isTeacher: boolean) {
    this.roomId = roomId
    this.isTeacher = isTeacher
    this.setupRealtimeSubscription()
  }

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
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', this.roomId)
      .single()

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
    }

    supabase
      .channel(`room_${this.roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${this.roomId}` },
        (payload) => {
          this.handleRoomUpdate(payload.new as any)
        }
      )
      .subscribe()
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

  getCurrentScene(): Phaser.Scene | null {
    const game = (globalThis as any).game as Phaser.Game
    if (!game) return null
    return game.scene.getScene(this.gameState?.scene || 'Menu')
  }

  async updateRoom(updates: Partial<any>) {
    if (!this.room) return

    const { error } = await (supabase as any)
      .from('rooms')
      .update(updates)
      .eq('id', this.roomId)

    if (error) {
      console.error('Failed to update room:', error)
    }
  }

  async addJournalEntry(actor: string, text: string) {
    const { error } = await (supabase as any)
      .from('journal_entries')
      .insert({
        room_id: this.roomId,
        actor,
        text
      })

    if (error) {
      console.error('Failed to add journal entry:', error)
    }
  }

  async sendChat(sender: string, message: string) {
    const { error } = await (supabase as any)
      .from('chat')
      .insert({
        room_id: this.roomId,
        sender,
        message
      })

    if (error) {
      console.error('Failed to send chat:', error)
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
}