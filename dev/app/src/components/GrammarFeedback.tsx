'use client'

import { useState } from 'react'

interface GrammarFeedbackData {
  error: string
  explanation: string
  correctForm: string
  hint: string
  grammarRule: string
}

interface GrammarFeedbackProps {
  feedback: GrammarFeedbackData
  incorrectText: string
  onContinue: () => void
}

/**
 * GrammarFeedback Component
 * Displays educational feedback when students make grammar mistakes in dialogue choices
 * Provides hints, explanations, and correct forms to support learning
 */
export default function GrammarFeedback({
  feedback,
  incorrectText,
  onContinue
}: GrammarFeedbackProps) {
  const [showHint, setShowHint] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-2xl max-w-2xl w-full p-6 border-4 border-amber-800">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-900">Grammar Error Detected</h2>
            <p className="text-sm text-amber-700">{feedback.error}</p>
          </div>
        </div>

        {/* Your Answer */}
        <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
          <p className="text-sm font-semibold text-red-900 mb-1">Your answer:</p>
          <p className="text-lg text-red-800 line-through italic">{incorrectText}</p>
        </div>

        {/* Hint Section (Progressive Disclosure) */}
        <div className="mb-4">
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              💡 Show Hint
            </button>
          ) : (
            <div className="p-4 bg-blue-100 border-2 border-blue-300 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-1">💡 Hint:</p>
              <p className="text-blue-800">{feedback.hint}</p>
            </div>
          )}
        </div>

        {/* Explanation Section (Progressive Disclosure) */}
        {showHint && (
          <div className="mb-4">
            {!showExplanation ? (
              <button
                onClick={() => setShowExplanation(true)}
                className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
              >
                📚 Show Explanation
              </button>
            ) : (
              <div className="p-4 bg-purple-100 border-2 border-purple-300 rounded-lg">
                <p className="text-sm font-semibold text-purple-900 mb-2">📚 Grammar Rule:</p>
                <p className="text-purple-800 mb-3">{feedback.grammarRule}</p>
                <p className="text-sm text-purple-700 italic">{feedback.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Correct Answer */}
        {showExplanation && (
          <div className="mb-6 p-4 bg-green-100 border-2 border-green-400 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-1">✓ Correct form:</p>
            <p className="text-lg text-green-800 font-semibold">{feedback.correctForm}</p>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          disabled={!showExplanation}
          className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-all ${
            showExplanation
              ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {showExplanation ? 'Try Again ➜' : 'Review the hint and explanation first'}
        </button>
      </div>
    </div>
  )
}
