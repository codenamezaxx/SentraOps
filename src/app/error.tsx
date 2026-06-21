"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mx-auto">
          <span className="material-symbols-outlined text-4xl text-destructive">error_outline</span>
        </div>

        <h1 className="mb-2 font-heading text-2xl font-bold text-foreground">
          Terjadi Kesalahan
        </h1>

        <p className="mb-8 text-muted-foreground">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
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
