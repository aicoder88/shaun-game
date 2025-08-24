'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ChatMessage {
  id: string
  sender: string
  message: string
  created_at: string
}

interface ChatPanelProps {
  messages: ChatMessage[]
  roomId: string
  userType: 'teacher' | 'student'
}

export function ChatPanel({ messages, roomId, userType }: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const sender = userType === 'teacher' ? 'Conductor Whibury' : 'Detective'
      
      const { error } = await supabase
        .from('chat')
        .insert({
          room_id: roomId,
          sender,
          message: newMessage.trim()
        })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getSenderColor = (sender: string) => {
    if (sender === 'Conductor Whibury') return 'text-steampunk-brass'
    if (sender === 'Detective') return 'text-blue-400'
    return 'text-purple-400'
  }

  const getSenderIcon = (sender: string) => {
    if (sender === 'Conductor Whibury') return '🎩'
    if (sender === 'Detective') return '🕵️'
    return '👤'
  }

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center">
          <MessageSquare className="w-4 h-4 mr-2 text-steampunk-brass" />
          <h3 className="text-white font-bold text-sm">Case Communication</h3>
          <span className="ml-auto text-gray-400 text-xs">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-xs text-center py-4">
            No messages yet. Communication will appear here.
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${
                message.sender === (userType === 'teacher' ? 'Conductor Whibury' : 'Detective')
                  ? 'flex-row-reverse space-x-reverse'
                  : ''
              }`}
            >
              <div className="text-lg flex-shrink-0">
                {getSenderIcon(message.sender)}
              </div>
              
              <div className={`flex-1 ${
                message.sender === (userType === 'teacher' ? 'Conductor Whibury' : 'Detective')
                  ? 'text-right'
                  : ''
              }`}>
                <div className="flex items-center space-x-1 mb-1">
                  <span className={`text-xs font-medium ${getSenderColor(message.sender)}`}>
                    {message.sender}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                
                <div className={`inline-block px-3 py-2 rounded-lg text-sm max-w-full ${
                  message.sender === (userType === 'teacher' ? 'Conductor Whibury' : 'Detective')
                    ? 'bg-steampunk-brass/20 text-white'
                    : 'bg-gray-700 text-white'
                }`}>
                  {message.message}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              userType === 'teacher' 
                ? 'Message as Conductor Whibury...' 
                : 'Report to the conductor...'
            }
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-steampunk-brass"
            maxLength={200}
            disabled={isSending}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="px-3 py-2 bg-steampunk-brass hover:bg-steampunk-bronze disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-gray-500 text-xs mt-1">
          {newMessage.length}/200 characters
        </div>
      </div>
    </div>
  )
}