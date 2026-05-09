'use client'

import React, { useState } from 'react'
import { Edit2, X, Image as ImageIcon, PawPrint, Loader2 } from 'lucide-react'
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

export function EditPetButton({ pet }: { pet: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(pet.photos?.[0] || null)
  const dict = useTranslation()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.append('id', pet.id)
    
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
                className="relative w-full max-w-lg glass rounded-3xl p-6 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide my-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-primary" /> Editar {pet.name}
                  </h3>
                  <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-5 h-5 text-white/40" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="w-full">
                    <label className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block">Foto Principal</label>
                    <div className="relative w-full h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center hover:bg-white/10 transition-all cursor-pointer group overflow-hidden">
                      <input type="file" name="photo" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                      {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="w-8 h-8 text-white/20 mb-2" />
                          <span className="text-sm text-white/40">Sin foto</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <span className="text-white font-bold text-sm">Cambiar foto</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block">Nombre</label>
                      <input required type="text" name="name" defaultValue={pet.name} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block">Especie</label>
                      <select name="species" defaultValue={pet.species} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none appearance-none text-white focus:ring-2 focus:ring-primary/50 transition-all">
                        {SPECIES_OPTIONS.map(s => (
                          <option key={s.value} value={s.value} className="bg-background">{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block">Raza</label>
                      <input type="text" name="breed" defaultValue={pet.breed} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block">Edad</label>
                      <input required type="number" name="age" defaultValue={pet.age} min="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block">Género</label>
                      <select required name="gender" defaultValue={pet.gender} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none appearance-none text-white focus:ring-2 focus:ring-primary/50 transition-all">
                        <option value="male" className="bg-background">Macho</option>
                        <option value="female" className="bg-background">Hembra</option>
                      </select>
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block">Tamaño</label>
                        <select name="size" defaultValue={pet.size} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none appearance-none text-white focus:ring-2 focus:ring-primary/50 transition-all">
                          <option value="small" className="bg-background">Pequeño</option>
                          <option value="medium" className="bg-background">Mediano</option>
                          <option value="large" className="bg-background">Grande</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-end gap-2 pb-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" name="vaccinated" value="true" defaultChecked={pet.vaccinated} className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50" />
                          <span className="text-sm text-white/60 group-hover:text-white transition-colors">Vacunado</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" name="pedigree" value="true" defaultChecked={pet.pedigree} className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50" />
                          <span className="text-sm text-white/60 group-hover:text-white transition-colors">Pedigree</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block">Biografía</label>
                    <textarea name="bio" defaultValue={pet.bio} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none resize-none h-24 focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block">Notas Médicas / Observaciones</label>
                    <textarea name="medical_notes" defaultValue={pet.medical_notes} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none resize-none h-20 focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-all">
                      Cancelar
                    </button>
                    <button disabled={isSubmitting} className="flex-[2] py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PawPrint className="w-5 h-5" />}
                      Guardar Cambios
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
