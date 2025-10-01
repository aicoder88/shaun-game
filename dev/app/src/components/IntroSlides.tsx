'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Slide {
  id: number
  title: string
  subtitle?: string
  content: string
  image?: string
  background: string
  animation?: string
  characterName?: string
  characterImage?: string
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Welcome Aboard",
    subtitle: "The Bullet Express",
    content: "The year is 2045. You are boarding the most luxurious train in the solar system - a steampunk masterpiece that travels to the edge of space.",
    background: "from-indigo-950 via-purple-950 to-black",
    animation: "fadeIn"
  },
  {
    id: 2,
    title: "Your Mission",
    subtitle: "Great Detective",
    content: "You are a renowned detective, known throughout the galaxy for your brilliant deductions and mastery of the English language.",
    background: "from-purple-950 via-indigo-900 to-black",
    characterImage: "/images/ui/lens_icon.svg"
  },
  {
    id: 3,
    title: "Meet Your Partner",
    subtitle: "Conductor Whibury",
    content: "Conductor Whibury, the keen-eyed train master, will assist you throughout your investigation. They know every corner of this magnificent vessel.",
    background: "from-amber-900 via-yellow-900 to-black",
    animation: "slideRight"
  },
  {
    id: 4,
    title: "The Setting",
    subtitle: "Luxury in Motion",
    content: "The Bullet Express features Victorian-era opulence meets futuristic technology. Brass fixtures, velvet seats, and windows showing the starry void of space.",
    background: "from-purple-900 via-violet-900 to-black"
  },
  {
    id: 5,
    title: "A Scream Echoes...",
    subtitle: "Something Terrible Has Happened",
    content: "As the train hurtles toward the orbital station, a piercing scream rings out from the luxury carriage. A passenger has been murdered!",
    background: "from-red-950 via-purple-950 to-black",
    animation: "shake"
  },
  {
    id: 6,
    title: "The Suspects",
    subtitle: "Three Mysterious Passengers",
    content: "Professor LeStrange - A distinguished archaeologist with suspicious artifacts...",
    background: "from-amber-950 via-brown-900 to-black",
    characterImage: "/images/characters/lestrange.svg",
    characterName: "Professor LeStrange"
  },
  {
    id: 7,
    title: "The Suspects",
    subtitle: "Three Mysterious Passengers",
    content: "Chef Gaspard - An anxious French chef whose restaurant is facing bankruptcy...",
    background: "from-slate-900 via-gray-900 to-black",
    characterImage: "/images/characters/gaspard.svg",
    characterName: "Chef Gaspard"
  },
  {
    id: 8,
    title: "The Suspects",
    subtitle: "Three Mysterious Passengers",
    content: "Captain Zane - A weathered airship captain with a mechanical arm and dark secrets...",
    background: "from-blue-950 via-slate-900 to-black",
    characterImage: "/images/characters/zane.svg",
    characterName: "Captain Zane"
  },
  {
    id: 9,
    title: "Your Tools",
    subtitle: "The Insight Lens",
    content: "You possess the legendary Insight Lens - a futuristic monocle that reveals hidden clues and contradictions. Use it wisely, you only have 3 charges!",
    background: "from-cyan-950 via-blue-950 to-black",
    animation: "pulse"
  },
  {
    id: 10,
    title: "Gather Evidence",
    subtitle: "Search Every Corner",
    content: "Click on objects, examine the scene, and talk to suspects. Every clue matters. Look for torn letters, bloody knives, and mechanical parts.",
    background: "from-purple-950 via-violet-900 to-black"
  },
  {
    id: 11,
    title: "Master English",
    subtitle: "Language is Your Weapon",
    content: "To solve this mystery, you must use perfect grammar. Ask questions correctly, understand vocabulary, and piece together testimonies.",
    background: "from-emerald-950 via-teal-900 to-black"
  },
  {
    id: 12,
    title: "Past Tense Mastery",
    subtitle: "Describe What Happened",
    content: "Where WERE you at midnight? What HAD you been doing? Practice past simple, past continuous, and past perfect tenses.",
    background: "from-indigo-900 via-purple-900 to-black"
  },
  {
    id: 13,
    title: "Question Formation",
    subtitle: "Interrogate the Suspects",
    content: "Ask the right questions: 'Where were you?' 'What did you see?' 'Why did you do it?' Grammar mistakes mean missed opportunities.",
    background: "from-orange-950 via-red-900 to-black"
  },
  {
    id: 14,
    title: "Mini-Games Await",
    subtitle: "Unlock the Truth",
    content: "Reconstruct torn letters, complete listening exercises, and arrange confession fragments. Each game teaches English skills.",
    background: "from-pink-950 via-purple-900 to-black"
  },
  {
    id: 15,
    title: "Your Journal",
    subtitle: "Record Everything",
    content: "Every clue, conversation, and discovery is automatically logged in your detective journal with timestamps. Review it anytime!",
    background: "from-yellow-950 via-amber-900 to-black"
  },
  {
    id: 16,
    title: "The Accusation",
    subtitle: "Present Your Case",
    content: "When you're ready, accuse the killer. But be careful - you must explain WHY with evidence and proper English. Get it wrong and they escape!",
    background: "from-red-900 via-crimson-950 to-black",
    animation: "shake"
  },
  {
    id: 17,
    title: "Unlock Rewards",
    subtitle: "Progress & Achievements",
    content: "Complete cases to unlock new avatar items, abilities, and even more challenging mysteries. The train journey is just beginning...",
    background: "from-purple-900 via-indigo-950 to-black"
  },
  {
    id: 18,
    title: "Space Awaits",
    subtitle: "More Mysteries to Come",
    content: "As the train reaches the orbital station, new carriages unlock. You'll soon encounter cyborgs, space pirates, and cosmic conspiracies...",
    background: "from-blue-950 via-indigo-950 to-black",
    animation: "fadeIn"
  },
  {
    id: 19,
    title: "Remember",
    subtitle: "Three Keys to Success",
    content: "1. Use the Insight Lens wisely\n2. Practice perfect English grammar\n3. Examine everything carefully",
    background: "from-violet-950 via-purple-900 to-black"
  },
  {
    id: 20,
    title: "Ready, Detective?",
    subtitle: "The Mystery Awaits",
    content: "The killer is on this train. Lives depend on your English skills and detective work. Are you ready to board the Bullet Express?",
    background: "from-amber-950 via-orange-900 to-black",
    animation: "pulse"
  }
]

