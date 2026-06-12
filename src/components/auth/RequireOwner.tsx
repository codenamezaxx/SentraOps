'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Profile } from '@/lib/types'

interface RequireOwnerProps {
  children: React.ReactNode
  profile: Profile | null
}

export function RequireOwner({ children, profile }: RequireOwnerProps) {
  const router = useRouter()

  useEffect(() => {
    if (!profile) {
      // No profile means not authenticated, middleware should handle this
      router.push('/login')
      return
    }

    if (profile.role !== 'owner') {
      // Not an owner, redirect to access denied
      router.push('/access-denied')
      return
    }
  }, [profile, router])

  if (!profile || profile.role !== 'owner') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
