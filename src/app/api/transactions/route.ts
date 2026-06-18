import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * DELETE /api/transactions
 * Delete one or more transactions by ID.
 * Uses service_role to bypass RLS — caller identity verified via auth user + profile check.
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  // Verify authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile to verify store association
  const { data: profile } = await supabase
    .from('profiles')
    .select('store_id, role')
    .eq('auth_id', user.id)
    .single()

  if (!profile?.store_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse request body
  const body = await request.json()
  const { ids } = body as { ids: string[] }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No transaction IDs provided' }, { status: 400 })
  }

  // Use service_role client for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey)

  try {
    // Verify all transactions belong to user's store
    const { data: transactions, error: verifyError } = await adminClient
      .from('transactions')
      .select('id, store_id')
      .in('id', ids)

    if (verifyError) throw verifyError

    const invalidIds = transactions?.filter(t => t.store_id !== profile.store_id).map(t => t.id) || []
    if (invalidIds.length > 0) {
      return NextResponse.json({
        error: 'Some transactions do not belong to your store',
        invalidIds
      }, { status: 403 })
    }

    // Delete transaction_items first (cascade should handle this, but explicit for safety)
    const { error: itemsError } = await adminClient
      .from('transaction_items')
      .delete()
      .in('transaction_id', ids)

    if (itemsError) throw itemsError

    // Delete transactions
    const { error: txError } = await adminClient
      .from('transactions')
      .delete()
      .in('id', ids)

    if (txError) throw txError

    return NextResponse.json({ success: true, deletedCount: ids.length })
  } catch (error) {
    console.error('Error deleting transactions:', error)
    return NextResponse.json({ error: 'Failed to delete transactions' }, { status: 500 })
  }
}