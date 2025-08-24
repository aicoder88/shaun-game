'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PhaserGame } from '@/components/PhaserGame'
import { StudentInterface } from '@/components/StudentInterface'
import { InventoryPanel } from '@/components/InventoryPanel'
import { JournalPanel } from '@/components/JournalPanel'
import { ChatPanel } from '@/components/ChatPanel'

export default function PlayPage() {
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')
  
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameManager, setGameManager] = useState<any>(null)
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])

  useEffect(() => {
    if (roomCode) {
      joinRoom(roomCode)
    } else {
      setError('No room code provided. Please ask your teacher for the room code.')
      setLoading(false)
    }
  }, [roomCode])

  const joinRoom = async (code: string) => {
    try {
      // Get or create anonymous user for student
      const { data: { user } } = await supabase.auth.getUser()
      let studentId = user?.id

      if (!studentId) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
        if (authError) throw authError
        studentId = authData.user?.id
      }

      // Find room by code
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .single()

      if (roomError) throw new Error('Room not found. Please check the room code.')

      // Update room with student ID if not already set
      if (!roomData.student_id) {
        const { error: updateError } = await supabase
          .from('rooms')
          .update({ student_id: studentId })
          .eq('id', roomData.id)

        if (updateError) throw updateError
        roomData.student_id = studentId
      }

      setRoom(roomData)
      setInventory(roomData.inventory?.items || [])
      setupRealtimeSubscriptions(roomData.id)
      
    } catch (error: any) {
      console.error('Error joining room:', error)
      setError(error.message || 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscriptions = (roomId: string) => {
    // Subscribe to room changes
    supabase
      .channel(`student_room_${roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          setRoom(payload.new)
          setInventory(payload.new.inventory?.items || [])
        }
      )
      .subscribe()

    // Subscribe to journal entries
    supabase
      .channel(`student_journal_${roomId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'journal_entries', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setJournalEntries(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    // Subscribe to chat messages
    supabase
      .channel(`student_chat_${roomId}`)
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
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (data) {
      setJournalEntries(data)
    }
  }

  const loadChatMessages = async (roomId: string) => {
    const { data } = await supabase
      .from('chat')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (data) {
      setChatMessages(data)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black">
        <div className="text-white text-xl">Boarding the Bullet Express...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black p-8">
        <div className="max-w-md mx-auto bg-black/50 p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Connection Error</h1>
          <p className="text-white mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-steampunk-brass hover:bg-steampunk-bronze text-white font-bold py-2 px-6 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black p-8">
        <div className="max-w-md mx-auto bg-black/50 p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Room Not Found</h1>
          <p className="text-gray-300 mb-6">
            The room code you entered doesn&apos;t exist or has expired.
          </p>
          <button
            onClick={() => window.location.href = '/menu'}
            className="bg-steampunk-brass hover:bg-steampunk-bronze text-white font-bold py-2 px-6 rounded"
          >
            Back to Menu
          </button>
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
            isTeacher={false}
            onGameReady={setGameManager}
          />
          
          {/* Student Interface Overlay */}
          <StudentInterface 
            room={room}
            lensCharges={room.lens_charges || 0}
            isLocked={room.locked || false}
          />

          {/* Room Info */}
          <div className="absolute top-4 left-4 z-50">
            <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
              <div>Room: <span className="text-steampunk-brass font-bold">{room.code}</span></div>
              <div>Detective: <span className="text-blue-400">You</span></div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="absolute top-4 right-4 z-50">
            <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${room.locked ? 'bg-red-400' : 'bg-green-400'}`}></div>
              <div>{room.locked ? 'Investigation Paused' : 'Investigation Active'}</div>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="w-80 bg-gray-900 flex flex-col">
          {/* Inventory Panel */}
          <div className="h-32 border-b border-gray-700">
            <InventoryPanel items={inventory} />
          </div>
          
          {/* Journal Panel */}
          <div className="flex-1 border-b border-gray-700">
            <JournalPanel entries={journalEntries} />
          </div>
          
          {/* Chat Panel */}
          <div className="h-48">
            <ChatPanel
              messages={chatMessages}
              roomId={room.id}
              userType="student"
            />
          </div>
        </div>
      </div>
    </div>
  )
}