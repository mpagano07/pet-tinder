'use client'

import { PawPrint } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      {/* Animated paw */}
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-16 w-16 rounded-full bg-primary/20 animate-ping" />
        <PawPrint className="relative z-10 w-10 h-10 text-primary animate-pulse" />
      </div>
      <p className="mt-4 text-sm text-white/50 animate-pulse tracking-widest uppercase">
        Cargando...
      </p>
    </div>
  )
}
