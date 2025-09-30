'use client'

import { useState, useMemo } from 'react'
import { Book, Search, Star, X } from 'lucide-react'
import caseData from '../data/case_01.json'

interface VocabularyWord {
  word: string
  definition: string
  example: string
  partOfSpeech: string
  difficulty: number
  synonyms: string[]
}

interface VocabularyGlossaryProps {
  discoveredWords?: string[]
  onClose: () => void
}

/**
 * VocabularyGlossary Component
 * Displays an interactive glossary of ESL vocabulary words
 * Tracks which words students have encountered during gameplay
 */
export default function VocabularyGlossary({
  discoveredWords = [],
  onClose
}: VocabularyGlossaryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<number | null>(null)
  const [showOnlyDiscovered, setShowOnlyDiscovered] = useState(false)

  const vocabulary = caseData.vocabulary as VocabularyWord[]

  // Filter and search vocabulary
  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter(word => {
      const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           word.definition.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDifficulty = filterDifficulty === null || word.difficulty === filterDifficulty

      const matchesDiscovered = !showOnlyDiscovered ||
                               discoveredWords.includes(word.word.toLowerCase())

      return matchesSearch && matchesDifficulty && matchesDiscovered
    })
  }, [searchTerm, filterDifficulty, showOnlyDiscovered, discoveredWords, vocabulary])

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Basic'
      case 2: return 'Intermediate'
      case 3: return 'Advanced'
      default: return 'Unknown'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border-4 border-amber-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-amber-800">
          <div className="flex items-center gap-3">
            <Book className="w-8 h-8 text-amber-800" />
            <div>
              <h2 className="text-3xl font-bold text-amber-900">Detective&apos;s Vocabulary</h2>
              <p className="text-sm text-amber-700">
                {discoveredWords.length} of {vocabulary.length} words discovered
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-amber-800" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b-2 border-amber-200 bg-amber-100">
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowOnlyDiscovered(!showOnlyDiscovered)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                showOnlyDiscovered
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-amber-800 border-2 border-amber-300'
              }`}
            >
              <Star className="w-3 h-3 inline mr-1" />
              Discovered Only
            </button>

            {[1, 2, 3].map(level => (
              <button
                key={level}
                onClick={() => setFilterDifficulty(filterDifficulty === level ? null : level)}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                  filterDifficulty === level
                    ? getDifficultyColor(level) + ' text-white'
                    : 'bg-white text-gray-800 border-2 border-gray-300'
                }`}
              >
                {getDifficultyLabel(level)}
              </button>
            ))}

            {(searchTerm || filterDifficulty || showOnlyDiscovered) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterDifficulty(null)
                  setShowOnlyDiscovered(false)
                }}
                className="px-3 py-1 rounded-full text-sm bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Word List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredVocabulary.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Book className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No words found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredVocabulary.map((word) => {
                const isDiscovered = discoveredWords.includes(word.word.toLowerCase())

                return (
                  <button
                    key={word.word}
                    onClick={() => setSelectedWord(word)}
                    className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                      isDiscovered
                        ? 'bg-white border-amber-300 hover:border-amber-500'
                        : 'bg-gray-100 border-gray-300 hover:border-gray-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {word.word}
                          {isDiscovered && (
                            <Star className="w-4 h-4 inline ml-1 text-yellow-500 fill-yellow-500" />
                          )}
                        </h3>
                        <span className="text-xs text-gray-500 italic">{word.partOfSpeech}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getDifficultyColor(word.difficulty)}`}>
                        {word.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{word.definition}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Word Detail Modal */}
        {selectedWord && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border-4 border-amber-600">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-bold text-amber-900">{selectedWord.word}</h3>
                    {discoveredWords.includes(selectedWord.word.toLowerCase()) && (
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 italic">{selectedWord.partOfSpeech}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getDifficultyColor(selectedWord.difficulty)}`}>
                      {getDifficultyLabel(selectedWord.difficulty)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Definition */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-1">Definition</h4>
                  <p className="text-gray-900">{selectedWord.definition}</p>
                </div>

                {/* Example */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-1">Example</h4>
                  <p className="text-gray-900 italic bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    &ldquo;{selectedWord.example}&rdquo;
                  </p>
                </div>

                {/* Synonyms */}
                {selectedWord.synonyms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Similar Words</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedWord.synonyms.map((synonym, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {synonym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedWord(null)}
                className="w-full mt-6 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
