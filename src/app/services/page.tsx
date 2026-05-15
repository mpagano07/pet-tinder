'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { MapPin, Phone, Star, Store, Plus, Search, Loader2, Edit2, Trash2, ExternalLink, BadgeCheck, MessageSquare, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/i18n/LanguageProvider'
import { createClient } from '@/utils/supabase/client'
import { AddServiceButton } from '@/components/services/AddServiceButton'
import { ServiceForm } from '@/components/services/ServiceForm'
import { ReviewForm } from '@/components/services/ReviewForm'
import { ReviewList } from '@/components/services/ReviewList'
import { ClientPortal } from '@/components/ui/ClientPortal'
import { deleteService, verifyService } from './actions'
import Image from 'next/image'

interface ServicePlace {
  id: string | number
  name: string
  type: 'vet' | 'shop' | 'grooming' | 'other'
  lat?: number
  lon?: number
  address?: string
  distance?: number
  phone?: string
  rating_avg?: number
  review_count?: number
  is_verified?: boolean
  promoted?: boolean
  photos?: string[]
  google_maps_url?: string
  provider_id?: string
  description?: string
}

export default function ServicesPage() {
  const dict = useTranslation()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<ServicePlace[]>([])
  const [dbServices, setDbServices] = useState<ServicePlace[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [editingService, setEditingService] = useState<any>(null)
  const [reviewingServiceId, setReviewingServiceId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      if (authUser) {
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
        setProfile(userProfile)
      }

      // 2. Cargar servicios de la DB inmediatamente
      const { data: dbSvc } = await supabase
        .from('services')
        .select('*')
      
      const formattedDbSvc = (dbSvc || []).map(s => ({ ...s, promoted: true }))
      setDbServices(formattedDbSvc)
      setServices(formattedDbSvc)
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleSearchNearby = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por tu navegador')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await fetchNearbyServices(latitude, longitude, dbServices)
        setLoading(false)
      },
      (error) => {
        alert('No pudimos obtener tu ubicación. Por favor activa el GPS.')
        setLoading(false)
      }
    )
  }

  const fetchNearbyServices = async (lat: number, lon: number, dbSvc: any[]) => {
    const radius = 15000
    const query = `[out:json];(node["amenity"="veterinary"](around:${radius},${lat},${lon});way["amenity"="veterinary"](around:${radius},${lat},${lon});node["shop"="pet"](around:${radius},${lat},${lon});way["shop"="pet"](around:${radius},${lat},${lon});node["shop"="pet_grooming"](around:${radius},${lat},${lon});way["shop"="pet_grooming"](around:${radius},${lat},${lon}););out center;`
    
    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query })
      const data = await response.json()
      const osmResults = data.elements.map((el: any) => {
        const tags = el.tags || {}
        const elLat = el.lat || el.center?.lat
        const elLon = el.lon || el.center?.lon
        return {
          id: `osm-${el.id}`,
          name: tags.name || 'Servicio Mascota',
          type: tags.amenity === 'veterinary' ? 'vet' : tags.shop === 'pet_grooming' ? 'grooming' : 'shop',
          lat: elLat, lon: elLon,
          address: tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}` : undefined,
          phone: tags['phone'] || tags['contact:phone'],
          distance: Math.round(calculateDistance(lat, lon, elLat, elLon) * 10) / 10,
          rating_avg: 4 + Math.random()
        }
      })
      
      setServices([...dbSvc, ...osmResults])
    } catch (e) {
      console.error('OSM Error')
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar servicio?')) {
      await deleteService(id)
      setServices(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleToggleVerify = async (service: ServicePlace) => {
    const newStatus = !service.is_verified
    await verifyService(service.id as string, newStatus)
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_verified: newStatus } : s))
  }

  const isAdmin = profile?.role === 'admin'
  const canManage = (service: ServicePlace) => isAdmin || service.provider_id === user?.id

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-8">
      <div className="max-w-md mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gradient">{dict.services.title}</h1>
          <p className="text-white/60">{dict.services.subtitle}</p>
        </header>

        {/* SEARCH NEARBY BUTTON */}
        <button
          onClick={handleSearchNearby}
          disabled={loading}
          className="w-full mb-8 py-4 glass bg-primary/10 border-primary/20 hover:bg-primary/20 text-white rounded-3xl font-bold transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <MapPin className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span>{dict.services.searchNearby || 'Explorar servicios cercanos'}</span>
            </>
          )}
        </button>

        <div className="space-y-4">
          {loading && services.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-white/60">Buscando servicios...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="glass rounded-3xl p-8 text-center border-dashed border-2 border-white/10">
              <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No se encontraron servicios cercanos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`glass rounded-[2rem] overflow-hidden border-white/5 ${service.promoted ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/20' : ''}`}
                >
                  {/* SERVICE THUMBNAIL */}
                  <div className="h-48 w-full relative bg-zinc-800/50 flex items-center justify-center overflow-hidden">
                    {service.photos && service.photos.length > 0 ? (
                      <Image 
                        src={service.photos[0]} 
                        alt={service.name} 
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-20">
                        <Store className="w-12 h-12" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Sin imagen</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      {service.is_verified && (
                        <span className="bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xl backdrop-blur-md">
                          <BadgeCheck className="w-3.5 h-3.5" /> VERIFICADO
                        </span>
                      )}
                      {service.promoted && (
                        <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-xl">
                          PROMOCIONADO
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg truncate flex items-center gap-2">
                        {service.name}
                      </h3>
                      {service.distance && (
                        <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{service.distance} km</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-white/70 mb-3 line-clamp-2">{service.description}</p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setReviewingServiceId(service.id as string)} className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Star className={`w-3 h-3 ${service.rating_avg ? 'text-yellow-400 fill-current' : 'text-white/20'}`} />
                          <span className="text-sm font-bold">{service.rating_avg?.toFixed(1) || '5.0'}</span>
                          <span className="text-[10px] text-white/40 ml-1">({service.review_count || 0})</span>
                        </button>
                        {service.google_maps_url && <a href={service.google_maps_url} target="_blank" className="text-primary hover:text-white"><ExternalLink className="w-4 h-4" /></a>}
                      </div>

                      <div className="flex items-center gap-2">
                        {canManage(service) && (
                          <>
                            {isAdmin && (
                              <button onClick={() => handleToggleVerify(service)} className={`p-2 rounded-full ${service.is_verified ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40'}`}>
                                <BadgeCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => setEditingService(service)} className="p-2 bg-white/5 rounded-full text-white/60"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(service.id as string)} className="p-2 bg-red-500/10 rounded-full text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                        {!canManage(service) && user && <button onClick={() => setReviewingServiceId(service.id as string)} className="p-2 bg-white/5 rounded-full text-white/60"><MessageSquare className="w-4 h-4" /></button>}
                        {service.phone && <a href={`tel:${service.phone}`} className="p-2 bg-primary/20 rounded-full text-primary"><Phone className="w-4 h-4" /></a>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <AddServiceButton />

        <ClientPortal>
          <AnimatePresence>
            {editingService && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditingService(null)}>
                <div className="relative w-full max-w-2xl glass rounded-[2.5rem] p-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <ServiceForm service={editingService} onSuccess={() => { setEditingService(null); window.location.reload(); }} />
                </div>
              </div>
            )}
            {reviewingServiceId && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setReviewingServiceId(null)}>
                <div className="relative w-full max-w-md glass rounded-[2.5rem] p-4" onClick={e => e.stopPropagation()}>
                  <ReviewForm serviceId={reviewingServiceId} onSuccess={() => window.location.reload()} />
                  <ReviewList serviceId={reviewingServiceId} />
                </div>
              </div>
            )}
          </AnimatePresence>
        </ClientPortal>
      </div>
      <Navigation />
    </div>
  )
}
