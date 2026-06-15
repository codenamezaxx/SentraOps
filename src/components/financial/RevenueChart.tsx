'use client'

import { formatCurrency } from '@/lib/utils'

interface DailyData {
  date: string
  revenue: number
}

interface RevenueChartProps {
  data: DailyData[]
}

/**
 * Requirement: 14.5
 * A simple bar chart for revenue trends using Tailwind CSS
 */
export function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)

  return (
    <div className="w-full space-y-4">
      <div className="flex items-end justify-between h-48 gap-2 pt-6">
        {data.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
              <div className="bg-surface-container-high text-on-surface border border-outline-variant text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {day.date}: {formatCurrency(day.revenue)}
              </div>
            </div>
            
            {/* Bar */}
            <div 
              className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-sm"
              style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
            />
          </div>
        ))}
      </div>
      
      {/* X-Axis labels (simple) */}
      <div className="flex justify-between text-[10px] text-on-surface-variant border-t border-outline-variant pt-2">
        <span>{data[0]?.date}</span>
        <span>{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}