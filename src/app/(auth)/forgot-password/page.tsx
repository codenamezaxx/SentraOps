import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4 md:p-10">
      <main className="w-full max-w-[420px] bg-card rounded-2xl shadow-md border border-outline-variant flex flex-col p-6 md:p-8 gap-6 animate-[fadeIn_0.3s_ease-out]">
        <header className="flex flex-col items-center justify-center gap-2 text-center pt-2">
          <h1 className="font-heading text-3xl font-bold text-primary">SentraOps</h1>
          <p className="text-base text-on-surface-variant">Lupa kata sandi?</p>
        </header>

        <ForgotPasswordForm />

        <div className="mt-4 text-center">
          <p className="text-base text-on-surface-variant">
            Ingat kata sandi?{' '}
            <Link
              className="text-sm font-bold text-primary hover:underline decoration-2 underline-offset-4"
              href="/login"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
