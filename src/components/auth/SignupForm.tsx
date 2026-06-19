"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

const signupSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  storeName: z.string().min(2, "Nama toko minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
})

type SignupValues = z.infer<typeof signupSchema>

export default function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      storeName: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: SignupValues) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendaftar")
      }

      toast.success("Akun berhasil dibuat! Silakan masuk.")
      router.push("/login")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat mendaftar"
      console.error("Signup error:", err)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface" htmlFor="fullName">
          Nama Lengkap
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-on-surface-variant pointer-events-none">person</span>
          <input
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-card text-on-surface text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            id="fullName"
            placeholder="John Doe"
            {...register("fullName")}
          />
        </div>
        {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface" htmlFor="storeName">
          Nama Toko
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-on-surface-variant pointer-events-none">store</span>
          <input
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-card text-on-surface text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            id="storeName"
            placeholder="Toko Kelontong Berkah"
            {...register("storeName")}
          />
        </div>
        {errors.storeName && <p className="text-xs text-red-500">{errors.storeName.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface" htmlFor="email">
          Email
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-on-surface-variant pointer-events-none">mail</span>
          <input
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-card text-on-surface text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            id="email"
            placeholder="nama@email.com"
            type="email"
            {...register("email")}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface" htmlFor="password">
          Kata Sandi
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-on-surface-variant pointer-events-none">lock</span>
          <input
            className="w-full h-12 pl-12 pr-12 rounded-xl border border-outline-variant bg-card text-on-surface text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            id="password"
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            {...register("password")}
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
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <button
        className="w-full h-12 mt-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Memproses..." : "Daftar Sekarang"}
      </button>
    </form>
  )
}
