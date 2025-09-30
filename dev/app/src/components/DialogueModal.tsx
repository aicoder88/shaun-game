'use client'

import { useState, useEffect } from 'react'
import GrammarFeedback from './GrammarFeedback'
import { useGameStore } from '@/stores/gameStore'
import caseData from '../data/case_01.json'

interface DialogueNode {
  id: string
  speaker: string
  text: string
  grammarFocus?: string
  vocabulary?: string[]
  reveals?: string
  isGrammarFeedback?: boolean
  responses?: DialogueResponse[]
}

interface DialogueResponse {
  id: string
  text: string
  nextNodeId?: string
  grammarCorrect: boolean
  grammarFeedback?: {
    error: string
    explanation: string
    correctForm: string
    hint: string
    grammarRule: string
  }
}

interface DialogueModalProps {
  suspect: any
  onClose: () => void
  onGrammarMistake?: (feedback: any) => void
}

/**
 * DialogueModal Component
 * Handles interactive dialogue with suspects
 * Integrates grammar feedback for ESL learning
 */
export default function DialogueModal({
  suspect,
  onClose,
  onGrammarMistake
}: DialogueModalProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>('greeting')
  const [currentNode, setCurrentNode] = useState<DialogueNode | null>(null)
  const [showGrammarFeedback, setShowGrammarFeedback] = useState(false)
  const [selectedIncorrectResponse, setSelectedIncorrectResponse] = useState<DialogueResponse | null>(null)
  const [dialogueHistory, setDialogueHistory] = useState<string[]>([])
  const [hoveredWord, setHoveredWord] = useState<string | null>(null)
  const addDiscoveredWord = useGameStore((state) => state.addDiscoveredWord)

  // Track vocabulary words when dialogue node changes
  useEffect(() => {
    if (currentNode?.vocabulary) {
      currentNode.vocabulary.forEach(word => {
        addDiscoveredWord(word)
      })
    }
  }, [currentNode, addDiscoveredWord])

  useEffect(() => {
    // Load initial dialogue node
    const dialogue = suspect.dialogue?.find((d: any) => d.trigger === 'first_meeting')
    if (dialogue) {
      const node = dialogue.nodes.find((n: any) => n.id === currentNodeId)
      setCurrentNode(node || null)
    }
  }, [suspect, currentNodeId])

  const handleResponseClick = (response: DialogueResponse) => {
    // Track the student's choice
    setDialogueHistory([...dialogueHistory, response.text])

    // Check for grammar errors
    if (!response.grammarCorrect && response.grammarFeedback) {
      setSelectedIncorrectResponse(response)
      setShowGrammarFeedback(true)

      // Notify parent component for analytics
      if (onGrammarMistake) {
        onGrammarMistake({
          suspect: suspect.name,
          incorrectText: response.text,
          feedback: response.grammarFeedback,
          timestamp: new Date().toISOString()
        })
      }
      return
    }

    // Proceed to next dialogue node
    if (response.nextNodeId) {
      setCurrentNodeId(response.nextNodeId)
    } else {
      onClose()
    }
  }

  const handleGrammarFeedbackContinue = () => {
    setShowGrammarFeedback(false)

    // Navigate to the grammar correction node
    if (selectedIncorrectResponse?.nextNodeId) {
      setCurrentNodeId(selectedIncorrectResponse.nextNodeId)
    }

    setSelectedIncorrectResponse(null)
  }

  // Helper to get vocabulary definition
  const getVocabularyDefinition = (word: string) => {
    const vocabList = caseData.vocabulary as any[]
    return vocabList.find(v => v.word.toLowerCase() === word.toLowerCase())
  }

  // Helper to render text with highlighted vocabulary words
  const renderTextWithVocabulary = (text: string, vocabularyWords?: string[]) => {
    if (!vocabularyWords || vocabularyWords.length === 0) {
      return text
    }

    const parts: React.ReactNode[] = []
    let remainingText = text
    let key = 0

    vocabularyWords.forEach(vocabWord => {
      const regex = new RegExp(`\\b(${vocabWord})\\b`, 'gi')
      const newParts: React.ReactNode[] = []

      if (typeof remainingText === 'string') {
        const splits = remainingText.split(regex)
        splits.forEach((part, index) => {
          if (part.toLowerCase() === vocabWord.toLowerCase()) {
            const vocab = getVocabularyDefinition(part)
            newParts.push(
              <span
                key={`vocab-${key++}`}
                className="relative inline-block"
              >
                <span
                  className="underline decoration-dotted decoration-2 decoration-blue-500 cursor-help text-blue-700 font-semibold"
                  onMouseEnter={() => setHoveredWord(vocab?.word || part)}
                  onMouseLeave={() => setHoveredWord(null)}
                >
                  {part}
                </span>
                {hoveredWord === (vocab?.word || part) && vocab && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 w-64 pointer-events-none">
                    <div className="bg-blue-900 text-white p-3 rounded-lg shadow-2xl border-2 border-blue-400">
                      <p className="font-bold text-sm mb-1">{vocab.word}</p>
                      <p className="text-xs italic text-blue-200 mb-2">{vocab.partOfSpeech}</p>
                      <p className="text-xs">{vocab.definition}</p>
                    </div>
                  </div>
                )}
              </span>
            )
          } else {
            newParts.push(part)
          }
        })
        remainingText = newParts as any
      }
    })

    return remainingText
  }

  if (!currentNode) {
    return null
  }

  // Show grammar feedback modal if needed
  if (showGrammarFeedback && selectedIncorrectResponse?.grammarFeedback) {
    return (
      <GrammarFeedback
        feedback={selectedIncorrectResponse.grammarFeedback}
        incorrectText={selectedIncorrectResponse.text}
        onContinue={handleGrammarFeedbackContinue}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-t-2xl shadow-2xl max-w-4xl w-full border-t-4 border-amber-800 animate-slide-up">
        {/* Header with suspect info */}
        <div className="flex items-center gap-4 p-6 border-b-2 border-amber-800">
          <div className="w-16 h-16 bg-amber-800 rounded-full flex items-center justify-center text-3xl">
            🕵️
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-amber-900">{suspect.name}</h2>
            <p className="text-sm text-amber-700">{suspect.occupation} • {suspect.age} years old</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            End Conversation
          </button>
        </div>

        {/* Dialogue content */}
        <div className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto">
          {/* Current speaker text */}
          <div className={`mb-6 p-4 rounded-lg ${
            currentNode.isGrammarFeedback
              ? 'bg-yellow-100 border-2 border-yellow-400'
              : currentNode.speaker === suspect.name
              ? 'bg-white border-2 border-amber-300'
              : 'bg-blue-50 border-2 border-blue-300'
          }`}>
            <p className="text-sm font-semibold mb-2 text-gray-700">
              {currentNode.speaker}:
            </p>
            <p className="text-lg text-gray-900">
              {renderTextWithVocabulary(currentNode.text, currentNode.vocabulary)}
            </p>

            {/* Grammar focus indicator */}
            {currentNode.grammarFocus && (
              <div className="mt-3 text-xs text-purple-700 bg-purple-100 px-3 py-1 rounded-full inline-block">
                📚 Grammar: {currentNode.grammarFocus}
              </div>
            )}

            {/* Vocabulary hints */}
            {currentNode.vocabulary && currentNode.vocabulary.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {currentNode.vocabulary.map((word, index) => (
                  <span
                    key={index}
                    className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full cursor-help"
                    title={`New vocabulary: ${word}`}
                  >
                    💡 {word}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Response options */}
          {currentNode.responses && currentNode.responses.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-3">Your response:</p>
              {currentNode.responses.map((response) => (
                <button
                  key={response.id}
                  onClick={() => handleResponseClick(response)}
                  className={`w-full text-left p-4 rounded-lg transition-all border-2 ${
                    response.grammarCorrect
                      ? 'bg-white hover:bg-green-50 border-gray-300 hover:border-green-400 hover:shadow-lg'
                      : 'bg-white hover:bg-red-50 border-gray-300 hover:border-red-400 hover:shadow-lg'
                  }`}
                >
                  <p className="text-gray-900">{response.text}</p>
                </button>
              ))}
            </div>
          )}

          {/* Continue button (if no responses) */}
          {(!currentNode.responses || currentNode.responses.length === 0) && (
            <button
              onClick={onClose}
              className="w-full mt-4 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
            >
              Continue Investigation ➜
            </button>
          )}
        </div>

        {/* Footer with hint */}
        <div className="px-6 py-3 bg-amber-50 border-t-2 border-amber-200 rounded-b-2xl">
          <p className="text-xs text-amber-800 text-center">
            💡 Choose your responses carefully. Correct grammar may reveal more information!
          </p>
        </div>
      </div>
    </div>
  )
}
