'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { formatCurrency } from '@/lib/utils'

interface DailyData {
  date: string
  revenue: number
}

interface RevenueChartProps {
  data: DailyData[]
}

const PADDING = { top: 32, right: 24, bottom: 32, left: 64 }
const CHART_W = 620
const CHART_H = 240
const INNER_W = CHART_W - PADDING.left - PADDING.right
const INNER_H = CHART_H - PADDING.top - PADDING.bottom

/**
 * Requirement: 14.5
 * SVG line chart with gradient fill using CSS custom property tokens from globals.css.
 */
export function RevenueChart({ data }: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; item: DailyData } | null>(null)

  const maxRevenue = useMemo(
    () => Math.max(...data.map((d) => d.revenue), 1),
    [data],
  )

  const xScale = useCallback(
    (index: number) => PADDING.left + (index / Math.max(data.length - 1, 1)) * INNER_W,
    [data.length],
  )

  const yScale = useCallback(
    (value: number) => PADDING.top + INNER_H - (value / maxRevenue) * INNER_H,
    [maxRevenue],
  )

  const linePath = useMemo(() => {
    if (data.length === 0) return ''
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.revenue)}`)
      .join(' ')
  }, [data, xScale, yScale])

  const areaPath = useMemo(() => {
    if (data.length === 0) return ''
    const baseline = PADDING.top + INNER_H
    const linePart = data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.revenue)}`)
      .join(' ')
    return `${linePart} L ${xScale(data.length - 1)} ${baseline} L ${xScale(0)} ${baseline} Z`
  }, [data, xScale, yScale])

  const gridLines = useMemo(() => {
    const lines: { y: number; label: string }[] = []
    const steps = 4
    for (let i = 0; i <= steps; i++) {
      const value = (maxRevenue / steps) * i
      lines.push({ y: yScale(value), label: formatCurrency(value) })
    }
    return lines
  }, [maxRevenue, yScale])

  // X-axis labels: unique keys via date string, not numeric index
  const xLabels = useMemo(() => {
    if (data.length === 0) return []
    if (data.length === 1) return [{ key: data[0].date, x: xScale(0), label: data[0].date }]
    const mid = Math.floor(data.length / 2)
    const seen = new Set<string>()
    const result: { key: string; x: number; label: string }[] = []
    for (const idx of [0, mid, data.length - 1]) {
      const label = data[idx].date
      // Deduplicate by date label (if mid === 0 or mid === last, skip duplicate)
      if (seen.has(label)) continue
      seen.add(label)
      result.push({ key: `xl-${label}-${idx}`, x: xScale(idx), label })
    }
    return result
  }, [data, xScale])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || data.length === 0) return
      const rect = svgRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      let closestIdx = 0
      let closestDist = Infinity
      data.forEach((_, i) => {
        const dist = Math.abs(xScale(i) - mouseX)
        if (dist < closestDist) {
          closestDist = dist
          closestIdx = i
        }
      })
      setHoveredIndex(closestIdx)
      setTooltip({
        x: xScale(closestIdx),
        y: yScale(data[closestIdx].revenue),
        item: data[closestIdx],
      })
    },
    [data, xScale, yScale],
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null)
    setTooltip(null)
  }, [])

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full h-auto"
        style={{ overflow: 'visible' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {gridLines.map((line, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={PADDING.left}
              y1={line.y}
              x2={CHART_W - PADDING.right}
              y2={line.y}
              stroke="var(--border)"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 4}
              y={line.y + 3}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {line.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        {data.length > 1 && (
          <path d={areaPath} fill="url(#areaGradient)" />
        )}

        {/* Line */}
        {data.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent-blue)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={`pt-${i}`}
            cx={xScale(i)}
            cy={yScale(d.revenue)}
            r={hoveredIndex === i ? 5 : 3}
            className="fill-accent-blue transition-all"
            stroke="var(--card)"
            strokeWidth={2}
          />
        ))}

        {/* X-axis labels */}
        {xLabels.map(({ key, x, label }) => (
          <text
            key={key}
            x={x}
            y={CHART_H - 6}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={10}
          >
            {label}
          </text>
        ))}

        {/* Hover crosshair + tooltip */}
        {hoveredIndex !== null && tooltip && (
          <g>
            <line
              x1={tooltip.x}
              y1={PADDING.top}
              x2={tooltip.x}
              y2={PADDING.top + INNER_H}
              stroke="var(--accent-blue)"
              strokeWidth={1}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <rect
              x={tooltip.x - 56}
              y={tooltip.y - 32}
              width={112}
              height={24}
              rx={8}
              fill="var(--card)"
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text
              x={tooltip.x}
              y={tooltip.y - 17}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={9}
              fontWeight={600}
            >
              {tooltip.item.date}: {formatCurrency(tooltip.item.revenue)}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}