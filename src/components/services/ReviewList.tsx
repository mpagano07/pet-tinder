'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Star, User, Calendar } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles: {
    full_name: string
    username: string
  }
}

export function ReviewList({ serviceId }: { serviceId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchReviews = async () => {
      // If it's an external service (OSM), it won't have reviews in our DB
      if (typeof serviceId === 'string' && serviceId.startsWith('osm-')) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('service_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles (
            full_name,
            username
          )
        `)
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setReviews(data as any)
      }
      setLoading(false)
    }

    fetchReviews()
  }, [serviceId, supabase])

  if (loading) {
    return (
      <div className="p-8 text-center text-white/40">
        Cargando reseñas...
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="p-8 text-center text-white/40 italic">
        Aún no hay reseñas. ¡Sé el primero en calificar!
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-bold mb-4">Reseñas de la comunidad</h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">{review.profiles?.full_name || 'Usuario'}</p>
                  <p className="text-[10px] text-white/40">@{review.profiles?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="font-bold text-sm">{review.rating}</span>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{review.comment}</p>
            <div className="mt-3 flex items-center gap-1 text-[10px] text-white/20">
              <Calendar className="w-3 h-3" />
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
