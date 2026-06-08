"use client"

import { useState } from "react"
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

  async function handleMagicLinkLogin() {
    if (!email) {
      toast.info("Masukkan email Anda untuk magic link.")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error("Gagal mengirim magic link", {
          description: error.message,
        })
        return
      }

      toast.success("Magic link terkirim", {
        description: "Cek email Anda untuk link masuk.",
      })
    } catch (err) {
      console.error('Magic link error:', err)
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
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-[color:hsl(var(--outline))]/60"
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
          <a className="text-sm font-semibold text-primary hover:underline transition-colors" href="#">
            Lupa sandi?
          </a>
        </div>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-on-surface-variant pointer-events-none">
            lock
          </span>
          <input
            className="w-full h-12 pl-12 pr-12 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-[color:hsl(var(--outline))]/60"
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

      {/* Primary Action */}
      <button
        className="w-full h-12 mt-4 bg-primary text-on-primary rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Memproses..." : "Masuk ke Akun"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-2">
        <div className="flex-1 h-px bg-outline-variant/50"></div>
        <span className="text-xs text-on-surface-variant uppercase tracking-wider">Atau</span>
        <div className="flex-1 h-px bg-outline-variant/50"></div>
      </div>

      {/* Secondary Action */}
      <button
        className="w-full h-12 border border-outline-variant text-primary rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-low hover:border-primary active:scale-[0.98] transition-all"
        type="button"
        onClick={handleMagicLinkLogin}
        disabled={isLoading}
      >
        <span className="material-symbols-outlined icon-fill">send</span>
        Kirim Link Masuk ke Email
      </button>
    </form>
  )
}
