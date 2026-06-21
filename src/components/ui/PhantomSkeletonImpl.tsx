'use client'

import '@aejkatappaja/phantom-ui'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  animation?: 'shimmer' | 'pulse' | 'breathe' | 'solid'
  stagger?: number | string
}

export function PhantomSkeletonImpl({
  children,
  animation = 'shimmer',
  stagger = 0.03,
}: Props) {
  const parsedStagger = typeof stagger === 'number' ? stagger : parseFloat(stagger) || 0.03
  return (
    <phantom-ui
      loading
      animation={animation}
      stagger={parsedStagger}
      background-color="oklch(0.5 0 0 / 0.06)"
      shimmer-color="oklch(0.5 0 0 / 0.12)"
      style={{ opacity: "0.7" }}
    >
      {children}
    </phantom-ui>
  )
}
