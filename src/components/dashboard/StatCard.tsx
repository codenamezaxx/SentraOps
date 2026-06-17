import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  variant?: 'default' | 'success' | 'destructive' | 'warning'
  description?: string
  descriptionClassName?: string
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default',
  description,
  descriptionClassName
}: StatCardProps) {
  const variantStyles = {
    default: 'border-outline-variant',
    success: 'border-primary',
    destructive: 'border-error',
    warning: 'border-tertiary',
  }

  const iconStyles = {
    default: 'text-on-surface-variant',
    success: 'text-primary',
    destructive: 'text-error',
    warning: 'text-tertiary',
  }

  return (
    <div className={cn(
      "bg-card p-5 rounded-2xl border shadow-md flex flex-col gap-2 group hover:shadow-lg transition-shadow",
      variantStyles[variant]
    )}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-muted-foreground">{title}</p>
        <Icon className={cn("w-5 h-5", iconStyles[variant])} />
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-foreground">{value}</h3>
      {description && (
        <p className={cn("text-xs mt-auto", descriptionClassName || iconStyles[variant])}>
          {description}
        </p>
      )}
    </div>
  )
}