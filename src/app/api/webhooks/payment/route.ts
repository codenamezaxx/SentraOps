import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
