'use client'

import { useState } from 'react'
import { createService, updateService } from '@/app/services/actions'
import { Camera, Loader2, X, MapPin, Phone, Type, Info, ExternalLink, Star } from 'lucide-react'
import { useTranslation } from '@/i18n/LanguageProvider'

interface ServiceFormProps {
  service?: any
  onSuccess: () => void
}

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const dict = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>(service?.photos || [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPhotos(prev => [...prev, ...files])

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeNewPhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('--- FORM SUBMISSION ---')
    console.log('Servicio:', service ? 'Update' : 'Create')
    console.log('Fotos en estado:', photos.length)
    photos.forEach((f, i) => console.log(`Foto ${i}: ${f.name} (${f.size} bytes)`))

    const formData = new FormData(e.currentTarget)
    if (service) {
      formData.append('id', service.id)
      formData.append('existing_photos', JSON.stringify(existingPhotos))
    }

    photos.forEach(photo => formData.append('photos', photo))

    const result = service ? await updateService(formData) : await createService(formData)
    console.log('Resultado de la acción:', result)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-2 text-center mb-6">
        <h2 className="text-2xl font-bold">{service ? 'Editar Servicio' : 'Publicar mi Servicio'}</h2>
        <p className="text-white/60 text-sm">Completa la información para que los dueños de mascotas te encuentren.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-white/60 uppercase tracking-widest font-bold flex items-center gap-2">
            <Type className="w-3 h-3" /> Nombre del Negocio
          </label>
          <input
            name="name"
            defaultValue={service?.name}
            required
            placeholder="Ej: Veterinaria San Roque"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/60 uppercase tracking-widest font-bold flex items-center gap-2">
            <Info className="w-3 h-3" /> Tipo de Servicio
          </label>
          <select
            name="type"
            defaultValue={service?.type || 'vet'}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="vet" className="bg-zinc-900">Veterinaria</option>
            <option value="shop" className="bg-zinc-900">Pet Shop</option>
            <option value="grooming" className="bg-zinc-900">Peluquería Canina</option>
            <option value="other" className="bg-zinc-900">Otro</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-white/60 uppercase tracking-widest font-bold flex items-center gap-2">
          <MapPin className="w-3 h-3" /> Dirección
        </label>
        <input
          name="address"
          defaultValue={service?.address}
          required
          placeholder="Calle 123, Ciudad"
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-white/60 uppercase tracking-widest font-bold flex items-center gap-2">
          <ExternalLink className="w-3 h-3" /> Enlace de Google Maps
        </label>
        <input
          name="google_maps_url"
          defaultValue={service?.google_maps_url}
          placeholder="https://goo.gl/maps/..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-white/60 uppercase tracking-widest font-bold flex items-center gap-2">
          <Phone className="w-3 h-3" /> Teléfono de Contacto
        </label>
        <input
          name="phone"
          defaultValue={service?.phone}
          placeholder="+54 9 11 ..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-white/60 uppercase tracking-widest font-bold">Descripción</label>
        <textarea
          name="description"
          defaultValue={service?.description}
          rows={3}
          placeholder="Contanos más sobre lo que ofrecés..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs text-white/60 uppercase tracking-widest font-bold">Fotos del Local / Productos</label>
        <div className="grid grid-cols-3 gap-2">
          {existingPhotos.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={url} alt="Service" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeExistingPhoto(i)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {previews.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewPhoto(i)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white/5 transition-all">
            <Camera className="w-6 h-6 text-white/40" />
            <span className="text-[10px] text-white/40 uppercase font-bold">Subir</span>
            <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs text-white/60 uppercase tracking-widest font-bold">Términos y Condiciones</label>
        <div className="glass bg-primary/5 border-primary/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">Primer mes GRATIS</p>
              <p className="text-[11px] text-white/50">Tu servicio será promocionado sin costo por 30 días. Luego tendrá un costo mensual de suscripción.</p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group p-1">
            <input
              type="checkbox"
              required
              className="w-5 h-5 rounded-md border-white/10 bg-white/5 checked:bg-primary transition-all cursor-pointer"
            />
            <span className="text-xs text-white/70 group-hover:text-white transition-colors">
              Acepto las políticas de privacidad y condiciones de servicio.
            </span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : service ? 'Guardar Cambios' : 'Publicar Ahora'}
      </button>
    </form>
  )
}
