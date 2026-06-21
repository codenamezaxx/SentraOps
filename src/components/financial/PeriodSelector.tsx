'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

/** Format date as YYYY-MM-DD in LOCAL timezone (no UTC shift) */
function fmt(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const periods = [
  { key: 'weekly', label: 'Mingguan' },
  { key: 'monthly', label: 'Bulanan' },
  { key: 'yearly', label: 'Tahunan' },
  { key: 'ytd', label: 'YTD' },
]

export function PeriodSelector({ activePeriod }: { activePeriod: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePeriod = (key: string) => {
    const now = new Date()
    let start: string

    switch (key) {
      case 'weekly': {
        const d = new Date(now)
        d.setDate(d.getDate() - 7)
        start = fmt(d)
        break
      }
      case 'monthly':
        start = fmt(new Date(now.getFullYear(), now.getMonth(), 1))
        break
      case 'yearly': {
        const d = new Date(now)
        d.setFullYear(d.getFullYear() - 1)
        start = fmt(d)
        break
      }
      case 'ytd':
        start = fmt(new Date(now.getFullYear(), 0, 1))
        break
      default:
        return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set('start', start)
    params.delete('end')
    router.push(`/financial?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 max-md:gap-1.5 flex-wrap justify-end">
      {periods.map((p) => (
        <button
          key={p.key}
          onClick={() => handlePeriod(p.key)}
          className={cn(
            'h-10 max-md:h-9 px-4 max-md:px-3 rounded-xl text-sm max-md:text-xs font-medium transition-colors whitespace-nowrap',
            activePeriod === p.key
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-hover'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
