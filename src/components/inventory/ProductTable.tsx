'use client'

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Product } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { StockBadge } from './StockBadge'
import { Button } from '@/components/ui/button'
import { Edit2, PackagePlus, Plus, Search, UtensilsCrossed } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { ProductForm } from './ProductForm'
import { StockUpdateForm } from './StockUpdateForm'
import Image from 'next/image'

interface ProductTableProps {
  products: Product[]
}

/**
 * Requirement: 11.1, 11.2, 11.5
 * Table for managing products and stock
 */
export function ProductTable({ products: initialProducts }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [updatingStockProduct, setUpdatingStockProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 30
  
  const filteredProducts = initialProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm))
  )

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk berdasarkan nama atau barcode..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)}
          className="h-12 px-6 rounded-xl bg-primary hover:opacity-90 text-primary-foreground gap-2 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-container/50">
                <TableHead className="font-semibold text-on-surface">Produk</TableHead>
                <TableHead className="font-semibold">Barcode</TableHead>
                <TableHead className="font-semibold">Kategori</TableHead>
                <TableHead className="font-semibold text-right">Harga Jual</TableHead>
                <TableHead className="font-semibold text-right">Harga Modal</TableHead>
                <TableHead className="font-semibold">Status Stok</TableHead>
                <TableHead className="font-semibold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-on-surface-variant">
                    Tidak ada produk ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-surface-container transition-colors">
                    <TableCell className="font-medium text-on-surface">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
                          {product.image_url ? (
                            <Image 
                              src={product.image_url} 
                              alt={product.name} 
                              width={40} 
                              height={40} 
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <span>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-on-surface-variant font-mono text-xs">
                      {product.barcode || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 bg-surface-container rounded-lg text-on-surface">
                        {product.category || 'Umum'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(product.cost_price)}
                    </TableCell>
                    <TableCell>
                      <StockBadge 
                        quantity={product.stock_quantity} 
                        threshold={product.min_stock_threshold} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setUpdatingStockProduct(product)}
                          className="h-10 w-10 rounded-lg hover:bg-muted text-primary"
                        >
                          <PackagePlus className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setEditingProduct(product)}
                          className="h-10 w-10 rounded-lg hover:bg-muted text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginatedProducts.length === 0 ? (
          <div className="bg-card rounded-2xl border border-outline-variant p-8 text-center text-muted-foreground">
            Tidak ada produk ditemukan.
          </div>
        ) : (
          paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-2xl border border-outline-variant p-4 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                  {product.image_url ? (
                    <Image 
                      src={product.image_url} 
                      alt={product.name} 
                      width={48} 
                      height={48} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-on-surface truncate">{product.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{product.barcode || 'Tanpa barcode'}</div>
                </div>
                <StockBadge 
                  quantity={product.stock_quantity} 
                  threshold={product.min_stock_threshold} 
                />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-on-surface-variant">
                  {product.category || 'Umum'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-muted/50 rounded-xl p-2">
                  <div className="text-xs text-muted-foreground">Harga Jual</div>
                  <div className="font-semibold text-on-surface">{formatCurrency(product.price)}</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-2">
                  <div className="text-xs text-muted-foreground">Harga Modal</div>
                  <div className="font-semibold text-on-surface-variant">{formatCurrency(product.cost_price)}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setUpdatingStockProduct(product)}
                  className="flex-1 h-10 rounded-xl text-primary border-primary/30 gap-1.5"
                >
                  <PackagePlus className="w-4 h-4" />
                  Stok
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditingProduct(product)}
                  className="flex-1 h-10 rounded-xl gap-1.5"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Add Product Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Produk Baru</DialogTitle>
          </DialogHeader>
          <ProductForm onSuccess={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm 
              product={editingProduct} 
              onSuccess={() => setEditingProduct(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Stock Update Dialog */}
      <Dialog open={!!updatingStockProduct} onOpenChange={(open) => !open && setUpdatingStockProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Stok: {updatingStockProduct?.name}</DialogTitle>
          </DialogHeader>
          {updatingStockProduct && (
            <StockUpdateForm 
              productId={updatingStockProduct.id}
              currentStock={updatingStockProduct.stock_quantity}
              onSuccess={() => setUpdatingStockProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
