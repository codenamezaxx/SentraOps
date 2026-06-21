"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "../../lib/supabase/client"
import { toast } from "sonner"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error("Gagal masuk", {
          description: error.message,
        })
        return
      }

      if (data.session) {
        toast.success("Berhasil masuk", {
          description: "Selamat datang kembali!",
        })
        
        await new Promise(resolve => setTimeout(resolve, 200))
        
        if (typeof window !== 'undefined') {
          window.location.assign("/")
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-4 mt-4" onSubmit={handlePasswordLogin}>
      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface" htmlFor="email">
          Email atau Nomor HP
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-on-surface-variant pointer-events-none">
            mail
          </span>
          <input
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-card text-on-surface text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            id="email"
            placeholder="contoh@usaha.com"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-on-surface" htmlFor="password">
            Password
          </label>
          <Link 
            className="text-sm font-semibold text-primary hover:underline transition-colors" 
            href="/forgot-password"
          >
            Lupa sandi?
          </Link>
        </div>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-on-surface-variant pointer-events-none">
            lock
          </span>
          <input
            className="w-full h-12 pl-12 pr-12 rounded-xl border border-outline-variant bg-card text-on-surface text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            id="password"
            placeholder="Masukkan password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            aria-label="Toggle password visibility"
            className="absolute right-4 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none flex items-center justify-center h-full"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            <span className="material-symbols-outlined">
              {showPassword ? "visibility" : "visibility_off"}
            </span>
          </button>
        </div>
      </div>

      {/* Demo Accounts Info */}
      <div className="rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-3 space-y-1.5">
        <p className="text-xs font-semibold text-on-surface-variant tracking-wide uppercase">Akun Demo</p>
        <div className="space-y-1">
          <p className="text-xs text-on-surface-variant">
            <span className="font-mono font-medium text-teal-600 dark:text-teal-400">Pemilik</span>
            {' — '}owner@demo.com{' / '}owner123
          </p>
          <p className="text-xs text-on-surface-variant">
            <span className="font-mono font-medium text-teal-600 dark:text-teal-400">Kasir</span>
            {' — '}kasir@demo.com{' / '}kasir123
          </p>
        </div>
      </div>

      {/* Primary Action */}
      <button
        className="w-full h-12 mt-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Memproses..." : "Masuk ke Akun"}
      </button>

    </form>
  )
}
