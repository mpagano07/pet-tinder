'use client'

import { useState } from 'react'
import { Plus, X, Sparkles, Loader2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPost } from '@/app/community/actions'
import { toast } from 'sonner'
import { ClientPortal } from '../ui/ClientPortal'

export function CreatePostModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await createPost(formData)
      if (res.error) toast.error(res.error)
      else {
        toast.success('¡Publicado!')
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
        className="p-3 bg-primary rounded-2xl shadow-[0_0_20px_rgba(230,57,70,0.5)] hover:scale-110 active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5 text-white" />
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
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" /> Nuevo Post
                  </h3>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-5 h-5 text-white/40" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Categoría</label>
                    <select name="category" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-xs appearance-none">
                       <option value="general" className="bg-zinc-900">General</option>
                       <option value="socialization" className="bg-zinc-900">Socialización</option>
                       <option value="question" className="bg-zinc-900">Pregunta</option>
                       <option value="alert" className="bg-zinc-900">Alerta</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Contenido</label>
                    <textarea required name="content" placeholder="Escribe lo que quieras compartir..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none resize-none h-32 focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(230,57,70,0.4)] flex items-center justify-center gap-2 disabled:opacity-70 uppercase italic tracking-tighter"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                    Publicar
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
