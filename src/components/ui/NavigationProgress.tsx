"use client"

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/lib/stores/uiStore'

export function NavigationProgress() {
  const pathname = usePathname()
  const { isNavigating, setIsNavigating } = useUIStore()
  const prevPathname = useRef(pathname)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      setIsNavigating(false)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [pathname, setIsNavigating])

  useEffect(() => {
    if (isNavigating) {
      timeoutRef.current = setTimeout(() => setIsNavigating(false), 4000)
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isNavigating, setIsNavigating])

  if (!isNavigating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] overflow-hidden">
      <div className="absolute inset-0 bg-primary/20" />
      <div className="absolute inset-0 bg-primary animate-progress origin-left" />
    </div>
  )
}
