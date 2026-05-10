'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PetForm } from './PetForm'
import { ClientPortal } from '../ui/ClientPortal'

export function AddPetButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-8 glass rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group hover:border-primary/50 hover:bg-primary/5 transition-all mb-8"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <span className="font-bold text-white/60 group-hover:text-white transition-colors uppercase tracking-widest text-xs">
          Agregar Nueva Mascota
        </span>
      </button>

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
                className="relative w-full max-w-lg glass rounded-[2.5rem] border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide my-8"
              >
                <div className="sticky top-0 right-0 z-50 flex justify-end p-4 pointer-events-none">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors pointer-events-auto"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="px-2 pb-2">
                   <PetForm onSuccess={() => setIsOpen(false)} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ClientPortal>
    </>
  )
}
