'use client'

import { useState } from 'react'
import { Eye, Lock, Lightbulb, MessageSquare, Book } from 'lucide-react'
import VocabularyGlossary from './VocabularyGlossary'
import { useGameStore } from '@/stores/gameStore'

interface StudentInterfaceProps {
  room: any
  lensCharges: number
  isLocked: boolean
}

export function StudentInterface({ room, lensCharges, isLocked }: StudentInterfaceProps) {
  const [showHint, setShowHint] = useState(false)
  const [showVocabulary, setShowVocabulary] = useState(false)
  const discoveredWords = useGameStore((state) => state.discoveredWords)

  const getCurrentSceneHint = () => {
    const hints: Record<string, string> = {
      'menu': 'Welcome! Wait for your teacher to start the case.',
      'carriage': 'Click on objects, people, and suspicious areas to investigate. Use your Insight Lens wisely!',
      'accuse': 'Review all your evidence before making an accusation. Choose carefully!',
      'debrief': 'Case complete! Review what you learned.'
    }
    
    return hints[room.scene] || 'Investigate carefully and look for clues!'
  }

  return (
    <>
      {/* Top Status Bar */}
      <div className="absolute top-16 left-4 right-4 z-40 flex justify-between items-center">
        {/* Lens Charges */}
        <div className="bg-black/80 text-white px-4 py-2 rounded-lg flex items-center">
          <Eye className="w-4 h-4 mr-2 text-yellow-400" />
          <span className="text-sm">Insight Lens:</span>
          <div className="ml-2 flex space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < lensCharges ? 'bg-yellow-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-2">
          {/* Vocabulary Button */}
          <button
            onClick={() => setShowVocabulary(true)}
            className="bg-black/80 text-white px-3 py-2 rounded-lg hover:bg-black/90 flex items-center relative"
          >
            <Book className="w-4 h-4 mr-1" />
            <span className="text-sm">Vocabulary</span>
            {discoveredWords.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {discoveredWords.length}
              </span>
            )}
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHint(!showHint)}
            className="bg-black/80 text-white px-3 py-2 rounded-lg hover:bg-black/90 flex items-center"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            <span className="text-sm">Hint</span>
          </button>
        </div>
      </div>

      {/* Hint Panel */}
      {showHint && (
        <div className="absolute top-32 right-4 z-50 bg-black/90 text-white p-4 rounded-lg max-w-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-yellow-400 flex items-center">
              <Lightbulb className="w-4 h-4 mr-1" />
              Detective Hint
            </h4>
            <button
              onClick={() => setShowHint(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-300">{getCurrentSceneHint()}</p>
        </div>
      )}

      {/* Investigation Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
          <div className="bg-black/90 text-white p-6 rounded-lg text-center max-w-md">
            <Lock className="w-8 h-8 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-bold mb-2">Investigation Paused</h3>
            <p className="text-gray-300">
              Conductor Whibury has paused the investigation. 
              Please wait for further instructions.
            </p>
          </div>
        </div>
      )}

      {/* Scene-specific UI */}
      {room.scene === 'carriage' && !isLocked && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-black/80 text-white px-6 py-3 rounded-lg flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-400">Current Scene:</span>
              <span className="text-steampunk-brass font-bold ml-1">Luxury Carriage</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Action:</span>
              <span className="text-blue-400 ml-1">Click to investigate</span>
            </div>
          </div>
        </div>
      )}

      {/* Scene transition notifications */}
      <div id="scene-notifications" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
        {/* This will be populated by game events */}
      </div>

      {/* Vocabulary Glossary Modal */}
      {showVocabulary && (
        <VocabularyGlossary
          discoveredWords={discoveredWords}
          onClose={() => setShowVocabulary(false)}
        />
      )}
    </>
  )
}