'use client'

import { useState } from 'react'
import { MobileIntroSlides } from '@/components/MobileIntroSlides'
import { useRouter } from 'next/navigation'

export default function MobilePage() {
  const router = useRouter()
  const [showIntro, setShowIntro] = useState(true)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const playSound = (frequency: number) => {
    if (typeof window === 'undefined') return
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  }

  const vibrate = (duration: number) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(duration)
    }
  }

  const handleCardTap = (action: string) => {
    setSelectedCard(action)
    playSound(800)
    vibrate(50)

    setTimeout(() => {
      setSelectedCard(null)
      if (action === 'play') {
        router.push('/menu')
      } else if (action === 'teacher') {
        router.push('/conductor')
      } else if (action === 'intro') {
        setShowIntro(true)
      }
    }, 200)
  }

  if (showIntro) {
    return <MobileIntroSlides onComplete={() => setShowIntro(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-8 mt-8">
          <div className="text-6xl mb-4 animate-bounce-slow">🚂</div>
          <h1 className="text-4xl font-black text-yellow-400 mb-2 drop-shadow-lg">
            Murder on the
          </h1>
          <h1 className="text-5xl font-black text-yellow-300 mb-4 drop-shadow-lg">
            Bullet Express
          </h1>
          <p className="text-white/80 text-lg">Tap a card to begin</p>
        </div>

        {/* Card Grid */}
        <div className="flex-1 flex flex-col gap-4 pb-8">
          {/* Play Story Mode */}
          <button
            onClick={() => {
              playSound(800)
              vibrate(50)
              router.push('/story')
            }}
            className={`
              group relative overflow-hidden rounded-3xl p-8
              bg-gradient-to-br from-green-500 to-emerald-600
              shadow-2xl transform transition-all duration-200
              active:scale-95 scale-100
              border-4 border-white/30
            `}
            style={{
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
          >
            <div className="relative z-10">
              <div className="text-6xl mb-3 group-active:scale-110 transition-transform">
                🕵️
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                Play Story Mode
              </h2>
              <p className="text-white/90 text-lg">
                Interactive mystery with feedback
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-active:opacity-100 transition-opacity" />
          </button>

          {/* Play as Teacher */}
          <button
            onClick={() => handleCardTap('teacher')}
            className={`
              group relative overflow-hidden rounded-3xl p-8
              bg-gradient-to-br from-orange-500 to-red-600
              shadow-2xl transform transition-all duration-200
              ${selectedCard === 'teacher' ? 'scale-95' : 'scale-100 active:scale-95'}
              border-4 border-white/30
            `}
            style={{
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
          >
            <div className="relative z-10">
              <div className="text-6xl mb-3 group-active:scale-110 transition-transform">
                🎩
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                Conductor Dashboard
              </h2>
              <p className="text-white/90 text-lg">
                Guide students through the mystery
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-active:opacity-100 transition-opacity" />
          </button>

          {/* Watch Intro Again */}
          <button
            onClick={() => handleCardTap('intro')}
            className={`
              group relative overflow-hidden rounded-3xl p-6
              bg-gradient-to-br from-purple-500 to-indigo-600
              shadow-2xl transform transition-all duration-200
              ${selectedCard === 'intro' ? 'scale-95' : 'scale-100 active:scale-95'}
              border-4 border-white/30
            `}
            style={{
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-2 group-active:scale-110 transition-transform">
                🎬
              </div>
              <h2 className="text-2xl font-black text-white mb-1">
                Watch Intro
              </h2>
              <p className="text-white/80">
                See the story again
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-active:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-white/60 text-sm pb-4">
          <p>Ages 12-15 • ESL Education</p>
          <p className="mt-2">🎮 Tap anywhere to play</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
