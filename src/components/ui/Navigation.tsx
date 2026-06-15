"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/pos", label: "POS", icon: "point_of_sale" },
  { href: "/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/financial", label: "Finance", icon: "payments" },
]

export function Navigation() {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <aside className="hidden md:flex flex-col h-screen w-[280px] fixed left-0 top-0 bg-surface-container-low p-4 gap-4 z-40">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined icon-fill">storefront</span>
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold text-primary">SentraOps</h1>
          <p className="text-xs text-on-surface-variant">MSME Suite</p>
        </div>
      </div>

      {/* Primary Action Button */}
      <button className="mx-4 mb-4 h-12 bg-primary text-on-primary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-colors active:scale-95">
        <span className="material-symbols-outlined">add</span>
        New Transaction
      </button>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-1 flex-grow overflow-y-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ease-in-out",
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              )}
            >
              <span className={cn("material-symbols-outlined", isActive && "icon-fill")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-1 mt-auto px-2 pb-4 pt-4 border-t border-outline-variant">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-semibold text-sm transition-all duration-200 ease-in-out"
        >
          <span className="material-symbols-outlined">settings</span>
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-semibold text-sm transition-all duration-200 ease-in-out w-full text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          Keluar
        </button>
      </div>
    </aside>
  )
}
