'use client'

import { useState } from 'react'
import { Settings, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import type { DifficultyLevel } from '@/types/game'

/**
 * DifficultyControls Component
 * Teacher interface for overriding and monitoring adaptive difficulty
 */
export default function DifficultyControls() {
  const [expanded, setExpanded] = useState(false)
  const difficultySettings = useGameStore((state) => state.difficultySettings)
  const analytics = useGameStore((state) => state.analytics)
  const setDifficultyLevel = useGameStore((state) => state.setDifficultyLevel)

  const handleSetDifficulty = (level: DifficultyLevel) => {
    setDifficultyLevel(level)

    // Log to journal
    const { addJournalEntry, room } = useGameStore.getState()
    if (room) {
      addJournalEntry({
        id: `${Date.now()}`,
        room_id: room.id,
        actor: 'Teacher',
        text: `Difficulty manually set to ${level}`,
        created_at: new Date().toISOString()
      })
    }
  }

  const getLevelColor = (level: DifficultyLevel) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-600 hover:bg-green-700 border-green-500'
      case 'intermediate':
        return 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500'
      case 'advanced':
        return 'bg-red-600 hover:bg-red-700 border-red-500'
    }
  }

  const getLevelIcon = (level: DifficultyLevel) => {
    switch (level) {
      case 'beginner':
        return <TrendingDown className="w-4 h-4" />
      case 'intermediate':
        return <Minus className="w-4 h-4" />
      case 'advanced':
        return <TrendingUp className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg border-2 border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-steampunk-brass" />
          <span className="font-bold text-white">Difficulty Settings</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white border-2 ${getLevelColor(difficultySettings.level)}`}>
            {difficultySettings.level.toUpperCase()}
          </span>
          <span className="text-gray-400">{expanded ? '▼' : '▶'}</span>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 border-t-2 border-gray-700 space-y-4">
          {/* Current Status */}
          <div className="bg-gray-800 rounded p-3 space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase">Current Settings</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Auto-Adjust:</span>
                <span className="ml-2 text-white font-semibold">
                  {difficultySettings.autoAdjust ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Hints:</span>
                <span className="ml-2 text-white font-semibold">
                  {difficultySettings.hintsEnabled ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Vocabulary:</span>
                <span className="ml-2 text-white font-semibold">
                  Level 1-{difficultySettings.vocabularyMaxDifficulty}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Hint Delay:</span>
                <span className="ml-2 text-white font-semibold">
                  {difficultySettings.hintDelay / 1000}s
                </span>
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          {analytics && (
            <div className="bg-gray-800 rounded p-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Student Performance</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Grammar Accuracy:</span>
                  <span className={`font-bold ${
                    analytics.grammarAccuracy >= 80 ? 'text-green-400' :
                    analytics.grammarAccuracy >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {analytics.grammarAccuracy}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vocabulary Progress:</span>
                  <span className={`font-bold ${
                    analytics.vocabularyProgress >= 80 ? 'text-green-400' :
                    analytics.vocabularyProgress >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {analytics.vocabularyProgress}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Case Progress:</span>
                  <span className="text-white font-bold">
                    {analytics.caseProgress}%
                  </span>
                </div>
              </div>

              {/* Recommendation */}
              {analytics.totalGrammarAttempts >= 5 && (
                <div className="mt-3 p-2 bg-blue-900/30 border border-blue-700 rounded">
                  <p className="text-xs text-blue-300">
                    {analytics.grammarAccuracy < 50 && '⚠️ Student struggling - consider lowering difficulty'}
                    {analytics.grammarAccuracy >= 50 && analytics.grammarAccuracy < 80 && '✓ Student performing well at current level'}
                    {analytics.grammarAccuracy >= 80 && '⭐ Excellent performance - consider increasing difficulty'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual Override Buttons */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Manual Override</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSetDifficulty('beginner')}
                disabled={difficultySettings.level === 'beginner'}
                className={`px-3 py-2 rounded border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  difficultySettings.level === 'beginner'
                    ? getLevelColor('beginner') + ' ring-2 ring-white'
                    : 'bg-gray-800 border-gray-600 hover:border-green-500 text-white'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  {getLevelIcon('beginner')}
                  <span className="text-xs font-bold">Beginner</span>
                </div>
              </button>

              <button
                onClick={() => handleSetDifficulty('intermediate')}
                disabled={difficultySettings.level === 'intermediate'}
                className={`px-3 py-2 rounded border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  difficultySettings.level === 'intermediate'
                    ? getLevelColor('intermediate') + ' ring-2 ring-white'
                    : 'bg-gray-800 border-gray-600 hover:border-yellow-500 text-white'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  {getLevelIcon('intermediate')}
                  <span className="text-xs font-bold">Intermediate</span>
                </div>
              </button>

              <button
                onClick={() => handleSetDifficulty('advanced')}
                disabled={difficultySettings.level === 'advanced'}
                className={`px-3 py-2 rounded border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  difficultySettings.level === 'advanced'
                    ? getLevelColor('advanced') + ' ring-2 ring-white'
                    : 'bg-gray-800 border-gray-600 hover:border-red-500 text-white'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  {getLevelIcon('advanced')}
                  <span className="text-xs font-bold">Advanced</span>
                </div>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 italic">
            💡 Changes take effect immediately. The system will resume auto-adjusting based on student performance.
          </div>
        </div>
      )}
    </div>
  )
}
