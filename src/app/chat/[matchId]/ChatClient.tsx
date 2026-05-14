'use client'

import { useState, useEffect, useLayoutEffect, useRef, type FormEvent } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PawPrint, Send, X, CornerUpLeft, Heart, Smile } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  reply_to_id?: string
  likes?: string[]
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
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [otherIsTyping, setOtherIsTyping] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<{
    track: (payload: { isTyping: boolean }) => Promise<void>
    presenceState: () => Record<string, Array<{ isTyping?: boolean }>>
  } | null>(null)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100)
    return () => clearTimeout(timer)
  }, [messages, otherIsTyping])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const addMessage = (message: Message) => {
    const normalized = {
      likes: 0,
      likedByMe: false,
      ...message,
    }

    setMessages((prev) => {
      if (prev.some((item) => item.id === normalized.id)) return prev
      return [...prev, normalized].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })
  }

  useEffect(() => {
    const channel = supabase.channel(`match:${matchId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    channelRef.current = channel

    channel
      .on('broadcast', { event: 'new_message' }, async (payload) => {
        const newMsg = payload.payload as Message
        addMessage(newMsg)

        if (newMsg.sender_id !== userId) {
          await supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id)
        }
      })
      .on('broadcast', { event: 'update_message' }, (payload) => {
        const updatedMsg = payload.payload as Message
        setMessages((prev) => prev.map((msg) => 
          msg.id === updatedMsg.id ? { ...msg, likes: updatedMsg.likes, is_read: updatedMsg.is_read } : msg
        ))
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, Array<{ isTyping?: boolean }>>
        const otherTyping = Object.entries(state).some(([id, presences]) => {
          return id !== userId && presences.some((p) => p.isTyping)
        })
        setOtherIsTyping(otherTyping)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ isTyping: false })
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('match_id', matchId)
            .neq('sender_id', userId)
            .eq('is_read', false)
        }
      })

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [matchId, supabase, userId])

  const handleLike = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    const isLiked = message.likes?.includes(userId) || false
    const newLikes = isLiked
      ? message.likes?.filter(id => id !== userId) || []
      : [...(message.likes || []), userId]

    // Optimistic update
    setMessages(prev => prev.map(m =>
      m.id === messageId
        ? { ...m, likes: newLikes }
        : m
    ))

    const { error } = await supabase
      .from('messages')
      .update({ likes: newLikes })
      .eq('id', messageId)

    if (error) {
      // Revert optimistic update
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, likes: message.likes }
          : m
      ))
      toast.error('Error al actualizar like')
    } else {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'update_message',
        payload: { ...message, likes: newLikes }
      })
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
  }

  const toggleLike = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              likedByMe: !msg.likedByMe,
              likes: msg.likedByMe ? (msg.likes || 1) - 1 : (msg.likes || 0) + 1,
            }
          : msg
      )
    )
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      channelRef.current?.track({ isTyping: true })
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      channelRef.current?.track({ isTyping: false })
    }, 2000)
  }

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageText = newMessage.trim()
    const finalMessage = messageText

    setNewMessage('')
    setReplyTo(null)
    setIsTyping(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    channelRef.current?.track({ isTyping: false })

    const tempId = `temp-${Math.random().toString(36).slice(2)}`
    const tempMsg: Message = {
      id: tempId,
      match_id: matchId,
      sender_id: userId,
      content: finalMessage,
      reply_to_id: replyTo?.id,
      likes: [],
      created_at: new Date().toISOString(),
    }

    addMessage(tempMsg)

    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: userId,
        content: finalMessage,
        reply_to_id: replyTo?.id,
        likes: [],
        is_read: false,
      })
      .select('id,created_at')
      .maybeSingle()

    if (error || !data) {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
      toast.error('No se pudo enviar el mensaje. Revisa tu conexión.')
      return
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === tempId
          ? { ...msg, id: data.id, created_at: data.created_at }
          : msg
      )
    )

    channelRef.current?.send({
      type: 'broadcast',
      event: 'new_message',
      payload: {
        ...tempMsg,
        id: data.id,
        created_at: data.created_at
      }
    })
  }

  return (
    <>
      <div className="flex-1 space-y-4 mb-32">
        {messages.map((msg) => {
          const isMe = msg.sender_id === userId
          const avatar = isMe ? myPetPhoto : otherPetPhoto
          const isLiked = msg.likes?.includes(userId) || false
          const replyToMessage = msg.reply_to_id ? messages.find(m => m.id === msg.reply_to_id) : null

          return (
            <div key={msg.id} className={cn('flex w-full gap-3', isMe ? 'flex-row-reverse' : 'flex-row')}>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0 mt-1 border border-white/5 relative">
                {avatar ? (
                  <Image 
                    src={avatar} 
                    alt="avatar" 
                    fill
                    sizes="32px"
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <PawPrint className="w-4 h-4 text-white/20" />
                  </div>
                )}
              </div>
              <div className="flex-1 max-w-[75%]">
                {replyToMessage && (
                  <div className={cn(
                    'mb-2 px-3 py-2 rounded-lg text-sm border-l-2',
                    isMe ? 'border-primary/50 bg-primary/10' : 'border-white/30 bg-white/5'
                  )}>
                    <p className="text-[11px] opacity-70 mb-1">
                      {isMe ? 'Respondiste a:' : 'Respondió:'}
                    </p>
                    <p className="line-clamp-2 text-[13px]">{replyToMessage.content}</p>
                  </div>
                )}
                <div
                  className={cn(
                    'px-4 py-3 rounded-3xl shadow-sm whitespace-pre-wrap transition-all',
                    isMe
                      ? 'bg-primary/20 text-primary-foreground border border-primary/20 rounded-tr-sm'
                      : 'glass rounded-tl-sm border border-white/10'
                  )}
                >
                  <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                  <span className="text-[10px] opacity-50 mt-1 block text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[12px] text-white/60">
                  <button
                    type="button"
                    onClick={() => handleLike(msg.id)}
                    title={isLiked ? 'Quitar like' : 'Me gusta'}
                    aria-label={isLiked ? 'Quitar like' : 'Me gusta'}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2 py-1 transition-colors',
                      (msg.likes && msg.likes.length > 0) ? 'bg-primary/20 text-primary' : 'hover:bg-white/10'
                    )}
                  >
                    <Heart className={cn('w-4 h-4', (msg.likes && msg.likes.length > 0) && 'fill-current')} />
                    {msg.likes && msg.likes.length > 0 && (
                      <span className="text-[11px]">{msg.likes.length}</span>
                    )}
                  </button>
                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => setReplyTo(msg)}
                      title="Responder"
                      aria-label="Responder"
                      className="rounded-full p-2 hover:bg-white/10 transition-colors"
                    >
                      <CornerUpLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-white/10 z-20">
        <div className="max-w-md mx-auto">
          {replyTo && (
            <div className="mb-3 rounded-3xl border-l-4 border-primary/60 bg-primary/10 p-3 text-sm text-white/80 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80">Respondiendo</p>
                  <p className="mt-1 text-white break-words">{replyTo.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Emojis are now inside the input */}

          <form onSubmit={sendMessage} className="flex gap-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                placeholder={placeholder}
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/30"
              />
              <button
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors p-2"
                title="Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>

              {showEmojis && (
                <div className="absolute bottom-full right-0 mb-3 p-2 bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl flex gap-1 z-50">
                  {['😊', '😂', '😮', '😢', '❤️', '👍', '👎', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        addEmoji(emoji)
                        setShowEmojis(false)
                        inputRef.current?.focus()
                      }}
                      className="rounded-xl hover:bg-white/10 p-2 text-xl transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              aria-label={sendText}
              title={sendText}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-primary/20"
            >
              <Send className="w-5 h-5 fill-current" />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
