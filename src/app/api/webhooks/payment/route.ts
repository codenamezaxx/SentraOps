import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createNotification } from '@/lib/notifications'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function markTransactionCompleted(supabaseAdmin: any, transactionId: string) {
  const { error: txnError } = await supabaseAdmin
    .from('transactions')
    .update({ status: 'completed' })
    .eq('id', transactionId)

  if (!txnError) {
    console.log(`Webhook: Transaction ${transactionId} marked as completed.`)

    // ── Get store info & send notification ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: txn } = await (supabaseAdmin as any)
      .from('transactions')
      .select('store_id, total_amount, payment_method')
      .eq('id', transactionId)
      .single()

    if (txn) {
      const methodLabel =
        txn.payment_method === 'qris' ? 'QRIS' :
        txn.payment_method === 'whatsapp_invoice' ? 'WhatsApp Invoice' :
        'Online'
      await createNotification({
        storeId: txn.store_id,
        title: 'Pembayaran Diterima',
        message: `Pembayaran ${methodLabel} sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(txn.total_amount)} telah dikonfirmasi.`,
        type: 'payment',
      })
    }
  } else {
    console.error('Webhook: Failed to update transaction:', txnError)
  }
}

export async function POST(request: Request) {
  try {
    const callbackToken = request.headers.get('x-callback-token')

    if (callbackToken !== process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // ── Handle QR Code paid callback (QRIS) ──
    if (payload.event === 'qr_codes.paid') {
      const transactionId = payload.data?.reference_id
      if (transactionId) {
        await markTransactionCompleted(supabaseAdmin, transactionId)
      }
      return NextResponse.json({ received: true })
    }

    // ── Handle Invoice callback (WhatsApp Invoice) ──
    const { status, external_id } = payload

    if (status === 'PAID' || status === 'SETTLED') {
      // Try to mark invoice as PAID if external_id is an invoice ID
      const { data: invoice, error: invoiceFetchError } = await supabaseAdmin
        .from('invoices')
        .select('id, transaction_id')
        .eq('id', external_id)
        .single()

      if (!invoiceFetchError && invoice) {
        const { error: invoiceUpdateError } = await supabaseAdmin
          .from('invoices')
          .update({ status: 'PAID', updated_at: new Date().toISOString() })
          .eq('id', invoice.id)

        if (!invoiceUpdateError) {
          console.log(`Webhook: Invoice ${invoice.id} marked as PAID.`)
        }

        // Also mark the linked transaction as completed
        if (invoice.transaction_id) {
          await markTransactionCompleted(supabaseAdmin, invoice.transaction_id)
        }
      } else {
        // Fallback: treat external_id as transaction ID (legacy)
        await markTransactionCompleted(supabaseAdmin, external_id)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
