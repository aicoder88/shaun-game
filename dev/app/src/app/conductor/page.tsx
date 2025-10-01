'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateSimpleRoomCode, randomChoice } from '@/lib/utils'
import caseData from '../../data/case_01.json'

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

const LazyTeacherControls = ({ room, onUpdateRoom, onSendBroadcast, onGrantLens, onToggleFreeze, onChangeScene }: any) => {
  const [Component, setComponent] = useState<any>(null)
  
  useEffect(() => {
    import('@/components/TeacherControls').then((mod) => {
      setComponent(() => mod.TeacherControls)
    })
  }, [])
  
  if (!Component) return null
  return <Component room={room} onUpdateRoom={onUpdateRoom} onSendBroadcast={onSendBroadcast} onGrantLens={onGrantLens} onToggleFreeze={onToggleFreeze} onChangeScene={onChangeScene} />
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

function ConductorPageContent() {
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')
  
  const [mounted, setMounted] = useState(false)
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [gameManager, setGameManager] = useState<any>(null)
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (roomCode) {
      joinExistingRoom(roomCode)
    } else {
      setLoading(false)
    }
  }, [mounted, roomCode])

  const joinExistingRoom = async (code: string) => {
    try {
      // For local development without Supabase, create a mock room
      if (!supabase) {
        console.log('Creating local room for code:', code)
        const killerId = randomChoice(['lestrange', 'gaspard', 'zane'])
        const localRoom = {
          id: `local-${code}`,
          code,
          scene: 'menu',
          teacher_id: 'local-teacher',
          killer_id: killerId,
          lens_charges: 3,
          inventory: { items: [] },
          created_at: new Date().toISOString(),
          locked: false
        }
        setRoom(localRoom)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .single()

      if (error || !data) {
        console.warn('Room not found in database, creating local room')
        const killerId = randomChoice(['lestrange', 'gaspard', 'zane'])
        const localRoom = {
          id: `local-${code}`,
          code,
          scene: 'menu',
          teacher_id: 'local-teacher',
          killer_id: killerId,
          lens_charges: 3,
          inventory: { items: [] },
          created_at: new Date().toISOString(),
          locked: false
        }
        setRoom(localRoom)
        setLoading(false)
        return
      }

      setRoom(data)
      setLoading(false)
    } catch (error) {
      console.error('Error joining room:', error)
      // Fallback to local room
      const killerId = randomChoice(['lestrange', 'gaspard', 'zane'])
      const localRoom = {
        id: `local-${code}`,
        code: code,
        scene: 'menu',
        teacher_id: 'local-teacher',
        killer_id: killerId,
        lens_charges: 3,
        inventory: { items: [] },
        created_at: new Date().toISOString(),
        locked: false
      }
      setRoom(localRoom)
      setLoading(false)
    }
  }

  const createNewRoom = async () => {
    console.log('Creating new room...')
    if (!mounted) return
    
    setCreating(true)
    try {
      const code = generateSimpleRoomCode()
      const killerId = randomChoice(['lestrange', 'gaspard', 'zane'])
      
      // Create a local room object for testing when database is unavailable
      const localRoom = {
        id: `local-${Date.now()}`,
        code,
        scene: 'menu',
        teacher_id: 'local-teacher',
        killer_id: killerId,
        lens_charges: 3,
        inventory: { items: [] },
        created_at: new Date().toISOString(),
        locked: false
      }

      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          let teacherId = user?.id

          if (!teacherId) {
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
        } catch (dbError) {
          console.warn('Database error, using local room:', dbError)
          setRoom(localRoom)
        }
      } else {
        console.warn('Database not available, using local room')
        setRoom(localRoom)
      }
      
      console.log('Room created successfully:', localRoom || 'from database')
      
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/conductor?room=${code}`)
      }
    } catch (error) {
      console.error('Error creating room:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert('Error creating room: ' + errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const updateRoom = async (updates: any) => {
    if (!room) return

    // Update local state immediately
    setRoom({ ...room, ...updates })

    // Try to update in database if available
    if (supabase) {
      try {
        const { error } = await (supabase as any)
          .from('rooms')
          .update(updates)
          .eq('id', room.id)

        if (error) {
          console.warn('Database update failed (local mode):', error)
        }
      } catch (error) {
        console.warn('Error updating room in database:', error)
      }
    } else {
      console.log('Local mode: Room updated', updates)
    }
  }

  const sendBroadcast = (message: string) => {
    console.log('Broadcasting message:', message)
    if (gameManager && gameManager.sendChat) {
      gameManager.sendChat('Conductor Whibury', message)
    } else {
      // Local mode fallback
      const newMessage = {
        id: Date.now().toString(),
        sender: 'Conductor Whibury',
        message,
        created_at: new Date().toISOString()
      }
      setChatMessages([...chatMessages, newMessage])
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

  if (!mounted || loading) {
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
          <LazyPhaserGame 
            roomId={room.id} 
            isTeacher={true}
            onGameReady={setGameManager}
          />
          
          {/* Teacher Controls Overlay */}
          <div className="absolute top-4 right-4 z-50">
            <LazyTeacherControls
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
        <div className="w-96 bg-black/90 backdrop-blur-sm border-l border-steampunk-copper/30 flex flex-col">
          {/* Room Info Header */}
          <div className="p-4 border-b border-steampunk-copper/30">
            <h2 className="text-xl font-bold text-steampunk-brass">Case Control Room</h2>
            <p className="text-sm text-gray-300">
              Room Code: <span className="font-mono text-steampunk-brass font-bold text-lg">{room.code}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Scene: {room.scene} • Lens: {room.lens_charges || 0} • {room.locked ? '🔒 Frozen' : '🔓 Active'}
            </p>
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
              userType="teacher"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConductorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black">
        <div className="text-white text-xl">Loading conductor dashboard...</div>
      </div>
    }>
      <ConductorPageContent />
    </Suspense>
  )
}