"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { AddStaffDialog } from '@/components/staff/AddStaffDialog'

export function StaffContent() {
  const [openAdd, setOpenAdd] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setOpenAdd(true)}
        className="h-12 bg-foreground text-background rounded-xl font-semibold text-sm px-5 flex items-center gap-2 hover:opacity-90 transition-colors active:scale-95"
      >
        <Plus className="w-5 h-5" />
        Tambah Staf Baru
      </button>
      <AddStaffDialog open={openAdd} onOpenChange={setOpenAdd} onAdded={() => router.refresh()} />
    </>
  )
}
