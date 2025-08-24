'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateRoomCode, randomChoice } from '@/lib/utils'
import { PhaserGame } from '@/components/PhaserGame'
import { TeacherControls } from '@/components/TeacherControls'
import { JournalPanel } from '@/components/JournalPanel'
import { ChatPanel } from '@/components/ChatPanel'
import caseData from '../../data/case_01.json'

export default function ConductorPage() {
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')
  
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [gameManager, setGameManager] = useState<any>(null)
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])

  useEffect(() => {
    if (roomCode) {
      joinExistingRoom(roomCode)
    } else {
      setLoading(false)
    }
  }, [roomCode])

  const joinExistingRoom = async (code: string) => {
    try {
      if (!supabase) throw new Error('Database not available')
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .single()

      if (error || !data) throw error || new Error('Room not found')

      setRoom(data)
      setLoading(false)
      setupRealtimeSubscriptions(data.id)
    } catch (error) {
      console.error('Error joining room:', error)
      setLoading(false)
    }
  }

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

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          code,
          scene: 'menu',
          teacher_id: teacherId,
          killer_id: killerId,
          lens_charges: 3,
          inventory: { items: [] },
          hotspots: { discovered: [] },
          suspects: { list: caseData.suspects.map(s => ({ ...s, cluesFound: [] })) },
          locked: false
        })
        .select()
        .single()

      if (error) throw error

      setRoom(data)
      setupRealtimeSubscriptions(data.id)
      
      // Update URL to include room code
      window.history.pushState({}, '', `/conductor?room=${code}`)
    } catch (error) {
      console.error('Error creating room:', error)
    } finally {
      setCreating(false)
    }
  }

  const setupRealtimeSubscriptions = (roomId: string) => {
    // Subscribe to room changes
    supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          setRoom(payload.new)
        }
      )
      .subscribe()

    // Subscribe to journal entries
    supabase
      .channel(`journal_${roomId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'journal_entries', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setJournalEntries(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    // Subscribe to chat messages
    supabase
      .channel(`chat_${roomId}`)
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
  }

  const loadJournalEntries = async (roomId: string) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (data) {
      setJournalEntries(data)
    }
  }

  const loadChatMessages = async (roomId: string) => {
    const { data, error } = await supabase
      .from('chat')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (data) {
      setChatMessages(data)
    }
  }

  const updateRoom = async (updates: any) => {
    if (!room) return

    const { error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', room.id)

    if (error) {
      console.error('Failed to update room:', error)
    }
  }

  const sendBroadcast = async (message: string) => {
    if (!room) return

    await supabase
      .from('chat')
      .insert({
        room_id: room.id,
        sender: 'Conductor Whibury',
        message
      })
  }

  const grantLensCharge = () => {
    updateRoom({ lens_charges: Math.min((room?.lens_charges || 0) + 1, 5) })
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
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Conductor Whibury&apos;s Control Room
          </h1>
          
          <div className="bg-black/50 p-8 rounded-lg text-center">
            <p className="text-white text-xl mb-8">
              Welcome, Conductor! Create a new case or join an existing room.
            </p>
            
            <button
              onClick={createNewRoom}
              disabled={creating}
              className="bg-steampunk-brass hover:bg-steampunk-bronze text-white font-bold py-4 px-8 rounded-lg text-xl disabled:opacity-50"
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

          {/* Room Code Display */}
          <div className="absolute top-4 left-4 z-50">
            <div className="bg-black/80 text-white px-4 py-2 rounded-lg">
              <div className="text-sm">Room Code:</div>
              <div className="text-2xl font-bold text-steampunk-brass">{room.code}</div>
              <div className="text-xs">
                Student URL: {window.location.origin}/play?room={room.code}
              </div>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="w-80 bg-gray-900 flex flex-col">
          {/* Journal Panel */}
          <div className="flex-1 border-b border-gray-700">
            <JournalPanel entries={journalEntries} />
          </div>
          
          {/* Chat Panel */}
          <div className="h-64">
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