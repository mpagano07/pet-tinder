'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createService(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const address = formData.get('address') as string
  const googleMapsUrl = formData.get('google_maps_url') as string
  const phone = formData.get('phone') as string
  const photos = formData.getAll('photos') as File[]
  
  console.log('[createService] Iniciando para:', name)
  console.log('[createService] Cantidad de fotos recibidas en server:', photos.length)

  let photosArray: string[] = []

  for (const photo of photos) {
    if (photo && photo.size > 0) {
      console.log('[createService] Procesando foto:', photo.name, 'size:', photo.size)
      const fileExt = photo.name.split('.').pop()
      const fileName = `${user.id}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

      const { error: uploadError, data } = await supabase.storage
        .from('services')
        .upload(fileName, photo, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        console.error('[createService] Error de subida:', uploadError)
        return { error: `Error en la imagen: ${uploadError.message}. ¿Creaste el bucket 'services' en Storage?` }
      }

      if (data) {
        console.log('[createService] Foto subida con éxito:', data.path)
        const { data: publicUrlData } = supabase.storage.from('services').getPublicUrl(fileName)
        console.log('[createService] URL Pública generada:', publicUrlData.publicUrl)
        photosArray.push(publicUrlData.publicUrl)
      }
    } else {
      console.log('[createService] Foto vacía o inválida omitida')
    }
  }

  // Set user role to provider if not already
  await supabase
    .from('profiles')
    .update({ role: 'provider' })
    .eq('id', user.id)
    .is('role', null)

  const { error } = await supabase
    .from('services')
    .insert({
      provider_id: user.id,
      name,
      type,
      description,
      address,
      google_maps_url: googleMapsUrl,
      phone,
      photos: photosArray,
      rating_avg: 5.0
    })

  if (error) {
    console.error('[createService Error]:', error)
    return { error: error.message }
  }

  console.log('[createService Success]: Service created for user', user.id)
  revalidatePath('/services')
  return { success: true }
}

export async function updateService(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const serviceId = formData.get('id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const address = formData.get('address') as string
  const googleMapsUrl = formData.get('google_maps_url') as string
  const phone = formData.get('phone') as string

  const existingPhotos = JSON.parse(formData.get('existing_photos') as string || '[]')
  const newPhotos = formData.getAll('photos') as File[]

  let photosArray: string[] = [...existingPhotos]

  for (const photo of newPhotos) {
    if (photo && photo.size > 0) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${user.id}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

      const { error: uploadError, data } = await supabase.storage
        .from('services')
        .upload(fileName, photo, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        return { error: `Error en la imagen: ${uploadError.message}. ¿Creaste el bucket 'services' en Storage?` }
      }

      if (data) {
        const { data: publicUrlData } = supabase.storage.from('services').getPublicUrl(fileName)
        photosArray.push(publicUrlData.publicUrl)
      }
    }
  }

  const { error } = await supabase
    .from('services')
    .update({
      name,
      type,
      description,
      address,
      google_maps_url: googleMapsUrl,
      phone,
      photos: photosArray,
      updated_at: new Date().toISOString()
    })
    .eq('id', serviceId)

  if (error) return { error: error.message }

  revalidatePath('/services')
  return { success: true }
}

export async function deleteService(serviceId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const { data: service } = await supabase.from('services').select('provider_id').eq('id', serviceId).single()

  if (profile?.role !== 'admin' && service?.provider_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)

  if (error) return { error: error.message }

  revalidatePath('/services')
  return { success: true }
}

export async function verifyService(serviceId: string, status: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized. Admin only.' }

  const { error } = await supabase
    .from('services')
    .update({ is_verified: status })
    .eq('id', serviceId)

  if (error) return { error: error.message }

  revalidatePath('/services')
  return { success: true }
}

export async function addReview(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const serviceId = formData.get('service_id') as string
  const rating = parseInt(formData.get('rating') as string)
  const comment = formData.get('comment') as string

  const { error } = await supabase
    .from('service_reviews')
    .insert({
      service_id: serviceId,
      user_id: user.id,
      rating,
      comment
    })

  if (error) {
    if (error.code === '23505') return { error: 'Ya has calificado este servicio' }
    return { error: error.message }
  }

  revalidatePath('/services')
  return { success: true }
}
