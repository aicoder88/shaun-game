import * as Phaser from 'phaser'
import { GameManager } from '../GameManager'
import caseData from '../../data/case_01.json'

export class CarriageScene extends Phaser.Scene {
  private gameManager: GameManager | null = null
  private hotspots: Phaser.GameObjects.Zone[] = []
  private suspects: Phaser.GameObjects.Image[] = []
  private lensCharges = 3
  private discoveredClues: string[] = []

  constructor() {
    super({ key: 'Carriage' })
  }

  create() {
    const { width, height } = this.cameras.main
    
    // Background
    this.add.image(width / 2, height / 2, 'carriage_bg').setDisplaySize(width, height)
    
    // Get game manager reference
    this.gameManager = (this.game as any).gameManager as GameManager
    
    // Create interactive hotspots based on case data
    this.createHotspots()
    
    // Place suspects in the scene
    this.placeSuspects()
    
    // Add victim body
    this.add.image(300, 250, 'victim').setScale(0.7).setTint(0x888888)
    
    // Setup click handlers for investigation
    this.input.on('pointerdown', this.handleSceneClick, this)
    
    // Add UI indicators (will be handled by overlay)
    this.events.emit('scene-ready', {
      lensCharges: this.lensCharges,
      suspects: caseData.suspects.map(s => s.name),
      clues: this.discoveredClues
    })
  }

  private createHotspots() {
    const scene = caseData.scenes.find(s => s.id === 'carriage')
    if (!scene) return

    scene.hotspots.forEach(hotspot => {
      const zone = this.add.zone(
        hotspot.x + hotspot.width / 2,
        hotspot.y + hotspot.height / 2,
        hotspot.width,
        hotspot.height
      )
      
      zone.setInteractive()
      zone.setData('hotspot', hotspot)
      
      // Visual indicator for hotspots (debug mode)
      if (process.env.NODE_ENV === 'development') {
        const rect = this.add.rectangle(
          hotspot.x + hotspot.width / 2,
          hotspot.y + hotspot.height / 2,
          hotspot.width,
          hotspot.height,
          0x00ff00,
          0.2
        )
        rect.setStrokeStyle(2, 0x00ff00)
      }

      zone.on('pointerdown', () => this.handleHotspotClick(hotspot))
      this.hotspots.push(zone)
    })
  }

  private placeSuspects() {
    const positions = [
      { x: 150, y: 300 }, // LeStrange
      { x: 450, y: 250 }, // Gaspard  
      { x: 350, y: 350 }  // Zane
    ]

    caseData.suspects.forEach((suspect, index) => {
      const pos = positions[index] || positions[0]
      const sprite = this.add.image(pos.x, pos.y, suspect.sprite.replace('.png', ''))
        .setScale(0.6)
        .setInteractive()
        .setData('suspect', suspect)

      sprite.on('pointerdown', () => this.handleSuspectClick(suspect))
      sprite.on('pointerover', () => {
        sprite.setTint(0xffffaa)
        this.input.setDefaultCursor('pointer')
      })
      sprite.on('pointerout', () => {
        sprite.clearTint()
        this.input.setDefaultCursor('default')
      })

      this.suspects.push(sprite)
    })
  }

  private handleSceneClick(pointer: Phaser.Input.Pointer) {
    // General scene interaction
  }

  private handleHotspotClick(hotspot: any) {
    switch (hotspot.interactionType) {
      case 'examine':
        this.examineHotspot(hotspot)
        break
      case 'pickup':
        this.pickupItem(hotspot)
        break
      case 'dialogue':
        this.startDialogue(hotspot.targetId)
        break
      case 'minigame':
        this.startMinigame(hotspot.targetId)
        break
    }
  }

  private examineHotspot(hotspot: any) {
    // Check for clues at this location
    const clue = caseData.clues.find(c => c.location === hotspot.id)
    
    if (clue && !this.discoveredClues.includes(clue.id)) {
      if (clue.requiredInsight && this.lensCharges <= 0) {
        this.showMessage('You need Insight Lens charges to examine this thoroughly.')
        return
      }

      if (clue.requiredInsight) {
        this.lensCharges--
        this.events.emit('lens-used', this.lensCharges)
      }

      this.discoveredClues.push(clue.id)
      this.showClueDiscovery(clue)
      
      // Add to journal
      this.gameManager?.addJournalEntry('Detective', `Discovered: ${clue.name} - ${clue.description}`)
    } else {
      this.showMessage(hotspot.description)
    }
  }

  private pickupItem(hotspot: any) {
    const clue = caseData.clues.find(c => c.location === hotspot.id)
    if (clue && !this.discoveredClues.includes(clue.id)) {
      this.discoveredClues.push(clue.id)
      this.showClueDiscovery(clue)
      this.events.emit('item-collected', clue)
    }
  }

  private startDialogue(suspectId: string) {
    const suspect = caseData.suspects.find(s => s.id === suspectId)
    if (suspect) {
      this.events.emit('dialogue-start', suspect)
    }
  }

  private startMinigame(gameId: string) {
    const minigame = caseData.minigames.find(m => m.id === gameId)
    if (minigame) {
      if (minigame.type === 'letter-reconstruction') {
        this.scene.start('MiniLetter', { minigame })
      } else if (minigame.type === 'gap-fill') {
        this.scene.start('MiniGapFill', { minigame })
      }
    }
  }

  private handleSuspectClick(suspect: any) {
    this.startDialogue(suspect.id)
  }

  private showClueDiscovery(clue: any) {
    this.sound.play('discovery', { volume: 0.7 })
    
    // Create discovery animation
    const popup = this.add.container(512, 288)
    
    const bg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.9)
      .setStrokeStyle(3, 0xd4af37)
    
    const title = this.add.text(0, -60, 'CLUE DISCOVERED!', {
      fontSize: '24px',
      fontFamily: 'serif',
      color: '#d4af37',
      align: 'center'
    }).setOrigin(0.5)
    
    const name = this.add.text(0, -20, clue.name, {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5)
    
    const desc = this.add.text(0, 20, clue.description, {
      fontSize: '14px',
      fontFamily: 'serif',
      color: '#cccccc',
      align: 'center',
      wordWrap: { width: 350 }
    }).setOrigin(0.5)
    
    popup.add([bg, title, name, desc])
    popup.setScale(0)
    
    this.tweens.add({
      targets: popup,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    })
    
    // Auto-close after 3 seconds or on click
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: popup,
        scale: 0,
        alpha: 0,
        duration: 200,
        onComplete: () => popup.destroy()
      })
    })
    
    popup.setInteractive(new Phaser.Geom.Rectangle(-200, -100, 400, 200), Phaser.Geom.Rectangle.Contains)
    popup.on('pointerdown', () => {
      popup.destroy()
    })
  }

  private showMessage(message: string) {
    this.events.emit('show-message', message)
  }

  onGameStateUpdate(gameState: any) {
    // Handle real-time updates from teacher
    if (gameState.locked !== undefined) {
      this.setInteractionLocked(gameState.locked)
    }
    
    if (gameState.lensCharges !== undefined) {
      this.lensCharges = gameState.lensCharges
      this.events.emit('lens-updated', this.lensCharges)
    }
  }

  private setInteractionLocked(locked: boolean) {
    this.hotspots.forEach(zone => zone.input!.enabled = !locked)
    this.suspects.forEach(sprite => sprite.input!.enabled = !locked)
  }
}