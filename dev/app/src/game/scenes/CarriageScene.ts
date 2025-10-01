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

    // Create procedural steampunk carriage background
    this.createCarriageBackground(width, height)
    
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
      // Emit to Phaser event system
      this.events.emit('dialogue-start', suspect)

      // Emit custom event for React to listen to
      window.dispatchEvent(new CustomEvent('dialogue-start', { detail: suspect }))
    }
  }

  private startMinigame(gameId: string) {
    const minigame = caseData.minigames.find(m => m.id === gameId)
    if (minigame) {
      if (minigame.type === 'letter-reconstruction') {
        this.scene.start('MiniLetter', { minigame })
      } else if (minigame.type === 'gap-fill') {
        this.scene.start('MiniGapFill', { minigame })
      } else if (minigame.type === 'confession-patchwork') {
        this.scene.start('MiniConfession', { minigame })
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

  private createCarriageBackground(width: number, height: number) {
    // Create a beautiful steampunk train carriage using Phaser graphics

    // Base gradient background - rich purples and golds
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x2C1B47, 0x2C1B47, 0x1A0E2E, 0x1A0E2E, 1, 1, 1, 1)
    bg.fillRect(0, 0, width, height)

    // Starfield through windows
    for (let i = 0; i < 30; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height / 2),
        Phaser.Math.Between(1, 2),
        0xFFFFFF,
        Phaser.Math.FloatBetween(0.3, 0.8)
      )
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.2, 0.9),
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      })
    }

    // Floor (dark wood planks)
    const floor = this.add.graphics()
    floor.fillGradientStyle(0x3E2723, 0x3E2723, 0x2C1810, 0x2C1810, 1, 1, 1, 1)
    floor.fillRect(0, height * 0.7, width, height * 0.3)

    // Wood plank lines
    for (let i = 0; i < 8; i++) {
      floor.lineStyle(2, 0x1A0A00, 0.5)
      floor.lineBetween(i * (width / 8), height * 0.7, i * (width / 8), height)
    }

    // Left wall (ornate Victorian wallpaper pattern)
    const leftWall = this.add.graphics()
    leftWall.fillStyle(0x4A148C, 1)
    leftWall.fillRect(0, height * 0.2, width * 0.15, height * 0.5)

    // Wallpaper pattern
    for (let y = height * 0.2; y < height * 0.7; y += 40) {
      for (let x = 10; x < width * 0.15; x += 40) {
        leftWall.lineStyle(1, 0x7B1FA2, 0.6)
        leftWall.strokeCircle(x, y, 8)
      }
    }

    // Right wall
    const rightWall = this.add.graphics()
    rightWall.fillStyle(0x4A148C, 1)
    rightWall.fillRect(width * 0.85, height * 0.2, width * 0.15, height * 0.5)

    // Wallpaper pattern
    for (let y = height * 0.2; y < height * 0.7; y += 40) {
      for (let x = width * 0.85 + 10; x < width; x += 40) {
        rightWall.lineStyle(1, 0x7B1FA2, 0.6)
        rightWall.strokeCircle(x, y, 8)
      }
    }

    // Windows (showing space)
    this.createWindow(width * 0.2, height * 0.15, 120, 180)
    this.createWindow(width * 0.45, height * 0.15, 120, 180)
    this.createWindow(width * 0.7, height * 0.15, 120, 180)

    // Ornate ceiling
    const ceiling = this.add.graphics()
    ceiling.fillGradientStyle(0x6A1B9A, 0x6A1B9A, 0x4A148C, 0x4A148C, 1, 1, 1, 1)
    ceiling.fillRect(0, 0, width, height * 0.15)

    // Ceiling molding
    ceiling.lineStyle(4, 0xD4AF37, 1)
    ceiling.lineBetween(0, height * 0.15, width, height * 0.15)

    // Gas lamps (brass fixtures)
    this.createGasLamp(width * 0.25, height * 0.3)
    this.createGasLamp(width * 0.75, height * 0.3)

    // Velvet seats
    this.createSeat(width * 0.15, height * 0.55, 140, 100, 0x8B0000)
    this.createSeat(width * 0.78, height * 0.55, 140, 100, 0x006400)

    // Dining table (center)
    const table = this.add.graphics()
    table.fillStyle(0x5D4037, 1)
    table.fillEllipse(width * 0.5, height * 0.6, 200, 100)
    table.lineStyle(3, 0x3E2723, 1)
    table.strokeEllipse(width * 0.5, height * 0.6, 200, 100)

    // Table items (tea set, documents)
    const teacup = this.add.ellipse(width * 0.45, height * 0.58, 20, 15, 0xFFFFFF, 0.8)
    const saucer = this.add.ellipse(width * 0.45, height * 0.6, 30, 20, 0xF5F5DC, 0.6)

    // Bookshelf (left side)
    this.createBookshelf(width * 0.08, height * 0.4, 80, 180)

    // Atmospheric particles (dust in light)
    for (let i = 0; i < 15; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(height * 0.2, height * 0.7),
        1,
        0xFFFFFF,
        0.3
      )
      this.tweens.add({
        targets: particle,
        y: particle.y + Phaser.Math.Between(-30, 30),
        x: particle.x + Phaser.Math.Between(-10, 10),
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1
      })
    }
  }

  private createWindow(x: number, y: number, width: number, height: number) {
    const graphics = this.add.graphics()

    // Window frame (brass)
    graphics.lineStyle(6, 0xCD7F32, 1)
    graphics.strokeRect(x - width / 2, y, width, height)

    // Window panes with space view
    graphics.fillGradientStyle(0x0A0A2E, 0x0A0A2E, 0x1A1A3E, 0x1A1A3E, 1, 1, 1, 1)
    graphics.fillRect(x - width / 2 + 3, y + 3, width - 6, height - 6)

    // Cross bars
    graphics.lineStyle(4, 0xCD7F32, 1)
    graphics.lineBetween(x - width / 2, y + height / 2, x + width / 2, y + height / 2)
    graphics.lineBetween(x, y, x, y + height)

    // Add a few stars visible through window
    for (let i = 0; i < 5; i++) {
      const star = this.add.circle(
        x + Phaser.Math.Between(-width / 2, width / 2),
        y + Phaser.Math.Between(0, height),
        1.5,
        0xFFFFFF,
        0.8
      )
    }
  }

  private createGasLamp(x: number, y: number) {
    const graphics = this.add.graphics()

    // Brass fixture
    graphics.fillStyle(0xCD7F32, 1)
    graphics.fillRect(x - 8, y - 15, 16, 30)
    graphics.fillCircle(x, y - 25, 12)

    // Glass globe
    graphics.fillStyle(0xFFE4B5, 0.6)
    graphics.fillCircle(x, y, 20)

    // Glowing light
    const light = this.add.circle(x, y, 25, 0xFFD700, 0.3)
    this.tweens.add({
      targets: light,
      alpha: 0.2,
      scale: 1.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Highlight
    this.add.circle(x - 5, y - 5, 6, 0xFFFFFF, 0.6)
  }

  private createSeat(x: number, y: number, width: number, height: number, color: number) {
    const graphics = this.add.graphics()

    // Velvet cushion
    graphics.fillStyle(color, 1)
    graphics.fillRoundedRect(x - width / 2, y, width, height, 10)

    // Tufted pattern
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        graphics.lineStyle(2, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 0.8)
        const px = x - width / 3 + (i * width / 3)
        const py = y + 20 + (j * height / 3)
        graphics.strokeCircle(px, py, 8)
      }
    }

    // Wooden armrest
    graphics.fillStyle(0x5D4037, 1)
    graphics.fillRoundedRect(x + width / 2 - 10, y + 20, 15, height - 40, 5)
  }

  private createBookshelf(x: number, y: number, width: number, height: number) {
    const graphics = this.add.graphics()

    // Shelf frame
    graphics.fillStyle(0x3E2723, 1)
    graphics.fillRect(x, y, width, height)

    // Shelves
    for (let i = 0; i < 4; i++) {
      graphics.lineStyle(3, 0x5D4037, 1)
      graphics.lineBetween(x, y + (i * height / 4), x + width, y + (i * height / 4))
    }

    // Books
    const bookColors = [0x8B4513, 0x654321, 0x2C1810, 0x4A2511, 0x7C4A2B]
    for (let shelf = 0; shelf < 4; shelf++) {
      for (let book = 0; book < 5; book++) {
        const bookColor = Phaser.Utils.Array.GetRandom(bookColors)
        const bookHeight = Phaser.Math.Between(30, 45)
        graphics.fillStyle(bookColor, 1)
        graphics.fillRect(
          x + 5 + (book * 14),
          y + (shelf * height / 4) + (height / 4 - bookHeight - 5),
          12,
          bookHeight
        )
        // Book spine line
        graphics.lineStyle(1, 0xD4AF37, 0.5)
        graphics.lineBetween(
          x + 11 + (book * 14),
          y + (shelf * height / 4) + (height / 4 - bookHeight - 5),
          x + 11 + (book * 14),
          y + (shelf * height / 4) + (height / 4 - 5)
        )
      }
    }
  }
}
