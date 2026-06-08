import { Navigation } from "@/components/ui/Navigation"
import { MobileBottomNav } from "@/components/ui/MobileBottomNav"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      {/* TopAppBar (Mobile & Desktop Header) */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 md:px-10 h-12 bg-surface shadow-sm md:ml-[280px] md:w-[calc(100%-280px)]">
        <div className="flex items-center gap-4">
          <span className="font-heading text-lg font-bold text-primary md:hidden">SentraOps</span>
          <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-1.5 h-10 w-64">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-xl">search</span>
            <input
              className="bg-transparent border-none outline-none focus:ring-0 text-base text-on-surface w-full p-0 placeholder:text-on-surface-variant"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95 text-on-surface-variant md:hidden">
            <span className="material-symbols-outlined">search</span>
          </button>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95 text-on-surface-variant relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-[color:hsl(var(--error))] rounded-full"></span>
          </button>
          <div className="ml-2 w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-sm font-semibold overflow-hidden">
            <span className="material-symbols-outlined">person</span>
          </div>
        </div>
      </header>

      <main className="flex-1 md:ml-[280px]">
        {children}
      </main>
      
      <MobileBottomNav />
    </div>
  )
}
