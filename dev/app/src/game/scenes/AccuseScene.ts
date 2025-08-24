import Phaser from 'phaser'
import caseData from '../../data/case_01.json'

export class AccuseScene extends Phaser.Scene {
  private selectedSuspect: string | null = null
  private evidence: string[] = []

  constructor() {
    super({ key: 'Accuse' })
  }

  init(data: any) {
    this.evidence = data.evidence || []
  }

  create() {
    const { width, height } = this.cameras.main

    // Dark courtroom-style background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0f0a)

    // Title
    this.add.text(width / 2, 50, 'MAKE YOUR ACCUSATION', {
      fontSize: '32px',
      fontFamily: 'serif',
      color: '#d4af37',
      stroke: '#8b4513',
      strokeThickness: 2
    }).setOrigin(0.5)

    // Subtitle
    this.add.text(width / 2, 90, 'Who do you believe is the murderer?', {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#ffffff'
    }).setOrigin(0.5)

    // Display suspects
    this.createSuspectSelection()

    // Evidence summary
    this.createEvidenceSummary()

    // Accusation button
    this.createAccusationButton()

    // Back button
    const backButton = this.add.text(50, 50, '← Back to Investigation', {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setInteractive()

    backButton.on('pointerdown', () => {
      this.scene.start('Carriage')
    })
  }

  private createSuspectSelection() {
    const startY = 150
    const spacing = 150

    caseData.suspects.forEach((suspect, index) => {
      const x = 200 + (index * spacing)
      const y = startY

      // Suspect portrait
      const portrait = this.add.image(x, y, suspect.sprite.replace('.png', ''))
        .setScale(0.8)
        .setInteractive()
        .setData('suspectId', suspect.id)

      // Suspect name
      const nameText = this.add.text(x, y + 80, suspect.name, {
        fontSize: '16px',
        fontFamily: 'serif',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5)

      // Occupation
      const occupationText = this.add.text(x, y + 100, suspect.occupation, {
        fontSize: '12px',
        fontFamily: 'serif',
        color: '#cccccc',
        align: 'center'
      }).setOrigin(0.5)

      // Selection border
      const border = this.add.rectangle(x, y, 120, 140, 0x000000, 0)
        .setStrokeStyle(3, 0x666666)
        .setData('suspectId', suspect.id)

      // Click handlers
      const selectSuspect = () => {
        this.selectSuspect(suspect.id, border)
      }

      portrait.on('pointerdown', selectSuspect)
      border.setInteractive().on('pointerdown', selectSuspect)

      // Hover effects
      portrait.on('pointerover', () => {
        portrait.setTint(0xffffaa)
        border.setStrokeStyle(3, 0xffff00)
      })

      portrait.on('pointerout', () => {
        if (this.selectedSuspect !== suspect.id) {
          portrait.clearTint()
          border.setStrokeStyle(3, 0x666666)
        }
      })
    })
  }

  private selectSuspect(suspectId: string, border: Phaser.GameObjects.Rectangle) {
    // Clear previous selection
    this.children.getAll().forEach(child => {
      if (child.getData && child.getData('suspectId') && child instanceof Phaser.GameObjects.Rectangle) {
        (child as Phaser.GameObjects.Rectangle).setStrokeStyle(3, 0x666666)
      }
      if (child.getData && child.getData('suspectId') && child instanceof Phaser.GameObjects.Image) {
        (child as Phaser.GameObjects.Image).clearTint()
      }
    })

    // Highlight selected
    this.selectedSuspect = suspectId
    border.setStrokeStyle(4, 0x00ff00)
    
    const portrait = this.children.getAll().find(child => 
      child instanceof Phaser.GameObjects.Image && 
      child.getData('suspectId') === suspectId
    ) as Phaser.GameObjects.Image
    
    if (portrait) {
      portrait.setTint(0xaaffaa)
    }

    this.sound.play('click', { volume: 0.5 })
  }

  private createEvidenceSummary() {
    const startY = 320
    
    this.add.text(100, startY, 'Evidence Collected:', {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#d4af37'
    })

    // List evidence
    this.evidence.forEach((evidenceId, index) => {
      const clue = caseData.clues.find(c => c.id === evidenceId)
      if (clue) {
        this.add.text(120, startY + 30 + (index * 25), `• ${clue.name}`, {
          fontSize: '14px',
          fontFamily: 'serif',
          color: '#ffffff'
        })
      }
    })

    if (this.evidence.length === 0) {
      this.add.text(120, startY + 30, 'No evidence collected yet', {
        fontSize: '14px',
        fontFamily: 'serif',
        color: '#888888'
      })
    }
  }

  private createAccusationButton() {
    const { width, height } = this.cameras.main
    
    const accuseButton = this.add.text(width / 2, height - 80, 'MAKE ACCUSATION', {
      fontSize: '24px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#cc0000',
      padding: { x: 30, y: 12 }
    }).setOrigin(0.5).setInteractive()

    accuseButton.on('pointerdown', () => {
      if (this.selectedSuspect) {
        this.makeAccusation()
      } else {
        this.showMessage('Please select a suspect first!')
      }
    })

    accuseButton.on('pointerover', () => {
      accuseButton.setBackgroundColor('#ff0000')
    })

    accuseButton.on('pointerout', () => {
      accuseButton.setBackgroundColor('#cc0000')
    })
  }

  private makeAccusation() {
    if (!this.selectedSuspect) return

    // Check if accusation is correct
    const suspects = caseData.suspects
    const accusedSuspect = suspects.find(s => s.id === this.selectedSuspect)
    
    // For demo purposes, let's make one suspect the killer randomly or based on room killer_id
    const gameManager = (this.game as any).gameManager
    const room = gameManager?.getRoom()
    const correctKiller = room?.killerId || 'zane' // Default to Captain Zane for demo

    const isCorrect = this.selectedSuspect === correctKiller

    // Transition to debrief scene with results
    this.scene.start('Debrief', {
      accusedSuspect: accusedSuspect,
      isCorrect: isCorrect,
      evidence: this.evidence,
      correctKiller: correctKiller
    })
  }

  private showMessage(message: string) {
    const popup = this.add.container(512, 300)
    
    const bg = this.add.rectangle(0, 0, 300, 100, 0x000000, 0.9)
      .setStrokeStyle(2, 0xffffff)
    
    const text = this.add.text(0, 0, message, {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5)
    
    popup.add([bg, text])
    
    this.time.delayedCall(2000, () => {
      popup.destroy()
    })
    
    popup.setInteractive(new Phaser.Geom.Rectangle(-150, -50, 300, 100), Phaser.Geom.Rectangle.Contains)
    popup.on('pointerdown', () => {
      popup.destroy()
    })
  }
}