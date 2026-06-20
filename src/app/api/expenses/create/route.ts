import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/queries'
import { createNotification } from '@/lib/notifications'
import type { ExpenseCategory } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getUserProfile()
    if (!profile?.store_id) {
      return NextResponse.json({ error: 'Store not found' }, { status: 400 })
    }

    const body = await request.json()
    const { title, amount, category, description, expense_date } = body

    if (!title || !amount || !category || !expense_date) {
      return NextResponse.json({ error: 'Title, amount, category, and expense_date are required' }, { status: 400 })
    }

    const validCategories: ExpenseCategory[] = ['operasional', 'gaji', 'logistik', 'lain-lain']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('expenses')
      .insert({
        store_id: profile.store_id,
        title,
        amount: Math.round(amount),
        category,
        description: description || null,
        expense_date,
      })
      .select()
      .single()

    if (error) {
      console.error('[expenses/create]', error)
      return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
    }

    // Notify about the new expense
    const cat = category as ExpenseCategory
    const categoryLabel = { operasional: 'Operasional', gaji: 'Gaji', logistik: 'Logistik', 'lain-lain': 'Lain-lain' }[cat]
    await createNotification({
      storeId: profile.store_id,
      title: 'Pengeluaran Baru',
      message: `${title} sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)} (${categoryLabel}) telah dicatat.`,
      type: 'payment',
    })

    return NextResponse.json({ success: true, expense: data })
  } catch (error) {
    console.error('[expenses/create]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
