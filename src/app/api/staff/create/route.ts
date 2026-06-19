import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json()

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 })
    }

    // Use the same server client pattern as other API routes
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check the caller is an owner
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: callerProfile } = await (supabase as any)
      .from('profiles')
      .select('role, store_id')
      .eq('auth_id', user.id)
      .single()

    if (!callerProfile || callerProfile.role !== 'owner') {
      return NextResponse.json({ error: "Hanya pemilik yang bisa menambah staf" }, { status: 403 })
    }

    // Create admin client with service_role key (bypasses RLS)
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Create auth user
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Gagal membuat akun" }, { status: 500 })
    }

    // 2. Create profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabaseAdmin as any)
      .from("profiles")
      .insert({
        id: authData.user.id,
        auth_id: authData.user.id,
        store_id: callerProfile.store_id,
        role: role,
        name: fullName,
      })

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Staf berhasil ditambahkan", userId: authData.user.id }, { status: 201 })
  } catch (error) {
    console.error("[create-staff]", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
