import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ProductGrid } from './ProductGrid'
import type { Product } from '@/lib/types'

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock child components
vi.mock('./CategoryFilter', () => ({
  CategoryFilter: () => <div data-testid="category-filter">Category Filter</div>,
}))

vi.mock('./ProductCard', () => ({
  ProductCard: ({ product }: { product: Product }) => (
    <div data-testid={`product-card-${product.id}`}>{product.name}</div>
  ),
}))

describe('ProductGrid Component', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      store_id: 'store-1',
      name: 'Kopi Arabica',
      barcode: '1234567890',
      price: 25000,
      cost_price: 15000,
      stock_quantity: 10,
      min_stock_threshold: 5,
      category: 'Minuman',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      store_id: 'store-1',
      name: 'Nasi Goreng',
      barcode: '0987654321',
      price: 20000,
      cost_price: 10000,
      stock_quantity: 5,
      min_stock_threshold: 3,
      category: 'Makanan',
      created_at: '2024-01-01T00:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays all active products organized by category', async () => {
    // Requirement 6.1: Display all active products organized by category
    const { createClient } = await import('@/lib/supabase/server')
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          gt: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({ data: mockProducts, error: null })
              ),
            })),
          })),
        })),
      })),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    render(await ProductGrid())

    await waitFor(() => {
      expect(screen.getByTestId('category-filter')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('product-card-2')).toBeInTheDocument()
      expect(screen.getByText('Kopi Arabica')).toBeInTheDocument()
      expect(screen.getByText('Nasi Goreng')).toBeInTheDocument()
    })
  })

  it('fetches products with stock_quantity greater than 0', async () => {
    // Requirement 6.1: Only display active products
    const { createClient } = await import('@/lib/supabase/server')
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          gt: vi.fn((field: string, value: number) => {
            expect(field).toBe('stock_quantity')
            expect(value).toBe(0)
            return {
              order: vi.fn(() => ({
                order: vi.fn(() =>
                  Promise.resolve({ data: mockProducts, error: null })
                ),
              })),
            }
          }),
        })),
      })),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    render(await ProductGrid())

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('products')
    })
  })

  it('orders products by category and name', async () => {
    // Requirement 6.1: Products organized by category
    const { createClient } = await import('@/lib/supabase/server')
    const orderCalls: { field: string; ascending: boolean }[] = []
    
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          gt: vi.fn(() => ({
            order: vi.fn((field: string, options: any) => {
              orderCalls.push({ field, ascending: options.ascending })
              
              // Return chain for second order call
              if (orderCalls.length === 1) {
                return {
                  order: vi.fn((field2: string, options2: any) => {
                    orderCalls.push({ field: field2, ascending: options2.ascending })
                    return Promise.resolve({ data: mockProducts, error: null })
                  }),
                }
              }
              return Promise.resolve({ data: mockProducts, error: null })
            }),
          })),
        })),
      })),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    render(await ProductGrid())

    await waitFor(() => {
      expect(orderCalls.length).toBe(2)
      expect(orderCalls[0].field).toBe('category')
      expect(orderCalls[0].ascending).toBe(true)
      expect(orderCalls[1].field).toBe('name')
      expect(orderCalls[1].ascending).toBe(true)
    })
  })

  it('displays error message when product fetch fails', async () => {
    // Requirement 18.1: Display user-friendly error message
    const { createClient } = await import('@/lib/supabase/server')
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          gt: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({
                  data: null,
                  error: { message: 'Database error' },
                })
              ),
            })),
          })),
        })),
      })),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    render(await ProductGrid())

    await waitFor(() => {
      expect(
        screen.getByText('Gagal memuat produk. Silakan refresh halaman.')
      ).toBeInTheDocument()
    })
  })

  it('displays empty state when no products exist', async () => {
    // Handle empty product list
    const { createClient } = await import('@/lib/supabase/server')
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          gt: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      })),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    render(await ProductGrid())

    await waitFor(() => {
      expect(screen.getByText('Belum ada produk')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Tambahkan produk pertama Anda di halaman Inventory'
        )
      ).toBeInTheDocument()
    })
  })

  it('applies responsive grid layout', async () => {
    // Requirement 13.1, 13.4: Responsive mobile-first layout
    const { createClient } = await import('@/lib/supabase/server')
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          gt: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({ data: mockProducts, error: null })
              ),
            })),
          })),
        })),
      })),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const { container } = render(await ProductGrid())

    await waitFor(() => {
      const gridElement = container.querySelector('section')
      expect(gridElement).toHaveClass(
        'grid',
        'grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-2',
        'xl:grid-cols-3'
      )
    })
  })
})
