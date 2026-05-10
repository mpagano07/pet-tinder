'use server'

import { createClient } from '@/utils/supabase/server'

export async function recordSwipe(swiperPetId: string, swipedPetId: string, action: 'like' | 'dislike') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 1. Insert swipe (upsert to handle accidental duplicates)
  const { error: swipeError } = await supabase
    .from('swipes')
    .upsert({
      swiper_pet_id: swiperPetId,
      swiped_pet_id: swipedPetId,
      action
    }, { onConflict: 'swiper_pet_id,swiped_pet_id' })

  if (swipeError) {
    return { error: swipeError.message }
  }

  // 2. Check for match if action is 'like'
  if (action === 'like') {
    const { data: mutualSwipe } = await supabase
      .from('swipes')
      .select('id')
      .eq('swiper_pet_id', swipedPetId)
      .eq('swiped_pet_id', swiperPetId)
      .eq('action', 'like')
      .maybeSingle()

    if (mutualSwipe) {
      const [pet1_id, pet2_id] = [swiperPetId, swipedPetId].sort()
      
      const { data: newMatch, error: matchError } = await supabase
        .from('matches')
        .insert({
          pet1_id,
          pet2_id
        })
        .select('id')
        .maybeSingle()
      
      if (matchError) {
        if (matchError.code === '23505') {
          const { data: existingMatch } = await supabase
            .from('matches')
            .select('id')
            .eq('pet1_id', pet1_id)
            .eq('pet2_id', pet2_id)
            .single()
          return { match: true, matchId: existingMatch?.id }
        }
        return { error: matchError.message }
      }
      
      return { match: true, matchId: newMatch?.id }
    }
  }

  return { match: false }
}
