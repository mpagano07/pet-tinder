'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ServiceForm } from './ServiceForm'
import { ClientPortal } from '../ui/ClientPortal'

export function AddServiceButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="mt-12 glass rounded-3xl p-8 text-center border-dashed border-2 border-primary/20 bg-primary/5">
        <h3 className="font-bold text-xl mb-2">¿Eres prestador de servicios?</h3>
        <p className="text-white/60 text-sm mb-6">
          Publicita tu veterinaria o pet shop aquí y llega a miles de dueños de mascotas en tu zona.
        </p>
        <button 
          onClick={() => setIsOpen(true)}
          className="px-8 py-3 bg-white text-zinc-950 rounded-2xl font-bold hover:scale-105 transition-all"
        >
          Publicar mi Servicio
        </button>
      </div>

      <ClientPortal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl glass rounded-[2.5rem] border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide my-8"
              >
                <div className="sticky top-0 right-0 z-50 flex justify-end p-4 pointer-events-none">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors pointer-events-auto"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <ServiceForm onSuccess={() => setIsOpen(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ClientPortal>
    </>
  )
}
