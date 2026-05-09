'use client'

import { useGeolocation } from '@/lib/useGeolocation'
import { updateLocation } from '@/lib/locationActions'
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export function LocationButton() {
  const { loading, error, coords, requestLocation } = useGeolocation()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!coords) return
    setSaving(true)
    updateLocation(coords.latitude, coords.longitude).then(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }, [coords])

  const handleClick = () => {
    setSaved(false)
    requestLocation()
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleClick}
        disabled={loading || saving}
        className="w-full py-2.5 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading || saving ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : saved ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <MapPin className="w-4 h-4 text-primary" />
        )}
        {loading
          ? 'Obteniendo ubicación...'
          : saving
          ? 'Guardando ubicación...'
          : saved
          ? '¡Ubicación guardada!'
          : 'Actualizar mi ubicación'}
      </button>
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 px-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
