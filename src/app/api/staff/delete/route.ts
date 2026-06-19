import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan" }, { status: 400 })
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
      return NextResponse.json({ error: "Hanya pemilik yang bisa menghapus staf" }, { status: 403 })
    }

    // Prevent deleting yourself
    if (userId === user.id) {
      return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Delete profile first (verify store_id ownership)
    const { error: profileDeleteError } = await (supabaseAdmin as any)
      .from('profiles')
      .delete()
      .eq('id', userId)
      .eq('store_id', callerProfile.store_id)

    if (profileDeleteError) {
      return NextResponse.json({ error: profileDeleteError.message }, { status: 500 })
    }

    // Delete auth user
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      return NextResponse.json({ error: authDeleteError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Staf berhasil dihapus" })
  } catch (error) {
    console.error("[delete-staff]", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
