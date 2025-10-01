'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface Slide {
  id: number
  emoji: string
  title: string
  subtitle: string
  action?: string
  color: string
  image?: string
}

const slides: Slide[] = [
  { id: 1, emoji: "🚂", title: "Welcome Aboard", subtitle: "The Bullet Express to Space", color: "from-purple-600 to-blue-600", action: "TAP TO START" },
  { id: 2, emoji: "🕵️", title: "You're the Detective", subtitle: "Use English to solve crimes", color: "from-blue-600 to-indigo-600" },
  { id: 3, emoji: "🎩", title: "Meet Whibury", subtitle: "Your guide on this journey", color: "from-amber-600 to-orange-600" },
  { id: 4, emoji: "💎", title: "Luxury Train", subtitle: "Victorian steampunk style", color: "from-violet-600 to-purple-600" },
  { id: 5, emoji: "😱", title: "A MURDER!", subtitle: "Someone has been killed...", color: "from-red-600 to-pink-600", action: "TAP!" },
  { id: 6, emoji: "👨‍🏫", title: "Professor LeStrange", subtitle: "Suspicious archaeologist", color: "from-amber-700 to-brown-600", image: "/images/characters/lestrange.svg" },
  { id: 7, emoji: "👨‍🍳", title: "Chef Gaspard", subtitle: "Nervous French chef", color: "from-gray-600 to-slate-700", image: "/images/characters/gaspard.svg" },
  { id: 8, emoji: "👩‍✈️", title: "Captain Zane", subtitle: "Airship captain with secrets", color: "from-blue-700 to-slate-600", image: "/images/characters/zane.svg" },
  { id: 9, emoji: "🔍", title: "Insight Lens", subtitle: "Reveals hidden clues", color: "from-cyan-600 to-blue-600", action: "TAP TO USE" },
  { id: 10, emoji: "🗂️", title: "Find Evidence", subtitle: "Tap objects to investigate", color: "from-purple-600 to-violet-600" },
  { id: 11, emoji: "📚", title: "Learn English", subtitle: "Grammar is your weapon", color: "from-green-600 to-emerald-600" },
  { id: 12, emoji: "⏰", title: "Past Tense", subtitle: "What WERE you doing?", color: "from-indigo-600 to-purple-600" },
  { id: 13, emoji: "❓", title: "Ask Questions", subtitle: "Where were you at midnight?", color: "from-orange-600 to-red-600" },
  { id: 14, emoji: "🎮", title: "Mini-Games", subtitle: "Puzzles teach English", color: "from-pink-600 to-rose-600" },
  { id: 15, emoji: "📔", title: "Your Journal", subtitle: "All clues saved automatically", color: "from-yellow-600 to-amber-600" },
  { id: 16, emoji: "⚖️", title: "Make Accusation", subtitle: "Pick the right killer!", color: "from-red-700 to-rose-700", action: "TAP TO ACCUSE" },
  { id: 17, emoji: "🏆", title: "Unlock Rewards", subtitle: "New abilities & mysteries", color: "from-purple-600 to-indigo-600" },
  { id: 18, emoji: "🌌", title: "Space Station", subtitle: "More mysteries await...", color: "from-blue-600 to-indigo-700" },
  { id: 19, emoji: "💡", title: "3 Keys to Win", subtitle: "Use Lens • Perfect English • Examine Everything", color: "from-violet-600 to-purple-700" },
  { id: 20, emoji: "🎯", title: "Ready?", subtitle: "The killer is on this train!", color: "from-amber-600 to-red-600", action: "TAP TO BEGIN" }
]

export function MobileIntroSlides({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTapped, setIsTapped] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const slide = slides[currentSlide]
  const progress = ((currentSlide + 1) / slides.length) * 100

  // Sound effects (simple beep using Web Audio API)
  const playSound = (frequency: number, duration: number) => {
    if (typeof window === 'undefined') return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  }

  // Haptic feedback
  const vibrate = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  const handleTap = () => {
    setIsTapped(true)
    playSound(800, 0.1)
    vibrate(50)

    setTimeout(() => {
      setIsTapped(false)
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1)
        playSound(400, 0.15)
        vibrate([30, 50, 30])
      } else {
        playSound(1200, 0.3)
        vibrate([100, 50, 100, 50, 100])
        onComplete()
      }
    }, 300)
  }

  // Swipe detection
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      playSound(600, 0.1)
      vibrate(40)
      setCurrentSlide(currentSlide + 1)
    }
    if (isRightSwipe && currentSlide > 0) {
      playSound(500, 0.1)
      vibrate(40)
      setCurrentSlide(currentSlide - 1)
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br ${slide.color} overflow-hidden touch-none`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-black/20">
        <div
          className="h-full bg-white/80 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Skip button */}
      <button
        onClick={() => {
          playSound(300, 0.1)
          onComplete()
        }}
        className="absolute top-4 right-4 px-4 py-2 bg-black/30 text-white text-sm rounded-full backdrop-blur-sm active:scale-95 transition-transform z-50"
      >
        Skip
      </button>

      {/* Main content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
        {/* Giant emoji with bounce */}
        <div
          className={`text-9xl mb-6 transform transition-all duration-300 ${
            isTapped ? 'scale-125 rotate-12' : 'scale-100'
          } animate-bounce-gentle`}
          style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }}
        >
          {slide.emoji}
        </div>

        {/* Character image if present */}
        {slide.image && (
          <div className="mb-6">
            <Image
              src={slide.image}
              alt={slide.title}
              width={150}
              height={225}
              className={`drop-shadow-2xl transform transition-all duration-300 ${
                isTapped ? 'scale-110 rotate-3' : 'scale-100'
              }`}
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-black text-white mb-3 drop-shadow-lg tracking-tight">
          {slide.title}
        </h1>

        {/* Subtitle */}
        <p className="text-2xl md:text-3xl text-white/90 font-medium mb-8 drop-shadow-md">
          {slide.subtitle}
        </p>

        {/* Tap action button */}
        <button
          onClick={handleTap}
          className={`
            px-12 py-6 bg-white text-gray-900 rounded-full font-black text-xl
            shadow-2xl transform transition-all duration-200
            ${isTapped ? 'scale-95 bg-gray-200' : 'scale-100 active:scale-95'}
            hover:scale-105 active:shadow-xl
            border-4 border-white/50
          `}
          style={{
            boxShadow: '0 10px 40px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.5)'
          }}
        >
          {slide.action || 'TAP TO CONTINUE'}
        </button>

        {/* Page indicator dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-white'
                  : index < currentSlide
                  ? 'w-3 bg-white/60'
                  : 'w-3 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Swipe hint (first slide only) */}
        {currentSlide === 0 && (
          <div className="absolute bottom-20 left-0 right-0 text-white/70 text-sm animate-pulse">
            ← Swipe or tap to navigate →
          </div>
        )}
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-black/30 text-white text-sm rounded-full backdrop-blur-sm">
        {currentSlide + 1}/{slides.length}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
