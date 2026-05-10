'use client'

import { useState } from 'react'
import { SwipeCard } from '@/components/SwipeCard'
import { recordSwipe } from './actions'
import { X, Heart, RefreshCcw } from 'lucide-react'
import { useTranslation } from '@/i18n/LanguageProvider'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { Pet } from '@/types'

export function FeedClient({ initialPets, swiperPet }: { initialPets: Pet[], swiperPet: Pet }) {
  const [pets, setPets] = useState(initialPets)
  const [matchPopup, setMatchPopup] = useState<{ pet: Pet, matchId?: string } | null>(null)
  const dict = useTranslation()
  const router = useRouter()

  const removeCard = async (swipedPetId: string, action: 'like' | 'dislike') => {
    const swipedPet = pets.find(p => p.id === swipedPetId)
    
    // Optimistic UI: remove card immediately
    setPets((prev) => prev.filter((p) => p.id !== swipedPetId))
    
    try {
      const result = await recordSwipe(swiperPet.id, swipedPetId, action)
      
      if (result.error) {
        toast.error(result.error)
      } else if (result.match) {
        setMatchPopup({ pet: swipedPet!, matchId: result.matchId })
      }
    } catch (err) {
      toast.error('Connection error')
    }
  }

  return (
    <div className="w-full max-w-md relative flex flex-col items-center">
      {/* Contenedor de Tarjetas */}
      <div className="w-full h-[60vh] relative z-10">
        {pets.length > 0 ? (
          <div className="w-full h-full relative">
            {pets.slice().reverse().map((pet, index) => (
              <SwipeCard
                key={pet.id}
                pet={pet}
                swiperPet={swiperPet}
                active={index === pets.length - 1}
                removeCard={removeCard}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full glass rounded-[2rem] flex flex-col items-center justify-center p-8 text-center border-dashed border-2 border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <RefreshCcw className="w-10 h-10 text-white/40" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{dict.feed.noMorePets}</h2>
            <p className="text-white/50 mb-8">{dict.feed.noMoreDesc}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary/20 text-primary font-bold rounded-xl hover:bg-primary/30 transition-all"
            >
              {dict.feed.refresh}
            </button>
          </div>
        )}
      </div>

      {/* Botones Manuales */}
      {pets.length > 0 && (
        <div className="flex gap-8 justify-center w-full py-8 mt-4 relative z-[50]">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (pets[0]) removeCard(pets[0].id, 'dislike');
            }}
            className="w-20 h-20 rounded-full bg-zinc-900/80 backdrop-blur-xl flex items-center justify-center border border-white/10 text-white/60 hover:text-red-500 hover:border-red-500/50 transition-all hover:scale-110 active:scale-90 shadow-2xl pointer-events-auto"
          >
            <X className="w-10 h-10" />
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (pets[0]) removeCard(pets[0].id, 'like');
            }}
            className="w-20 h-20 rounded-full bg-zinc-900/80 backdrop-blur-xl flex items-center justify-center border border-white/10 text-primary hover:border-primary/50 transition-all hover:scale-110 active:scale-90 shadow-[0_0_40px_rgba(230,57,70,0.3)] pointer-events-auto"
          >
            <Heart className="w-10 h-10 fill-current" />
          </button>
        </div>
      )}

      {/* Match Popup Overlay */}
      <AnimatePresence>
        {matchPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="w-full max-w-sm text-center"
            >
              <div className="relative mb-8 flex justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-primary p-1 animate-pulse">
                  <img 
                    src={matchPopup.pet.photos?.[0] || ''} 
                    className="w-full h-full object-cover rounded-full" 
                    alt="Matched pet"
                  />
                </div>
                <Heart className="absolute -bottom-2 -right-2 w-12 h-12 text-primary fill-current drop-shadow-[0_0_15px_rgba(230,57,70,0.6)]" />
              </div>

              <h1 className="text-5xl font-black text-white italic mb-4 tracking-tighter">¡IT&apos;S A MATCH!</h1>
              <p className="text-xl text-white/70 mb-10 px-4">
                A <b>{matchPopup.pet.name}</b> también le gustas. ¡Es hora de empezar a hablar!
              </p>
              
              <div className="flex flex-col gap-4 px-4">
                <button 
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl text-lg shadow-[0_0_30px_rgba(230,57,70,0.5)] hover:scale-105 transition-transform active:scale-95"
                  onClick={() => router.push(`/chat/${matchPopup.matchId}`)}
                >
                  ENVIAR MENSAJE
                </button>
                <button 
                  className="w-full py-4 bg-white/5 text-white/60 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all"
                  onClick={() => setMatchPopup(null)}
                >
                  SEGUIR BUSCANDO
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
