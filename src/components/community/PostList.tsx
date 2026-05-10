'use client'

import { Sparkles } from 'lucide-react'

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

export function PostList({ initialPosts }: { initialPosts: Post[] }) {
  return (
    <div className="space-y-3">
      {initialPosts.length > 0 ? (
        initialPosts.map((post) => (
          <div key={post.id} className="glass-dark p-5 rounded-[2rem] border border-white/5 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                {post.author.avatar_url ? (
                  <img src={post.author.avatar_url} className="w-full h-full object-cover" alt={post.author.username} />
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
