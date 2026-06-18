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
import { toast } from 'sonner'
import { Loader2, Upload, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  barcode: z.string().optional().nullable().or(z.literal('')),
  price: z.number().min(0, 'Harga jual tidak boleh negatif'),
  cost_price: z.number().min(0, 'Harga modal tidak boleh negatif'),
  stock_quantity: z.number().min(0, 'Stok tidak boleh negatif'),
  min_stock_threshold: z.number().min(0, 'Ambang batas tidak boleh negatif'),
  category: z.string().optional().nullable().or(z.literal('')),
  image_url: z.string().optional().nullable().or(z.literal('')),
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
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.image_url || null)

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
      image_url: product?.image_url || '',
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
        image_url: values.image_url || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

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

      onSuccess?.()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan produk')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB')
      return
    }

    setIsUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Unauthorized')

      const fileExt = file.name.split('.').pop()
      const randomId = crypto.randomUUID().split('-')[0]
      const fileName = `${user.id}/${randomId}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath)

      form.setValue('image_url', publicUrl)
      setPreviewUrl(publicUrl)
      toast.success('Gambar berhasil diunggah')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Gagal mengunggah gambar')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    form.setValue('image_url', '')
    setPreviewUrl(null)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Image Upload Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-on-surface">Gambar Produk</label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden bg-muted group">
              {previewUrl ? (
                <>
                  <Image 
                    src={previewUrl} 
                    alt="Preview" 
                    fill 
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 h-12 rounded-xl border border-outline-variant bg-surface hover:bg-muted transition-colors font-semibold text-sm w-fit">
                  <Upload className="w-4 h-4" />
                  Pilih Gambar
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading || isLoading}
                />
              </label>
              <p className="text-[10px] text-muted-foreground mt-2">
                Format: JPG, PNG, WEBP (Maks. 2MB)
              </p>
            </div>
          </div>
        </div>

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
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    value={field.value ?? 0} 
                    className="h-12 rounded-xl" 
                  />
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
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    value={field.value ?? 0} 
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
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-on-surface">Stok Saat Ini</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    value={field.value ?? 0} 
                    className="h-12 rounded-xl" 
                  />
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
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    value={field.value ?? 0} 
                    className="h-12 rounded-xl" 
                  />
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