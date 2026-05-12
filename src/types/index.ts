export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: any | null
  created_at: string
  updated_at: string
}

export interface Pet {
  id: string
  owner_id: string
  name: string
  breed: string | null
  species: string | null
  age: number | null
  gender: 'male' | 'female'
  photos: string[]
  bio: string | null
  temperament?: string[]
  activity_level?: number
  kids_friendly?: boolean
  housing?: string
  genetic_info?: string | null
  behavior_prediction?: string | null
  created_at: string
}

export interface Swipe {
  id: string
  swiper_pet_id: string
  swiped_pet_id: string
  action: 'like' | 'dislike'
  created_at: string
}

export interface Match {
  id: string
  pet1_id: string
  pet2_id: string
  created_at: string
  pet1?: Pet
  pet2?: Pet
}

export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  reply_to_id?: string
  likes?: string[]
  created_at: string
  is_read?: boolean
}

export type ReportReason =
  | 'spam'
  | 'inappropriate_content'
  | 'fake_profile'
  | 'abusive_behavior'
  | 'other'

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned'

export interface Report {
  id: string
  reporter_id: string
  reported_pet_id: string
  reason: ReportReason
  description: string | null
  status: ReportStatus
  created_at: string
  reporter?: Profile
  reported_pet?: Pet
}
