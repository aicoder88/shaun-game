import * as Phaser from 'phaser'
import caseData from '../../data/case_01.json'

export class DebriefScene extends Phaser.Scene {
  private accusedSuspect: any = null
  private isCorrect = false
  private evidence: string[] = []
  private correctKiller = ''

  constructor() {
    super({ key: 'Debrief' })
  }

  init(data: any) {
    this.accusedSuspect = data.accusedSuspect
    this.isCorrect = data.isCorrect
    this.evidence = data.evidence || []
    this.correctKiller = data.correctKiller
  }

  create() {
    const { width, height } = this.cameras.main

    // Background color based on success/failure
    const bgColor = this.isCorrect ? 0x0a1a0a : 0x1a0a0a
    this.add.rectangle(width / 2, height / 2, width, height, bgColor)

    if (this.isCorrect) {
      this.createSuccessScreen()
    } else {
      this.createFailureScreen()
    }

    this.createESLSummary()
    this.createNavigationButtons()

    // Play appropriate sound
    const soundKey = this.isCorrect ? 'discovery' : 'mystery'
    this.sound.play(soundKey, { volume: 0.8 })
  }

  private createSuccessScreen() {
    const { width } = this.cameras.main

    // Success title
    this.add.text(width / 2, 80, 'CASE SOLVED!', {
      fontSize: '36px',
      fontFamily: 'serif',
      color: '#00ff00',
      stroke: '#004400',
      strokeThickness: 3
    }).setOrigin(0.5)

    // Congratulations message
    this.add.text(width / 2, 130, `Excellent detective work! You correctly identified ${this.accusedSuspect.name} as the murderer.`, {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5)

    // Show the killer's confession
    this.createConfession()

    // Achievement unlocked
    this.add.text(width / 2, 220, '🎖️ Achievement Unlocked: Master Detective', {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffd700'
    }).setOrigin(0.5)
  }

  private createFailureScreen() {
    const { width } = this.cameras.main
    const correctSuspect = caseData.suspects.find(s => s.id === this.correctKiller)

    // Failure title
    this.add.text(width / 2, 80, 'CASE UNSOLVED', {
      fontSize: '36px',
      fontFamily: 'serif',
      color: '#ff6666',
      stroke: '#440000',
      strokeThickness: 3
    }).setOrigin(0.5)

    // Explanation
    this.add.text(width / 2, 130, `Your accusation of ${this.accusedSuspect.name} was incorrect.\nThe real killer was ${correctSuspect?.name}.`, {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5)

    // Show what was missed
    this.createMissedClues()

    // Encouragement
    this.add.text(width / 2, 220, 'Don\'t give up! Every great detective learns from their mistakes.', {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffcccc'
    }).setOrigin(0.5)
  }

  private createConfession() {
    const { width } = this.cameras.main
    const confessions: Record<string, string> = {
      'lestrange': 'Professor LeStrange confesses: "I had to protect my reputation! When they discovered my fake artifacts, my career would have been ruined. I couldn\'t let that happen."',
      'gaspard': 'Chef Gaspard confesses: "Mon Dieu! That terrible review destroyed everything! My restaurant, my dreams... I lost control when I saw them at dinner."',
      'zane': 'Captain Zane confesses: "The Aurora incident has haunted me for years. When they threatened to expose the truth about those deaths, I... I couldn\'t let my crew suffer for my mistakes."'
    }

    const confession = confessions[this.correctKiller] || 'The killer remains silent, but justice has been served.'

    const confessionBox = this.add.rectangle(width / 2, 290, 700, 80, 0x333333, 0.9)
      .setStrokeStyle(2, 0xd4af37)

    this.add.text(width / 2, 290, confession, {
      fontSize: '14px',
      fontFamily: 'serif',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 650 }
    }).setOrigin(0.5)
  }

  private createMissedClues() {
    const { width } = this.cameras.main
    const allClues = caseData.clues
    const missedClues = allClues.filter(clue => !this.evidence.includes(clue.id))

    if (missedClues.length > 0) {
      this.add.text(width / 2, 260, 'Clues you might have missed:', {
        fontSize: '16px',
        fontFamily: 'serif',
        color: '#ffaa00'
      }).setOrigin(0.5)

      missedClues.slice(0, 2).forEach((clue, index) => {
        this.add.text(width / 2, 290 + (index * 25), `• ${clue.name}: ${clue.description}`, {
          fontSize: '13px',
          fontFamily: 'serif',
          color: '#ffccaa',
          align: 'center',
          wordWrap: { width: 600 }
        }).setOrigin(0.5)
      })
    }
  }

  private createESLSummary() {
    const { width, height } = this.cameras.main
    const yStart = height - 200

    // ESL Learning Summary
    this.add.text(100, yStart, 'English Learning Summary:', {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#d4af37'
    })

    const learningPoints = [
      'Past tenses: You practiced using past simple, past continuous, and past perfect',
      'Crime vocabulary: murder, suspect, alibi, evidence, motive, clue',
      'Modal verbs: could, might, must for speculation and possibility',
      'Reading comprehension: analyzing clues and dialogue for meaning'
    ]

    learningPoints.forEach((point, index) => {
      this.add.text(120, yStart + 30 + (index * 20), `• ${point}`, {
        fontSize: '13px',
        fontFamily: 'serif',
        color: '#ffffff',
        wordWrap: { width: 500 }
      })
    })

    // Performance metrics
    const evidenceScore = Math.round((this.evidence.length / caseData.clues.length) * 100)
    this.add.text(width - 250, yStart, `Evidence Found: ${evidenceScore}%\nAccuracy: ${this.isCorrect ? '100%' : '0%'}`, {
      fontSize: '14px',
      fontFamily: 'serif',
      color: '#ffff00',
      align: 'right'
    })
  }

  private createNavigationButtons() {
    const { width, height } = this.cameras.main

    // Play Again button
    const playAgainButton = this.add.text(width / 2 - 120, height - 50, 'Play Again', {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#0066cc',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive()

    playAgainButton.on('pointerdown', () => {
      // Reset game and return to menu
      this.scene.start('Menu')
    })

    // Continue to Next Case button (placeholder)
    const nextCaseButton = this.add.text(width / 2 + 120, height - 50, 'Next Case', {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#cc6600',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive()

    nextCaseButton.on('pointerdown', () => {
      // Placeholder for future cases
      this.showMessage('More cases coming soon!')
    })

    // Hover effects
    playAgainButton.on('pointerover', () => playAgainButton.setBackgroundColor('#0088ff'))
    playAgainButton.on('pointerout', () => playAgainButton.setBackgroundColor('#0066cc'))
    
    nextCaseButton.on('pointerover', () => nextCaseButton.setBackgroundColor('#ff8800'))
    nextCaseButton.on('pointerout', () => nextCaseButton.setBackgroundColor('#cc6600'))
  }

  private showMessage(message: string) {
    const { width, height } = this.cameras.main
    const popup = this.add.container(width / 2, height / 2)
    
    const bg = this.add.rectangle(0, 0, 300, 120, 0x000000, 0.9)
      .setStrokeStyle(2, 0xffffff)
    
    const text = this.add.text(0, 0, message, {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5)
    
    const okButton = this.add.text(0, 40, 'OK', {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 5 }
    }).setOrigin(0.5).setInteractive()

    okButton.on('pointerdown', () => {
      popup.destroy()
    })
    
    popup.add([bg, text, okButton])
  }
}