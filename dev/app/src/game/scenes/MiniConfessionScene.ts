import * as Phaser from 'phaser'
import type { GameManager } from '../GameManager'
import type {
  ConfessionFragment,
  ConfessionPatchworkData,
  ConfessionSegment
} from '../../types/case'
import { useGameStore } from '@/stores/gameStore'

interface FragmentCard extends Phaser.GameObjects.Container {
  getData(key: 'fragment'): ConfessionFragment | undefined
  getData(key: 'homeX'): number
  getData(key: 'homeY'): number
  getData(key: string): any
}

export class MiniConfessionScene extends Phaser.Scene {
  private segments: ConfessionSegment[] = []
  private fragments: ConfessionFragment[] = []
  private dropZones: Map<string, Phaser.GameObjects.Zone> = new Map()
  private zoneVisuals: Map<string, Phaser.GameObjects.Rectangle> = new Map()
  private placedFragments: Map<string, ConfessionFragment> = new Map()
  private requiredCount = 0
  private progressText: Phaser.GameObjects.Text | null = null
  private feedbackText: Phaser.GameObjects.Text | null = null
  private summaryText = ''
  private vocabularyFocus: string[] = []
  private rewardClueId: string | undefined
  private gameManager: GameManager | null = null
  private isComplete = false

  constructor() {
    super({ key: 'MiniConfession' })
  }

  init(data: { minigame: { data: ConfessionPatchworkData } }) {
    const minigame = data.minigame
    this.segments = [...minigame.data.segments].sort((a, b) => a.order - b.order)
    this.fragments = minigame.data.fragments
    this.summaryText = minigame.data.confessionText
    this.vocabularyFocus = minigame.data.vocabularyFocus || []
    this.rewardClueId = minigame.data.rewardClueId
    this.requiredCount = this.fragments.filter(fragment => !fragment.isDecoy).length
  }

  create() {
    const { width, height } = this.cameras.main
    const manager = (this.game as any).gameManager as GameManager | undefined
    this.gameManager = manager ?? null

    // Background vignette
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d1117, 0.95)

    // Title and instructions
    this.add.text(width / 2, 50, 'Confession Patchwork', {
      fontFamily: 'serif',
      fontSize: '28px',
      color: '#f5d67b'
    }).setOrigin(0.5)

