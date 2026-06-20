"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { 
  Settings, 
  AlertCircle, 
  LogOut, 
  Sun, 
  Moon,
  ChevronDown,
  Store,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { LogoutDialog } from "@/components/dashboard/LogoutDialog"
import { AboutDialog } from "@/components/dashboard/AboutDialog"
import { UserAvatar } from "@/components/ui/UserAvatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserProfileDropdown() {
  const [profile, setProfile] = React.useState<{ name: string; role: string; storeName: string; avatarUrl: string | null } | null>(null)
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
            .select("name, role, avatar_url, stores(name)")
            .eq("auth_id", user.id)
            .single()

          if (profileData) {
            const storeData = profileData.stores as { name: string } | null
            setProfile({
              name: profileData.name || "User",
              role: profileData.role,
              storeName: storeData?.name || "Toko Saya",
              avatarUrl: profileData.avatar_url || null,
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

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="ml-2 flex items-center gap-1 rounded-full bg-background border border-border hover:ring-2 hover:ring-primary/20 transition-all outline-none overflow-hidden">
          <UserAvatar name={profile?.name} avatarUrl={profile?.avatarUrl} size="sm" />
          <ChevronDown className="mr-2 w-3 h-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 rounded-2xl border border-border bg-card shadow-xl p-2"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 p-2">
            <UserAvatar name={profile?.name} avatarUrl={profile?.avatarUrl} size="lg" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {isLoading ? "Loading..." : profile?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Store className="w-3 h-3" />
                {isLoading ? "..." : profile?.storeName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {isLoading ? "..." : profile?.role}
              </p>
            </div>
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
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>Tentang & Umpan Balik</span>
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

      <AboutDialog
        open={showSupport}
        onOpenChange={setShowSupport}
      />
      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </>
  )
}
