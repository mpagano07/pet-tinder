'use client'

import { useState, useCallback } from 'react'

interface GeoState {
  loading: boolean
  error: string | null
  coords: GeolocationCoordinates | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    loading: false,
    error: null,
    coords: null,
  })

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocalización no soportada por este navegador.' }))
      return
    }

    setState(s => ({ ...s, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          coords: position.coords,
        })
      },
      (err) => {
        setState({
          loading: false,
          error: err.code === 1
            ? 'Permiso de ubicación denegado.'
            : 'No se pudo obtener la ubicación.',
          coords: null,
        })
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  return { ...state, requestLocation }
}
