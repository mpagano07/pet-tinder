'use client'

import { User, Heart, MessageCircle, LogOut, Globe, Store } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n/LanguageProvider'
import { logout } from '@/app/auth/actions'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function Navigation() {
  const pathname = usePathname()
  const dict = useTranslation()
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userPets } = await supabase.from('pets').select('id').eq('owner_id', user.id)
      const myPetIds = userPets?.map(p => p.id) || []

      if (myPetIds.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .neq('sender_id', user.id)
        
        setUnreadCount(count || 0)
      }
    }

    fetchUnread()

    const channel = supabase
      .channel('global-unread-count')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchUnread())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => fetchUnread())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const tabs = [
    { name: dict.nav.feed, href: '/feed', icon: Heart },
    { name: 'Comunidad', href: '/community', icon: Globe },
    { name: dict.nav.matches, href: '/matches', icon: MessageCircle, badge: unreadCount },
    { name: dict.nav.profile, href: '/profiles', icon: User },
    { name: dict.nav.services, href: '/services', icon: Store },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-all relative',
                isActive ? 'text-primary' : 'text-white/40 hover:text-white/60'
              )}
            >
              <div className="relative">
                <tab.icon
                  className={cn('w-6 h-6', isActive && 'fill-current drop-shadow-[0_0_8px_rgba(230,57,70,0.5)]')}
                />
                {tab.badge ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-white flex items-center justify-center rounded-full font-bold border-2 border-zinc-950">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
