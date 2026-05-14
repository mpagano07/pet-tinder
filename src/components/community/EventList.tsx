'use client'

import { useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { joinEvent, leaveEvent } from '@/app/community/actions'
import Image from 'next/image'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  description: string
  category: string
  event_date: string
  location_name: string
  image_url: string | null
  participants_count: number
  is_joined: boolean
}

export function EventList({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState(initialEvents)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggleJoin = async (event: Event) => {
    setLoadingId(event.id)
    try {
      if (event.is_joined) {
        const res = await leaveEvent(event.id)
        if (res.error) toast.error(res.error)
        else {
          setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_joined: false, participants_count: e.participants_count - 1 } : e))
          toast.success('Has salido del evento')
        }
      } else {
        const res = await joinEvent(event.id)
        if (res.error) toast.error(res.error)
        else {
          setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_joined: true, participants_count: e.participants_count + 1 } : e))
          toast.success('¡Te has unido al evento!')
        }
      }
    } catch (err) {
      toast.error('Error de conexión')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {events.length > 0 ? (
        events.map((event) => (
          <div key={event.id} className="glass rounded-3xl p-5 border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-2xl bg-zinc-800 overflow-hidden relative border border-white/5 shrink-0">
                <Image 
                  src={event.image_url || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=200"} 
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt={event.title} 
                  fill
                  sizes="80px"
                />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-tighter mb-1">
                  {new Date(event.event_date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })} • {new Date(event.event_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <h4 className="font-bold text-lg leading-tight mb-2">{event.title}</h4>
                <div className="flex items-center gap-1 text-white/40 text-[10px] font-bold uppercase">
                  <MapPin className="w-3 h-3" /> {event.location_name}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-[8px] font-bold">P{i}</div>
                    ))}
                 </div>
                 <span className="text-[10px] font-bold text-white/40">+{event.participants_count} asistentes</span>
              </div>
              <button 
                onClick={() => handleToggleJoin(event)}
                disabled={loadingId === event.id}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  event.is_joined 
                    ? 'bg-primary/20 text-primary border-primary/20 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/20' 
                    : 'bg-white/5 text-white/60 border-white/5 hover:bg-primary hover:text-white hover:border-primary'
                }`}
              >
                {loadingId === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (event.is_joined ? 'Asistiré' : 'Unirse')}
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 glass rounded-3xl border border-dashed border-white/10">
          <p className="text-white/40 text-sm italic">No hay eventos programados próximamente.</p>
        </div>
      )}
    </div>
  )
}
