import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, fullName, storeName } = await request.json()

    // Validate input
    if (!email || !password || !fullName || !storeName) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      )
    }

    // Create admin client with service_role key (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Gagal membuat akun" },
        { status: 500 }
      )
    }

    // 2. Create store
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from("stores")
      .insert({
        name: storeName,
        owner_id: authData.user.id,
      })
      .select()
      .single()

    if (storeError) {
      // Rollback: delete the auth user if store creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: storeError.message },
        { status: 500 }
      )
    }

    // 3. Create profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        auth_id: authData.user.id,
        store_id: storeData.id,
        role: "owner",
        name: fullName,
      })

    if (profileError) {
      // Rollback
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin.from("stores").delete().eq("id", storeData.id)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Akun berhasil dibuat", userId: authData.user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup API error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}