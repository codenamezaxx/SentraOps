'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Product } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  barcode: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Harga jual tidak boleh negatif'),
  cost_price: z.coerce.number().min(0, 'Harga modal tidak boleh negatif'),
  stock_quantity: z.coerce.number().min(0, 'Stok tidak boleh negatif'),
  min_stock_threshold: z.coerce.number().min(0, 'Ambang batas tidak boleh negatif'),
  category: z.string().optional().nullable(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
  onSuccess?: () => void
}

/**
 * Requirement: 11.3, 11.4
 * Form for creating or editing products
 */
export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      barcode: product?.barcode || '',
      price: product?.price || 0,
      cost_price: product?.cost_price || 0,
      stock_quantity: product?.stock_quantity || 0,
      min_stock_threshold: product?.min_stock_threshold || 5,
      category: product?.category || '',
    },
  })

  async function onSubmit(values: ProductFormValues) {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Unauthorized')

      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('auth_id', user.id)
        .single()
      
      if (!profile?.store_id) throw new Error('Store ID not found')

      const productData = {
        name: values.name,
        barcode: values.barcode || null,
        price: values.price,
        cost_price: values.cost_price,
        stock_quantity: values.stock_quantity,
        min_stock_threshold: values.min_stock_threshold,
        category: values.category || null,
      }

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .eq('store_id', profile.store_id)

        if (error) throw error
        toast.success('Produk berhasil diperbarui')
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...productData,
            store_id: profile.store_id,
          })

        if (error) throw error
        toast.success('Produk berhasil ditambahkan')
      }

      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan produk')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-on-surface">Nama Produk</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Kopi Gayo 250g" {...field} value={field.value || ''} className="h-12 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface">Barcode (Opsional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Scan atau ketik barcode" 
                    {...field} 
                    value={field.value || ''} 
                    className="h-12 rounded-xl" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface">Kategori</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Contoh: Minuman" 
                    {...field} 
                    value={field.value || ''} 
                    className="h-12 rounded-xl" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface">Harga Jual (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? 0} className="h-12 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cost_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface">Harga Modal (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? 0} className="h-12 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface">Stok Saat Ini</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? 0} className="h-12 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="min_stock_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface">Ambang Batas Stok Menipis</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? 0} className="h-12 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-primary hover:opacity-90 text-primary-foreground"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Simpan Perubahan' : 'Tambah Produk'}
        </Button>
      </form>
    </Form>
  )
}