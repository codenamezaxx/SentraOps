'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface StockUpdateFormProps {
  productId: string
  currentStock: number
  onSuccess?: () => void
}

/**
 * Requirement: 11.3
 * Form for quick stock adjustments (increment/decrement)
 */
export function StockUpdateForm({ productId, currentStock, onSuccess }: StockUpdateFormProps) {
  const [adjustment, setAdjustment] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (adjustment === 0) return

    setIsLoading(true)
    try {
      const newStock = currentStock + adjustment
      if (newStock < 0) throw new Error('Stok tidak boleh negatif')

      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', productId)

      if (error) throw error

      toast.success('Stok berhasil diperbarui')
      setAdjustment(0)
      onSuccess?.()
    } catch (error) {
      console.error('Error updating stock:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui stok')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-medium text-on-surface">
          Stok Saat Ini: <span className="text-primary font-bold">{currentStock}</span>
        </div>
        <div className="text-sm font-medium text-on-surface">
          Hasil Akhir: <span className="font-bold">{currentStock + adjustment}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-xl"
          onClick={() => setAdjustment(prev => prev - 1)}
        >
          <Minus className="w-4 h-4" />
        </Button>
        
        <Input
          type="number"
          value={adjustment}
          onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
          className="h-12 text-center text-lg font-bold rounded-xl"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-xl"
          onClick={() => setAdjustment(prev => prev + 1)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Button
        type="submit"
        disabled={isLoading || adjustment === 0}
        className="w-full h-12 rounded-xl bg-accent-blue hover:opacity-90 text-accent-blue-foreground font-semibold"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Simpan Perubahan Stok
      </Button>
    </form>
  )
}