import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { isLowStock, isOutOfStock } from '@/lib/inventory'

interface StockBadgeProps {
  quantity: number
  threshold: number
  className?: string
}

/**
 * Requirement: 10.1, 10.3, 11.2
 * Displays a visual indicator for stock level
 */
export function StockBadge({ quantity, threshold, className }: StockBadgeProps) {
  const low = isLowStock(quantity, threshold)
  const out = isOutOfStock(quantity)

  if (out) {
    return (
      <Badge 
        variant="outline" 
        className={cn("bg-error/10 text-error border-error/20", className)}
      >
        Habis
      </Badge>
    )
  }

  if (low) {
    return (
      <Badge 
        variant="outline" 
        className={cn("bg-surface-container text-tertiary border-tertiary/30", className)}
      >
        Stok Menipis: {quantity}
      </Badge>
    )
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("bg-primary/10 text-primary border-primary/20", className)}
    >
      Tersedia: {quantity}
    </Badge>
  )
}
