"use client"

import { useState } from 'react'
import { Loader2, Eye, EyeOff, Store, User, Mail, Lock, Shield } from 'lucide-react'
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

interface AddStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded?: () => void
}

export function AddStaffDialog({ open, onOpenChange, onAdded }: AddStaffDialogProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'owner' | 'cashier'>('cashier')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!fullName.trim()) { setError('Nama wajib diisi'); return }
    if (!email.trim()) { setError('Email wajib diisi'); return }
    if (password.length < 6) { setError('Password minimal 6 karakter'); return }

    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat staf')
      toast.success(`${fullName.trim()} berhasil ditambahkan`)
      setFullName('')
      setEmail('')
      setPassword('')
      setRole('cashier')
      setShowPassword(false)
      onOpenChange(false)
      onAdded?.()
    } catch (err) {
      console.error('[add-staff]', err)
      setError(err instanceof Error ? err.message : 'Gagal membuat staf')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Staf Baru</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface" htmlFor="staffName">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input id="staffName" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama Staff" className="pl-10 h-12 rounded-xl" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface" htmlFor="staffEmail">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input id="staffEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com" className="pl-10 h-12 rounded-xl" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface" htmlFor="staffPassword">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input id="staffPassword" type={showPassword ? 'text' : 'password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter" className="pl-10 pr-10 h-12 rounded-xl" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
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
            Tambah Staf
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
