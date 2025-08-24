import Phaser from 'phaser'

interface Gap {
  id: string
  position: number
  correctAnswer: string
  options: string[]
  grammarPoint: string
}

export class MiniGapFillScene extends Phaser.Scene {
  private transcript = ''
  private gaps: Gap[] = []
  private selectedAnswers: Map<string, string> = new Map()
  private currentGapIndex = 0
  private gapButtons: Phaser.GameObjects.Text[][] = []
  private audioKey = ''

  constructor() {
    super({ key: 'MiniGapFill' })
  }

  init(data: any) {
    const minigame = data.minigame
    this.transcript = minigame.data.transcript
    this.gaps = minigame.data.gaps
    this.audioKey = minigame.data.audioFile.replace('.ogg', '')
  }

  create() {
    const { width, height } = this.cameras.main

    // Dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a)

    // Title
    this.add.text(width / 2, 50, 'Wine Tasting Conversation', {
      fontSize: '24px',
      fontFamily: 'serif',
      color: '#d4af37'
    }).setOrigin(0.5)

    // Instructions
    this.add.text(width / 2, 80, 'Listen to the conversation and fill in the missing words', {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffffff'
    }).setOrigin(0.5)

    // Audio controls
    this.createAudioControls()

    // Display transcript with gaps
    this.createTranscriptDisplay()

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

    // Check button
    const checkButton = this.add.text(width - 150, height - 100, 'Check Answers', {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#006600',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive()

    checkButton.on('pointerdown', () => {
      this.checkAnswers()
    })
  }

  private createAudioControls() {
    const { width } = this.cameras.main
    
    // Play button
    const playButton = this.add.text(width / 2 - 50, 130, '▶ Play Audio', {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#4444aa',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive()

    playButton.on('pointerdown', () => {
      // Since we don't have actual audio files, simulate audio playback
      this.simulateAudioPlayback()
    })

    // Speed controls
    const speedSlow = this.add.text(width / 2 + 50, 130, '0.7x', {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setInteractive()

    const speedNormal = this.add.text(width / 2 + 100, 130, '1.0x', {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#888888',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setInteractive()

    // Highlight normal speed as selected
    speedNormal.setBackgroundColor('#4444aa')
  }

  private createTranscriptDisplay() {
    const { width } = this.cameras.main
    let yPos = 200
    
    // Split transcript into words and create interactive gaps
    const words = this.transcript.split(' ')
    let currentLine = ''
    let lineWords: Phaser.GameObjects.Text[] = []
    let xPos = 100

    words.forEach((word, index) => {
      // Check if this position should be a gap
      const gap = this.gaps.find(g => this.transcript.indexOf(word) === g.position)
      
      if (gap) {
        // Create gap selector
        this.createGapSelector(gap, xPos, yPos)
        xPos += 120
      } else {
        // Regular word
        const wordText = this.add.text(xPos, yPos, word, {
          fontSize: '16px',
          fontFamily: 'serif',
          color: '#ffffff'
        })
        
        xPos += wordText.width + 10
      }

      // Line wrapping
      if (xPos > width - 100) {
        xPos = 100
        yPos += 40
      }
    })
  }

  private createGapSelector(gap: Gap, x: number, y: number) {
    // Create dropdown-style selector
    const currentAnswer = this.selectedAnswers.get(gap.id) || '___'
    
    const gapButton = this.add.text(x, y, currentAnswer, {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 8, y: 4 }
    }).setInteractive()

    // Store button reference
    if (!this.gapButtons[this.gaps.indexOf(gap)]) {
      this.gapButtons[this.gaps.indexOf(gap)] = []
    }

    gapButton.setData('gap', gap)
    gapButton.on('pointerdown', () => {
      this.showGapOptions(gap, gapButton)
    })
  }

  private showGapOptions(gap: Gap, button: Phaser.GameObjects.Text) {
    // Create options popup
    const popup = this.add.container(button.x, button.y + 50)
    const options: Phaser.GameObjects.Text[] = []

    gap.options.forEach((option, index) => {
      const optionButton = this.add.text(0, index * 35, option, {
        fontSize: '16px',
        fontFamily: 'serif',
        color: '#000000',
        backgroundColor: '#f0f0f0',
        padding: { x: 12, y: 6 }
      }).setInteractive().setOrigin(0.5)

      optionButton.on('pointerdown', () => {
        this.selectedAnswers.set(gap.id, option)
        button.setText(option)
        
        // Color code based on correctness (for immediate feedback)
        if (option === gap.correctAnswer) {
          button.setBackgroundColor('#ccffcc')
        } else {
          button.setBackgroundColor('#ffcccc')
        }
        
        popup.destroy()
      })

      optionButton.on('pointerover', () => {
        optionButton.setBackgroundColor('#e0e0e0')
      })

      optionButton.on('pointerout', () => {
        optionButton.setBackgroundColor('#f0f0f0')
      })

      options.push(optionButton)
      popup.add(optionButton)
    })

    // Add background
    const bg = this.add.rectangle(0, (gap.options.length - 1) * 17.5, 150, gap.options.length * 35, 0xffffff, 0.9)
    bg.setStrokeStyle(2, 0x333333)
    popup.addAt(bg, 0)

    // Close popup when clicking elsewhere
    const closeHandler = () => {
      popup.destroy()
      this.input.off('pointerdown', closeHandler)
    }

    this.time.delayedCall(100, () => {
      this.input.on('pointerdown', closeHandler)
    })
  }

  private simulateAudioPlayback() {
    // Show audio playing indicator
    const indicator = this.add.text(512, 160, 'Playing audio...', {
      fontSize: '14px',
      fontFamily: 'serif',
      color: '#ffff00'
    }).setOrigin(0.5)

    // Simulate audio duration
    this.time.delayedCall(3000, () => {
      indicator.destroy()
    })

    // Play mystery sound as placeholder
    this.sound.play('mystery', { volume: 0.5 })
  }

  private checkAnswers() {
    let correctCount = 0
    let totalGaps = this.gaps.length

    this.gaps.forEach((gap) => {
      const selectedAnswer = this.selectedAnswers.get(gap.id)
      if (selectedAnswer === gap.correctAnswer) {
        correctCount++
      }
    })

    const percentage = Math.round((correctCount / totalGaps) * 100)
    let message = ''
    let color = '#ffffff'

    if (percentage >= 80) {
      message = `Excellent! ${correctCount}/${totalGaps} correct (${percentage}%)`
      color = '#00ff00'
      this.sound.play('discovery', { volume: 0.8 })
    } else if (percentage >= 60) {
      message = `Good work! ${correctCount}/${totalGaps} correct (${percentage}%)`
      color = '#ffff00'
    } else {
      message = `Keep practicing! ${correctCount}/${totalGaps} correct (${percentage}%)`
      color = '#ff6666'
    }

    // Show results popup
    const popup = this.add.container(512, 300)
    
    const bg = this.add.rectangle(0, 0, 500, 200, 0x000000, 0.95)
      .setStrokeStyle(3, parseInt(color.replace('#', ''), 16))
    
    const resultText = this.add.text(0, -40, message, {
      fontSize: '20px',
      fontFamily: 'serif',
      color: color,
      align: 'center'
    }).setOrigin(0.5)

    const grammarTip = this.add.text(0, 0, 'Grammar Focus: Past tenses in crime narratives', {
      fontSize: '14px',
      fontFamily: 'serif',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5)
    
    const continueBtn = this.add.text(0, 60, 'Continue Investigation', {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive()

    continueBtn.on('pointerdown', () => {
      this.scene.start('Carriage')
    })
    
    popup.add([bg, resultText, grammarTip, continueBtn])
    popup.setAlpha(0)
    
    this.tweens.add({
      targets: popup,
      alpha: 1,
      duration: 500
    })
  }
}