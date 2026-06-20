import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { markInvoiceAsPaid } from '@/lib/supabase/queries'
import { createNotification } from '@/lib/notifications'

export async function POST(request: Request) {
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

    // Fetch invoice details before marking paid (need store_id + customer name)
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invoice } = await (supabaseAdmin as any)
      .from('invoices')
      .select('store_id, customer_name, amount')
      .eq('id', invoiceId)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const ok = await markInvoiceAsPaid(invoiceId)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to mark invoice as paid' }, { status: 500 })
    }

    // Notify that the invoice was paid
    await createNotification({
      storeId: invoice.store_id,
      title: 'Tagihan Dibayar',
      message: `Tagihan dari ${invoice.customer_name || 'pelanggan'} sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(invoice.amount)} telah dibayar dan dicatat sebagai lunas.`,
      type: 'payment',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[mark-paid]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
