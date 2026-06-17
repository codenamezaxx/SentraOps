import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Lupa Kata Sandi?
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Jangan khawatir, kami akan mengirimkan instruksi reset kepada Anda.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <ForgotPasswordForm />
        </div>
        
        <p className="text-center text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} SentraOps. All rights reserved.
        </p>
      </div>
    </div>
  );
}