'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MenuPage() {
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()

  const joinAsStudent = async () => {
    if (!roomCode.trim()) {
      alert('Please enter a room code')
      return
    }

    setIsJoining(true)
    router.push(`/play?room=${roomCode.toUpperCase()}`)
  }

  const startAsTeacher = () => {
    router.push('/conductor')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-steampunk-brass mb-4 drop-shadow-lg">
            MURDER ON THE
          </h1>
          <h2 className="text-4xl font-bold text-steampunk-brass mb-2 drop-shadow-lg">
            BULLET EXPRESS
          </h2>
          <p className="text-xl text-gray-300 font-serif">
            An ESL Detective Mystery
          </p>
        </div>

        {/* Atmospheric Description */}
        <div className="mb-12 p-6 bg-black/30 rounded-lg border border-steampunk-bronze/30">
          <p className="text-gray-200 text-lg leading-relaxed">
            Welcome aboard the luxurious Bullet Express, where a mysterious murder has occurred 
            in the steampunk-powered carriage. As a detective, use your English skills to 
            question suspects, examine clues, and solve the case before the train reaches London!
          </p>
        </div>

        {/* Menu Options */}
        <div className="space-y-6">
          {/* Student Option */}
          <div className="bg-black/50 p-8 rounded-xl border border-steampunk-copper/30">
            <h3 className="text-2xl font-bold text-white mb-4">🕵️ Join as Detective</h3>
            <p className="text-gray-300 mb-6">
              Enter your teacher&apos;s room code to join the investigation
            </p>
            
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-steampunk-brass focus:outline-none text-center text-lg font-mono"
                maxLength={6}
              />
              <button
                onClick={joinAsStudent}
                disabled={isJoining || !roomCode.trim()}
                className="px-6 py-3 bg-steampunk-brass hover:bg-steampunk-bronze disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>

          {/* Teacher Option */}
          <div className="bg-black/50 p-8 rounded-xl border border-steampunk-copper/30">
            <h3 className="text-2xl font-bold text-white mb-4">🎩 Conductor Dashboard</h3>
            <p className="text-gray-300 mb-6">
              Control the case as Conductor Whibury and guide your students
            </p>
            
            <button
              onClick={startAsTeacher}
              className="px-8 py-3 bg-steampunk-copper hover:bg-steampunk-bronze text-white font-bold rounded-lg transition-colors text-lg"
            >
              Enter Control Room
            </button>
          </div>
        </div>

        {/* Game Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl mb-2">🔍</div>
            <h4 className="text-white font-bold mb-1">Investigate</h4>
            <p className="text-gray-400 text-sm">Examine clues and question suspects</p>
          </div>
          
          <div className="p-4">
            <div className="text-3xl mb-2">🎮</div>
            <h4 className="text-white font-bold mb-1">Mini-Games</h4>
            <p className="text-gray-400 text-sm">Solve puzzles to uncover evidence</p>
          </div>
          
          <div className="p-4">
            <div className="text-3xl mb-2">📚</div>
            <h4 className="text-white font-bold mb-1">Learn English</h4>
            <p className="text-gray-400 text-sm">Practice grammar and vocabulary</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Age 12-15 • ESL Level: Intermediate • Duration: 30-45 minutes</p>
        </div>
      </div>
    </div>
  )
}