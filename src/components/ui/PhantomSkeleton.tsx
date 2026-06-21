'use client'

import dynamic from 'next/dynamic'

/** PhantomSkeleton — Lit-based shimmer skeleton.
 *  Dynamically imported with ssr:false to avoid loading Lit on the server
 *  (which would cause "Multiple versions of Lit loaded" warning in the console). */
export const PhantomSkeleton = dynamic(
  () => import('./PhantomSkeletonImpl').then((m) => m.PhantomSkeletonImpl),
  { ssr: false },
)
