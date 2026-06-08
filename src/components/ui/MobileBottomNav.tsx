"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/pos", label: "POS", icon: "storefront" },
  { href: "/inventory", label: "Stock", icon: "inventory" },
  { href: "/financial", label: "Money", icon: "account_balance_wallet" },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-surface rounded-t-xl border-t border-outline-variant/30 shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl px-4 py-1 active:scale-90 transition-transform duration-150 h-14 min-w-[64px]",
              isActive
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant"
            )}
          >
            <span className={cn("material-symbols-outlined", isActive && "icon-fill")}>
              {item.icon}
            </span>
            <span className="text-xs font-semibold mt-1">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
