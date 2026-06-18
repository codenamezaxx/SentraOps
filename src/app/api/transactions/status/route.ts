import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('store_id')
    .eq('auth_id', user.id)
    .single()

  if (!profile?.store_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: txn, error } = await supabase
    .from('transactions')
    .select('id, status, payment_method')
    .eq('id', id)
    .eq('store_id', profile.store_id)
    .single()

  if (error || !txn) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  return NextResponse.json({ status: txn.status, payment_method: txn.payment_method })
}
