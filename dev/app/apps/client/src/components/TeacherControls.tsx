'use client'

import { useState } from 'react'
import { Play, Pause, Eye, MessageSquare, Settings, Users, BookOpen } from 'lucide-react'

interface TeacherControlsProps {
  room: any
  onUpdateRoom: (updates: any) => void
  onSendBroadcast: (message: string) => void
  onGrantLens: () => void
  onToggleFreeze: () => void
  onChangeScene: (scene: string) => void
}

export function TeacherControls({
  room,
  onUpdateRoom,
  onSendBroadcast,
  onGrantLens,
  onToggleFreeze,
  onChangeScene
}: TeacherControlsProps) {
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [showScenes, setShowScenes] = useState(false)

  const handleBroadcast = () => {
    if (broadcastMessage.trim()) {
      onSendBroadcast(broadcastMessage)
      setBroadcastMessage('')
      setShowBroadcast(false)
    }
  }

  const scenes = [
    { key: 'menu', name: 'Menu', description: 'Main menu' },
    { key: 'carriage', name: 'Carriage', description: 'Investigation scene' },
    { key: 'accuse', name: 'Accusation', description: 'Make accusation' },
    { key: 'debrief', name: 'Debrief', description: 'Case results' }
  ]

  return (
    <div className="bg-black/90 p-4 rounded-lg border border-steampunk-bronze min-w-64">
      <h3 className="text-steampunk-brass font-bold text-lg mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2" />
        Conductor Controls
      </h3>

      {/* Quick Stats */}
      <div className="mb-4 p-3 bg-gray-800/50 rounded">
        <div className="text-white text-sm space-y-1">
          <div className="flex justify-between">
            <span>Room:</span>
            <span className="text-steampunk-brass font-mono">{room.code}</span>
          </div>
          <div className="flex justify-between">
            <span>Scene:</span>
            <span className="text-blue-400 capitalize">{room.scene}</span>
          </div>
          <div className="flex justify-between">
            <span>Lens Charges:</span>
            <span className="text-yellow-400">{room.lens_charges || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={room.locked ? 'text-red-400' : 'text-green-400'}>
              {room.locked ? 'Paused' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-2">
        {/* Pause/Resume */}
        <button
          onClick={onToggleFreeze}
          className={`w-full flex items-center justify-center px-4 py-2 rounded font-medium transition-colors ${
            room.locked 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {room.locked ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Resume Investigation
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause Investigation
            </>
          )}
        </button>

        {/* Grant Lens Charge */}
        <button
          onClick={onGrantLens}
          className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium transition-colors"
          disabled={room.lens_charges >= 5}
        >
          <Eye className="w-4 h-4 mr-2" />
          Grant Insight Lens
        </button>

        {/* Broadcast Message */}
        <button
          onClick={() => setShowBroadcast(!showBroadcast)}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Broadcast Message
        </button>

        {/* Change Scene */}
        <button
          onClick={() => setShowScenes(!showScenes)}
          className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Change Scene
        </button>
      </div>

      {/* Broadcast Message Panel */}
      {showBroadcast && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded">
          <h4 className="text-white font-medium mb-2">Broadcast to Student</h4>
          <textarea
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Enter your message as Conductor Whibury..."
            className="w-full h-20 p-2 bg-gray-700 text-white rounded text-sm resize-none"
            maxLength={200}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-400 text-xs">
              {broadcastMessage.length}/200
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setShowBroadcast(false)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                disabled={!broadcastMessage.trim()}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scene Selection Panel */}
      {showScenes && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded">
          <h4 className="text-white font-medium mb-2">Select Scene</h4>
          <div className="space-y-1">
            {scenes.map(scene => (
              <button
                key={scene.key}
                onClick={() => {
                  onChangeScene(scene.key)
                  setShowScenes(false)
                }}
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  room.scene === scene.key
                    ? 'bg-steampunk-brass text-black'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <div className="font-medium">{scene.name}</div>
                <div className="text-xs opacity-75">{scene.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-white font-medium mb-2 text-sm">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSendBroadcast("Great detective work! Keep investigating.")}
            className="px-2 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs rounded"
          >
            Encourage
          </button>
          <button
            onClick={() => onSendBroadcast("Look more carefully at the clues you've found.")}
            className="px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 text-xs rounded"
          >
            Hint
          </button>
          <button
            onClick={() => onSendBroadcast("Take your time and examine everything thoroughly.")}
            className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs rounded"
          >
            Slow Down
          </button>
          <button
            onClick={() => onSendBroadcast("Try talking to the suspects again.")}
            className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 text-xs rounded"
          >
            Redirect
          </button>
        </div>
      </div>
    </div>
  )
}