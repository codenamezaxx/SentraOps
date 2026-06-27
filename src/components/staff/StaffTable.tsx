"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Pencil, Trash2, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import { EditStaffDialog } from '@/components/staff/EditStaffDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface StaffMember {
  id: string
  auth_id: string
  name: string | null
  role: string
  email: string
  avatar_url: string | null
}

interface StaffTableProps {
  staff: StaffMember[]
  currentUserId: string
}

export function StaffTable({ staff, currentUserId }: StaffTableProps) {
  const router = useRouter()
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleted = async () => {
    if (!deletingStaff) return
    setDeleting(true)
    try {
      const res = await fetch('/api/staff/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deletingStaff.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus staf')
      toast.success('Staf berhasil dihapus')
      setDeletingStaff(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus staf')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground">Nama Staf</th>
              <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground">Email</th>
              <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground">Peran</th>
              <th className="text-right px-5 py-3.5 font-semibold text-muted-foreground w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                  Belum ada staf
                </td>
              </tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors min-h-12">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {s.avatar_url ? (
                          <Image src={s.avatar_url} alt="" width={32} height={32} className="object-cover w-full h-full" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium text-foreground">{s.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-muted-foreground">{s.email}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      s.role === 'owner'
                        ? 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {s.role === 'owner' ? 'Pemilik' : 'Kasir'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingStaff(s)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                        title="Edit staf"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingStaff(s)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Hapus staf"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col">
        {staff.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Belum ada staf
          </div>
        ) : (
          staff.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 min-h-12">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {s.avatar_url ? (
                  <Image src={s.avatar_url} alt="" width={36} height={36} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-sm font-bold text-primary">{(s.name || '?')[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{s.name || '-'}</p>
                <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${
                  s.role === 'owner'
                    ? 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {s.role === 'owner' ? 'Pemilik' : 'Kasir'}
                </span>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => setEditingStaff(s)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                  title="Edit staf"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingStaff(s)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Hapus staf"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {editingStaff && (
        <EditStaffDialog
          open={true}
          onOpenChange={(open) => { if (!open) setEditingStaff(null) }}
          staff={editingStaff}
          onUpdated={() => { setEditingStaff(null); router.refresh() }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingStaff} onOpenChange={(open) => { if (!open) setDeletingStaff(null) }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Staf</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{deletingStaff?.name || 'staf ini'}</strong>?
              Akun pengguna dan semua datanya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleted() }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
