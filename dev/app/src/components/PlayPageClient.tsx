'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PhaserGame } from '@/components/PhaserGame'
import { StudentInterface } from '@/components/StudentInterface'
import { InventoryPanel } from '@/components/InventoryPanel'
import { JournalPanel } from '@/components/JournalPanel'
import { ChatPanel } from '@/components/ChatPanel'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useGameStore } from '@/stores/gameStore'

export default function PlayPageClient() {
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')
  
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameManager, setGameManager] = useState<any>(null)
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])

  // Memoized computed values to prevent unnecessary re-renders
  const gameState = useMemo(() => ({
    roomId: room?.id,
    isTeacher: false,
    lensCharges: room?.lens_charges || 0,
    isLocked: room?.locked || false,
    inventory: room?.inventory?.items || []
  }), [room?.id, room?.lens_charges, room?.locked, room?.inventory])

  const roomInfo = useMemo(() => ({
    code: room?.code,
    status: room?.locked ? 'Investigation Paused' : 'Investigation Active',
    statusColor: room?.locked ? 'bg-red-400' : 'bg-green-400'
  }), [room?.code, room?.locked])

  const loadJournalEntries = useCallback(async (roomId: string) => {
    if (!supabase) return
    const { data } = await supabase
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
    const { data } = await supabase
      .from('chat')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (data) {
      setChatMessages(data)
    }
  }, [])

  const setupRealtimeSubscriptions = useCallback((roomId: string) => {
    // Use centralized Zustand store for real-time subscriptions
    const { setupRealTimeSubscription } = useGameStore.getState()
    
    // Set up subscriptions through the store
    setupRealTimeSubscription(roomId)
    
    // Load existing data
    loadJournalEntries(roomId)
    loadChatMessages(roomId)
  }, [loadJournalEntries, loadChatMessages])

  const joinRoom = useCallback(async (code: string) => {
    try {
      if (!supabase) throw new Error('Database not available')
      
      setError(null)
      
      // Get or create anonymous user for student
      const { data: { user } } = await supabase.auth.getUser()
      let studentId = user?.id

      if (!studentId) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
        if (authError) {
          console.error('Auth error:', authError)
          throw new Error(`Authentication failed: ${authError.message}`)
        }
        studentId = authData.user?.id
      }

      // Find room by code
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.toUpperCase().trim()) // Normalize room code
        .single()

      if (roomError) {
        console.error('Room lookup error:', roomError)
        throw new Error('Room not found. Please check the room code.')
      }

      const roomDataTyped = roomData as any
      // Update room with student ID if not already set
      if (!roomDataTyped.student_id && studentId) {
        const { error: updateError } = await (supabase as any)
          .from('rooms')
          .update({ student_id: studentId })
          .eq('id', roomDataTyped.id)

        if (updateError) {
          console.error('Room update error:', updateError)
          throw new Error(`Failed to join room: ${updateError.message}`)
        }
        roomDataTyped.student_id = studentId
      }

      setRoom(roomDataTyped)
      setInventory(roomDataTyped.inventory?.items || [])
      setupRealtimeSubscriptions(roomDataTyped.id)
      
    } catch (error: any) {
      console.error('Error joining room:', error)
      setError(error.message || 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }, [setupRealtimeSubscriptions])

  useEffect(() => {
    if (roomCode) {
      joinRoom(roomCode)
    } else {
      setError('No room code provided. Please ask your teacher for the room code.')
      setLoading(false)
    }
  }, [roomCode, joinRoom])

  // Subscribe to Zustand store updates
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(
      (newState: any, prevState: any) => {
        if (newState.room !== prevState?.room && newState.room) {
          setRoom(newState.room)
          setInventory(newState.room.inventory?.items || [])
        }
        if (newState.journalEntries !== prevState?.journalEntries) {
          setJournalEntries(newState.journalEntries)
        }
        if (newState.chatMessages !== prevState?.chatMessages) {
          setChatMessages(newState.chatMessages)
        }
        if (newState.error !== prevState?.error) {
          setError(newState.error)
        }
      }
    )

    return unsubscribe
  }, [])

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
          <p className="text-gray-300 mb-6">{error}</p>
          
          <button
            onClick={() => window.location.href = '/menu'}
            className="px-6 py-3 bg-steampunk-brass hover:bg-steampunk-bronze text-white font-bold rounded-lg transition-colors"
          >
            Return to Menu
          </button>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black">
        <div className="text-white text-xl">No room found. Please check your room code.</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
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
            <div className="absolute inset-0 pointer-events-none">
              <StudentInterface
                room={room}
                lensCharges={gameState.lensCharges}
                isLocked={gameState.isLocked}
              />
            </div>
          </div>

          {/* Side Panels */}
          <div className="w-96 bg-black/90 backdrop-blur-sm border-l border-steampunk-copper/30 flex flex-col">
            {/* Room Info Header */}
            <div className="p-4 border-b border-steampunk-copper/30">
              <h2 className="text-lg font-bold text-steampunk-brass">Detective Case</h2>
              <p className="text-sm text-gray-300">
                Room: <span className="font-mono text-steampunk-brass font-bold">{room.code}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${roomInfo.statusColor}`}></div>
                <p className="text-xs text-gray-400">{roomInfo.status}</p>
                <span className="text-xs text-gray-400">• Lens: {gameState.lensCharges}</span>
              </div>
            </div>

            {/* Inventory Panel */}
            <div className="h-48 border-b border-steampunk-copper/30">
              <InventoryPanel 
                items={inventory}
              />
            </div>

            {/* Journal Panel */}
            <div className="flex-1 border-b border-steampunk-copper/30">
              <JournalPanel 
                entries={journalEntries}
              />
            </div>

            {/* Chat Panel */}
            <div className="h-64">
              <ChatPanel 
                messages={chatMessages}
                roomId={room.id}
                userType="student"
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}