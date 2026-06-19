import { createClient } from './server'
import type { Profile, Store, Invoice } from '../types'

export async function getOverdueInvoices(storeId: string): Promise<Invoice[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('invoices')
    .select('*')
    .eq('store_id', storeId)
    .eq('status', 'UNPAID')
    .lt('due_date', now)
  return (data || []) as Invoice[]
}

export async function createInvoiceForTransaction(params: {
  storeId: string
  customerName: string
  customerPhone?: string
  amount: number
  transactionId?: string
}): Promise<Invoice | null> {
  const supabase = await createClient()
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 7)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('invoices')
    .insert({
      store_id: params.storeId,
      customer_name: params.customerName,
      customer_phone: params.customerPhone || null,
      amount: params.amount,
      due_date: dueDate.toISOString(),
      status: 'UNPAID',
    })
    .select()
    .single()
  if (error) {
    console.error('[createInvoiceForTransaction]', error)
    return null
  }
  return (data || null) as Invoice | null
}

export async function updateInvoiceXenditUrl(invoiceId: string, xenditUrl: string): Promise<void> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('invoices')
    .update({ xendit_invoice_url: xenditUrl })
    .eq('id', invoiceId)
}

export async function markInvoiceAsPaid(invoiceId: string): Promise<boolean> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('invoices')
    .update({ status: 'PAID', updated_at: new Date().toISOString() })
    .eq('id', invoiceId)
  return !error
}

export async function updateInvoice(
  invoiceId: string,
  data: {
    customer_name?: string
    customer_phone?: string | null
    amount?: number
    due_date?: string
  }
): Promise<boolean> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('invoices')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', invoiceId)
  return !error
}

export async function deleteInvoice(invoiceId: string): Promise<boolean> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
  return !error
}

export async function getInvoices(
  storeId: string,
  options?: { status?: string; overdue?: boolean }
): Promise<Invoice[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('invoices')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }
  if (options?.overdue) {
    query = query.eq('status', 'UNPAID').lt('due_date', new Date().toISOString())
  }

  const { data } = await query
  return (data || []) as Invoice[]
}

export async function getStaff(storeId: string): Promise<Profile[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
  return (data || []) as Profile[]
}

export async function getUserProfile() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  return profile as Profile | null
}

export async function getStore(storeId: string) {
  const supabase = await createClient()
  
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single()

  return store as Store | null
}

export async function getUserContext() {
  const profile = await getUserProfile()
  if (!profile) return null

  const store = await getStore(profile.store_id)
  return { profile, store }
}