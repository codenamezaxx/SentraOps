"use client"

import { Navigation } from "@/components/ui/Navigation"
import { MobileBottomNav } from "@/components/ui/MobileBottomNav"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { GlobalSearch } from "@/components/dashboard/GlobalSearch"
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown"
import { useUIStore } from "@/lib/stores/uiStore"
import { cn } from "@/lib/utils"
import { Bell, Store } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSidebarCollapsed } = useUIStore()

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      {/* TopAppBar (Mobile & Desktop Header) */}
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-30 flex items-center justify-between px-4 md:px-10 h-16 bg-card border-b border-border transition-all duration-200 ease-in-out",
          isSidebarCollapsed ? "md:ml-20 md:w-[calc(100%-80px)]" : "md:ml-70 md:w-[calc(100%-280px)]"
        )}
      >
        <div className="flex items-center gap-4">
          <span className="flex gap-2 font-heading text-lg font-bold text-tertiary md:hidden">
            <span className="p-2 flex items-center justify-center rounded-lg bg-primary text-on-primary-container">
              <Store className="w-4 h-4 text-primary-foreground" />
            </span>
            SentraOps
          </span>
          <div className="hidden md:block">
            <GlobalSearch />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 md:hidden">
            <GlobalSearch />
          </div>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors active:scale-95 text-muted-foreground relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          <UserProfileDropdown />
        </div>
      </header>

      <main
        className={cn(
          "flex-1 pt-16 overflow-x-hidden transition-all duration-200 ease-in-out",
          isSidebarCollapsed ? "md:ml-20" : "md:ml-70"
        )}
      >
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  )
}