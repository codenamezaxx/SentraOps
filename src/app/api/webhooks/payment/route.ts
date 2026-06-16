import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/webhooks/payment
 * 
 * Handles Xendit Invoice callbacks.
 * Verify token, then update transaction status to 'completed' on success.
 */
export async function POST(request: Request) {
  try {
    const callbackToken = request.headers.get('x-callback-token')
    
    // 1. Verify webhook authenticity
    if (callbackToken !== process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()
    const { status, external_id } = payload

    // 2. Only process successful payments
    if (status === 'PAID' || status === 'SETTLED') {
      // Use service role client to bypass RLS for background update
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      )

      const { error } = await supabaseAdmin
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', external_id)

      if (error) {
        console.error('Webhook: Failed to update transaction:', error)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      console.log(`Webhook: Transaction ${external_id} marked as completed.`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}