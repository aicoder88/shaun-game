'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, X } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { getDifficultyManager } from '@/lib/DifficultyManager'

interface AdaptiveHintProps {
  context: 'dialogue' | 'investigation' | 'minigame'
  hintText: string
  onDismiss?: () => void
}

/**
 * AdaptiveHint Component
 * Shows contextual hints based on difficulty settings and time stuck
 * Adapts hint display timing and detail level to student proficiency
 */
export default function AdaptiveHint({
  context,
  hintText,
  onDismiss
}: AdaptiveHintProps) {
  const [visible, setVisible] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const difficultySettings = useGameStore((state) => state.difficultySettings)

  useEffect(() => {
    // Don't show hints if disabled
    if (!difficultySettings.hintsEnabled) {
      return
    }

    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      setTimeElapsed(elapsed)

      const manager = getDifficultyManager()
      if (manager.shouldShowHint(elapsed)) {
        setVisible(true)
        clearInterval(checkInterval)
      }
    }, 1000)

    return () => clearInterval(checkInterval)
  }, [difficultySettings])

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  if (!visible) return null

  // Get hint style based on difficulty
  const getHintStyle = () => {
    switch (difficultySettings.level) {
      case 'beginner':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          border: 'border-blue-400',
          icon: '💡',
          title: 'Helpful Hint!'
        }
      case 'intermediate':
        return {
          bg: 'bg-gradient-to-r from-purple-600 to-purple-700',
          border: 'border-purple-500',
          icon: '🔍',
          title: 'Hint'
        }
      case 'advanced':
        return {
          bg: 'bg-gradient-to-r from-gray-700 to-gray-800',
          border: 'border-gray-600',
          icon: '💭',
          title: 'Subtle Clue'
        }
    }
  }

  const style = getHintStyle()

  return (
    <div
      className="fixed bottom-20 right-4 z-50 max-w-sm animate-slide-up"
      role="alert"
      aria-live="polite"
    >
      <div className={`${style.bg} rounded-lg shadow-2xl border-2 ${style.border} p-4`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{style.icon}</span>
            <h4 className="text-white font-bold">{style.title}</h4>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss hint"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-white text-sm leading-relaxed">
          {hintText}
        </p>

        {/* Context badge */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-white/70 capitalize">
            {context} hint
          </span>
          <span className="text-xs text-white/50">
            Shown after {Math.floor(timeElapsed / 1000)}s
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage hint state with automatic timing
 */
export function useAdaptiveHint(
  context: 'dialogue' | 'investigation' | 'minigame'
) {
  const [currentHint, setCurrentHint] = useState<string | null>(null)
  const [hintDismissed, setHintDismissed] = useState(false)

  const showHint = (hintText: string) => {
    if (!hintDismissed) {
      setCurrentHint(hintText)
    }
  }

  const dismissHint = () => {
    setCurrentHint(null)
    setHintDismissed(true)
  }

  const resetHint = () => {
    setCurrentHint(null)
    setHintDismissed(false)
  }

  return {
    currentHint,
    showHint,
    dismissHint,
    resetHint,
    HintComponent: currentHint ? (
      <AdaptiveHint
        context={context}
        hintText={currentHint}
        onDismiss={dismissHint}
      />
    ) : null
  }
}
