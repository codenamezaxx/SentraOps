import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (!password || typeof password !== 'string') {
      return Response.json({ error: 'Password wajib diisi.' }, { status: 400 })
    }

    // 1. Authenticate current user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return Response.json({ error: 'Sesi tidak valid.' }, { status: 401 })
    }

    // 2. Verify password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    })
    if (signInError) {
      return Response.json({ error: 'Password salah.' }, { status: 403 })
    }

    // 3. Get profile — need service_role to bypass RLS
    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() {},
        },
      }
    )

    const { data: profile } = await adminClient
      .from('profiles')
      .select('role, store_id')
      .eq('auth_id', user.id)
      .single()

    if (profile?.role === 'owner' && profile?.store_id) {
      // Check for another owner in the same store
      const { count } = await adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', profile.store_id)
        .eq('role', 'owner')
        .neq('auth_id', user.id)

      if (!count || count === 0) {
        return Response.json({
          error: 'Tidak dapat menghapus akun owner terakhir. Tambahkan owner lain terlebih dahulu atau hubungi administrator.'
        }, { status: 400 })
      }
    }

    // 4. Delete profile first (service_role bypasses RLS)
    await adminClient
      .from('profiles')
      .delete()
      .eq('auth_id', user.id)

    // 5. Delete avatar from storage if exists
    await adminClient.storage
      .from('avatars')
      .remove([`${user.id}/avatar.jpg`])

    // 6. Delete auth user via Admin API
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      throw new Error(deleteError.message)
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Delete account error:', err)
    return Response.json({
      error: 'Gagal menghapus akun. Silakan coba lagi atau hubungi dukungan.'
    }, { status: 500 })
  }
}
