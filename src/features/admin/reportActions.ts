'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ReportReason, ReportStatus } from '@/types'

export async function submitReport(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const reportedPetId = formData.get('reported_pet_id') as string
  const reason = formData.get('reason') as ReportReason
  const description = formData.get('description') as string

  if (!reportedPetId || !reason) return { error: 'Faltan datos requeridos' }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_pet_id: reportedPetId,
    reason,
    description: description || null,
    status: 'pending',
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateReportStatus(reportId: string, status: ReportStatus) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', reportId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}
