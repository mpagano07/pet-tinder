'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { PawPrint, Flag, X, Heart, MapPin, Sparkles } from 'lucide-react'
import { useState, useRef } from 'react'
import { ReportModal } from '@/components/ui/ReportModal'
import type { Pet } from '@/types'
import { calculateCompatibility, getCompatibilityLabel } from '@/lib/matching'

interface SwipeCardProps {
  pet: Pet
  swiperPet: Pet
  active: boolean
  removeCard: (id: string, action: 'like' | 'dislike') => void
}

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  rabbit: '🐇',
  bird: '🦜',
  other: '🐾',
}

export function SwipeCard({ pet, swiperPet, active, removeCard }: SwipeCardProps) {
  const [showReport, setShowReport] = useState(false)
  const [exitX, setExitX] = useState(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  // Color overlays for like/dislike feedback
  const likeOpacity = useTransform(x, [20, 120], [0, 0.7])
  const dislikeOpacity = useTransform(x, [-20, -120], [0, 0.7])

  const dragEnd = (_e: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      setExitX(500)
      removeCard(pet.id, 'like')
    } else if (info.offset.x < -100) {
      setExitX(-500)
      removeCard(pet.id, 'dislike')
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
    }
  }

  const cardRef = useRef<HTMLDivElement>(null)

  const handleTap = (e: any, info: any) => {
    if (!active || !cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const xPos = info.point.x - rect.left
    const isNext = xPos > rect.width / 2

    if (isNext) {
      setPhotoIndex(prev => (prev + 1) % (pet.photos?.length || 1))
    } else {
      setPhotoIndex(prev => (prev - 1 + (pet.photos?.length || 1)) % (pet.photos?.length || 1))
    }
  }

  const speciesKey = pet.species?.toLowerCase() ?? 'other'
  const speciesEmoji = SPECIES_EMOJI[speciesKey] ?? '🐾'

  // Calculate compatibility
  const compatibility = calculateCompatibility(swiperPet as any, pet as any)
  const { label: compLabel, color: compColor } = getCompatibilityLabel(compatibility)

  return (
    <>
      <motion.div
        className={`absolute top-0 w-full h-[60vh] max-h-[600px] cursor-grab select-none ${!active ? 'pointer-events-none' : 'pointer-events-auto'}`}
        style={{ x, rotate, opacity: active ? 1 : 0 }}
        drag={active ? 'x' : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={dragEnd}
        animate={{ x: exitX }}
        transition={{ duration: 0.3 }}
        whileTap={{ cursor: 'grabbing' }}
        ref={cardRef}
        onTap={handleTap}
      >
        <div className="w-full h-full rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl bg-zinc-900">
          {/* Photo Indicators */}
          {pet.photos && pet.photos.length > 1 && (
            <div className="absolute top-2 left-0 right-0 z-40 flex gap-1 px-4">
              {pet.photos.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i === photoIndex ? 'bg-white' : 'bg-white/30'}`} 
                />
              ))}
            </div>
          )}

          {/* Photo */}
          {pet.photos && pet.photos.length > 0 ? (
            <motion.img
              key={photoIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={pet.photos[photoIndex]}
              alt={pet.name}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <PawPrint className="w-24 h-24 text-white/10" />
            </div>
          )}

          {/* Compatibility Badge - Only visible if active to prevent stacking issues */}
          {active && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, x: -20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              className="absolute top-16 left-4 z-30"
            >
              <div className="glass-dark px-3 py-1.5 rounded-2xl border border-white/10 flex flex-col gap-0.5 shadow-xl">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${compColor}`}>{compLabel}</span>
                </div>
                <div className="text-xl font-black text-white leading-none">
                  {compatibility}% <span className="text-[10px] font-medium opacity-50">Match</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Like overlay */}
          <motion.div
            className="absolute inset-0 bg-green-500 rounded-[2rem] pointer-events-none"
            style={{ opacity: likeOpacity }}
          />
          {/* Dislike overlay */}
          <motion.div
            className="absolute inset-0 bg-red-500 rounded-[2rem] pointer-events-none"
            style={{ opacity: dislikeOpacity }}
          />

          {/* Like / Dislike stamp */}
          <motion.div
            className="absolute top-8 left-6 rotate-[-20deg] border-4 border-green-400 rounded-lg px-3 py-1 pointer-events-none"
            style={{ opacity: likeOpacity }}
          >
            <span className="text-green-400 font-black text-2xl tracking-widest">LIKE</span>
          </motion.div>
          <motion.div
            className="absolute top-8 right-6 rotate-[20deg] border-4 border-red-400 rounded-lg px-3 py-1 pointer-events-none"
            style={{ opacity: dislikeOpacity }}
          >
            <span className="text-red-400 font-black text-2xl tracking-widest">NOPE</span>
          </motion.div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

          {/* Report button */}
          {active && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowReport(true) }}
              className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 transition-colors z-10"
              title="Reportar"
            >
              <Flag className="w-4 h-4 text-white/60" />
            </button>
          )}

          {/* Species badge */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-sm flex items-center gap-1.5">
            <span>{speciesEmoji}</span>
            <span className="text-white/80 capitalize">{pet.species ?? 'Mascota'}</span>
          </div>

          {/* Info Area */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex justify-between items-end mb-1">
              <div>
                <h2 className="text-3xl font-bold">
                  {pet.name}{pet.age != null ? `, ${pet.age}` : ''}
                </h2>
                {pet.breed && <p className="text-white/70 text-sm mt-0.5">{pet.breed}</p>}
              </div>
              <div className="flex items-center gap-1 text-white/50 text-xs mb-1">
                <MapPin className="w-3 h-3" />
                <span>{pet.gender === 'male' ? '♂ Macho' : '♀ Hembra'}</span>
              </div>
            </div>
            {pet.bio && (
              <p className="text-sm text-white/60 line-clamp-2 mt-2 leading-relaxed">{pet.bio}</p>
            )}
            
            {/* Extended tags */}
            <div className="flex flex-wrap gap-2 mt-3">
               {pet.temperament?.slice(0, 3).map((tag, i) => (
                 <span key={i} className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-white/60 uppercase font-bold tracking-wider border border-white/5">{tag}</span>
               ))}
               {pet.kids_friendly && (
                 <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 rounded-full text-blue-300 uppercase font-bold tracking-wider border border-blue-500/20">Niños OK</span>
               )}
            </div>
          </div>
        </div>
      </motion.div>

      {showReport && (
        <ReportModal
          petId={pet.id}
          petName={pet.name}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  )
}
