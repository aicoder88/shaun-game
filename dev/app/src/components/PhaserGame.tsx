'use client'

import { useEffect, useRef } from 'react'
import * as Phaser from 'phaser'
import { GameManager } from '@/game/GameManager'
import { GameErrorBoundary } from './ErrorBoundary'

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

    try {
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

      // Provide game instance to GameManager (removes global dependency)
      gameManager.setGameInstance(gameRef.current)

      if (onGameReady) {
        onGameReady(gameManager)
      }
    } catch (error) {
      console.error('Failed to initialize Phaser game:', error)
      throw error
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
      
      if (gameManagerRef.current) {
        gameManagerRef.current.destroy()
        gameManagerRef.current = null
      }
    }
  }, [roomId, isTeacher, onGameReady])

  return (
    <GameErrorBoundary>
      <div 
        ref={containerRef} 
        className="game-container w-full h-full flex items-center justify-center"
      />
    </GameErrorBoundary>
  )
}