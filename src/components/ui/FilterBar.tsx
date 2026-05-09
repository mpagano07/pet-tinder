'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown, Check, MapPin, Loader2 } from 'lucide-react'
import { updateLocation } from '@/app/profiles/actions'
import { toast } from 'sonner'
import { createPortal } from 'react-dom'

const SPECIES = [
  { value: '', label: 'Todos', emoji: '🐾' },
  { value: 'dog', label: 'Perros', emoji: '🐕' },
  { value: 'cat', label: 'Gatos', emoji: '🐈' },
  { value: 'rabbit', label: 'Conejos', emoji: '🐇' },
  { value: 'bird', label: 'Aves', emoji: '🦜' },
  { value: 'other', label: 'Otros', emoji: '🐾' },
]

const GENDERS = [
  { value: '', label: 'Cualquier género' },
  { value: 'male', label: '♂ Machos' },
  { value: 'female', label: '♀ Hembras' },
]

export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [open, setOpen] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Local state to manage filters before applying
  const [tempSpecies, setTempSpecies] = useState(searchParams.get('species') ?? '')
  const [tempGender, setTempGender] = useState(searchParams.get('gender') ?? '')
  const [tempMaxAge, setTempMaxAge] = useState(searchParams.get('maxAge') ?? '')
  const [tempMaxDist, setTempMaxDist] = useState(searchParams.get('maxDist') ?? '')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync local state when URL changes
  useEffect(() => {
    setTempSpecies(searchParams.get('species') ?? '')
    setTempGender(searchParams.get('gender') ?? '')
    setTempMaxAge(searchParams.get('maxAge') ?? '')
    setTempMaxDist(searchParams.get('maxDist') ?? '')
  }, [searchParams])

  const hasFilters = !!(searchParams.get('species') || searchParams.get('gender') || searchParams.get('maxAge') || searchParams.get('maxDist'))

  const handleApply = () => {
    console.log('[FilterBar] Clicked Apply')
    const params = new URLSearchParams()
    if (tempSpecies) params.set('species', tempSpecies)
    if (tempGender) params.set('gender', tempGender)
    if (tempMaxAge) params.set('maxAge', tempMaxAge)
    if (tempMaxDist) params.set('maxDist', tempMaxDist)
    
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
    setOpen(false)
  }

  const handleClear = () => {
    setTempSpecies('')
    setTempGender('')
    setTempMaxAge('')
    setTempMaxDist('')
    router.push(pathname)
    setOpen(false)
  }

  const handleToggleGeo = async () => {
    if (isLocating) return
    setIsLocating(true)
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await updateLocation(latitude, longitude)
        toast.success('Ubicación actualizada')
        setIsLocating(false)
      },
      () => {
        toast.error('Activa el GPS')
        setIsLocating(false)
      }
    )
  }

  if (!mounted) return null

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
          hasFilters
            ? 'bg-primary/20 border-primary/50 text-primary'
            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtros
        {hasFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel via Portal */}
      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-start pt-20 px-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setOpen(false)} />
          
          {/* Panel */}
          <div className="relative w-full max-w-sm glass rounded-[2.5rem] border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[80vh] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filtros</h2>
              <button onClick={() => setOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Geolocation Toggle */}
            <div className="mb-6 pb-6 border-b border-white/5">
              <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-3">
                Ubicación (GPS)
              </label>
              <button
                type="button"
                onClick={handleToggleGeo}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                  isLocating ? 'bg-white/5 border-white/10' : 'bg-primary/10 border-primary/20 text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm font-bold">Activar mi GPS</span>
                </div>
                {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              </button>
            </div>

            {/* Distance Filter */}
            <div className="mb-8">
              <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-3">
                Distancia: <span className="text-white font-black">{tempMaxDist ? `${tempMaxDist} km` : 'Sin límite'}</span>
              </label>
              <input
                type="range"
                min={1}
                max={100}
                step={5}
                value={tempMaxDist || 100}
                onChange={(e) => setTempMaxDist(e.target.value === '100' ? '' : e.target.value)}
                className="w-full accent-primary h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Species */}
            <div className="mb-6">
              <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-3">
                Especie
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      console.log('[FilterBar] Selected species:', s.value)
                      setTempSpecies(s.value)
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      tempSpecies === s.value
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div className="mb-8">
              <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-3">
                Género
              </label>
              <div className="flex flex-col gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setTempGender(g.value)}
                    className={`px-5 py-3.5 rounded-2xl text-sm font-bold transition-all text-left flex justify-between items-center border ${
                      tempGender === g.value
                        ? 'bg-primary/20 border-primary/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {g.label}
                    {tempGender === g.value && <Check className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleClear}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 text-xs font-black hover:bg-white/10 transition-colors"
              >
                LIMPIAR
              </button>
              <button
                onClick={handleApply}
                className="flex-[2] py-4 rounded-2xl bg-primary text-white text-xs font-black hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20"
              >
                VER RESULTADOS
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
