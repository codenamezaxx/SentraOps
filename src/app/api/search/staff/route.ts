import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()
    if (!q) {
      return NextResponse.json({ data: [] })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the caller's store_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: callerProfile } = await (supabase as any)
      .from('profiles')
      .select('store_id')
      .eq('auth_id', user.id)
      .single()

    if (!callerProfile?.store_id) {
      return NextResponse.json({ data: [] })
    }

    // Use admin client to bypass RLS (profiles RLS only shows own profile)
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: staff } = await (supabaseAdmin as any)
      .from('profiles')
      .select('id, name, role')
      .eq('store_id', callerProfile.store_id)
      .ilike('name', `%${q}%`)
      .limit(5)

    return NextResponse.json({ data: staff || [] })
  } catch (error) {
    console.error("[search-staff]", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
