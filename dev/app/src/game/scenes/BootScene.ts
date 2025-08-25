import * as Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  preload() {
    console.log('BootScene: Starting preload...')
    
    // Create simple colored rectangles as placeholders for missing images
    this.load.on('loaderror', (file: any) => {
      console.warn('Failed to load:', file.src)
    })

    // Skip loading missing assets - we'll create them programmatically
    console.log('BootScene: Skipping asset loading (assets not available)')

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