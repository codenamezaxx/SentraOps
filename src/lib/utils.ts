import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Compact version — abbreviates large numbers for card display.
 *   Rp 1.000 → Rp 1.000  (under 10K: full)
 *   Rp 12.500 → Rp 12,5 K  (10K+)
 *   Rp 1.500.000 → Rp 1,5 Jt  (jutaan)
 *   Rp 1.200.000.000 → Rp 1,2 M  (miliaran)
 */
export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''

  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Jt`
  }
  if (abs >= 10_000) {
    return `${sign}Rp ${(abs / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} K`
  }
  return formatCurrency(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const SUPABASE_STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
  : ''

export function getProductImageUrl(imageUrl: string | null): string | undefined {
  if (!imageUrl) return undefined
  if (imageUrl.startsWith('http')) return imageUrl
  return SUPABASE_STORAGE_URL + imageUrl
}
