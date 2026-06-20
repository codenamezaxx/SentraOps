import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { expenseId } = await request.json()
    if (!expenseId) {
      return NextResponse.json({ error: 'expenseId is required' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('expenses')
      .delete()
      .eq('id', expenseId)

    if (error) {
      console.error('[expenses/delete]', error)
      return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[expenses/delete]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
