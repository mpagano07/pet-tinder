'use client'

import React, { useState } from 'react'
import { Edit2, X, Image as ImageIcon, PawPrint, Loader2, Sparkles, Brain, FlaskConical, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { updatePet } from '@/app/profiles/actions'
import { useTranslation } from '@/i18n/LanguageProvider'
import { ClientPortal } from '../ui/ClientPortal'

const SPECIES_OPTIONS = [
  { value: 'dog', label: '🐕 Perro' },
  { value: 'cat', label: '🐈 Gato' },
  { value: 'rabbit', label: '🐇 Conejo' },
  { value: 'bird', label: '🦜 Ave' },
  { value: 'other', label: '🐾 Otro' },
]

const MAX_PHOTOS = 3

interface PhotoItem {
  id: string
  src: string
  file?: File
}

export function EditPetButton({ pet }: { pet: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photos, setPhotos] = useState<PhotoItem[]>(
    (pet.photos || []).map((url: string, i: number) => ({ id: `existing-${i}`, src: url }))
  )
  const dict = useTranslation()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) {
      toast.error(`Solo puedes subir hasta ${MAX_PHOTOS} imágenes.`)
      return
    }

    const selectedFiles = files.slice(0, remaining)
    const newPhotos = selectedFiles.map(file => ({
      id: `new-${Math.random().toString(36).substr(2, 9)}`,
      src: URL.createObjectURL(file),
      file
    }))

    if (files.length > remaining) {
      toast.error(`Solo puedes subir hasta ${MAX_PHOTOS} imágenes.`)
    }

    setPhotos(prev => [...prev, ...newPhotos])
  }

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const setAsMain = (index: number) => {
    setPhotos(prev => {
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.unshift(item)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.append('id', pet.id)
    
    // Send existing photo URLs to keep
    const existingUrls = photos.filter(p => !p.file).map(p => p.src)
    formData.append('existing_photos', JSON.stringify(existingUrls))
    
    // Append new files in the correct order is tricky with FormData.getAll
    // So we'll just append them all and the backend will have to guess, 
    // OR we can send a "photo_order" string.
    
    // Let's send photo_order to help the backend reconstruct the array
    const photoOrder = photos.map(p => p.file ? `file:${p.file.name}` : `url:${p.src}`)
    formData.append('photo_order', JSON.stringify(photoOrder))
    
    // Add the files
    photos.forEach(p => {
      if (p.file) {
        formData.append('photo', p.file)
      }
    })
    
    try {
      const result = await updatePet(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Mascota actualizada correctamente')
        setIsOpen(false)
      }
    } catch (err) {
      toast.error('Algo salió mal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-2 right-12 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20 backdrop-blur-sm border border-white/20 group-hover:scale-110 active:scale-95"
        title="Editar mascota"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      <ClientPortal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide my-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-primary" /> Editar {pet.name}
                  </h3>
                  <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-5 h-5 text-white/40" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Fotos de la Mascota</p>
                        <p className="text-[10px] text-white/50">Máximo {MAX_PHOTOS} imágenes</p>
                      </div>
                      <span className="text-[10px] text-white/50 uppercase tracking-widest">
                        {photos.length}/{MAX_PHOTOS}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {photos.map((photo, index) => (
                        <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                          <img src={photo.src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setAsMain(index)}
                              className={`p-1 backdrop-blur-sm rounded-full text-white transition-colors ${index === 0 ? 'bg-yellow-500' : 'bg-black/50 hover:bg-yellow-500/50'}`}
                            >
                              <Star className={`w-3 h-3 ${index === 0 ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removePhoto(photo.id)}
                              className="p-1 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-yellow-500/80 text-white text-[8px] font-black uppercase text-center py-0.5">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="relative aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center hover:bg-white/10 transition-all cursor-pointer group overflow-hidden">
                        <input
                          type="file"
                          name="photo"
                          accept="image/*"
                          multiple
                          disabled={photos.length >= MAX_PHOTOS}
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <ImageIcon className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                        <span className="text-[8px] text-white/40 font-bold uppercase tracking-tighter mt-1">Añadir</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Nombre</label>
                      <input required type="text" name="name" defaultValue={pet.name} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Especie</label>
                      <select name="species" defaultValue={pet.species} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none appearance-none text-white focus:ring-2 focus:ring-primary/50 transition-all font-bold">
                        {SPECIES_OPTIONS.map(s => (
                          <option key={s.value} value={s.value} className="bg-background">{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Raza</label>
                      <input type="text" name="breed" defaultValue={pet.breed} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Edad</label>
                      <input required type="number" name="age" defaultValue={pet.age} min="0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
                    </div>
                    
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Género</label>
                      <select required name="gender" defaultValue={pet.gender} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none appearance-none text-white focus:ring-2 focus:ring-primary/50 transition-all font-bold">
                        <option value="male" className="bg-background">Macho</option>
                        <option value="female" className="bg-background">Hembra</option>
                      </select>
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Tamaño</label>
                      <select name="size" defaultValue={pet.size || 'medium'} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none appearance-none text-white focus:ring-2 focus:ring-primary/50 transition-all font-bold">
                        <option value="small" className="bg-background">Pequeño</option>
                        <option value="medium" className="bg-background">Mediano</option>
                        <option value="large" className="bg-background">Grande</option>
                      </select>
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Vivienda</label>
                      <select name="housing" defaultValue={pet.housing || 'both'} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none appearance-none text-white focus:ring-2 focus:ring-primary/50 transition-all font-bold">
                        <option value="apartment" className="bg-background">Departamento</option>
                        <option value="house" className="bg-background">Casa</option>
                        <option value="both" className="bg-background">Ambas</option>
                      </select>
                    </div>

                    <div className="col-span-2 space-y-3">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Nivel de Actividad (1-5)</label>
                      <input type="range" name="activity_level" min="1" max="5" defaultValue={pet.activity_level || 3} className="w-full accent-primary bg-white/5 h-2 rounded-lg appearance-none cursor-pointer" />
                      <div className="flex justify-between text-[10px] text-white/40 uppercase font-black">
                        <span>Relajado</span>
                        <span>Muy Activo</span>
                      </div>
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Temperamento (Comas)</label>
                      <input type="text" name="temperament" defaultValue={pet.temperament?.join(', ')} placeholder="ej: Juguetón, Tranquilo" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                    </div>

                    {/* Innovative Fields */}
                    <div className="col-span-2 p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                       <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Datos Inteligentes</span>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block flex items-center gap-1.5">
                            <FlaskConical className="w-3 h-3" /> Info Genética
                          </label>
                          <input type="text" name="genetic_info" defaultValue={pet.genetic_info} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block flex items-center gap-1.5">
                            <Brain className="w-3 h-3" /> Predicción de Comportamiento
                          </label>
                          <textarea name="behavior_prediction" defaultValue={pet.behavior_prediction} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none resize-none h-16 focus:ring-2 focus:ring-primary/50 transition-all" />
                       </div>
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer group glass-dark p-3 rounded-2xl border border-white/5">
                        <input type="checkbox" name="vaccinated" value="true" defaultChecked={pet.vaccinated} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary/50" />
                        <span className="text-xs text-white/60 group-hover:text-white transition-colors font-bold uppercase tracking-tighter">Vacunado</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group glass-dark p-3 rounded-2xl border border-white/5">
                        <input type="checkbox" name="kids_friendly" value="true" defaultChecked={pet.kids_friendly} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary/50" />
                        <span className="text-xs text-white/60 group-hover:text-white transition-colors font-bold uppercase tracking-tighter">Niños OK</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Biografía</label>
                    <textarea name="bio" defaultValue={pet.bio} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none resize-none h-24 focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase italic tracking-tighter transition-all">
                      Cancelar
                    </button>
                    <button disabled={isSubmitting} className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(230,57,70,0.4)] uppercase italic tracking-tighter">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PawPrint className="w-5 h-5" />}
                      Guardar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ClientPortal>
    </>
  )
}
