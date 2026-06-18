'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Unregister any existing SW to stop refresh loops
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) reg.unregister()
      })
    }
  }, [])

  return null
}
