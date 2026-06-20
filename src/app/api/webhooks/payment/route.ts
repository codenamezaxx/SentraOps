import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createNotification } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    const callbackToken = request.headers.get('x-callback-token')

    if (callbackToken !== process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()
    const { status, external_id } = payload

    if (status === 'PAID' || status === 'SETTLED') {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      )

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
          await supabaseAdmin
            .from('transactions')
            .update({ status: 'completed' })
            .eq('id', invoice.transaction_id)
          console.log(`Webhook: Transaction ${invoice.transaction_id} marked as completed.`)
        }
      } else {
        // Fallback: treat external_id as transaction ID (legacy)
        const { error: txnError } = await supabaseAdmin
          .from('transactions')
          .update({ status: 'completed' })
          .eq('id', external_id)

        if (!txnError) {
          console.log(`Webhook: Transaction ${external_id} marked as completed.`)
        } else {
          console.error('Webhook: Failed to update transaction:', txnError)
        }
      }

      // Get store_id from the transaction to create notification
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: txn } = await (supabaseAdmin as any)
        .from('transactions')
        .select('store_id, total_amount, payment_method')
        .eq('id', external_id)
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
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
