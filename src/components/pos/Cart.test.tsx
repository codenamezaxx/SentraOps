import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Cart } from './Cart'
import { useCartStore } from '@/lib/stores/cartStore'
import type { CartItem } from '@/lib/types'

// Mock the cart store
vi.mock('@/lib/stores/cartStore', () => ({
  useCartStore: vi.fn(),
}))

describe('Cart Component', () => {
  const mockUpdateQuantity = vi.fn()
  const mockRemoveItem = vi.fn()

  const mockCartItems: CartItem[] = [
    {
      id: '1',
      store_id: 'store-1',
      name: 'Nasi Goreng',
      barcode: '123456',
      price: 25000,
      cost_price: 15000,
      stock_quantity: 10,
      min_stock_threshold: 5,
      category: 'Makanan',
      created_at: '2024-01-01',
      quantity: 2,
    },
    {
      id: '2',
      store_id: 'store-1',
      name: 'Es Kopi Susu',
      barcode: '789012',
      price: 18000,
      cost_price: 10000,
      stock_quantity: 20,
      min_stock_threshold: 5,
      category: 'Minuman',
      created_at: '2024-01-01',
      quantity: 1,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Empty Cart State', () => {
    beforeEach(() => {
      vi.mocked(useCartStore).mockReturnValue({
        items: [],
        total: 0,
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
        addItem: vi.fn(),
        clearCart: vi.fn(),
      })
    })

    it('displays empty cart message when cart has no items', () => {
      render(<Cart />)
      
      expect(screen.getByText('Keranjang masih kosong')).toBeInTheDocument()
      expect(screen.getByText('Tambahkan produk untuk memulai transaksi')).toBeInTheDocument()
    })

    it('shows shopping cart icon when empty', () => {
      render(<Cart />)
      
      const icon = screen.getByText('shopping_cart')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Cart with Items', () => {
    beforeEach(() => {
      vi.mocked(useCartStore).mockReturnValue({
        items: mockCartItems,
        total: 68000, // (25000 * 2) + (18000 * 1)
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
        addItem: vi.fn(),
        clearCart: vi.fn(),
      })
    })

    it('displays all cart items with correct product names (Requirement 6.4)', () => {
      render(<Cart />)
      
      expect(screen.getByText('Nasi Goreng')).toBeInTheDocument()
      expect(screen.getByText('Es Kopi Susu')).toBeInTheDocument()
    })

    it('displays product quantities correctly (Requirement 6.4)', () => {
      render(<Cart />)
      
      // Find all quantity displays (there should be 2, one for each item)
      const quantities = screen.getAllByText(/^[0-9]+$/).filter(
        (el) => el.classList.contains('text-center')
      )
      
      expect(quantities[0]).toHaveTextContent('2')
      expect(quantities[1]).toHaveTextContent('1')
    })

    it('displays product prices correctly', () => {
      render(<Cart />)
      
      expect(screen.getByText('Rp 25.000')).toBeInTheDocument()
      expect(screen.getByText('Rp 18.000')).toBeInTheDocument()
    })

    it('displays subtotals for each item (Requirement 6.4)', () => {
      render(<Cart />)
      
      expect(screen.getByText('Subtotal: Rp 50.000')).toBeInTheDocument() // 25000 * 2
      expect(screen.getByText('Subtotal: Rp 18.000')).toBeInTheDocument() // 18000 * 1
    })

    it('displays real-time cart total (Requirement 6.5)', () => {
      render(<Cart />)
      
      expect(screen.getByText('Rp 68.000')).toBeInTheDocument()
    })

    it('displays total item count', () => {
      render(<Cart />)
      
      expect(screen.getByText('3 item')).toBeInTheDocument() // 2 + 1
    })
  })

  describe('Quantity Controls', () => {
    beforeEach(() => {
      vi.mocked(useCartStore).mockReturnValue({
        items: mockCartItems,
        total: 68000,
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
        addItem: vi.fn(),
        clearCart: vi.fn(),
      })
    })

    it('calls updateQuantity with incremented value when increment button clicked (Requirement 7.1)', () => {
      render(<Cart />)
      
      const incrementButtons = screen.getAllByLabelText('Tambah jumlah')
      fireEvent.click(incrementButtons[0])
      
      expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3) // quantity 2 + 1
    })

    it('calls updateQuantity with decremented value when decrement button clicked (Requirement 7.1)', () => {
      render(<Cart />)
      
      const decrementButtons = screen.getAllByLabelText('Kurangi jumlah')
      fireEvent.click(decrementButtons[0])
      
      expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 1) // quantity 2 - 1
    })

    it('decrementing to zero removes item from cart (Requirement 7.2)', () => {
      // Set up a cart with quantity 1
      vi.mocked(useCartStore).mockReturnValue({
        items: [mockCartItems[1]], // Es Kopi Susu with quantity 1
        total: 18000,
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
        addItem: vi.fn(),
        clearCart: vi.fn(),
      })

      render(<Cart />)
      
      const decrementButton = screen.getByLabelText('Kurangi jumlah')
      fireEvent.click(decrementButton)
      
      // Should call updateQuantity with 0, which triggers removal in the store
      expect(mockUpdateQuantity).toHaveBeenCalledWith('2', 0)
    })
  })

  describe('Remove Item Functionality', () => {
    beforeEach(() => {
      vi.mocked(useCartStore).mockReturnValue({
        items: mockCartItems,
        total: 68000,
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
        addItem: vi.fn(),
        clearCart: vi.fn(),
      })
    })

    it('displays remove button for each cart item', () => {
      render(<Cart />)
      
      const removeButtons = screen.getAllByLabelText('Hapus item')
      expect(removeButtons).toHaveLength(2)
    })

    it('calls removeItem when remove button clicked (Requirement 7.3)', () => {
      render(<Cart />)
      
      const removeButtons = screen.getAllByLabelText('Hapus item')
      fireEvent.click(removeButtons[0])
      
      expect(mockRemoveItem).toHaveBeenCalledWith('1')
    })

    it('removes correct item when multiple items in cart', () => {
      render(<Cart />)
      
      const removeButtons = screen.getAllByLabelText('Hapus item')
      fireEvent.click(removeButtons[1]) // Remove second item
      
      expect(mockRemoveItem).toHaveBeenCalledWith('2')
    })
  })

  describe('Currency Formatting', () => {
    beforeEach(() => {
      vi.mocked(useCartStore).mockReturnValue({
        items: mockCartItems,
        total: 68000,
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
        addItem: vi.fn(),
        clearCart: vi.fn(),
      })
    })

    it('formats prices in Indonesian Rupiah format', () => {
      render(<Cart />)
      
      // Prices should be formatted as "Rp X.XXX"
      expect(screen.getByText('Rp 25.000')).toBeInTheDocument()
      expect(screen.getByText('Rp 18.000')).toBeInTheDocument()
      expect(screen.getByText('Rp 68.000')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    beforeEach(() => {
      vi.mocked(useCartStore).mockReturnValue({
        items: mockCartItems,
        total: 68000,
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
        addItem: vi.fn(),
        clearCart: vi.fn(),
      })
    })

    it('renders cart items with proper mobile-first styling', () => {
      const { container } = render(<Cart />)
      
      // Check that cart items have mobile-optimized classes
      const cartItems = container.querySelectorAll('.rounded-xl')
      expect(cartItems.length).toBeGreaterThan(0)
    })

    it('ensures touch target size for interactive elements (Requirement 13.3)', () => {
      render(<Cart />)
      
      // Increment/decrement buttons should have h-8 (32px) within a touch-friendly container
      const buttons = screen.getAllByLabelText(/Tambah jumlah|Kurangi jumlah/)
      buttons.forEach((button) => {
        expect(button.classList.contains('h-8')).toBe(true)
        expect(button.classList.contains('w-8')).toBe(true)
      })
    })
  })
})
