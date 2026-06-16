"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingCart, Package, DollarSign, ScrollText } from "lucide-react"

const navItems = [
  { href: "/", label: "Beranda", icon: LayoutDashboard },
  { href: "/inventory", label: "Stok", icon: Package },
  { href: "/pos", label: "POS", icon: ShoppingCart, isPrimary: true },
  { href: "/financial", label: "Laporan", icon: DollarSign },
  { href: "/transactions", label: "Riwayat", icon: ScrollText },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 md:hidden">
      {/* Container background */}
      <div className="absolute bottom-0 h-18 w-full border-t rounded-2xl border-zinc-200/60 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80" />
      
      <div className="relative flex h-full items-end justify-around pb-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-2.5 flex flex-col items-center justify-center gap-1"
              >
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-90",
                  "bg-primary text-primary-foreground"
                )}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 px-3 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}