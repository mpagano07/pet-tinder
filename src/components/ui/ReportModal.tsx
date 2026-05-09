'use client'

import { useState, useRef, useEffect } from 'react'
import { Flag, X, Loader2, CheckCircle } from 'lucide-react'
import { submitReport } from '@/features/admin/reportActions'
import type { ReportReason } from '@/types'

const REASONS: { value: ReportReason; label: string; emoji: string }[] = [
  { value: 'spam', label: 'Spam o publicidad', emoji: '📢' },
  { value: 'inappropriate_content', label: 'Contenido inapropiado', emoji: '🚫' },
  { value: 'fake_profile', label: 'Perfil falso', emoji: '🎭' },
  { value: 'abusive_behavior', label: 'Comportamiento abusivo', emoji: '⚠️' },
  { value: 'other', label: 'Otro motivo', emoji: '📝' },
]

interface ReportModalProps {
  petId: string
  petName: string
  onClose: () => void
}

export function ReportModal({ petId, petName, onClose }: ReportModalProps) {
  const [selected, setSelected] = useState<ReportReason | null>(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on overlay click
  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setLoading(true)

    const formData = new FormData()
    formData.set('reported_pet_id', petId)
    formData.set('reason', selected)
    formData.set('description', description)

    const result = await submitReport(formData)
    setLoading(false)

    if (result.success) {
      setSuccess(true)
      setTimeout(onClose, 1800)
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <div className="glass w-full max-w-md rounded-3xl p-6 border border-white/10 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-400" />
            <h2 className="font-bold text-lg">Reportar a {petName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle className="w-12 h-12 text-green-400" />
            <p className="font-semibold text-white">¡Reporte enviado!</p>
            <p className="text-sm text-white/60 text-center">Revisaremos tu reporte pronto.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-white/60 mb-4">¿Por qué quieres reportar este perfil?</p>

            {/* Reason selector */}
            <div className="grid grid-cols-1 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelected(r.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all border ${
                    selected === r.value
                      ? 'bg-primary/20 border-primary/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span>{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>

            {/* Optional description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción adicional (opcional)"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
            />

            <button
              type="submit"
              disabled={!selected || loading}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar reporte'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
