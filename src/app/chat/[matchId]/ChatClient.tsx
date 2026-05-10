'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PawPrint, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  created_at: string
}

interface ChatClientProps {
  matchId: string
  userId: string
  initialMessages: Message[]
  placeholder: string
  sendText: string
  myPetPhoto?: string
  otherPetPhoto?: string
}

export function ChatClient({
  matchId,
  userId,
  initialMessages,
  placeholder,
  sendText,
  myPetPhoto,
  otherPetPhoto
}: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [otherIsTyping, setOtherIsTyping] = useState(false)
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, otherIsTyping])

  useEffect(() => {
    const channel = supabase.channel(`match:${matchId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        const newMsg = payload.new as Message
        if (newMsg.sender_id !== userId) {
          setMessages((prev) => [...prev, newMsg])
          // Mark as read immediately if we are in the chat
          supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id).then()
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const otherTyping = Object.entries(state).some(([id, presences]: [string, any]) => {
          return id !== userId && presences.some((p: any) => p.isTyping)
        })
        setOtherIsTyping(otherTyping)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ isTyping: false })
          // Mark existing unread messages in this match as read
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('match_id', matchId)
            .neq('sender_id', userId)
            .eq('is_read', false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase, userId])

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      supabase.channel(`match:${matchId}`).track({ isTyping: true })
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      supabase.channel(`match:${matchId}`).track({ isTyping: false })
    }, 3000)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const msgContent = newMessage.trim()
    setNewMessage('')
    setIsTyping(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    supabase.channel(`match:${matchId}`).track({ isTyping: false })

    // Optimistic Update
    const tempMsg: Message = {
      id: Math.random().toString(),
      match_id: matchId,
      sender_id: userId,
      content: msgContent,
      created_at: new Date().toISOString()
    }
    setMessages((prev) => [...prev, tempMsg])

    // Send to DB
    await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: userId,
      content: msgContent,
      is_read: false
    })
  }

  return (
    <>
      <div className="flex-1 space-y-6 mb-24">
        {messages.map((msg) => {
          const isMe = msg.sender_id === userId
          const avatar = isMe ? myPetPhoto : otherPetPhoto

          return (
            <div key={msg.id} className={cn("flex w-full gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0 mt-1 border border-white/5">
                {avatar ? (
                  <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <PawPrint className="w-4 h-4 text-white/20" />
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "glass rounded-tl-sm border border-white/5"
                )}
              >
                <p className="text-[15px] leading-relaxed">{msg.content}</p>
                <span className="text-[10px] opacity-50 mt-1 block text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}

        {otherIsTyping && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0 border border-white/5">
              {otherPetPhoto && <img src={otherPetPhoto} className="w-full h-full object-cover" alt="avatar" />}
            </div>
            <div className="glass px-4 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-white/10 z-20">
        <form onSubmit={sendMessage} className="max-w-md mx-auto flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            placeholder={placeholder}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/30"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-primary/20"
          >
            <Send className="w-5 h-5 fill-current" />
          </button>
        </form>
      </div>
    </>
  )
}
