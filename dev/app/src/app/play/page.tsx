'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Lazy load components to avoid SSR issues
const LazyPhaserGame = ({ roomId, isTeacher, onGameReady }: any) => {
  const [Component, setComponent] = useState<any>(null)
  
  useEffect(() => {
    import('@/components/PhaserGame').then((mod) => {
      setComponent(() => mod.PhaserGame)
    })
  }, [])
  
  if (!Component) return <div>Loading game engine...</div>
  return <Component roomId={roomId} isTeacher={isTeacher} onGameReady={onGameReady} />
}

const LazyStudentInterface = ({ room, lensCharges, isLocked }: any) => {
  const [Component, setComponent] = useState<any>(null)
  
  useEffect(() => {
    import('@/components/StudentInterface').then((mod) => {
      setComponent(() => mod.StudentInterface)
    })
  }, [])
  
  if (!Component) return null
  return <Component room={room} lensCharges={lensCharges} isLocked={isLocked} />
}

const LazyInventoryPanel = ({ items }: any) => {
  const [Component, setComponent] = useState<any>(null)
  
  useEffect(() => {
    import('@/components/InventoryPanel').then((mod) => {
      setComponent(() => mod.InventoryPanel)
    })
  }, [])
  
  if (!Component) return <div>Loading inventory...</div>
  return <Component items={items} />
}

const LazyJournalPanel = ({ entries }: any) => {
  const [Component, setComponent] = useState<any>(null)
  
  useEffect(() => {
    import('@/components/JournalPanel').then((mod) => {
      setComponent(() => mod.JournalPanel)
    })
  }, [])
  
  if (!Component) return <div>Loading journal...</div>
  return <Component entries={entries} />
}

const LazyChatPanel = ({ messages, roomId, userType }: any) => {
  const [Component, setComponent] = useState<any>(null)
  
  useEffect(() => {
    import('@/components/ChatPanel').then((mod) => {
      setComponent(() => mod.ChatPanel)
    })
  }, [])
  
  if (!Component) return <div>Loading chat...</div>
  return <Component messages={messages} roomId={roomId} userType={userType} />
}

function PlayPageContent() {
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')
  
  const [mounted, setMounted] = useState(false)
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameManager, setGameManager] = useState<any>(null)
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (roomCode) {
      joinRoom(roomCode)
    } else {
      setError('No room code provided. Please ask your teacher for the room code.')
      setLoading(false)
    }
  }, [mounted, roomCode])

  const joinRoom = async (code: string) => {
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
        .eq('code', code.toUpperCase().trim())
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
      
    } catch (error: any) {
      console.error('Error joining room:', error)
      setError(error.message || 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading) {
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
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/menu'
              }
            }}
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

  const gameState = {
    roomId: room?.id,
    isTeacher: false,
    lensCharges: room?.lens_charges || 0,
    isLocked: room?.locked || false,
    inventory: room?.inventory?.items || []
  }

  const roomInfo = {
    code: room?.code,
    status: room?.locked ? 'Investigation Paused' : 'Investigation Active',
    statusColor: room?.locked ? 'bg-red-400' : 'bg-green-400'
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex h-screen">
        {/* Game Area */}
        <div className="flex-1 relative">
          <LazyPhaserGame 
            roomId={room.id} 
            isTeacher={false}
            onGameReady={setGameManager}
          />
          
          {/* Student Interface Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <LazyStudentInterface
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
            <LazyInventoryPanel items={inventory} />
          </div>

          {/* Journal Panel */}
          <div className="flex-1 border-b border-steampunk-copper/30">
            <LazyJournalPanel entries={journalEntries} />
          </div>

          {/* Chat Panel */}
          <div className="h-64">
            <LazyChatPanel 
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

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black">
        <div className="text-white text-xl">Boarding the Bullet Express...</div>
      </div>
    }>
      <PlayPageContent />
    </Suspense>
  )
}