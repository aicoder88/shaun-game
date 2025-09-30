'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateRoomCode, randomChoice } from '@/lib/utils'
import { PhaserGame } from '@/components/PhaserGame'
import { TeacherControls } from '@/components/TeacherControls'
import { JournalPanel } from '@/components/JournalPanel'
import { ChatPanel } from '@/components/ChatPanel'
import TeacherAnalytics from '@/components/TeacherAnalytics'
import DifficultyControls from '@/components/DifficultyControls'
import { useGameStore } from '@/stores/gameStore'
import caseData from '../data/case_01.json'

export default function ConductorPageClient() {
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')
  
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [gameManager, setGameManager] = useState<any>(null)
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const analytics = useGameStore((state) => state.analytics)

  const loadJournalEntries = useCallback(async (roomId: string) => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (data) {
      setJournalEntries(data)
    }
  }, [])

  const loadChatMessages = useCallback(async (roomId: string) => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('chat')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (data) {
      setChatMessages(data)
    }
  }, [])

  const setupRealtimeSubscriptions = useCallback((roomId: string) => {
    // Subscribe to room changes
    supabase
      ?.channel(`room_${roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          setRoom(payload.new)
        }
      )
      .subscribe()

    // Subscribe to journal entries
    supabase
      ?.channel(`journal_${roomId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'journal_entries', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setJournalEntries(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    // Subscribe to chat messages
    supabase
      ?.channel(`chat_${roomId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setChatMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    // Load existing data
    loadJournalEntries(roomId)
    loadChatMessages(roomId)
  }, [loadJournalEntries, loadChatMessages])

  const joinExistingRoom = useCallback(async (code: string) => {
    try {
      if (!supabase) throw new Error('Database not available')
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .single()

      if (error || !data) throw error || new Error('Room not found')

      const roomData = data as any
      setRoom(roomData)
      setLoading(false)
      setupRealtimeSubscriptions(roomData.id)
    } catch (error) {
      console.error('Error joining room:', error)
      setLoading(false)
    }
  }, [setupRealtimeSubscriptions])

  useEffect(() => {
    if (roomCode) {
      joinExistingRoom(roomCode)
    } else {
      setLoading(false)
    }
  }, [roomCode, joinExistingRoom])

  const createNewRoom = async () => {
    setCreating(true)
    try {
      if (!supabase) throw new Error('Database not available')
      
      const code = generateRoomCode()
      const killerId = randomChoice(['lestrange', 'gaspard', 'zane'])
      
      const { data: { user } } = await supabase.auth.getUser()
      let teacherId = user?.id

      if (!teacherId) {
        // Create anonymous user for teacher
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
        if (authError) throw authError
        teacherId = authData.user?.id
      }

      const { data, error } = await (supabase as any)
        .from('rooms')
        .insert({
          code,
          scene: 'menu',
          teacher_id: teacherId,
          killer_id: killerId,
          lens_charges: 3,
          inventory: { items: [] },
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setRoom(data)
      setupRealtimeSubscriptions(data.id)
      
      // Update URL to include room code
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/conductor?room=${code}`)
      }
    } catch (error) {
      console.error('Error creating room:', error)
    } finally {
      setCreating(false)
    }
  }

  const updateRoom = async (updates: any) => {
    if (!room) return
    if (!supabase) {
      console.error('Database not available')
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('rooms')
        .update(updates)
        .eq('id', room.id)

      if (error) {
        console.error('Supabase error updating room:', error)
        throw new Error(`Failed to update room: ${error.message}`)
      }

    } catch (error) {
      console.error('Error updating room:', error)
    }
  }

  const sendBroadcast = (message: string) => {
    if (gameManager && gameManager.sendChat) {
      gameManager.sendChat('Conductor Whibury', message)
    }
  }

  const grantLensCharge = () => {
    const newCharges = (room?.lens_charges || 0) + 1
    updateRoom({ lens_charges: newCharges })
  }

  const toggleFreeze = () => {
    updateRoom({ locked: !room?.locked })
  }

  const changeScene = (newScene: string) => {
    updateRoom({ scene: newScene })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black">
        <div className="text-white text-xl">Loading conductor dashboard...</div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-steampunk-brass mb-8">
            🎩 Conductor Dashboard
          </h1>
          
          <div className="bg-black/50 p-8 rounded-xl border border-steampunk-copper/30">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Case</h2>
            <p className="text-gray-300 mb-6">
              Start a fresh mystery for your students to solve
            </p>
            
            <p className="text-sm text-gray-400 mb-6">
              Case: &quot;{caseData.title}&quot; • Killer: {caseData.suspects[0].name}, {caseData.suspects[1].name}, or {caseData.suspects[2].name}
            </p>
            
            <button
              onClick={createNewRoom}
              disabled={creating}
              className="px-8 py-4 bg-steampunk-brass hover:bg-steampunk-bronze disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-lg"
            >
              {creating ? 'Creating Case...' : 'Start New Case'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex h-screen">
        {/* Game Area */}
        <div className="flex-1 relative">
          <PhaserGame 
            roomId={room.id} 
            isTeacher={true}
            onGameReady={setGameManager}
          />
          
          {/* Teacher Controls Overlay */}
          <div className="absolute top-4 right-4 z-50">
            <TeacherControls
              room={room}
              onUpdateRoom={updateRoom}
              onSendBroadcast={sendBroadcast}
              onGrantLens={grantLensCharge}
              onToggleFreeze={toggleFreeze}
              onChangeScene={changeScene}
            />
          </div>
        </div>

        {/* Side Panels */}
        <div className="w-96 bg-black/90 backdrop-blur-sm border-l border-steampunk-copper/30 flex flex-col overflow-hidden">
          {/* Room Info Header */}
          <div className="p-4 border-b border-steampunk-copper/30 flex-shrink-0">
            <h2 className="text-xl font-bold text-steampunk-brass">Case Control Room</h2>
            <p className="text-sm text-gray-300">
              Room Code: <span className="font-mono text-steampunk-brass font-bold text-lg">{room.code}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Scene: {room.scene} • Lens: {room.lens_charges || 0} • {room.locked ? '🔒 Frozen' : '🔓 Active'}
            </p>
          </div>

          {/* Difficulty Controls */}
          <div className="p-4 border-b border-steampunk-copper/30 flex-shrink-0">
            <DifficultyControls />
          </div>

          {/* Analytics Panel */}
          <div className="p-4 border-b border-steampunk-copper/30 overflow-y-auto flex-shrink-0" style={{ maxHeight: '35vh' }}>
            <TeacherAnalytics analytics={analytics} studentName="Student" />
          </div>

          {/* Journal Panel */}
          <div className="flex-1 border-b border-steampunk-copper/30 overflow-hidden">
            <JournalPanel
              entries={journalEntries}
            />
          </div>

          {/* Chat Panel */}
          <div className="h-48 flex-shrink-0">
            <ChatPanel 
              messages={chatMessages}
              roomId={room.id}
              userType="teacher"
            />
          </div>
        </div>
      </div>
    </div>
  )
}