import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateInvoice } from '@/lib/supabase/queries'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invoiceId, customer_name, customer_phone, amount, due_date } = await request.json()
    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    const updateData: Record<string, string | number | null> = {}
    if (customer_name !== undefined) updateData.customer_name = customer_name
    if (customer_phone !== undefined) updateData.customer_phone = customer_phone || null
    if (amount !== undefined) updateData.amount = amount
    if (due_date !== undefined) updateData.due_date = due_date

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const ok = await updateInvoice(invoiceId, updateData as Parameters<typeof updateInvoice>[1])
    if (!ok) {
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[edit-invoice]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
