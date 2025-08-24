'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { GameManager } from '@/game/GameManager'

interface PhaserGameProps {
  roomId: string
  isTeacher: boolean
  onGameReady?: (gameManager: GameManager) => void
}

export function PhaserGame({ roomId, isTeacher, onGameReady }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gameManagerRef = useRef<GameManager | null>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const gameManager = new GameManager(roomId, isTeacher)
    gameManagerRef.current = gameManager

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1024,
      height: 576,
      parent: containerRef.current,
      backgroundColor: '#2c1810',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false
        }
      },
      scene: gameManager.getScenes(),
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        max: {
          width: 1024,
          height: 576
        }
      },
      audio: {
        disableWebAudio: false
      },
      loader: {
        crossOrigin: 'anonymous'
      }
    }

    gameRef.current = new Phaser.Game(config)

    if (onGameReady) {
      onGameReady(gameManager)
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
      gameManagerRef.current = null
    }
  }, [roomId, isTeacher, onGameReady])

  return (
    <div 
      ref={containerRef} 
      className="game-container w-full h-full flex items-center justify-center"
    />
  )
}