'use client'

import { useState, useRef } from 'react'
import { Plus, Image as ImageIcon, PawPrint, Loader2, Sparkles, Brain, FlaskConical } from 'lucide-react'
import { toast } from 'sonner'
import { addPet } from '@/app/profiles/actions'
import { useTranslation } from '@/i18n/LanguageProvider'

const SPECIES_OPTIONS = [
  { value: 'dog', label: '🐕 Perro' },
  { value: 'cat', label: '🐈 Gato' },
  { value: 'rabbit', label: '🐇 Conejo' },
  { value: 'bird', label: '🦜 Ave' },
  { value: 'other', label: '🐾 Otro' },
]

export function PetForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
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
    
    try {
      const result = await addPet(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(dict.profile.petAdded || 'Pet added successfully!')
        formRef.current?.reset()
        setPreview(null)
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] pointer-events-none" />
      
      <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
        <Plus className="text-primary w-6 h-6" /> {dict.profile.addNewPet}
      </h3>
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload Field */}
        <div className="w-full">
          <label className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-2 block">
            Foto Principal
          </label>
          <div className="relative w-full h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center hover:bg-white/10 transition-all cursor-pointer group overflow-hidden">
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              required
            />
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover animate-in fade-in zoom-in duration-300" />
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-8 h-8 text-white/20 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors font-bold uppercase tracking-tighter">Toca para subir foto</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">{dict.profile.petName}</label>
            <input required type="text" name="name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Especie</label>
            <select name="species" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none appearance-none text-white focus:ring-2 focus:ring-primary/50 transition-all font-bold">
              {SPECIES_OPTIONS.map(s => (
                <option key={s.value} value={s.value} className="bg-background">{s.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">{dict.profile.petBreed}</label>
            <input type="text" name="breed" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">{dict.profile.petAge}</label>
            <input required type="number" name="age" min="0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
          </div>
          
          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">{dict.profile.petGender}</label>
            <select required name="gender" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none appearance-none text-white focus:ring-2 focus:ring-primary/50 transition-all font-bold">
              <option value="male" className="bg-background">{dict.profile.petMale}</option>
              <option value="female" className="bg-background">{dict.profile.petFemale}</option>
            </select>
          </div>
          
          <div className="col-span-2 grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Tamaño</label>
              <select name="size" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none appearance-none text-white focus:ring-2 focus:ring-primary/50 transition-all font-bold">
                <option value="small" className="bg-background">Pequeño</option>
                <option value="medium" className="bg-background">Mediano</option>
                <option value="large" className="bg-background">Grande</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Vivienda</label>
              <select name="housing" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none appearance-none text-white focus:ring-2 focus:ring-primary/50 transition-all font-bold">
                <option value="apartment" className="bg-background">Departamento</option>
                <option value="house" className="bg-background">Casa</option>
                <option value="both" className="bg-background">Ambas</option>
              </select>
            </div>
          </div>

          <div className="col-span-2 space-y-3">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block flex items-center gap-2">
               Nivel de Actividad <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-[8px]">1-5</span>
            </label>
            <input type="range" name="activity_level" min="1" max="5" defaultValue="3" className="w-full accent-primary bg-white/5 h-2 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-[10px] text-white/40 uppercase font-black">
              <span>Relajado</span>
              <span>Muy Activo</span>
            </div>
          </div>

          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Temperamento (Separar por comas)</label>
            <input type="text" name="temperament" placeholder="ej: Juguetón, Tranquilo, Protector" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
          </div>

          {/* Genetic & Behavior - Innovative Fields */}
          <div className="col-span-2 p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Datos Inteligentes</span>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block flex items-center gap-1.5">
                  <FlaskConical className="w-3 h-3" /> Info Genética
                </label>
                <input type="text" name="genetic_info" placeholder="Línea de sangre, pedigree, pureza..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block flex items-center gap-1.5">
                  <Brain className="w-3 h-3" /> Predicción de Comportamiento
                </label>
                <textarea name="behavior_prediction" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none resize-none h-16 focus:ring-2 focus:ring-primary/50 transition-all" placeholder="¿Cómo reacciona ante extraños o ruidos fuertes?" />
             </div>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group glass-dark p-3 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
              <input type="checkbox" name="vaccinated" value="true" className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary/50" />
              <span className="text-xs text-white/60 group-hover:text-white transition-colors font-bold uppercase tracking-tighter">Vacunado</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group glass-dark p-3 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
              <input type="checkbox" name="kids_friendly" value="true" defaultChecked className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary/50" />
              <span className="text-xs text-white/60 group-hover:text-white transition-colors font-bold uppercase tracking-tighter">Niños OK</span>
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">{dict.profile.petBio}</label>
          <textarea name="bio" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none resize-none h-24 focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
        </div>

        <button 
          disabled={isSubmitting}
          className="w-full py-5 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(230,57,70,0.4)] flex items-center justify-center gap-3 disabled:opacity-70 text-lg uppercase italic tracking-tighter"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <PawPrint className="w-6 h-6 fill-current" />
              {dict.profile.addPetBtn}
            </>
          )}
        </button>
      </form>
    </div>
  )
}
