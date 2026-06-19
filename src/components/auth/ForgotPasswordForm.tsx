"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const supabase = createClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/reset-password`,
      })

      if (error) throw error

      setIsSent(true)
      toast.success("Instruksi reset kata sandi telah dikirim ke email Anda.")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan"
      console.error("Forgot password error:", err)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center pt-2">
        <div className="p-4 bg-primary/10 rounded-full">
          <span className="material-symbols-outlined text-primary text-3xl">mail</span>
        </div>
        <h2 className="text-lg font-semibold text-on-surface">Cek Email Anda</h2>
        <p className="text-sm text-on-surface-variant">
          Kami telah mengirimkan tautan untuk mengatur ulang kata sandi ke email Anda.
        </p>
        <a
          className="w-full h-12 border border-outline-variant text-primary rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-low hover:border-primary active:scale-[0.98] transition-all mt-2"
          href="/login"
        >
          Kembali ke Masuk
        </a>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface" htmlFor="email">
          Email
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-on-surface-variant pointer-events-none">
            mail
          </span>
          <input
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-card text-on-surface text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            id="email"
            placeholder="nama@email.com"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <button
        className="w-full h-12 mt-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Mengirim..." : "Kirim Instruksi Reset"}
      </button>
    </form>
  )
}
