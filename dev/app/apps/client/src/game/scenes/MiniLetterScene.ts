import Phaser from 'phaser'

interface LetterPiece {
  id: string
  text: string
  x: number
  y: number
  rotation: number
  width: number
  height: number
}

export class MiniLetterScene extends Phaser.Scene {
  private pieces: Phaser.GameObjects.Text[] = []
  private originalPieces: LetterPiece[] = []
  private solution = ''
  private targetZones: Phaser.GameObjects.Zone[] = []
  private placedPieces: Map<string, Phaser.GameObjects.Text> = new Map()
  private isComplete = false

  constructor() {
    super({ key: 'MiniLetter' })
  }

  init(data: any) {
    const minigame = data.minigame
    this.originalPieces = minigame.data.pieces
    this.solution = minigame.data.solution
  }

  create() {
    const { width, height } = this.cameras.main

    // Dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a)

    // Title
    this.add.text(width / 2, 50, 'Reconstruct the Torn Letter', {
      fontSize: '24px',
      fontFamily: 'serif',
      color: '#d4af37'
    }).setOrigin(0.5)

    // Instructions
    this.add.text(width / 2, 80, 'Drag the pieces to reconstruct the blackmail letter', {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffffff'
    }).setOrigin(0.5)

    // Create reconstruction area
    this.createReconstructionArea()
    
    // Create letter pieces
    this.createLetterPieces()

    // Back button
    const backButton = this.add.text(50, 50, '← Back', {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setInteractive()

    backButton.on('pointerdown', () => {
      this.scene.start('Carriage')
    })
  }

  private createReconstructionArea() {
    const { width } = this.cameras.main
    
    // Create target zones for proper letter arrangement
    const zoneWidth = 150
    const zoneHeight = 40
    const startX = width / 2 - (zoneWidth * 2.5)
    const startY = 200

    for (let i = 0; i < 5; i++) {
      const zone = this.add.zone(
        startX + (i * zoneWidth),
        startY + Math.floor(i / 3) * (zoneHeight + 10),
        zoneWidth,
        zoneHeight
      )
      
      zone.setRectangleDropZone(zoneWidth, zoneHeight)
      zone.setData('index', i)
      
      // Visual indicator
      const rect = this.add.rectangle(
        zone.x, zone.y, zoneWidth, zoneHeight, 0x333333, 0.5
      ).setStrokeStyle(2, 0x666666)
      
      this.targetZones.push(zone)
    }
  }

  private createLetterPieces() {
    const startY = 400
    const spacing = 200

    this.originalPieces.forEach((piece, index) => {
      const text = this.add.text(
        100 + (index * spacing),
        startY,
        piece.text,
        {
          fontSize: '14px',
          fontFamily: 'serif',
          color: '#000000',
          backgroundColor: '#f0f0f0',
          padding: { x: 8, y: 4 }
        }
      ).setOrigin(0.5)
        .setRotation(Phaser.Math.DegToRad(piece.rotation))
        .setInteractive({ draggable: true })
        .setData('originalPiece', piece)

      // Drag events
      text.on('dragstart', (pointer: any, dragX: number, dragY: number) => {
        text.setTint(0xffff00)
      })

      text.on('drag', (pointer: any, dragX: number, dragY: number) => {
        text.x = dragX
        text.y = dragY
      })

      text.on('dragend', (pointer: any, dragX: number, dragY: number) => {
        text.clearTint()
      })

      text.on('drop', (pointer: any, target: Phaser.GameObjects.Zone) => {
        // Snap to drop zone
        text.x = target.x
        text.y = target.y
        text.setRotation(0) // Straighten when placed correctly
        
        const index = target.getData('index')
        this.placedPieces.set(`zone_${index}`, text)
        
        this.checkSolution()
      })

      this.pieces.push(text)
    })

    // Enable drop zones
    this.input.on('drop', (pointer: any, gameObject: Phaser.GameObjects.Text, dropZone: Phaser.GameObjects.Zone) => {
      gameObject.emit('drop', pointer, dropZone)
    })
  }

  private checkSolution() {
    if (this.placedPieces.size !== this.originalPieces.length) return

    // Check if pieces are in correct order
    const reconstructedText = Array.from({ length: this.originalPieces.length }, (_, i) => {
      const piece = this.placedPieces.get(`zone_${i}`)
      return piece ? piece.text : ''
    }).join(' ')

    const expectedOrder = [
      "Dear Captain",
      "Zane, I know", 
      "about the Aurora",
      "incident. Pay me",
      "10,000 pounds or"
    ]

    let correct = true
    for (let i = 0; i < expectedOrder.length; i++) {
      const piece = this.placedPieces.get(`zone_${i}`)
      if (!piece || piece.text !== expectedOrder[i]) {
        correct = false
        break
      }
    }

    if (correct) {
      this.completePuzzle()
    }
  }

  private completePuzzle() {
    if (this.isComplete) return
    this.isComplete = true

    this.sound.play('discovery', { volume: 0.8 })

    // Show completion message
    const popup = this.add.container(512, 288)
    
    const bg = this.add.rectangle(0, 0, 600, 300, 0x000000, 0.95)
      .setStrokeStyle(3, 0x00ff00)
    
    const title = this.add.text(0, -100, 'LETTER RECONSTRUCTED!', {
      fontSize: '28px',
      fontFamily: 'serif',
      color: '#00ff00'
    }).setOrigin(0.5)
    
    const content = this.add.text(0, -20, this.solution, {
      fontSize: '14px',
      fontFamily: 'serif',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5)

    const insight = this.add.text(0, 80, 'The letter reveals Captain Zane is being blackmailed about the Aurora incident!', {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffff00',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5)
    
    const continueBtn = this.add.text(0, 120, 'Continue Investigation', {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive()

    continueBtn.on('pointerdown', () => {
      // Add clue to journal and return to carriage
      this.scene.start('Carriage')
    })
    
    popup.add([bg, title, content, insight, continueBtn])
    popup.setAlpha(0)
    
    this.tweens.add({
      targets: popup,
      alpha: 1,
      duration: 500
    })
  }
}