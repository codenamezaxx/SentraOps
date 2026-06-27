"use client"

import { useState } from 'react'
import { Loader2, User, Store, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface StaffMember {
  id: string
  name: string | null
  role: string
}

interface EditStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: StaffMember
  onUpdated?: () => void
}

export function EditStaffDialog({ open, onOpenChange, staff, onUpdated }: EditStaffDialogProps) {
  const [fullName, setFullName] = useState(staff.name || '')
  const [role, setRole] = useState(staff.role)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!fullName.trim()) { setError('Nama wajib diisi'); return }

    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/staff/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: staff.id, fullName: fullName.trim(), role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui staf')
      toast.success('Staf berhasil diperbarui')
      onOpenChange(false)
      onUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui staf')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Staf</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface" htmlFor="editStaffName">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input id="editStaffName" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe" className="pl-10 h-12 rounded-xl" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface">Peran</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRole('cashier')}
                className={`flex-1 h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  role === 'cashier'
                    ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                    : 'border-border hover:bg-muted text-muted-foreground'
                }`}>
                <Store className="w-4 h-4" />
                Kasir
              </button>
              <button type="button" onClick={() => setRole('owner')}
                className={`flex-1 h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  role === 'owner'
                    ? 'border-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : 'border-border hover:bg-muted text-muted-foreground'
                }`}>
                <Shield className="w-4 h-4" />
                Pemilik
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="h-12">
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}
            className="h-12 bg-accent-blue text-accent-blue-foreground hover:bg-accent-blue/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
