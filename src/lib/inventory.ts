/**
 * Inventory utility functions.
 * Stock status determination and helpers.
 */

export type StockStatus = "out_of_stock" | "low_stock" | "in_stock" | "overstock"

export interface StockInfo {
  status: StockStatus
  label: string
  color: "destructive" | "warning" | "success" | "default"
}

/**
 * Determine stock status based on quantity and threshold.
 * Property 12: Low Stock Status Determination
 */
export function getStockStatus(
  quantity: number,
  threshold: number
): StockStatus {
  if (quantity <= 0) return "out_of_stock"
  if (quantity <= threshold) return "low_stock"
  if (quantity > threshold * 2) return "overstock"
  return "in_stock"
}

/**
 * Get display info for stock status.
 */
export function getStockInfo(quantity: number, threshold: number): StockInfo {
  const status = getStockStatus(quantity, threshold)

  const map: Record<StockStatus, StockInfo> = {
    out_of_stock: { status: "out_of_stock", label: "Habis", color: "destructive" },
    low_stock: { status: "low_stock", label: "Stok Menipis", color: "warning" },
    in_stock: { status: "in_stock", label: "Tersedia", color: "success" },
    overstock: { status: "overstock", label: "Berlebih", color: "default" },
  }

  return map[status]
}

/**
 * Check if a product is low on stock (quantity > 0 but ≤ threshold).
 */
export function isLowStock(quantity: number, threshold: number): boolean {
  return quantity > 0 && quantity <= threshold
}

/**
 * Check if a product is out of stock.
 */
export function isOutOfStock(quantity: number): boolean {
  return quantity <= 0
}

/**
 * Count products that are low on stock or out of stock.
 */
export function countCriticalStock(
  items: Array<{ stock_quantity: number; min_stock_threshold: number }>
): { lowStock: number; outOfStock: number } {
  let lowStock = 0
  let outOfStock = 0

  for (const item of items) {
    if (isOutOfStock(item.stock_quantity)) {
      outOfStock++
    } else if (isLowStock(item.stock_quantity, item.min_stock_threshold)) {
      lowStock++
    }
  }

  return { lowStock, outOfStock }
}
