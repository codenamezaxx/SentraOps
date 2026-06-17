import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Reset Kata Sandi
          </h1>
          <p className="mt-2 text-muted-foreground">
            Masukkan kata sandi baru untuk akun Anda.
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
          <ResetPasswordForm />
        </div>
        
        <p className="text-center text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} SentraOps. All rights reserved.
        </p>
      </div>
    </div>
  );
}