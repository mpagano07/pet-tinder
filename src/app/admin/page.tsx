import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldAlert, Users, PawPrint, MessageCircle, Heart, ArrowLeft, Flag, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getDictionary } from '@/i18n/getDictionary'
import Link from 'next/link'
import { updateReportStatus } from '@/features/admin/reportActions'
import type { ReportStatus } from '@/types'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dict = getDictionary()

  if (!user) {
    redirect('/auth/login')
  }

  // Check for admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Fetch counts
  const [
    { count: usersCount },
    { count: petsCount },
    { count: matchesCount },
    { count: swipesCount },
    { count: reportsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('pets').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
    supabase.from('swipes').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  // Fetch recent reports with reporter and pet info
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      id, reason, description, status, created_at,
      reporter:reporter_id (username),
      reported_pet:reported_pet_id (name, breed)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch latest users
  const { data: latestUsers } = await supabase
    .from('profiles')
    .select('id, username, full_name, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  // Fetch latest pets
  const { data: latestPets } = await supabase
    .from('pets')
    .select('id, name, breed, species, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  const REASON_LABELS: Record<string, string> = {
    spam: '📢 Spam',
    inappropriate_content: '🚫 Contenido inapropiado',
    fake_profile: '🎭 Perfil falso',
    abusive_behavior: '⚠️ Comportamiento abusivo',
    other: '📝 Otro',
  }

  const STATUS_STYLES: Record<ReportStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    reviewed: 'bg-blue-500/20 text-blue-400',
    dismissed: 'bg-white/10 text-white/40',
    actioned: 'bg-green-500/20 text-green-400',
  }
  const STATUS_LABELS: Record<ReportStatus, string> = {
    pending: 'Pendiente',
    reviewed: 'Revisado',
    dismissed: 'Descartado',
    actioned: 'Accionado',
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-16">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <header className="pt-12 pb-8 px-6 flex items-center gap-4 relative z-10">
        <Link href="/profiles" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold tracking-tight text-white">{dict.admin.title}</h1>
        </div>
      </header>

      <main className="relative z-10 px-4 max-w-5xl mx-auto space-y-10">
        {/* Stats */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-white/80">{dict.admin.stats}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard icon={Users} label={dict.admin.totalUsers} value={usersCount || 0} color="text-blue-400" />
            <StatCard icon={PawPrint} label={dict.admin.totalPets} value={petsCount || 0} color="text-orange-400" />
            <StatCard icon={MessageCircle} label={dict.admin.totalMatches} value={matchesCount || 0} color="text-green-400" />
            <StatCard icon={Heart} label={dict.admin.totalSwipes} value={swipesCount || 0} color="text-pink-400" />
            <StatCard icon={Flag} label="Reportes pendientes" value={reportsCount || 0} color="text-red-400" />
          </div>
        </section>

        {/* Reports table */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-white/80 flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-400" /> Reportes
          </h2>
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            {reports && reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 uppercase text-xs tracking-wider">
                      <th className="text-left px-4 py-3">Mascota reportada</th>
                      <th className="text-left px-4 py-3">Razón</th>
                      <th className="text-left px-4 py-3">Reportado por</th>
                      <th className="text-left px-4 py-3">Estado</th>
                      <th className="text-left px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r: any) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {r.reported_pet?.name ?? '—'}
                          {r.reported_pet?.breed && (
                            <span className="text-white/40 ml-1 text-xs">({r.reported_pet.breed})</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/70">{REASON_LABELS[r.reason] ?? r.reason}</td>
                        <td className="px-4 py-3 text-white/50">@{r.reporter?.username ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[r.status as ReportStatus]}`}>
                            {STATUS_LABELS[r.status as ReportStatus]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {r.status === 'pending' && (
                              <>
                                <form action={async () => {
                                  'use server'
                                  await updateReportStatus(r.id, 'actioned')
                                }}>
                                  <button className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors" title="Accionar">
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                </form>
                                <form action={async () => {
                                  'use server'
                                  await updateReportStatus(r.id, 'dismissed')
                                }}>
                                  <button className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors" title="Descartar">
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </form>
                              </>
                            )}
                            {r.status !== 'pending' && (
                              <form action={async () => {
                                'use server'
                                await updateReportStatus(r.id, 'pending')
                              }}>
                                <button className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors" title="Marcar pendiente">
                                  <Clock className="w-4 h-4" />
                                </button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-white/40">
                <Flag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Sin reportes por ahora</p>
              </div>
            )}
          </div>
        </section>

        {/* Latest users + pets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Latest users */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white/80 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Últimos usuarios
            </h2>
            <div className="glass rounded-2xl border border-white/10 divide-y divide-white/5">
              {latestUsers?.map((u: any) => (
                <div key={u.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{u.full_name || u.username}</p>
                    <p className="text-xs text-white/40">@{u.username}</p>
                  </div>
                  <p className="text-xs text-white/30">
                    {new Date(u.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Latest pets */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white/80 flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-orange-400" /> Últimas mascotas
            </h2>
            <div className="glass rounded-2xl border border-white/10 divide-y divide-white/5">
              {latestPets?.map((p: any) => (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-white/40">{p.breed ?? p.species ?? '—'}</p>
                  </div>
                  <p className="text-xs text-white/30">
                    {new Date(p.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className="glass p-5 rounded-2xl flex flex-col items-center text-center border border-white/10">
      <div className={`p-3 rounded-2xl bg-white/5 mb-3 ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-xs text-white/50 font-medium uppercase tracking-wider leading-tight">{label}</p>
    </div>
  )
}
