import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' })
  }

  create() {
    const { width, height } = this.cameras.main

    // Background
    this.add.image(width / 2, height / 2, 'menu_bg').setDisplaySize(width, height)
    
    // Dark overlay for better text visibility
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
    
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

    // Menu buttons will be controlled by the UI overlay
    // This scene serves as the visual background
    
    // Add some atmospheric elements
    this.createSteamParticles()
    this.playAmbientSound()
  }

  private createSteamParticles() {
    const particles = this.add.particles(100, 500, 'steam', {
      speed: { min: 10, max: 30 },
      lifespan: 3000,
      alpha: { start: 0.3, end: 0 },
      scale: { start: 0.1, end: 0.3 }
    })
  }

  private playAmbientSound() {
    if (!this.sound.get('train_ambient')) {
      this.sound.play('train_ambient', { loop: true, volume: 0.3 })
    }
  }
}