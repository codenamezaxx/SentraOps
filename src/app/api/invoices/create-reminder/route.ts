import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateInvoiceXenditUrl } from '@/lib/supabase/queries'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invoiceId, customerName, amount, dueDate, storeName } = await request.json()

    if (!invoiceId || !customerName || !amount || !dueDate || !storeName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let xenditUrl: string

    const xenditKey = process.env.XENDIT_SECRET_KEY
    if (xenditKey) {
      const { default: Xendit } = await import('xendit-node')
      const xendit = new Xendit({ secretKey: xenditKey })
      const invoice = await xendit.Invoice.createInvoice({
        data: {
          externalId: invoiceId,
          amount: Math.round(amount),
          payerEmail: `${customerName.replace(/\s+/g, '.').toLowerCase()}@customer.id`,
          description: `Tagihan ${customerName} - ${storeName}`,
          customer: { givenNames: customerName },
          currency: 'IDR',
        }
      })
      xenditUrl = invoice.invoiceUrl

      await updateInvoiceXenditUrl(invoiceId, xenditUrl)
    } else {
      xenditUrl = `https://checkout.xendit.co/id/invoice/${invoiceId}`
    }

    const dueLabel = new Date(dueDate).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    const nominal = new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount)

    const waText = `Halo ${customerName}, ini adalah pengingat tagihan dari ${storeName} sebesar ${nominal} yang jatuh tempo pada ${dueLabel}. Silakan bayar melalui link berikut: ${xenditUrl}`

    return NextResponse.json({ xenditUrl, waText })
  } catch (error) {
    console.error('[create-reminder]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
