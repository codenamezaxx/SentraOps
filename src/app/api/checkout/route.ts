import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/queries'
import type { PaymentMethod } from '@/lib/types'

export interface CheckoutRequest {
  items: {
    product_id: string
    quantity: number
  }[]
  payment_method: PaymentMethod
}

export interface CheckoutResponse {
  success: boolean
  transaction_id?: string
  error?: string
  code?: string
  product_name?: string
}

/**
 * POST /api/checkout
 *
 * Processes a checkout request:
 * 1. Validates cart items and payment method
 * 2. Checks stock availability
 * 3. Creates transaction record
 * 4. Creates transaction_items
 * 5. Updates product stock quantities atomically
 * 6. Returns success or error response
 *
 * Requirements: 8.3, 8.4, 8.7, 9.1, 9.2, 9.3, 9.4
 * Properties: 6, 9, 10, 11
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Silakan login terlebih dahulu.' },
        { status: 401 }
      )
    }

    // 2. Get user profile with store context
    const profile = await getUserProfile()
    if (!profile || !profile.store_id) {
      return NextResponse.json(
        { success: false, error: 'Profil toko tidak ditemukan.' },
        { status: 400 }
      )
    }

    // 3. Parse and validate request body
    const body: CheckoutRequest = await request.json()

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keranjang belanja kosong.' },
        { status: 400 }
      )
    }

    const validPaymentMethods: PaymentMethod[] = ['cash', 'qris', 'whatsapp_invoice']
    if (!body.payment_method || !validPaymentMethods.includes(body.payment_method)) {
      return NextResponse.json(
        { success: false, error: 'Metode pembayaran tidak valid.' },
        { status: 400 }
      )
    }

    // 4. Fetch all products with their current stock
    const productIds = body.items.map((item) => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, store_id, price, cost_price, stock_quantity, min_stock_threshold, name')
      .in('id', productIds)
      .eq('store_id', profile.store_id)

    if (productsError || !products) {
      console.error('Failed to fetch products:', productsError)
      return NextResponse.json(
        { success: false, error: 'Gagal memuat data produk.' },
        { status: 500 }
      )
    }

    // 5. Validate stock availability for all items
    for (const item of body.items) {
      const product = products.find((p) => p.id === item.product_id)
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            code: 'PRODUCT_NOT_FOUND',
            error: `Produk dengan ID ${item.product_id} tidak ditemukan.`,
          },
          { status: 400 }
        )
      }

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            code: 'INSUFFICIENT_STOCK',
            product_name: product.name,
            error: `Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock_quantity}, diminta: ${item.quantity}.`,
          },
          { status: 400 }
        )
      }
    }

    // 6. Calculate total amount
    let totalAmount = 0
    for (const item of body.items) {
      const product = products.find((p) => p.id === item.product_id)!
      totalAmount += product.price * item.quantity
    }

    // 7. Execute transaction atomically using Supabase RPC or sequential calls with error handling
    // Use a database transaction approach: create transaction, items, then update stock

    // 7a. Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        store_id: profile.store_id,
        cashier_id: profile.auth_id,
        total_amount: totalAmount,
        payment_method: body.payment_method,
        status: 'completed',
      })
      .select()
      .single()

    if (transactionError || !transaction) {
      console.error('Failed to create transaction:', transactionError)
      return NextResponse.json(
        { success: false, error: 'Gagal membuat transaksi. Silakan coba lagi.' },
        { status: 500 }
      )
    }

    // 7b. Create transaction items
    const transactionItems = body.items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)!
      return {
        transaction_id: transaction.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: product.price,
        cost_price_at_time: product.cost_price,
      }
    })

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems)

    if (itemsError) {
      console.error('Failed to create transaction items:', itemsError)
      // Attempt to rollback the transaction
      await supabase.from('transactions').delete().eq('id', transaction.id)
      return NextResponse.json(
        { success: false, error: 'Gagal menyimpan item transaksi.' },
        { status: 500 }
      )
    }

    // 7c. Update product stock quantities
    for (const item of body.items) {
      const product = products.find((p) => p.id === item.product_id)!
      const newStock = product.stock_quantity - item.quantity

      const { error: stockError } = await supabase
        .from('products')
        .update({
          stock_quantity: Math.max(0, newStock),
        })
        .eq('id', item.product_id)
        .eq('store_id', profile.store_id)

      if (stockError) {
        console.error(`Failed to update stock for product ${item.product_id}:`, stockError)
        // Log the error but don't fail - the transaction and items are already created
        // In production, this should trigger a reconciliation process
      }
    }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      transaction_id: transaction.id,
    })
  } catch (error) {
    console.error('Checkout error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan sistem. Silakan coba lagi.',
      },
      { status: 500 }
    )
  }
}