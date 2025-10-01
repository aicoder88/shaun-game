'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Animated starfield background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                           radial-gradient(2px 2px at 60% 70%, white, transparent),
                           radial-gradient(1px 1px at 50% 50%, white, transparent),
                           radial-gradient(1px 1px at 80% 10%, white, transparent),
                           radial-gradient(2px 2px at 90% 60%, white, transparent),
                           radial-gradient(1px 1px at 33% 80%, white, transparent)`,
          backgroundSize: '200% 200%',
          animation: 'twinkle 8s ease-in-out infinite'
        }}/>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl px-8">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logo.svg"
            alt="Murder on the Bullet Express"
            width={400}
            height={120}
            priority
            className="drop-shadow-2xl"
          />
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl mb-4 text-yellow-200 font-serif italic drop-shadow-lg">
          A Steampunk Detective Mystery in Space
        </p>

        <p className="text-lg md:text-xl mb-10 text-purple-200 opacity-90">
          Solve murders, learn English, and uncover secrets aboard the Bullet Express
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/intro"
            className="group inline-block relative px-12 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold rounded-lg transition-all duration-300 text-xl shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 border-2 border-yellow-400"
          >
            <span className="relative z-10">Begin Investigation</span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"/>
          </Link>

          <Link
            href="/menu"
            className="px-8 py-3 bg-purple-900/50 hover:bg-purple-800/70 text-white font-bold rounded-lg transition-all border border-purple-600"
          >
            Skip to Menu →
          </Link>
        </div>

        {/* Subtitle */}
        <div className="mt-12 text-sm text-purple-300 opacity-75">
          <p>For ESL students aged 12-15 • Point-and-click adventure</p>
          <p className="mt-4">
            <Link href="/mobile" className="text-yellow-400 hover:text-yellow-300 underline">
              📱 Mobile Touch Version
            </Link>
          </p>
        </div>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}