'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinEvent(eventId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('event_participants')
    .insert({
      event_id: eventId,
      profile_id: user.id
    })

  if (error) {
    if (error.code === '23505') return { error: 'Ya estás unido a este evento' }
    return { error: error.message }
  }

  revalidatePath('/community')
  return { success: true }
}

export async function leaveEvent(eventId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)
    .eq('profile_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/community')
  return { success: true }
}

export async function createEvent(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const date = formData.get('date') as string
  const locationName = formData.get('location_name') as string

  const { error } = await supabase
    .from('events')
    .insert({
      creator_id: user.id,
      title,
      description,
      category,
      event_date: date,
      location_name: locationName
    })

  if (error) return { error: error.message }

  revalidatePath('/community')
  return { success: true }
}

export async function createPost(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  const category = formData.get('category') as string

  const { error } = await supabase
    .from('community_posts')
    .insert({
      author_id: user.id,
      content,
      category
    })

  if (error) return { error: error.message }

  revalidatePath('/community')
  return { success: true }
}
