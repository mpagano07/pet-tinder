import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ChatClient } from './ChatClient'
import { getDictionary } from '@/i18n/getDictionary'
import Link from 'next/link'
import { ArrowLeft, PawPrint } from 'lucide-react'

export default async function ChatPage({ params }: { params: { matchId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dict = getDictionary()

  if (!user) {
    redirect('/auth/login')
  }

  // Verify match exists and user is part of it
  const { data: match } = await supabase
    .from('matches')
    .select(`
      id,
      pet1:pet1_id (id, name, owner_id, photos),
      pet2:pet2_id (id, name, owner_id, photos)
    `)
    .eq('id', params.matchId)
    .single()

  if (!match || (match.pet1.owner_id !== user.id && match.pet2.owner_id !== user.id)) {
    redirect('/matches')
  }

  // Determine other pet name
  const isPet1Mine = match.pet1.owner_id === user.id
  const myPet = isPet1Mine ? match.pet1 : match.pet2
  const otherPet = isPet1Mine ? match.pet2 : match.pet1

  // Fetch initial messages
  const { data: initialMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', params.matchId)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      
      <header className="glass sticky top-0 z-20 border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <Link href="/matches" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/10">
            {otherPet.photos?.[0] ? (
              <img src={otherPet.photos[0]} alt={otherPet.name} className="w-full h-full object-cover" />
            ) : (
              <PawPrint className="w-5 h-5 text-white/40" />
            )}
          </div>
          <div>
            <h2 className="font-bold">{otherPet.name}</h2>
            <p className="text-xs text-green-400">En línea</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 relative z-10 flex flex-col">
        <ChatClient 
          matchId={params.matchId} 
          userId={user.id} 
          initialMessages={initialMessages || []} 
          placeholder={dict.chat.placeholder}
          sendText={dict.chat.send}
          myPetPhoto={myPet.photos?.[0]}
          otherPetPhoto={otherPet.photos?.[0]}
        />
      </main>
    </div>
  )
}
