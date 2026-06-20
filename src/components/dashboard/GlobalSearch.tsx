"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { 
  Search, 
  ShoppingCart, 
  LayoutDashboard, 
  Package, 
  FileText, 
  Settings,
  ArrowRight,
  PackageSearch,
  History,
  Receipt,
  Users,
  TrendingDown
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/lib/stores/cartStore"
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
  CommandSeparator
} from "@/components/ui/command"
import type { Product, Transaction } from "@/lib/types"

/**
 * GlobalSearch Component (Omni-Search / Command Palette)
 * 
 * Provides global navigation and data search capabilities
 * Categorized into Navigation, Products, and Transactions
 * Integrates with cart state when on POS page
 */
export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [products, setProducts] = React.useState<Product[]>([])
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [expenses, setExpenses] = React.useState<{ id: string; title: string; amount: number; category: string }[]>([])
  const [, setLoading] = React.useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const addItem = useCartStore((state) => state.addItem)
  const isPosPage = pathname === "/pos"

  // Global shortcut handler (Ctrl+K / Cmd+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Debounced search logic
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setProducts([])
        setTransactions([])
        setExpenses([])
        return
      }

      setLoading(true)
      const supabase = createClient()

      try {
        // Parallel search for products, transactions, and expenses
        const [productsRes, transactionsRes, expensesRes] = await Promise.all([
          supabase
            .from("products")
            .select("*")
            .ilike("name", `%${query}%`)
            .limit(5),
          supabase
            .from("transactions")
            .select("*")
            .ilike("id", `%${query}%`)
            .limit(5),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase as any)
            .from("expenses")
            .select("id, title, amount, category")
            .ilike("title", `%${query}%`)
            .limit(5)
        ])

        if (productsRes.data) setProducts(productsRes.data as Product[])
        if (transactionsRes.data) setTransactions(transactionsRes.data as Transaction[])
        if (expensesRes.data) setExpenses(expensesRes.data as { id: string; title: string; amount: number; category: string }[])
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center bg-muted/50 rounded-full px-4 py-1.5 h-10 w-64 border border-border/50 hover:border-primary/50 focus-within:border-primary transition-all text-muted-foreground group"
      >
        <Search className="mr-2 w-4 h-4 group-hover:text-primary transition-colors" />
        <span className="text-sm flex-1 text-left">Cari Apapun...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          Ctrl + K
        </kbd>
      </button>

      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors active:scale-95 text-muted-foreground"
      >
        <Search className="w-5 h-5" />
      </button>

      <CommandDialog 
        open={open} 
        onOpenChange={setOpen}
        shouldFilter={false}
        className="rounded-2xl! border-border shadow-2xl dark:bg-zinc-950"
      >
        <CommandInput 
          placeholder="Cari navigasi, produk, atau transaksi..." 
          onValueChange={setQuery}
          className="h-12!"
        />
        <CommandList className="max-h-100 p-2">
          <CommandEmpty>Hasil tidak ditemukan.</CommandEmpty>
          
          <CommandGroup heading="Navigasi">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Beranda</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/pos"))}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Buka POS (Kasir)</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/inventory"))}>
              <Package className="mr-2 h-4 w-4" />
              <span>Manajemen Stok</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/invoices"))}>
              <Receipt className="mr-2 h-4 w-4" />
              <span>Manajemen Tagihan</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/financial"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Lihat Laporan Keuangan</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/transactions"))}>
              <History className="mr-2 h-4 w-4" />
              <span>Riwayat Transaksi</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/staff"))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Manajemen Staff</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/expenses"))}>
              <TrendingDown className="mr-2 h-4 w-4" />
              <span>Manajemen Pengeluaran</span>
            </CommandItem>
          </CommandGroup>

          {products.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Produk">
                {products.map((product) => (
                  <CommandItem 
                    key={product.id}
                    onSelect={() => runCommand(() => {
                      if (isPosPage) {
                        addItem(product)
                      } else {
                        router.push("/pos")
                        // Wait for navigation then maybe focus? 
                        // Simplified: just nav to POS
                      }
                    })}
                  >
                    <PackageSearch className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        Stok: {product.stock_quantity} | Rp {product.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    {isPosPage && (
                      <div className="ml-auto text-[10px] bg-teal-500/10 text-teal-600 px-2 py-0.5 rounded-full font-medium">
                        Tambah ke Keranjang
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {transactions.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Transaksi">
                {transactions.map((tx) => (
                  <CommandItem 
                    key={tx.id}
                    onSelect={() => runCommand(() => router.push("/transactions"))}
                  >
                    <History className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>#{tx.id.slice(0, 8)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {tx.payment_method.toUpperCase()} | Rp {tx.total_amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <ArrowRight className="ml-auto h-3 w-3 opacity-50" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {expenses.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Pengeluaran">
                {expenses.map((expense) => (
                  <CommandItem 
                    key={expense.id}
                    onSelect={() => runCommand(() => router.push("/expenses"))}
                  >
                    <TrendingDown className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{expense.title}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {expense.category} | Rp {expense.amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <ArrowRight className="ml-auto h-3 w-3 opacity-50" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="Sistem">
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}