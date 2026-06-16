"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingCart, Package, DollarSign, ScrollText } from "lucide-react"

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/inventory", label: "Stock", icon: Package },
  { href: "/financial", label: "Money", icon: DollarSign },
  { href: "/transactions", label: "History", icon: ScrollText },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-card rounded-t-2xl border-t border-border shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 active:scale-90 transition-transform duration-150 h-14 min-w-[56px]",
              isActive
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-semibold mt-1">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
