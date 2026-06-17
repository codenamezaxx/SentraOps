import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Daftar SentraOps
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kelola operasional UMKM Anda dengan lebih mudah
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
          <SignupForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} SentraOps. All rights reserved.
        </p>
      </div>
    </div>
  );
}