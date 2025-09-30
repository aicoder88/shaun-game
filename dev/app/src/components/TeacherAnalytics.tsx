'use client'

import { useMemo } from 'react'
import { TrendingUp, Award, BookOpen, Brain, Clock, Target, Download } from 'lucide-react'
import type { StudentAnalytics } from '@/types/game'

interface TeacherAnalyticsProps {
  analytics: StudentAnalytics | null
  studentName?: string
}

/**
 * TeacherAnalytics Component
 * Real-time dashboard showing student ESL performance and engagement metrics
 * Provides actionable insights for teachers
 */
export default function TeacherAnalytics({
  analytics,
  studentName = 'Student'
}: TeacherAnalyticsProps) {
  // Calculate derived metrics
  const metrics = useMemo(() => {
    if (!analytics) return null

    const grammarAccuracy = analytics.totalGrammarAttempts > 0
      ? Math.round((analytics.correctGrammarAttempts / analytics.totalGrammarAttempts) * 100)
      : 0

    const vocabularyPercentage = analytics.totalVocabularyWords > 0
      ? Math.round((analytics.discoveredWords.length / analytics.totalVocabularyWords) * 100)
      : 0

    const cluePercentage = analytics.totalClues > 0
      ? Math.round((analytics.cluesDiscovered / analytics.totalClues) * 100)
      : 0

    const sessionMinutes = Math.floor(analytics.sessionDuration / 60)

    return {
      grammarAccuracy,
      vocabularyPercentage,
      cluePercentage,
      sessionMinutes,
      engagementScore: Math.round(
        (analytics.suspectInteractions * 10 +
          analytics.journalEntries * 5 +
          analytics.chatMessages * 2) / 3
      )
    }
  }, [analytics])

  // Export analytics as CSV
  const exportReport = () => {
    if (!analytics) return

    const csv = [
      ['Student Performance Report'],
      ['Generated', new Date().toLocaleString()],
      ['Student', studentName],
      [''],
      ['Grammar Performance'],
      ['Total Attempts', analytics.totalGrammarAttempts],
      ['Correct Attempts', analytics.correctGrammarAttempts],
      ['Accuracy', `${metrics?.grammarAccuracy}%`],
      [''],
      ['Vocabulary Progress'],
      ['Words Discovered', analytics.discoveredWords.length],
      ['Total Words', analytics.totalVocabularyWords],
      ['Progress', `${metrics?.vocabularyPercentage}%`],
      [''],
      ['Investigation Progress'],
      ['Clues Found', analytics.cluesDiscovered],
      ['Total Clues', analytics.totalClues],
      ['Lens Charges Used', analytics.lensChargesUsed],
      ['Dialogues Completed', analytics.dialoguesCompleted.length],
      ['Mini-games Completed', analytics.minigamesCompleted.length],
      [''],
      ['Grammar Mistakes'],
      ['Timestamp', 'Suspect', 'Incorrect', 'Correct', 'Error Type'],
      ...analytics.grammarMistakes.map(m => [
        new Date(m.timestamp).toLocaleTimeString(),
        m.suspect,
        m.incorrectText,
        m.correctForm,
        m.error
      ])
    ]

    const csvContent = csv.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${studentName}_analytics_${Date.now()}.csv`
    a.click()
  }

  if (!analytics || !metrics) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <Brain className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" />
        <p className="text-gray-400">No student data available</p>
        <p className="text-sm text-gray-500 mt-1">Analytics will appear when a student joins</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-steampunk-brass flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Student Analytics
          </h3>
          <p className="text-sm text-gray-400">{studentName}&apos;s Performance</p>
        </div>
        <button
          onClick={exportReport}
          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Grammar Accuracy */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4 border-2 border-blue-600">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-blue-300" />
            <span className="text-xs text-blue-300 font-semibold">Grammar Accuracy</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {metrics.grammarAccuracy}%
          </div>
          <div className="text-xs text-blue-200">
            {analytics.correctGrammarAttempts}/{analytics.totalGrammarAttempts} correct
          </div>
          {/* Progress bar */}
          <div className="mt-2 bg-blue-950 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-400 h-full transition-all duration-500"
              style={{ width: `${metrics.grammarAccuracy}%` }}
            />
          </div>
        </div>

        {/* Vocabulary Progress */}
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4 border-2 border-purple-600">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-purple-300" />
            <span className="text-xs text-purple-300 font-semibold">Vocabulary</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {metrics.vocabularyPercentage}%
          </div>
          <div className="text-xs text-purple-200">
            {analytics.discoveredWords.length}/{analytics.totalVocabularyWords} words
          </div>
          <div className="mt-2 bg-purple-950 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-400 h-full transition-all duration-500"
              style={{ width: `${metrics.vocabularyPercentage}%` }}
            />
          </div>
        </div>

        {/* Investigation Progress */}
        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-4 border-2 border-green-600">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-300" />
            <span className="text-xs text-green-300 font-semibold">Investigation</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {metrics.cluePercentage}%
          </div>
          <div className="text-xs text-green-200">
            {analytics.cluesDiscovered}/{analytics.totalClues} clues found
          </div>
          <div className="mt-2 bg-green-950 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-400 h-full transition-all duration-500"
              style={{ width: `${metrics.cluePercentage}%` }}
            />
          </div>
        </div>

        {/* Session Time */}
        <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-4 border-2 border-orange-600">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-300" />
            <span className="text-xs text-orange-300 font-semibold">Session Time</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {metrics.sessionMinutes}m
          </div>
          <div className="text-xs text-orange-200">
            {analytics.dialoguesCompleted.length} dialogues completed
          </div>
        </div>
      </div>

      {/* Grammar Mistakes Section */}
      {analytics.grammarMistakes.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-red-800">
          <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Recent Grammar Mistakes ({analytics.grammarMistakes.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {analytics.grammarMistakes.slice(-5).reverse().map((mistake, index) => (
              <div
                key={mistake.id || index}
                className="bg-gray-900 rounded p-3 text-xs border-l-4 border-red-500"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400">{mistake.suspect}</span>
                  <span className="text-gray-500">
                    {new Date(mistake.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-red-300 line-through mb-1">{mistake.incorrectText}</div>
                <div className="text-green-300">✓ {mistake.correctForm}</div>
                <div className="text-gray-500 italic mt-1">{mistake.error}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Metrics */}
      <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
        <h4 className="text-sm font-bold text-gray-300 mb-3">Engagement Metrics</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-steampunk-brass">
              {analytics.suspectInteractions}
            </div>
            <div className="text-xs text-gray-400">Suspect Talks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-steampunk-brass">
              {analytics.journalEntries}
            </div>
            <div className="text-xs text-gray-400">Journal Entries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-steampunk-brass">
              {analytics.minigamesCompleted.length}
            </div>
            <div className="text-xs text-gray-400">Mini-games</div>
          </div>
        </div>
      </div>

      {/* Mini-game Scores */}
      {Object.keys(analytics.minigameScores).length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
          <h4 className="text-sm font-bold text-gray-300 mb-3">Mini-game Performance</h4>
          <div className="space-y-2">
            {Object.entries(analytics.minigameScores).map(([game, score]) => (
              <div key={game} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{game}</span>
                <span className="text-sm font-bold text-steampunk-brass">{score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
