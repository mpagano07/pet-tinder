'use client'

import { useState } from 'react'
import { Plus, X, Calendar, MapPin, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createEvent } from '@/app/community/actions'
import { toast } from 'sonner'
import { ClientPortal } from '../ui/ClientPortal'

export function CreateEventModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await createEvent(formData)
      if (res.error) toast.error(res.error)
      else {
        toast.success('¡Evento creado!')
        setIsOpen(false)
      }
    } catch (err) {
      toast.error('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-all"
      >
        <Plus className="w-3 h-3" /> Crear Evento
      </button>

      <ClientPortal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Organizar Evento</h3>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-5 h-5 text-white/40" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Título</label>
                    <input required name="title" placeholder="ej: Juntada de Galgos" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Ubicación</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                       <input required name="location_name" placeholder="ej: Parque Centenario" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Fecha y Hora</label>
                        <input required name="date" type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-xs" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Categoría</label>
                        <select name="category" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-xs appearance-none">
                           <option value="meetup" className="bg-zinc-900">Juntada</option>
                           <option value="walk" className="bg-zinc-900">Caminata</option>
                           <option value="training" className="bg-zinc-900">Entrenamiento</option>
                           <option value="other" className="bg-zinc-900">Otro</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Descripción</label>
                    <textarea name="description" placeholder="¿De qué trata el evento?" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none resize-none h-24 focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(230,57,70,0.4)] flex items-center justify-center gap-2 disabled:opacity-70 uppercase italic tracking-tighter"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                    Publicar Evento
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ClientPortal>
    </>
  )
}
