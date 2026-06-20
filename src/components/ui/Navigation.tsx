"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useUIStore } from "@/lib/stores/uiStore"
import { useCartStore } from "@/lib/stores/cartStore"
import { LogoutDialog } from "@/components/dashboard/LogoutDialog"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  DollarSign,
  ScrollText,
  Receipt,
  Settings,
  LogOut,
  Plus,
  ChevronLeft,
  Users,
} from "lucide-react"

const ownerOnlyRoutes = ['/inventory', '/financial', '/staff']

const navItems = [
  { href: "/", label: "Beranda", icon: LayoutDashboard },
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/inventory", label: "Stok Barang", icon: Package, ownerOnly: true },
  { href: "/invoices", label: "Manajemen Tagihan", icon: Receipt },
  { href: "/financial", label: "Laporan Keuangan", icon: DollarSign, ownerOnly: true },
  { href: "/transactions", label: "Riwayat Transaksi", icon: ScrollText },
  { href: "/staff", label: "Manajemen Staf", icon: Users, ownerOnly: true },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [supabase] = React.useState(() => createClient())
  const { isSidebarCollapsed, toggleSidebarCollapsed, setIsNavigating } = useUIStore()
  const { clearCart } = useCartStore()
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)
  const [role, setRole] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function getRole() {
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
  }, [supabase])

  const visibleItems = React.useMemo(
    () => navItems.filter((item) => !item.ownerOnly || role === 'owner'),
    [role]
  )

  React.useEffect(() => {
    visibleItems.forEach((item) => router.prefetch(item.href))
    router.prefetch('/settings')
  }, [router, visibleItems])

  const handleNavClick = () => {
    setIsNavigating(true)
  }

  return (
    <>
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen fixed left-0 top-0 bg-card p-4 gap-4 z-40 transition-all duration-200 ease-in-out border-r border-border",
        isSidebarCollapsed ? "w-20 items-center" : "w-[280px]"
      )}
    >
      {/* Brand Header */}
      <div className={cn("flex items-center gap-3 px-2 pt-4 pb-6", isSidebarCollapsed && "justify-center")}>
        <img
          src="/icons/icon-192.svg"
          alt="SentraOps"
          className="w-10 h-10 shrink-0"
        />
        {!isSidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-heading text-xl font-bold text-foreground truncate">SentraOps</h1>
            <p className="text-xs text-muted-foreground truncate">UMKM Management</p>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <Link
        href="/pos"
        onClick={() => {
          clearCart()
          setIsNavigating(true)
        }}
        className={cn(
          "mx-2 mb-4 h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-colors active:scale-95",
          isSidebarCollapsed ? "w-12 px-0" : "px-4 w-auto"
        )}
      >
        <Plus className="w-5 h-5 shrink-0" />
        {!isSidebarCollapsed && <span className="truncate">Transaksi Baru</span>}
      </Link>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-1 flex-grow overflow-y-auto px-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isSidebarCollapsed ? item.label : undefined}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ease-in-out h-12",
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "text-muted-foreground hover:bg-muted",
                isSidebarCollapsed && "justify-center px-0"
              )}
            >
              <Icon className={cn("w-5 h-5 m-3 shrink-0", isActive && "text-on-primary-container")} />
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-1 mt-auto px-2 pb-4 pt-4 border-t border-border">
        <Link
          href="/settings"
          title={isSidebarCollapsed ? "Pengaturan" : undefined}
          onClick={handleNavClick}
          className={cn(
            "flex items-center gap-3 px-3 py-3 text-muted-foreground hover:bg-muted rounded-xl font-semibold text-sm transition-all duration-200 ease-in-out h-12",
            isSidebarCollapsed && "justify-center px-0"
          )}
        >
          <Settings className="w-5 h-5 m-3 shrink-0" />
          {!isSidebarCollapsed && <span className="truncate">Pengaturan</span>}
        </Link>
        <button
          onClick={() => setShowLogoutDialog(true)}
          title={isSidebarCollapsed ? "Keluar" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-3 text-destructive hover:bg-destructive/10 rounded-xl font-semibold text-sm transition-all duration-200 ease-in-out h-12 w-full text-left cursor-pointer",
            isSidebarCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5 m-3 shrink-0 text-destructive" />
          {!isSidebarCollapsed && <span className="truncate">Keluar</span>}
        </button>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleSidebarCollapsed}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center transition-all duration-200 ease-in-out shadow-sm hover:bg-muted z-50",
          isSidebarCollapsed ? "-right-4 rotate-180" : "-right-4"
        )}
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>
    </aside>
      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </>
  )
}
