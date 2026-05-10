import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Globe, Users, Calendar, MapPin, Sparkles, ArrowRight } from 'lucide-react'
import { getDictionary } from '@/i18n/getDictionary'
import { EventList } from '@/components/community/EventList'
import { CreateEventModal } from '@/components/community/CreateEventModal'
import { PostList } from '@/components/community/PostList'
import { CreatePostModal } from '@/components/community/CreatePostModal'

export default async function CommunityPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dict = getDictionary()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // 1. Fetch Stats
  const { count: totalDogs } = await supabase.from('pets').select('*', { count: 'exact', head: true }).eq('species', 'dog')
  const { count: totalGoldens } = await supabase.from('pets').select('*', { count: 'exact', head: true }).ilike('breed', '%golden%')

  // 2. Fetch Events with participant counts and user join status
  const { data: eventsData } = await supabase
    .from('events')
    .select(`
      *,
      event_participants (profile_id)
    `)
    .order('event_date', { ascending: true })
    .limit(10)

  const formattedEvents = (eventsData || []).map(event => ({
    ...event,
    participants_count: event.event_participants?.length || 0,
    is_joined: event.event_participants?.some((p: any) => p.profile_id === user.id) || false
  }))

  // 3. Fetch Social Board Posts
  const { data: postsData } = await supabase
    .from('community_posts')
    .select(`
      *,
      author:author_id (
        username,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

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
             {isAdmin && <CreateEventModal />}
          </div>

          <EventList initialEvents={formattedEvents} />
        </section>

        {/* Community Board */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-yellow-400" /> Tablero Social
             </h3>
             <CreatePostModal />
          </div>

          <PostList initialPosts={postsData || []} />
        </section>

      </main>

      <Navigation />
    </div>
  )
}
