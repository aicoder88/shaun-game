import * as Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  preload() {
    this.load.image('logo', '/images/logo.png')
    this.load.image('carriage_bg', '/images/carriage_bg.jpg')
    this.load.image('menu_bg', '/images/menu_bg.jpg')
    
    // Character sprites
    this.load.image('lestrange', '/images/lestrange.png')
    this.load.image('gaspard', '/images/gaspard.png')
    this.load.image('zane', '/images/zane.png')
    this.load.image('victim', '/images/victim.png')
    
    // UI elements
    this.load.image('inventory_panel', '/images/ui/inventory_panel.png')
    this.load.image('journal_panel', '/images/ui/journal_panel.png')
    this.load.image('lens_icon', '/images/ui/lens_icon.png')
    this.load.image('button', '/images/ui/button.png')
    
    // Items
    this.load.image('knife', '/images/items/knife.png')
    this.load.image('letter', '/images/items/letter.png')
    this.load.image('book', '/images/items/book.png')
    this.load.image('gear', '/images/items/gear.png')
    this.load.image('glass', '/images/items/glass.png')
    this.load.image('logbook', '/images/items/logbook.png')
    
    // Audio
    this.load.audio('train_ambient', '/audio/train_ambient.ogg')
    this.load.audio('click', '/audio/click.ogg')
    this.load.audio('discovery', '/audio/discovery.ogg')
    this.load.audio('mystery', '/audio/mystery.ogg')
    
    // Bitmap font for retro styling
    this.load.bitmapFont('steampunk', '/fonts/steampunk.png', '/fonts/steampunk.fnt')

    // Loading bar
    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(240, 270, 320, 50)

    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading Murder on the Bullet Express...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    })
    loadingText.setOrigin(0.5, 0.5)

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    })
    percentText.setOrigin(0.5, 0.5)

    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%')
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      progressBar.fillRect(250, 280, 300 * value, 30)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
    })
  }

  create() {
    // Add a subtle delay for loading screen visibility
    this.time.delayedCall(1000, () => {
      this.scene.start('Menu')
    })
  }
}