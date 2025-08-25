'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🚂</div>
        <div className="text-2xl mb-8">Murder on the Bullet Express</div>
        <div className="text-lg mb-8 opacity-80">Loading complete! Ready to play.</div>
        <Link 
          href="/menu"
          className="inline-block px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors text-lg"
        >
          Enter Game
        </Link>
      </div>
    </div>
  )
}