'use client'

import { useEffect, useState } from 'react'
import { Trophy, X, Sparkles } from 'lucide-react'
import type { Achievement } from '@/types/game'

interface AchievementUnlockProps {
  achievement: Achievement
  onDismiss: () => void
}

/**
 * AchievementUnlock Component
 * Animated celebration popup when student earns an achievement
 * Shows with fanfare and confetti effect
 */
export default function AchievementUnlock({
  achievement,
  onDismiss
}: AchievementUnlockProps) {
  const [visible, setVisible] = useState(false)
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number }>>([])

  useEffect(() => {
    // Animate in
    setTimeout(() => setVisible(true), 100)

    // Generate confetti positions
    const confettiArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5
    }))
    setConfetti(confettiArray)

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(onDismiss, 300)
  }

  const getRarityStyle = () => {
    switch (achievement.rarity) {
      case 'common':
        return {
          bg: 'from-gray-600 to-gray-700',
          border: 'border-gray-400',
          glow: 'shadow-gray-500/50',
          text: 'text-gray-300'
        }
      case 'rare':
        return {
          bg: 'from-blue-600 to-blue-700',
          border: 'border-blue-400',
          glow: 'shadow-blue-500/50',
          text: 'text-blue-300'
        }
      case 'epic':
        return {
          bg: 'from-purple-600 to-purple-700',
          border: 'border-purple-400',
          glow: 'shadow-purple-500/50',
          text: 'text-purple-300'
        }
      case 'legendary':
        return {
          bg: 'from-yellow-500 to-orange-600',
          border: 'border-yellow-400',
          glow: 'shadow-yellow-500/50',
          text: 'text-yellow-200'
        }
    }
  }

  const style = getRarityStyle()

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 animate-confetti"
            style={{
              left: `${particle.x}%`,
              top: '-10%',
              animationDelay: `${particle.delay}s`,
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][
                particle.id % 5
              ]
            }}
          />
        ))}
      </div>

      {/* Achievement Card */}
      <div
        className={`relative bg-gradient-to-br ${style.bg} rounded-2xl border-4 ${style.border} ${style.glow} shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 ${
          visible ? 'scale-100 rotate-0' : 'scale-50 rotate-12'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-8 h-8 text-yellow-400 mr-2" />
            <h2 className="text-2xl font-bold text-white">Achievement Unlocked!</h2>
          </div>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${style.text} bg-black/30`}>
            {achievement.rarity}
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="text-8xl animate-bounce">{achievement.icon}</div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-white mb-3">
            {achievement.title}
          </h3>
          <p className="text-lg text-white/90 mb-6">
            {achievement.description}
          </p>

          {/* Category Badge */}
          <div className="inline-block px-4 py-2 bg-black/40 rounded-lg">
            <span className="text-sm text-white/80 capitalize">
              {achievement.category} Achievement
            </span>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleDismiss}
          className="mt-8 w-full py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-colors backdrop-blur-sm"
        >
          Continue Investigation ➜
        </button>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  )
}
