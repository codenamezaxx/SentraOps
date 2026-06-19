"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi kata sandi minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Kata sandi tidak cocok",
  path: ["confirmPassword"],
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: ResetPasswordValues) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) throw error

      toast.success("Kata sandi berhasil diperbarui. Silakan masuk kembali.")
      router.push("/login")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan"
      console.error("Reset password error:", err)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface" htmlFor="password">
          Kata Sandi Baru
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

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface" htmlFor="confirmPassword">
          Konfirmasi Kata Sandi
        </label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-on-surface-variant pointer-events-none">lock</span>
          <input
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-card text-on-surface text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            id="confirmPassword"
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <button
        className="w-full h-12 mt-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Memproses..." : "Perbarui Kata Sandi"}
      </button>
    </form>
  )
}
