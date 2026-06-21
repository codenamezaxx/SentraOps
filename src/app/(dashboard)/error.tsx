"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[DashboardError]", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mx-auto">
          <span className="material-symbols-outlined text-4xl text-destructive">warning</span>
        </div>

        <h2 className="mb-2 font-heading text-xl font-bold text-foreground">
          Halaman Tidak Dapat Dimuat
        </h2>

        <p className="mb-8 text-muted-foreground">
          Terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
          {process.env.NODE_ENV === "development" && (
            <span className="mt-2 block rounded-lg bg-muted p-3 text-left font-mono text-sm text-foreground">
              {error.message}
            </span>
          )}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="h-12 px-8 text-base">
            Coba Lagi
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="h-12 px-8 text-base"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  )
}
