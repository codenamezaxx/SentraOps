'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { db } from '@/lib/offlineDb'
import { useSyncStore } from '@/lib/stores/syncStore'
import type { Product } from '@/lib/types'

export function RealtimeSyncProvider() {
  const bumpProductVersion = useSyncStore((s) => s.bumpProductVersion)
  const subscribed = useRef(false)

  useEffect(() => {
    if (subscribed.current) return
    subscribed.current = true

    const supabase = createClient()
    const channel = supabase
      .channel('products-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async (payload) => {
          try {
            if (payload.eventType === 'INSERT' && payload.new) {
              await db.cached_products.put(payload.new as Product)
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              await db.cached_products.put(payload.new as Product)
            } else if (payload.eventType === 'DELETE' && payload.old) {
              await db.cached_products.delete((payload.old as Product).id)
            }
            bumpProductVersion()
          } catch {
            // Silently handle IndexedDB errors
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      subscribed.current = false
    }
  }, [bumpProductVersion])

  return null
}
