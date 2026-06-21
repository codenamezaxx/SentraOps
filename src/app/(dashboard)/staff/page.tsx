import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { StaffContent } from '@/components/staff/StaffContent'
import { StaffTable } from '@/components/staff/StaffTable'
import { Users } from 'lucide-react'

export default async function StaffPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, store_id')
    .eq('auth_id', user.id)
    .single()

  if (!profile || profile.role !== 'owner') return null
  if (!profile.store_id) return null

  // Use admin client to bypass RLS — regular server client can't see all profiles in a store
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (supabaseAdmin as any)
    .from('profiles')
    .select('*')
    .eq('store_id', profile.store_id)
    .order('created_at', { ascending: false })

  const staffList = (staff || []) as Array<Record<string, unknown> & { id: string; auth_id: string; name: string | null; role: string }>

  // Fetch emails from auth.users using admin client
  const authIds = staffList.map((s) => s.auth_id).filter(Boolean)
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
  const emailMap = new Map<string, string>()
  if (authUsers?.users) {
    authUsers.users.forEach((u) => {
      if (authIds.includes(u.id)) {
        emailMap.set(u.id, u.email || '-')
      }
    })
  }

  const staffWithEmail = staffList.map((s) => ({
    ...s,
    email: emailMap.get(s.auth_id) || '-',
  }))

  return (
    <div className="flex-1 pb-24 md:pb-8 px-4 md:px-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground">Manajemen Staf</h1>
            <p className="text-sm text-muted-foreground">Kelola akun staf toko Anda</p>
          </div>
        </div>
        <StaffContent />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <StaffTable staff={staffWithEmail} currentUserId={user.id} />
      </div>
    </div>
  )
}
