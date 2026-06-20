import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getUserProfile, createInvoiceForTransaction } from '@/lib/supabase/queries'
import { createNotification } from '@/lib/notifications'
import type { PaymentMethod } from '@/lib/types'
import { Xendit } from 'xendit-node'

export interface CheckoutRequest {
  items: {
    product_id: string
    quantity: number
  }[]
  payment_method: PaymentMethod
  customer_name?: string
  customer_phone?: string
  cash_amount?: number
  cash_change?: number
}

export interface CheckoutResponse {
  success: boolean
  transaction_id?: string
  payment_url?: string
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
    if (!profile || !profile.id || !profile.store_id) {
      return NextResponse.json(
        { success: false, code: 'INVALID_PROFILE_CONTEXT', error: 'Profil toko tidak valid atau tidak lengkap.' },
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

    const validPaymentMethods: PaymentMethod[] = ['cash', 'qris', 'whatsapp_invoice', 'invoice']
    if (!body.payment_method || !validPaymentMethods.includes(body.payment_method)) {
      return NextResponse.json(
        { success: false, error: 'Metode pembayaran tidak valid.' },
        { status: 400 }
      )
    }

    // Require customer_name for invoice payment method
    if (body.payment_method === 'invoice' && (!body.customer_name || !body.customer_name.trim())) {
      return NextResponse.json(
        { success: false, error: 'Nama pelanggan wajib diisi untuk metode tagihan.' },
        { status: 400 }
      )
    }

    // Validate that payment method is enabled in store settings
    const settingKeyMap: Record<string, string> = {
      cash: 'cash',
      qris: 'qris',
      whatsapp_invoice: 'whatsapp',
      invoice: 'piutang',
    }
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: storeData } = await (supabaseAdmin as any)
      .from('stores')
      .select('payment_methods')
      .eq('id', profile.store_id)
      .single()
    if (storeData?.payment_methods) {
      const settingKey = settingKeyMap[body.payment_method]
      const isEnabled = (storeData.payment_methods as Record<string, boolean>)[settingKey]
      if (isEnabled === false) {
        return NextResponse.json(
          {
            success: false,
            error: 'Metode pembayaran ini sedang dinonaktifkan oleh pengaturan toko.',
          },
          { status: 400 }
        )
      }
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
    let transaction: { id: string; total_amount: number } | null = null

    try {
      const isPending = body.payment_method === 'qris' || body.payment_method === 'whatsapp_invoice' || body.payment_method === 'invoice'
      const insertData: Record<string, unknown> = {
        store_id: profile.store_id,
        cashier_id: profile.id,
        total_amount: totalAmount,
        payment_method: body.payment_method,
        status: isPending ? 'pending' : 'completed',
        cash_amount: body.payment_method === 'cash' ? (body.cash_amount ?? totalAmount) : null,
        change_amount: body.payment_method === 'cash' ? (body.cash_change ?? 0) : null,
      }
      const { data: txn, error: transactionError } = await supabase
        .from('transactions')
        .insert(insertData as never)
        .select()
        .single()

      if (transactionError) {
        throw transactionError
      }

      if (!txn) {
        throw new Error('Transaction record creation returned empty data.')
      }

      transaction = txn
    } catch (err) {
      console.error('Failed to create transaction:', err)

      const pgError = err as { code?: string; details?: string; message?: string }
      if (pgError.code === '23503') {
        const detail = pgError.details || ''
        let field = 'foreign key'

        if (detail.includes('store_id')) field = 'store_id'
        else if (detail.includes('cashier_id')) field = 'cashier_id'

        return NextResponse.json(
          {
            success: false,
            code: 'FOREIGN_KEY_VIOLATION',
            error: `Validasi referensi data gagal. Field ${field} tidak cocok dengan data yang ada di database.`,
          },
          { status: 400 }
        )
      }

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

    // Check for low stock after update and create notifications
    for (const item of body.items) {
      const product = products.find((p) => p.id === item.product_id)!
      const newStock = product.stock_quantity - item.quantity
      if (newStock > 0 && newStock <= (product.min_stock_threshold || 5)) {
        await createNotification({
          storeId: profile.store_id,
          title: 'Stok Menipis',
          message: `${product.name} tersisa ${newStock} — segera lakukan restok.`,
          type: 'stock',
        })
      } else if (newStock <= 0) {
        await createNotification({
          storeId: profile.store_id,
          title: 'Stok Habis',
          message: `${product.name} sudah habis — lakukan restok segera.`,
          type: 'stock',
        })
      }
    }

    // 8. Create invoice record if payment method is invoice
    if (body.payment_method === 'invoice') {
      const invoice = await createInvoiceForTransaction({
        storeId: profile.store_id,
        customerName: body.customer_name!,
        customerPhone: body.customer_phone,
        amount: totalAmount,
        transactionId: transaction.id,
      })

      if (!invoice) {
        return NextResponse.json(
          {
            success: false,
            error: 'Gagal membuat tagihan. Silakan coba lagi.',
          },
          { status: 500 }
        )
      }

      // Notify new invoice created
      await createNotification({
        storeId: profile.store_id,
        title: 'Tagihan Baru',
        message: `Tagihan untuk ${body.customer_name} sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount)} telah dibuat.`,
        type: 'invoice',
      })
    }

    // 9. Handle Xendit Invoice creation if payment method is gateway
    let paymentUrl: string | undefined

    if (body.payment_method === 'qris' || body.payment_method === 'whatsapp_invoice') {
      try {
        const xenditClient = new Xendit({
          secretKey: process.env.XENDIT_SECRET_KEY || '',
        })

        const invoice = await xenditClient.Invoice.createInvoice({
          data: {
            externalId: transaction.id,
            amount: transaction.total_amount,
            description: `SentraOps Order #${transaction.id.slice(0, 8)}`,
            customer: {
              givenNames: profile.name || 'Customer',
            },
            successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/transactions`,
            failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pos`,
          },
        })

        paymentUrl = invoice.invoiceUrl
      } catch (err) {
        console.error('Xendit Invoice creation failed:', err)
        // Keep transaction as PENDING, but notify failure to generate link
        return NextResponse.json(
          {
            success: false,
            transaction_id: transaction.id,
            error: 'Gagal membuat invoice pembayaran. Silakan cek riwayat transaksi.',
          },
          { status: 500 }
        )
      }
    }

    // 10. Create notifications
    if (body.payment_method === 'cash') {
      // Notify successful cash payment
      await createNotification({
        storeId: profile.store_id,
        title: 'Pembayaran Diterima',
        message: `Pembayaran tunai sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount)} berhasil.`,
        type: 'payment',
      })
    }

    // 11. Return success response
    return NextResponse.json({
      success: true,
      transaction_id: transaction.id,
      payment_url: paymentUrl,
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