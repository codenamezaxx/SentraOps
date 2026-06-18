'use client'

import { useEffect, useRef } from 'react'
import { db } from '@/lib/offlineDb'

async function processQueue() {
  try {
    const pending = await db.offline_transactions_queue
      .where('state')
      .equals('PENDING_SYNC')
      .toArray()

    for (const tx of pending) {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: tx.items,
            payment_method: tx.payment_method,
            ...(tx.cash_amount !== undefined && {
              cash_amount: tx.cash_amount,
              cash_change: tx.cash_change,
            }),
            ...(tx.customer_name && {
              customer_name: tx.customer_name,
              customer_phone: tx.customer_phone,
            }),
          }),
        })

        if (!res.ok) {
          await db.offline_transactions_queue.update(tx.id!, { state: 'FAILED' })
          continue
        }

        await db.offline_transactions_queue.delete(tx.id!)
      } catch {
        await db.offline_transactions_queue.update(tx.id!, { state: 'FAILED' })
      }
    }
  } catch {
    // IndexedDB unavailable
  }
}

export function OfflineSyncEngine() {
  const processed = useRef(false)

  useEffect(() => {
    // Process once on mount (catches case where queue exists while online)
    if (!processed.current) {
      processed.current = true
      if (navigator.onLine) processQueue()
    }

    const handleOnline = () => processQueue()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  return null
}
