'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const fullName = formData.get('full_name') as string
  const bio = formData.get('bio') as string

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, bio, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/profiles')
  return { success: true }
}

export async function addPet(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const species = formData.get('species') as string
  const breed = formData.get('breed') as string
  const age = parseInt(formData.get('age') as string)
  const gender = formData.get('gender') as string
  const bio = formData.get('bio') as string
  const vaccinated = formData.get('vaccinated') === 'true'
  const size = formData.get('size') as string
  const pedigree = formData.get('pedigree') === 'true'
  const medicalNotes = formData.get('medical_notes') as string
  const housing = formData.get('housing') as string
  const activityLevel = parseInt(formData.get('activity_level') as string || '3')
  const kidsFriendly = formData.get('kids_friendly') === 'true'
  const temperamentRaw = formData.get('temperament') as string
  const temperament = temperamentRaw ? temperamentRaw.split(',').map(t => t.trim()).filter(Boolean) : []
  const geneticInfo = formData.get('genetic_info') as string
  const behaviorPrediction = formData.get('behavior_prediction') as string
  const photoOrder = JSON.parse(formData.get('photo_order') as string || '[]') as string[]
  const uploadedFiles = formData.getAll('photo') as File[]
  
  let photosArray: string[] = []

  if (photoOrder.length > 0) {
    for (const item of photoOrder) {
      if (item.startsWith('file:')) {
        const fileNameRaw = item.replace('file:', '')
        const photo = uploadedFiles.find(f => f.name === fileNameRaw)
        
        if (photo && photo.size > 0) {
          const fileExt = photo.name.split('.').pop()
          const fileName = `${user.id}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

          const { error: uploadError, data } = await supabase.storage
            .from('pets')
            .upload(fileName, photo, { cacheControl: '3600', upsert: false })

          if (!uploadError && data) {
            const { data: publicUrlData } = supabase.storage.from('pets').getPublicUrl(fileName)
            photosArray.push(publicUrlData.publicUrl)
          }
        }
      }
    }
  } else {
    // Fallback for simple uploads
    for (const photo of uploadedFiles) {
      if (photo && photo.size > 0) {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${user.id}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

        const { error: uploadError, data } = await supabase.storage
          .from('pets')
          .upload(fileName, photo, { cacheControl: '3600', upsert: false })

        if (!uploadError && data) {
          const { data: publicUrlData } = supabase.storage.from('pets').getPublicUrl(fileName)
          photosArray.push(publicUrlData.publicUrl)
        }
      }
    }
  }

  const { error } = await supabase
    .from('pets')
    .insert({
      owner_id: user.id,
      name,
      species: species || 'other',
      breed,
      age,
      gender,
      bio,
      vaccinated,
      size: size || 'medium',
      pedigree,
      medical_notes: medicalNotes,
      housing: housing || 'both',
      activity_level: activityLevel,
      kids_friendly: kidsFriendly,
      temperament: temperament,
      genetic_info: geneticInfo,
      behavior_prediction: behaviorPrediction,
      photos: photosArray
    })

  if (error) return { error: error.message }

  revalidatePath('/profiles')
  return { success: true }
}

export async function deletePet(petId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profiles')
  return { success: true }
}

export async function updatePet(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const petId = formData.get('id') as string
  const name = formData.get('name') as string
  const species = formData.get('species') as string
  const breed = formData.get('breed') as string
  const age = parseInt(formData.get('age') as string)
  const gender = formData.get('gender') as string
  const bio = formData.get('bio') as string
  const vaccinated = formData.get('vaccinated') === 'true'
  const size = formData.get('size') as string
  const pedigree = formData.get('pedigree') === 'true'
  const medicalNotes = formData.get('medical_notes') as string
  // Construct update object carefully
  const updateData: any = {
    name,
    species: species || 'other',
    breed,
    age,
    gender,
    bio,
    vaccinated,
    size: size || 'medium',
    pedigree,
    medical_notes: medicalNotes,
    housing: formData.get('housing') as string || 'both',
    activity_level: parseInt(formData.get('activity_level') as string || '3'),
    kids_friendly: formData.get('kids_friendly') === 'true',
    temperament: (formData.get('temperament') as string || '').split(',').map(t => t.trim()).filter(Boolean),
    genetic_info: formData.get('genetic_info') as string,
    behavior_prediction: formData.get('behavior_prediction') as string,
  }

  const photoOrder = JSON.parse(formData.get('photo_order') as string || '[]') as string[]
  const uploadedFiles = formData.getAll('photo') as File[]
  
  const finalPhotos: string[] = []

  for (const item of photoOrder) {
    if (item.startsWith('url:')) {
      finalPhotos.push(item.replace('url:', ''))
    } else if (item.startsWith('file:')) {
      const fileNameRaw = item.replace('file:', '')
      const photo = uploadedFiles.find(f => f.name === fileNameRaw)
      
      if (photo && photo.size > 0) {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${user.id}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

        const { error: uploadError, data } = await supabase.storage
          .from('pets')
          .upload(fileName, photo, { cacheControl: '3600', upsert: false })

        if (!uploadError && data) {
          const { data: publicUrlData } = supabase.storage.from('pets').getPublicUrl(fileName)
          finalPhotos.push(publicUrlData.publicUrl)
        }
      }
    }
  }

  if (finalPhotos.length > 0) {
    updateData.photos = finalPhotos
  }

  // Use a more robust update call
  const { error } = await supabase
    .from('pets')
    .update(updateData)
    .match({ id: petId, owner_id: user.id })

  if (error) {
    console.error('[updatePet Error]:', error)
    return { error: error.message }
  }

  revalidatePath('/profiles')
  return { success: true }
}

export async function updateLocation(lat: number, lng: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ location: `POINT(${lng} ${lat})` })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