export function IntroSlides({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const slide = slides[currentSlide]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection('forward')
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection('backward')
      setCurrentSlide(currentSlide - 1)
    }
  }

  const skipIntro = () => {
    onComplete()
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'Escape') skipIntro()
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSlide])

  return (
    <div className={`fixed inset-0 bg-gradient-to-b ${slide.background} z-50 overflow-hidden`}>
      {/* Animated starfield background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
        {/* Slide content */}
        <div
          className={`max-w-4xl w-full text-center transform transition-all duration-700 ${
            direction === 'forward' ? 'slide-in-right' : 'slide-in-left'
          } ${slide.animation === 'shake' ? 'animate-shake' : ''} ${
            slide.animation === 'pulse' ? 'animate-pulse-slow' : ''
          }`}
          key={slide.id}
        >
          {/* Character image if present */}
          {slide.characterImage && (
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <Image
                  src={slide.characterImage}
                  alt={slide.characterName || 'Character'}
                  width={200}
                  height={300}
                  className="drop-shadow-2xl transform hover:scale-105 transition-transform"
                />
                {slide.characterName && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 px-4 py-2 rounded-lg border border-yellow-600">
                    <p className="text-yellow-400 font-bold text-sm whitespace-nowrap">
                      {slide.characterName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-4 drop-shadow-lg font-serif">
            {slide.title}
          </h1>

          {/* Subtitle */}
          {slide.subtitle && (
            <h2 className="text-2xl md:text-3xl text-yellow-200 mb-8 italic opacity-90">
              {slide.subtitle}
            </h2>
          )}

          {/* Content */}
          <p className="text-xl md:text-2xl text-white leading-relaxed max-w-3xl mx-auto mb-12 whitespace-pre-line">
            {slide.content}
          </p>
        </div>

        {/* Navigation */}
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-between px-8 max-w-6xl mx-auto">
          {/* Previous button */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="px-6 py-3 bg-purple-900/50 hover:bg-purple-800/70 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all border border-purple-600"
          >
            ← Previous
          </button>

          {/* Progress indicator */}
          <div className="flex flex-col items-center">
            <div className="flex gap-2 mb-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-yellow-400'
                      : index < currentSlide
                      ? 'w-2 bg-yellow-600'
                      : 'w-2 bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              {currentSlide + 1} / {slides.length}
            </p>
          </div>

          {/* Next/Complete button */}
          <button
            onClick={nextSlide}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-all border-2 border-yellow-400 shadow-lg hover:shadow-yellow-500/50"
          >
            {currentSlide === slides.length - 1 ? 'Start Investigation →' : 'Next →'}
          </button>
        </div>

        {/* Skip button */}
        <button
          onClick={skipIntro}
          className="absolute top-8 right-8 px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          Skip Intro (ESC)
        </button>

        {/* Keyboard hints */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-gray-500 text-xs flex gap-4">
          <span>← → Arrow keys to navigate</span>
          <span>|</span>
          <span>Space to advance</span>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .slide-in-right {
          animation: slideInRight 0.7s ease-out;
        }
        .slide-in-left {
          animation: slideInLeft 0.7s ease-out;
        }
      `}</style>
    </div>
  )
}
