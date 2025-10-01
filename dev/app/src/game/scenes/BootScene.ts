import * as Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  preload() {
    console.log('BootScene: Starting preload...')

    // Error handler
    this.load.on('loaderror', (file: any) => {
      console.warn('Failed to load:', file.src)
    })

    // Load character sprites (SVG)
    this.load.svg('lestrange', '/images/characters/lestrange.svg', { width: 200, height: 300 })
    this.load.svg('gaspard', '/images/characters/gaspard.svg', { width: 200, height: 300 })
    this.load.svg('zane', '/images/characters/zane.svg', { width: 200, height: 300 })

    // Load evidence items (SVG)
    this.load.svg('bloody_knife', '/images/items/knife.svg', { width: 100, height: 100 })
    this.load.svg('torn_letter', '/images/items/letter.svg', { width: 100, height: 100 })
    this.load.svg('ancient_book', '/images/items/book.svg', { width: 100, height: 100 })
    this.load.svg('mechanical_piece', '/images/items/gear.svg', { width: 100, height: 100 })
    this.load.svg('wine_glass', '/images/items/glass.svg', { width: 100, height: 100 })
    this.load.svg('flight_log', '/images/items/logbook.svg', { width: 100, height: 100 })

    // Load UI elements (SVG)
    this.load.svg('lens_icon', '/images/ui/lens_icon.svg', { width: 60, height: 60 })

    // Load logo (SVG)
    this.load.svg('logo', '/images/logo.svg', { width: 400, height: 120 })

    console.log('BootScene: Loading game assets...')

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