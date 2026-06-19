import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteInvoice } from '@/lib/supabase/queries'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invoiceId } = await request.json()
    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    const ok = await deleteInvoice(invoiceId)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[delete-invoice]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
