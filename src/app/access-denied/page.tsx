import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export const dynamic = 'force-static'

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-sm p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-error/10 dark:bg-error/20 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-error" />
            </div>
          </div>
          
          <h1 className="text-2xl font-heading font-bold text-on-surface mb-3">
            Akses Ditolak
          </h1>
          
          <p className="text-on-surface-variant mb-6">
            Anda tidak memiliki izin untuk mengakses halaman ini. Fitur ini hanya tersedia untuk pemilik toko.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full h-12 flex items-center justify-center rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors active:scale-95"
            >
              Kembali ke Dashboard
            </Link>
            
            <Link
              href="/pos"
              className="w-full h-12 flex items-center justify-center rounded-xl bg-surface-container-high text-on-surface font-semibold hover:bg-surface-container-highest transition-colors active:scale-95"
            >
              Buka POS
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
