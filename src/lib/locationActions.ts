'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLocation(lat: number, lng: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // PostGIS GEOGRAPHY point: POINT(lng lat)
  const { error } = await supabase
    .from('profiles')
    .update({
      location: `POINT(${lng} ${lat})`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profiles')
  return { success: true }
}
