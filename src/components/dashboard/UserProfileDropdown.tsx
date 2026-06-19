"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Sun, 
  Moon,
  Store as StoreIcon,
  ChevronDown,
  ExternalLink,
  MessageCircle,
  ChevronDown as ChevronDownIcon,
  ChevronRight,
  Info,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { LogoutDialog } from "@/components/dashboard/LogoutDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    q: "Printer thermal tidak merespons",
    a: "Pastikan printer dalam keadaan menyala dan terhubung ke jaringan yang sama. Buka menu Pengaturan &rarr; Printer, lalu pilih 'Uji Coba Koneksi'. Jika masih gagal, restart perangkat dan coba kembali.",
  },
  {
    q: "Mode offline tidak menyinkronkan data",
    a: "Transaksi yang dibuat saat offline akan tersimpan di perangkat dan otomatis dikirim saat koneksi kembali. Pastikan Anda tidak menutup browser sebelum melihat notifikasi 'Sinkronisasi Berhasil'.",
  },
  {
    q: "Tagihan tidak muncul di riwayat",
    a: "Tagihan yang masih menunggu pembayaran (pending) tidak ditampilkan di riwayat transaksi. Tagihan akan muncul setelah status berubah menjadi lunas atau kadaluarsa. Cek halaman Manajemen Tagihan untuk detailnya.",
  },
]

function SupportDialog({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: { name: string; storeName: string } | null
}) {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null)

  const waText = profile
    ? `Halo%20Support%20SentraOps,%20saya%20${encodeURIComponent(profile.name)}%20dari%20${encodeURIComponent(profile.storeName)}%20butuh%20bantuan.%0A%0A---%0A%0A`
    : "Halo%20Support%20SentraOps,%20saya%20butuh%20bantuan.%0A%0A---%0A%0A"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-6 gap-0 dark:bg-zinc-900">
        <DialogHeader className="pb-4 border-b border-border mb-4">
          <DialogTitle className="text-xl font-heading font-bold text-foreground">
            Pusat Bantuan SentraOps
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Tim support kami siap membantu 24/7
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/6281234567890?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
            Hubungi via WhatsApp
          </a>

          {/* FAQ Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-primary" />
              Pertanyaan Umum
            </h3>
            <div className="space-y-1">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i
                return (
                  <div key={i} className="rounded-xl border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{faq.q}</span>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-2.5 text-xs text-muted-foreground leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground/50 tracking-wide">
            SentraOps v1.2.0
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * UserProfileDropdown Component (Client Component)
 * 
 * Interactive dropdown menu for user profile actions
 * Displays user/store info, navigation to settings/help,
 * responsive theme toggle for mobile, and sign-out workflow.
 */
export function UserProfileDropdown() {
  const [profile, setProfile] = React.useState<{ name: string; role: string; storeName: string } | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)
  const [showSupport, setShowSupport] = React.useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [supabase] = React.useState(() => createClient())

  React.useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name, role, stores(name)")
            .eq("auth_id", user.id)
            .single()

          if (profileData) {
            const storeData = profileData.stores as { name: string } | null
            setProfile({
              name: profileData.name || "User",
              role: profileData.role,
              storeName: storeData?.name || "Toko Saya"
            })
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }
    getProfile()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/login")
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="ml-2 w-15 h-10 rounded-full bg-background flex items-center justify-center text-on-primary-container text-sm font-semibold overflow-hidden border border-border hover:ring-2 hover:ring-primary/20 transition-all outline-none">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"> 
            <User className="w-4 h-4" />
          </div>
          <ChevronDown className="ml-1 w-3 h-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 rounded-2xl border border-border bg-card shadow-xl p-2"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-bold leading-none text-foreground flex items-center gap-2">
              <StoreIcon className="w-3.5 h-3.5 text-primary" />
              {isLoading ? "Loading..." : profile?.storeName}
            </p>
            <p className="text-xs leading-none text-muted-foreground flex items-center gap-2 mt-1">
              <span className="capitalize">{isLoading ? "..." : profile?.role}</span>
              <span>•</span>
              <span>{isLoading ? "..." : profile?.name}</span>
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onSelect={() => router.push("/settings")}
            className="rounded-xl py-2.5 px-3 focus:bg-primary/5 focus:text-on-primary-container transition-colors cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Pengaturan Akun</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onSelect={() => setShowSupport(true)}
            className="rounded-xl py-2.5 px-3 focus:bg-primary/5 focus:text-on-primary-container transition-colors cursor-pointer"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Bantuan & Dukungan</span>
          </DropdownMenuItem>
          
          {/* Mobile Only Theme Toggle */}
          <DropdownMenuItem 
            onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="md:hidden rounded-xl py-2.5 px-3 focus:bg-primary/5 focus:text-on-primary-container transition-colors cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>Ubah Tema ({theme === "dark" ? "Terang" : "Gelap"})</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem 
          onSelect={() => setShowLogoutDialog(true)}
          className="rounded-xl py-2.5 px-3 text-error focus:bg-error/10 focus:text-foreground transition-colors cursor-pointer font-medium"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar dari Akun</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

      <SupportDialog
        open={showSupport}
        onOpenChange={setShowSupport}
        profile={profile ? { name: profile.name, storeName: profile.storeName } : null}
      />
      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </>
  )
}
