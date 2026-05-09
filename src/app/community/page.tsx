import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Globe, Users, Calendar, MapPin, Sparkles, Plus, ArrowRight } from 'lucide-react'
import { getDictionary } from '@/i18n/getDictionary'

export default async function CommunityPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dict = getDictionary()

  if (!user) {
    redirect('/auth/login')
  }

  // Real Stats from DB
  const { count: totalDogs } = await supabase.from('pets').select('*', { count: 'exact', head: true }).eq('species', 'dog')
  const { count: totalGoldens } = await supabase.from('pets').select('*', { count: 'exact', head: true }).ilike('breed', '%golden%')

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <header className="pt-12 pb-6 px-6 relative z-10">
        <h1 className="text-4xl font-black text-gradient tracking-tighter mb-2 italic uppercase">Comunidad</h1>
        <p className="text-white/50 text-sm">Conecta con otros dueños y asiste a eventos locales.</p>
      </header>

      <main className="px-6 space-y-8 relative z-10">
        
        {/* Local Stats Widget */}
        <section className="glass rounded-[2rem] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="font-bold text-white/80 uppercase tracking-widest text-xs">Cerca de ti</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-3xl font-black text-white">{totalDogs || 0}</p>
                <p className="text-xs text-white/40 uppercase font-bold">Perros activos</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-primary">{totalGoldens || 0}</p>
                <p className="text-xs text-white/40 uppercase font-bold">Golden Retrievers</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                   <MapPin className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                   <p className="text-sm font-bold text-white/90">Parque Centenario</p>
                   <p className="text-[10px] text-white/40 font-bold uppercase">Punto más popular hoy</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20" />
            </div>
          </div>
        </section>

        {/* Featured Events */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold flex items-center gap-2">
               <Calendar className="w-5 h-5 text-primary" /> Próximos Eventos
             </h3>
             <button className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
               Ver todos <ArrowRight className="w-3 h-3" />
             </button>
          </div>

          <div className="space-y-4">
            {/* Event Card 1 */}
            <div className="glass rounded-3xl p-5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
               <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-800 overflow-hidden relative border border-white/5 shrink-0">
                     <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Event" />
                     <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-primary rounded-lg text-[8px] font-black text-white italic">HOT</div>
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] font-black text-primary uppercase tracking-tighter mb-1">Este Sábado • 16:00hs</p>
                     <h4 className="font-bold text-lg leading-tight mb-2">Gran Juntada de Cachorros</h4>
                     <div className="flex items-center gap-1 text-white/40 text-[10px] font-bold uppercase">
                        <MapPin className="w-3 h-3" /> Parque de las Naciones
                     </div>
                  </div>
               </div>
               <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                       <div key={i} className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-[8px] font-bold">P{i}</div>
                     ))}
                     <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-zinc-900 flex items-center justify-center text-[8px] font-bold text-primary">+12</div>
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-primary hover:text-white transition-all rounded-xl text-xs font-bold uppercase tracking-wider border border-white/5">Unirse</button>
               </div>
            </div>

            {/* Event Card 2 */}
            <div className="glass rounded-3xl p-5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
               <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-800 overflow-hidden relative border border-white/5 shrink-0">
                     <img src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Event" />
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter mb-1">Domingo • 10:00hs</p>
                     <h4 className="font-bold text-lg leading-tight mb-2">Caminata Grupal Senior</h4>
                     <div className="flex items-center gap-1 text-white/40 text-[10px] font-bold uppercase">
                        <MapPin className="w-3 h-3" /> Costanera Sur
                     </div>
                  </div>
               </div>
               <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex -space-x-2">
                     {[1,2].map(i => (
                       <div key={i} className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-[8px] font-bold">P{i}</div>
                     ))}
                     <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-zinc-900 flex items-center justify-center text-[8px] font-bold text-blue-400">+5</div>
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-primary hover:text-white transition-all rounded-xl text-xs font-bold uppercase tracking-wider border border-white/5">Unirse</button>
               </div>
            </div>
          </div>
        </section>

        {/* Community Board */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-yellow-400" /> Tablero Social
             </h3>
             <button className="p-2 bg-primary rounded-full shadow-[0_0_15px_rgba(230,57,70,0.4)]">
               <Plus className="w-4 h-4 text-white" />
             </button>
          </div>

          <div className="space-y-3">
             <div className="glass-dark p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-full bg-zinc-800" />
                   <div>
                      <p className="text-xs font-bold">@matias_rex</p>
                      <p className="text-[10px] text-white/40">Hace 2 horas</p>
                   </div>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  "Busco compañero de socialización para cachorro de 4 meses en zona Palermo. Es un labrador muy tranquilo!"
                </p>
                <div className="mt-3 flex gap-2">
                   <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/10">SOCIALIZACIÓN</span>
                </div>
             </div>

             <div className="glass-dark p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-full bg-zinc-800" />
                   <div>
                      <p className="text-xs font-bold">@laura_pups</p>
                      <p className="text-[10px] text-white/40">Hace 5 horas</p>
                   </div>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  "¿Alguien conoce un buen adiestrador que use refuerzo positivo por la zona de Belgrano?"
                </p>
                <div className="mt-3 flex gap-2">
                   <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-lg border border-green-400/10">PREGUNTA</span>
                </div>
             </div>
          </div>
        </section>

      </main>

      <Navigation />
    </div>
  )
}
