import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { storeId, ...fields } = body

    if (!storeId) {
      return NextResponse.json({ error: "ID toko wajib diisi" }, { status: 400 })
    }

    // Verify auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify caller is the store owner
    const { data: callerProfile } = await (supabase as any)
      .from('profiles')
      .select('role, store_id')
      .eq('auth_id', user.id)
      .single()

    if (!callerProfile || callerProfile.role !== 'owner') {
      return NextResponse.json({ error: "Hanya pemilik yang bisa mengubah pengaturan toko" }, { status: 403 })
    }

    if (callerProfile.store_id !== storeId) {
      return NextResponse.json({ error: "Tidak memiliki akses ke toko ini" }, { status: 403 })
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Build update payload — only allow specific fields
    const allowedFields = ['name', 'address', 'phone', 'receipt_footer', 'payment_methods', 'default_stock_threshold']
    const updatePayload: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in fields) {
        updatePayload[key] = fields[key]
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "Tidak ada field yang valid untuk diubah" }, { status: 400 })
    }

    const { error: updateError } = await (supabaseAdmin as any)
      .from('stores')
      .update(updatePayload)
      .eq('id', storeId)

    if (updateError) {
      console.error('[store-settings-update]', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Pengaturan toko berhasil diperbarui" })
  } catch (error) {
    console.error('[store-settings]', error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
