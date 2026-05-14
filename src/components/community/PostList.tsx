'use client'

import { useState } from 'react'
import { Sparkles, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { toast } from 'sonner'

interface Post {
  id: string
  content: string
  category: string
  created_at: string
  author: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

export function PostList({ initialPosts, isAdmin = false }: { initialPosts: Post[], isAdmin?: boolean }) {
  const [posts, setPosts] = useState(initialPosts)
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta publicación?')) return

    const { error } = await supabase.from('community_posts').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar publicación')
    } else {
      toast.success('Publicación eliminada')
      setPosts(posts.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-3">
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="glass-dark p-5 rounded-[2rem] border border-white/5 transition-all relative">
            {isAdmin && (
              <button 
                onClick={() => handleDelete(post.id)}
                className="absolute top-4 right-4 p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                title="Eliminar publicación"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden relative">
                {post.author.avatar_url ? (
                  <Image 
                    src={post.author.avatar_url} 
                    className="object-cover" 
                    alt={post.author.username} 
                    fill
                    sizes="40px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/20">
                    {post.author.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold">@{post.author.username}</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed italic">
              "{post.content}"
            </p>
            <div className="mt-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                post.category === 'socialization' 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                  : 'bg-green-500/10 text-green-400 border-green-500/20'
              }`}>
                {post.category}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 glass rounded-3xl border border-dashed border-white/10">
          <p className="text-white/40 text-sm italic">No hay publicaciones aún. ¡Sé el primero!</p>
        </div>
      )}
    </div>
  )
}
