"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useUIStore } from "@/lib/stores/uiStore"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  DollarSign,
  ScrollText,
  Receipt,
  Settings,
  MoreHorizontal,
  Users,
  TrendingDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ownerMainItems = [
  { href: "/", label: "Beranda", icon: LayoutDashboard },
  { href: "/inventory", label: "Stok", icon: Package },
  { href: "/pos", label: "POS", icon: ShoppingCart, isPrimary: true },
  { href: "/financial", label: "Laporan", icon: DollarSign },
]

const cashierMainItems = [
  { href: "/", label: "Beranda", icon: LayoutDashboard },
  { href: "/transactions", label: "Riwayat", icon: ScrollText },
  { href: "/pos", label: "POS", icon: ShoppingCart, isPrimary: true },
  { href: "/invoices", label: "Tagihan", icon: Receipt },
]

const ownerMoreItems = [
  { href: "/transactions", label: "Riwayat", icon: ScrollText },
  { href: "/invoices", label: "Tagihan", icon: Receipt },
  { href: "/expenses", label: "Pengeluaran", icon: TrendingDown },
  { href: "/staff", label: "Manajemen Staf", icon: Users },
  { href: "/settings", label: "Pengaturan", icon: Settings },
]

const cashierMoreItems = [
  { href: "/settings", label: "Pengaturan", icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { setIsNavigating } = useUIStore()
  const [role, setRole] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function getRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_id', user.id)
        .single()
      if (data) setRole(data.role)
    }
    getRole()
  }, [])

  const mainItems = role === 'owner' ? ownerMainItems : cashierMainItems
  const moreItems = role === 'owner' ? ownerMoreItems : cashierMoreItems

  const handleNavClick = () => {
    setIsNavigating(true)
  }

  const isMoreActive = moreItems.some((item) => pathname === item.href)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 md:hidden">
      <div className="absolute bottom-0 h-18 w-full border-t rounded-2xl border-zinc-200/60 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80" />

      <div className="relative flex h-full items-end justify-around pb-2">
        {mainItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className="relative -top-2.5 flex flex-col items-center justify-center gap-1"
              >
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-90",
                    "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 px-3 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}

        {/* Lainnya — dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 px-3 transition-colors cursor-pointer",
                isMoreActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">Lainnya</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            sideOffset={8}
            className="min-w-44 mb-2"
          >
            {moreItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md",
                      isActive && "bg-accent font-semibold"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
