import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { FeedClient } from './FeedClient'
import { PawPrint } from 'lucide-react'
import { getDictionary } from '@/i18n/getDictionary'
import { FilterBar } from '@/components/ui/FilterBar'
import { Suspense } from 'react'

interface FeedPageProps {
  searchParams: {
    species?: string
    gender?: string
    maxAge?: string
  }
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dict = getDictionary()

  if (!user) {
    redirect('/auth/login')
  }

  // 1. Fetch user's primary pet with full details for matching
  const { data: userPets } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)

  if (!userPets || userPets.length === 0) {
    redirect('/profiles')
  }
  const myPet = userPets[0]
  const myPetId = myPet.id

  const { data: existingSwipes } = await supabase
    .from('swipes')
    .select('swiped_pet_id')
    .eq('swiper_pet_id', myPetId)

  const swipedIds = existingSwipes?.map(s => s.swiped_pet_id) || []

  // 2. Build query with filters
  let query = supabase
    .from('pets')
    .select(`
      *,
      owner:owner_id (
        location
      )
    `)
    .neq('owner_id', user.id)

  // Filter out already swiped pets
  if (swipedIds.length > 0) {
    query = query.not('id', 'in', swipedIds)
  }

  // Filter by species (exact match for performance and enum compatibility)
  const species = Array.isArray(searchParams.species) ? searchParams.species[0] : searchParams.species
  if (species && species !== '') {
    query = query.eq('species', species)
  }

  // Filter by gender (exact match for enum compatibility)
  const gender = Array.isArray(searchParams.gender) ? searchParams.gender[0] : searchParams.gender
  if (gender && gender !== '') {
    query = query.eq('gender', gender)
  }

  // Filter by age
  const maxAge = Array.isArray(searchParams.maxAge) ? searchParams.maxAge[0] : searchParams.maxAge
  if (maxAge && !isNaN(parseInt(maxAge))) {
    query = query.lte('age', parseInt(maxAge))
  }

  const { data: potentialMatches, error: queryError } = await query.limit(50)
  
  if (queryError) {
    console.error('[Feed Query Error]:', queryError)
  }

  const unswipedPets = potentialMatches || []

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none" />

      <header className="pt-12 pb-4 px-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <PawPrint className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-gradient">{dict.feed.discover}</h1>
        </div>
        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>
      </header>

      <main className="relative z-10 px-4 mt-4 flex justify-center">
        <FeedClient 
          key={JSON.stringify(searchParams)} 
          initialPets={unswipedPets} 
          swiperPet={myPet} 
        />
      </main>

      <Navigation />
    </div>
  )
}
