'use client'

import { useState } from 'react'
import { BookOpen, Clock } from 'lucide-react'

interface JournalEntry {
  id: string
  actor: string
  text: string
  created_at: string
}

interface JournalPanelProps {
  entries: JournalEntry[]
}

export function JournalPanel({ entries }: JournalPanelProps) {
  const [filter, setFilter] = useState<'all' | 'detective' | 'conductor'>('all')

  const filteredEntries = entries.filter(entry => {
    if (filter === 'all') return true
    if (filter === 'detective') return entry.actor === 'Detective'
    if (filter === 'conductor') return entry.actor === 'Conductor Whibury'
    return true
  })

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getActorColor = (actor: string) => {
    if (actor === 'Detective') return 'text-blue-400'
    if (actor === 'Conductor Whibury') return 'text-steampunk-brass'
    return 'text-purple-400'
  }

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-steampunk-brass" />
            <h3 className="text-white font-bold text-sm">Investigation Journal</h3>
          </div>
          <span className="text-gray-400 text-xs">
            {entries.length} entries
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex space-x-1">
          {(['all', 'detective', 'conductor'] as const).map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filter === filterType
                  ? 'bg-steampunk-brass text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="text-gray-500 text-xs text-center py-4">
            {filter === 'all' 
              ? 'No journal entries yet. Start investigating!'
              : `No ${filter} entries yet.`
            }
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div
              key={entry.id}
              className="bg-gray-700/50 rounded-lg p-3 border-l-2 border-steampunk-bronze"
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${getActorColor(entry.actor)}`}>
                  {entry.actor}
                </span>
                <div className="flex items-center text-gray-500 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(entry.created_at)}
                </div>
              </div>
              
              <p className="text-white text-sm leading-relaxed">
                {entry.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Auto-scroll indicator */}
      {entries.length > 5 && (
        <div className="px-3 py-1 border-t border-gray-700">
          <div className="text-gray-500 text-xs text-center">
            Scroll up to see earlier entries
          </div>
        </div>
      )}
    </div>
  )
}