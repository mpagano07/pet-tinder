'use client'

import { useState } from 'react'
import { addReview } from '@/app/services/actions'
import { Star, Loader2, Send } from 'lucide-react'

interface ReviewFormProps {
  serviceId: string
  onSuccess: () => void
}

export function ReviewForm({ serviceId, onSuccess }: ReviewFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Por favor selecciona una calificación')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('service_id', serviceId)
    formData.append('rating', rating.toString())

    const result = await addReview(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-1">Calificar Servicio</h3>
        <p className="text-white/60 text-sm">Tu opinión ayuda a otros dueños de mascotas.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={`w-10 h-10 ${
                (hover || rating) >= star ? 'text-yellow-400 fill-current' : 'text-white/10'
              } transition-colors`}
            />
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs text-white/60 uppercase tracking-widest font-bold">Tu Comentario</label>
        <textarea
          name="comment"
          required
          rows={3}
          placeholder="¿Qué te pareció el servicio?"
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Enviar Calificación</>}
      </button>
    </form>
  )
}
