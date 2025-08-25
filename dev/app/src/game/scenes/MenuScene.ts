import * as Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' })
  }

  create() {
    const { width, height } = this.cameras.main
    console.log('MenuScene: Creating menu scene')

    // Background gradient instead of image
    const graphics = this.add.graphics()
    graphics.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f0f23, 0x0c0c1d)
    graphics.fillRect(0, 0, width, height)
    
    // Title
    const title = this.add.text(width / 2, 150, 'MURDER ON THE\nBULLET EXPRESS', {
      fontSize: '48px',
      fontFamily: 'serif',
      color: '#d4af37',
      align: 'center',
      stroke: '#8b4513',
      strokeThickness: 3
    }).setOrigin(0.5)

    // Subtitle
    const subtitle = this.add.text(width / 2, 220, 'An ESL Detective Mystery', {
      fontSize: '20px',
      fontFamily: 'serif',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5)

    // Train emoji as decoration
    const trainEmoji = this.add.text(width / 2, 300, '🚂', {
      fontSize: '64px'
    }).setOrigin(0.5)

    // Status text
    const statusText = this.add.text(width / 2, 400, 'Game Engine Loaded Successfully!\nReady to investigate mysteries.', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#a855f7',
      align: 'center'
    }).setOrigin(0.5)

    console.log('MenuScene: Scene created successfully')
  }

}