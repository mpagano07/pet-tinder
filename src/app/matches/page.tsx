import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { PawPrint, MessageCircle } from 'lucide-react'
import { getDictionary } from '@/i18n/getDictionary'
import Link from 'next/link'
import Image from 'next/image'
import { DeleteMatchButton } from '@/components/matches/DeleteMatchButton'

export default async function MatchesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dict = getDictionary()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's pets
  const { data: userPets } = await supabase
    .from('pets')
    .select('id')
    .eq('owner_id', user.id)

  const myPetIds = userPets?.map(p => p.id) || []

  // Get matches where any of the user's pets are involved
  let matchesData = []
  if (myPetIds.length > 0) {
    const { data: matches } = await supabase
      .from('matches')
      .select(`
        id,
        pet1:pet1_id (id, name, breed, photos),
        pet2:pet2_id (id, name, owner_id, photos)
      `)
      .or(`pet1_id.in.(${myPetIds.join(',')}),pet2_id.in.(${myPetIds.join(',')})`)
      
    // Get unread counts for these matches
    const { data: unreadCounts } = await supabase
      .from('messages')
      .select('match_id')
      .eq('is_read', false)
      .neq('sender_id', user.id)

    matchesData = (matches || []).map(match => ({
      ...match,
      unreadCount: unreadCounts?.filter(m => m.match_id === match.id).length || 0
    }))
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none" />

      <header className="pt-12 pb-4 px-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-gradient">{dict.matches.title}</h1>
        </div>
      </header>

      <main className="relative z-10 px-4 mt-4 max-w-md mx-auto">
        {matchesData.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {matchesData.map((match: any) => {
              // Determine which pet is "mine" and which is "theirs"
              const isPet1Mine = myPetIds.includes(match.pet1.id)
              const theirPet = isPet1Mine ? match.pet2 : match.pet1
              const myPet = isPet1Mine ? match.pet1 : match.pet2

              return (
                <div key={match.id} className="relative group">
                  <Link href={`/chat/${match.id}`} className="block">
                    <div className="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-white/10 overflow-hidden border-2 border-white/10 flex-shrink-0 relative">
                          {theirPet.photos?.[0] ? (
                            <Image 
                              src={theirPet.photos[0]} 
                              alt={theirPet.name} 
                              fill
                              sizes="56px"
                              className="object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PawPrint className="w-6 h-6 text-white/20" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{theirPet.name}</h3>
                          <p className="text-white/60 text-sm">Match con {myPet.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {match.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-primary text-[10px] text-white flex items-center justify-center rounded-full font-bold shadow-lg shadow-primary/20">
                            {match.unreadCount}
                          </span>
                        )}
                        <div className="text-primary font-semibold text-sm mr-2 flex items-center gap-2">
                          {dict.matches.chat} &rarr;
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Delete Conversation Button */}
                  <DeleteMatchButton matchId={match.id} />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 text-center border-dashed border-2 border-white/10 mt-10">
            <HeartCrackIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-2">{dict.matches.noMatches}</p>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}

function HeartCrackIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="m12 13-1-1 2-2-3-3 2-2" />
    </svg>
  )
}
