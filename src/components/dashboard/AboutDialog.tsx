"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MessageCircle, ExternalLink } from "lucide-react"
import { VERSION } from "@/lib/version"

export function AboutDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-6 gap-0 dark:bg-zinc-900">
        <DialogHeader className="items-center text-center pb-4 border-b border-border mb-4">
          <img
            src="/icons/icon-192.svg"
            alt="SentraOps"
            className="w-14 h-14 mb-2"
          />
          <DialogTitle className="text-xl font-heading font-bold text-foreground">
            Tentang SentraOps
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Dashboard operasional all-in-one untuk UMKM
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* About */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            SentraOps adalah platform manajemen usaha untuk UMKM Indonesia.
            Kelola kasir, stok barang, keuangan, dan tagihan dalam satu
            aplikasi — gratis dan mudah digunakan.
          </p>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Versi</p>
              <p className="text-sm font-semibold text-foreground">v{VERSION}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Author</p>
              <p className="text-sm font-semibold text-foreground">@codenamezaxx</p>
            </div>
          </div>

          {/* Feedback buttons */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5 justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
              Umpan Balik
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href="https://github.com/codenamezaxx/SentraOps/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 active:scale-[0.98] rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Buka Issue di GitHub
              </a>
              <a
                href="mailto:zakky.ahmad@protonmail.com?subject=Umpan%20Balik%20SentraOps"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 border border-border hover:bg-muted/50 active:scale-[0.98] rounded-xl text-foreground text-sm font-medium flex items-center justify-center gap-2 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Kirim Email
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground/50 tracking-wide">
            SentraOps v{VERSION}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
