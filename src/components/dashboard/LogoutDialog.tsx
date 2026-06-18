"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/login")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-sm">
        <AlertDialogHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-2">
            <LogOut className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">Konfirmasi Keluar</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Apakah Anda yakin ingin keluar dari akun ini? Anda akan dialihkan ke halaman login.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="h-12 rounded-xl w-full sm:w-auto">Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSignOut}
            className="h-12 rounded-xl w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-surface"
          >
            Ya, Keluar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}