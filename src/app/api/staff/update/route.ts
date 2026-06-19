import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    const { userId, fullName, role } = await request.json()

    if (!userId || !fullName || !role) {
      return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: callerProfile } = await (supabase as any)
      .from('profiles')
      .select('role, store_id')
      .eq('auth_id', user.id)
      .single()

    if (!callerProfile || callerProfile.role !== 'owner') {
      return NextResponse.json({ error: "Hanya pemilik yang bisa mengubah data staf" }, { status: 403 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error: updateError } = await (supabaseAdmin as any)
      .from('profiles')
      .update({ name: fullName, role })
      .eq('id', userId)
      .eq('store_id', callerProfile.store_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Staf berhasil diperbarui" })
  } catch (error) {
    console.error("[update-staff]", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
