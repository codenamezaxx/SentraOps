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
  ChevronDown
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

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
            onSelect={() => router.push("/support")}
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
          onSelect={handleSignOut}
          className="rounded-xl py-2.5 px-3 text-error focus:bg-error/10 focus:text-foreground transition-colors cursor-pointer font-medium"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar dari Akun</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}