    this.add.text(width / 2, 90, 'Drag the truthful fragments onto the timeline to rebuild the confession.', {
      fontFamily: 'serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5)

    this.progressText = this.add.text(width / 2, 120, '', {
      fontFamily: 'serif',
      fontSize: '18px',
      color: '#66ffb2'
    }).setOrigin(0.5)

    this.feedbackText = this.add.text(width / 2, 160, '', {
      fontFamily: 'serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5)

    this.createTimeline(width)
    this.createFragmentCards(width, height)

    // Back button
    const backButton = this.add.text(50, 50, '← Back', {
      fontFamily: 'serif',
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setInteractive()

    backButton.on('pointerdown', () => {
      this.scene.start('Carriage')
    })

    this.input.on('drop', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dropZone: Phaser.GameObjects.GameObject) => {
      this.handleDrop(gameObject as FragmentCard, dropZone as Phaser.GameObjects.Zone)
    })

    this.updateProgress()
  }

  private createTimeline(width: number) {
    const slotWidth = 220
    const slotHeight = 110
    const gap = 30
    const totalWidth = this.segments.length * slotWidth + (this.segments.length - 1) * gap
    const startX = width / 2 - totalWidth / 2 + slotWidth / 2
    const y = 260

    this.segments.forEach((segment, index) => {
      const x = startX + index * (slotWidth + gap)

      const container = this.add.rectangle(x, y, slotWidth, slotHeight, 0x1b2c3a, 0.35)
        .setStrokeStyle(2, 0x4cbbe6)
      this.zoneVisuals.set(segment.id, container)

      this.add.text(x, y - slotHeight / 2 - 28, segment.label, {
        fontFamily: 'serif',
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0.5)

      this.add.text(x, y + slotHeight / 2 + 20, segment.prompt, {
        fontFamily: 'serif',
        fontSize: '14px',
        color: '#c9d7ff',
        align: 'center',
        wordWrap: { width: slotWidth + 20 }
      }).setOrigin(0.5)

      const zone = this.add.zone(x, y, slotWidth - 20, slotHeight - 20)
      zone.setRectangleDropZone(slotWidth - 20, slotHeight - 20)
      zone.setData('segment', segment)
      this.dropZones.set(segment.id, zone)
    })
  }

  private createFragmentCards(width: number, height: number) {
    const cardWidth = 260
    const cardHeight = 100
    const columns = 3
    const columnSpacing = 280
    const rowSpacing = 140
    const startX = width / 2 - columnSpacing
    const startY = height - 200

    this.fragments.forEach((fragment, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      const x = startX + column * columnSpacing
      const y = startY + row * rowSpacing

      const card = this.add.container(x, y)
      const background = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x27364a, fragment.isDecoy ? 0.45 : 0.75)
        .setStrokeStyle(2, fragment.isDecoy ? 0xff7a7a : 0x66ffb2)
      const text = this.add.text(0, 0, fragment.text, {
        fontFamily: 'serif',
        fontSize: '16px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: cardWidth - 24 }
      }).setOrigin(0.5)

      card.add([background, text])
      card.setSize(cardWidth, cardHeight)
      card.setData('fragment', fragment)
      card.setData('homeX', x)
      card.setData('homeY', y)
      card.setDepth(5)
      card.setInteractive({ draggable: true })

      card.on('dragstart', () => {
        if (this.isComplete) return
        this.children.bringToTop(card)
        card.setScale(1.05)
        this.showFeedback('')
      })

      card.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        card.x = dragX
        card.y = dragY
      })

      card.on('dragend', (_pointer: Phaser.Input.Pointer, _dragX: number, _dragY: number, dropped: boolean) => {
        card.setScale(1)
        if (!dropped) {
          this.returnCardHome(card as FragmentCard)
        }
      })

      this.input.setDraggable(card)
    })
  }

  private handleDrop(card: FragmentCard, zone: Phaser.GameObjects.Zone) {
    if (this.isComplete) {
      this.returnCardHome(card)
      return
    }

    const fragment = card.getData('fragment') as ConfessionFragment | undefined
    const segment = zone.getData('segment') as ConfessionSegment | undefined

    if (!fragment || !segment) {
      this.returnCardHome(card)
      return
    }

    if (fragment.isDecoy) {
      this.showFeedback(`Decoy spotted: ${fragment.hint}`, '#ff7a7a')
      this.shakeCard(card)
      this.time.delayedCall(250, () => this.returnCardHome(card))
      return
    }

    if (segment.id !== fragment.correctSegmentId) {
      this.showFeedback(`Not quite. ${fragment.hint}`, '#ff9f6b')
      this.shakeCard(card)
      this.time.delayedCall(250, () => this.returnCardHome(card))
      return
    }

    if (this.placedFragments.has(segment.id)) {
      this.showFeedback('That timeline slot is already locked. Try an empty space.', '#ffd166')
      this.returnCardHome(card)
      return
    }

    this.lockCardIntoZone(card, zone, segment, fragment)
  }

  private lockCardIntoZone(
    card: FragmentCard,
    zone: Phaser.GameObjects.Zone,
    segment: ConfessionSegment,
    fragment: ConfessionFragment
  ) {
    this.placedFragments.set(segment.id, fragment)
    this.zoneVisuals.get(segment.id)?.setFillStyle(0x1f4d3d, 0.7)

    this.tweens.add({
      targets: card,
      x: zone.x,
      y: zone.y,
      duration: 200,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.input.setDraggable(card, false)
        card.setDepth(10)
      }
    })

    this.showFeedback(`Locked in! ${segment.grammarHint}`, '#5fffb7')
    this.updateProgress()

    if (this.placedFragments.size === this.requiredCount) {
      this.time.delayedCall(350, () => this.completePatchwork())
    }
  }

  private updateProgress() {
    if (!this.progressText) return
    this.progressText.setText(`Confession assembled: ${this.placedFragments.size}/${this.requiredCount}`)
  }

  private showFeedback(message: string, color = '#ffffff') {
    if (!this.feedbackText) return
    this.feedbackText.setText(message)
    this.feedbackText.setColor(color)
  }

  private returnCardHome(card: FragmentCard) {
    this.tweens.add({
      targets: card,
      x: card.getData('homeX'),
      y: card.getData('homeY'),
      duration: 200,
      ease: 'Sine.easeInOut'
    })
  }

  private shakeCard(card: FragmentCard) {
    this.tweens.add({
      targets: card,
      x: card.x + 10,
      duration: 60,
      yoyo: true,
      repeat: 2
    })
  }

  private completePatchwork() {
    if (this.isComplete) return
    this.isComplete = true

    this.sound.play('discovery', { volume: 0.8 })
    this.showFeedback('Confession complete! Share it with your team.', '#66ffb2')

    this.recordCompletionAnalytics()
    this.handleRewardClue()

    if (this.rewardClueId) {
      void this.gameManager?.addJournalEntry('Detective', `Assembled the confession: ${this.summaryText}`)
    }

    const { width, height } = this.cameras.main
    const overlay = this.add.container(width / 2, height / 2)
    const bg = this.add.rectangle(0, 0, 680, 420, 0x000000, 0.92).setStrokeStyle(3, 0x5fffb7)
    const halo = this.add.circle(0, -160, 200, 0x5fffb7, 0.12)
      .setBlendMode(Phaser.BlendModes.ADD)
    const title = this.add.text(0, -160, 'CONFESSION PATCHED TOGETHER', {
      fontFamily: 'serif',
      fontSize: '26px',
      color: '#5fffb7'
    }).setOrigin(0.5)

    const confession = this.add.text(0, -30, this.summaryText, {
      fontFamily: 'serif',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5)

    let vocabBlock: Phaser.GameObjects.Text | null = null
    if (this.vocabularyFocus.length) {
      vocabBlock = this.add.text(0, 110, `Vocabulary: ${this.vocabularyFocus.join(', ')}`, {
        fontFamily: 'serif',
        fontSize: '16px',
        color: '#f5d67b'
      }).setOrigin(0.5)
    }

    const teacherPrompt = this.add.text(0, 150, 'Teacher prompt: Discuss how motive, action, and remorse connect the language to the crime.', {
      fontFamily: 'serif',
      fontSize: '16px',
      color: '#66ffb2',
      align: 'center',
      wordWrap: { width: 520 }
    }).setOrigin(0.5)

    const continueBtn = this.add.text(0, 215, 'Return to Investigation', {
      fontFamily: 'serif',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#2d8a6d',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive()

    continueBtn.on('pointerdown', () => {
      this.scene.start('Carriage')
    })

    const items: Phaser.GameObjects.GameObject[] = vocabBlock
      ? [bg, halo, title, confession, vocabBlock, teacherPrompt, continueBtn]
      : [bg, halo, title, confession, teacherPrompt, continueBtn]
    overlay.add(items)
    overlay.setAlpha(0)

    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 400
    })

    this.tweens.add({
      targets: halo,
      alpha: { from: 0.12, to: 0.3 },
      scale: { from: 1, to: 1.05 },
      duration: 1200,
      yoyo: true,
      repeat: -1
    })
  }

  private recordCompletionAnalytics() {
    const store = useGameStore.getState()
    store.trackMinigameCompleted('confession_patchwork', 100)
    store.updateAnalytics()
  }

  private handleRewardClue() {
    if (!this.rewardClueId) return

    const store = useGameStore.getState()
    const room = store.room
    const clueId = this.rewardClueId

    if (!room) {
      store.trackClueDiscovered()
      store.updateAnalytics()
      return
    }

    const suspectsState = room.suspects || {}
    const existingClues = Array.isArray(suspectsState.clues) ? suspectsState.clues : []

    if (existingClues.includes(clueId)) {
      return
    }

    const updatedClues = [...existingClues, clueId]
    const updatedSuspects = {
      ...suspectsState,
      clues: updatedClues
    }

    useGameStore.setState((state) => ({
      room: state.room ? { ...state.room, suspects: updatedSuspects } : state.room
    }))

    void store.updateRoom(room.id, { suspects: updatedSuspects })
    store.trackClueDiscovered()
  }
}
