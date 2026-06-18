'use client'

import { useEffect } from 'react'
import { db } from '@/lib/offlineDb'

export function OfflineDbInit() {
  useEffect(() => {
    db.open()
  }, [])

  return null
}
