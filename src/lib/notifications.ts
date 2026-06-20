import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { NotificationType } from '@/lib/types'

/**
 * Create a notification record for a store using the admin client (bypasses RLS).
 * Returns the notification ID or null on failure.
 */
export async function createNotification(params: {
  storeId: string
  title: string
  message: string
  type: NotificationType
}): Promise<string | null> {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin as any)
      .from('notifications')
      .insert({
        store_id: params.storeId,
        title: params.title,
        message: params.message,
        type: params.type,
        is_read: false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[createNotification]', error)
      return null
    }

    return data?.id ?? null
  } catch (err) {
    console.error('[createNotification]', err)
    return null
  }
}
