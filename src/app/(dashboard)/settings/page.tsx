"use client"

import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  TabsContent,
  TabsList,
  TabsTrigger,
  Tabs,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Store,
  Users,
  CreditCard,
  AlertTriangle,
  Loader2
} from "lucide-react"

interface StoreSettings {
  id: string
  name: string
  address: string | null
  phone: string | null
  receipt_footer: string | null
  payment_methods: Record<string, boolean> | null
  default_stock_threshold: number | null
}

interface StaffMember {
  id: string
  name: string | null
  role: string
}

export default function SettingsPage() {
  const [store, setStore] = useState<StoreSettings | null>(null)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [saving, setSaving] = useState(false)
  const [storeName, setStoreName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [receiptFooter, setReceiptFooter] = useState("")
  const [defaultStockThreshold, setDefaultStockThreshold] = useState(5)
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    qris: true,
    whatsapp: true
  })
  const [activeTab, setActiveTab] = useState("profil")
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profileData } = await supabase
          .from("profiles")
          .select("store_id")
          .eq("auth_id", user.id)
          .single()

        if (!profileData?.store_id) return
        const storeId = profileData.store_id

        const { data: storeData } = await supabase
          .from("stores")
          .select("*")
          .eq("id", storeId)
          .single()

        if (storeData) {
          const raw = storeData as Record<string, unknown>
          setStore({
            id: String(raw.id),
            name: String(raw.name),
            address: raw.address as string | null,
            phone: raw.phone as string | null,
            receipt_footer: raw.receipt_footer as string | null,
            payment_methods: raw.payment_methods as Record<string, boolean> | null,
            default_stock_threshold: raw.default_stock_threshold as number | null
          })
          setStoreName(String(raw.name || ""))
          setAddress(String(raw.address || ""))
          setPhone(String(raw.phone || ""))
          setReceiptFooter(String(raw.receipt_footer || ""))
          setDefaultStockThreshold(Number(raw.default_stock_threshold || 5))
          setPaymentMethods(((raw.payment_methods as Record<string, boolean>) || { cash: true, qris: true, whatsapp: true }) as { cash: boolean; qris: boolean; whatsapp: boolean })
        }

        const { data: staffData } = await supabase
          .from("profiles")
          .select("id, name, role")
          .eq("store_id", storeId)

        if (staffData) setStaff(staffData as StaffMember[])
      } catch (e) {
        console.error(e)
      }
    }
    fetchData()
  }, [supabase])

  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: storeName,
        address,
        phone,
        receipt_footer: receiptFooter,
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("stores") as any).update(payload).eq("id", store.id)
      toast.success("Profil toko berhasil diperbarui.")
      setStore(prev => prev ? { ...prev, name: storeName, address, phone, receipt_footer: receiptFooter } : prev)
    } catch {
      toast.error("Gagal memperbarui profil toko.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePaymentMethod = async (method: string, value: boolean) => {
    const updated = { ...paymentMethods, [method]: value }
    setPaymentMethods(updated)
    if (!store) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("stores") as any).update({ payment_methods: updated }).eq("id", store.id)
      toast.success("Metode pembayaran diperbarui.")
    } catch {
      toast.error("Gagal memperbarui metode pembayaran.")
      setPaymentMethods(paymentMethods)
    }
  }

  const handleSaveStockThreshold = async () => {
    if (!store) return
    setSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("stores") as any).update({ default_stock_threshold: defaultStockThreshold }).eq("id", store.id)
      toast.success("Batasan stok berhasil diperbarui.")
    } catch {
      toast.error("Gagal memperbarui batasan stok.")
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadge = (role: string) => {
    if (role === "owner")
      return <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Owner</Badge>
    return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Kasir</Badge>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">Kelola informasi toko dan preferensi Anda.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-row bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-1.5 gap-2 h-auto border-none shadow-none overflow-x-auto no-scrollbar flex-nowrap justify-start">
          <TabsTrigger
            value="profil"
            className="rounded-xl shrink-0 h-11 px-6 justify-center gap-2 border-none! transition-all data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:shadow-md text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
          >
            <Store className="w-4 h-4" />
            <span>Profil Toko</span>
          </TabsTrigger>
          <TabsTrigger
            value="staf"
            className="rounded-xl shrink-0 h-11 px-6 justify-center gap-2 border-none! transition-all data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:shadow-md text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
          >
            <Users className="w-4 h-4" />
            <span>Manajemen Staf</span>
          </TabsTrigger>
          <TabsTrigger
            value="pembayaran"
            className="rounded-xl shrink-0 h-11 px-6 justify-center gap-2 border-none! transition-all data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:shadow-md text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
          >
            <CreditCard className="w-4 h-4" />
            <span>Metode Pembayaran</span>
          </TabsTrigger>
          <TabsTrigger
            value="batasan"
            className="rounded-xl shrink-0 h-11 px-6 justify-center gap-2 border-none! transition-all data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:shadow-md text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Batasan Sistem</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <TabsContent value="profil" className="mt-0 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Profil Toko</h2>
            <form onSubmit={handleSaveStoreProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="storeName" className="text-sm font-medium">Nama Toko</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="SentraOps Store"
                  className="h-12 rounded-xl bg-card border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-sm font-medium">Alamat</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. ..."
                  className="h-12 rounded-xl bg-card border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium">Telepon</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0821..."
                  className="h-12 rounded-xl bg-card border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="footer" className="text-sm font-medium">Teks Footer Struk</Label>
                <Input
                  id="footer"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  placeholder="Terima kasih atas kunjungannya"
                  className="h-12 rounded-xl bg-card border-border"
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto"
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="staf" className="mt-0 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Manajemen Staf</h2>
            <div className="space-y-3">
              {staff.length === 0 && (
                <p className="text-muted-foreground text-sm">Tidak ada staf ditemukan.</p>
              )}
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-border rounded-2xl bg-muted/50"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">{member.name || "Tanpa Nama"}</span>
                    <span className="text-xs text-muted-foreground">ID: {String(member.id).slice(0, 8)}...</span>
                  </div>
                  {getRoleBadge(member.role)}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pembayaran" className="mt-0 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Metode Pembayaran</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-muted/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Tunai</p>
                  <p className="text-xs text-muted-foreground">Aktifkan pembayaran dengan uang tunai</p>
                </div>
                <Switch
                  checked={paymentMethods.cash}
                  onCheckedChange={(v) => handleUpdatePaymentMethod("cash", v)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-muted/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">QRIS (Xendit)</p>
                  <p className="text-xs text-muted-foreground">Aktifkan pembayaran via kode QR</p>
                </div>
                <Switch
                  checked={paymentMethods.qris}
                  onCheckedChange={(v) => handleUpdatePaymentMethod("qris", v)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-muted/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">WhatsApp Link</p>
                  <p className="text-xs text-muted-foreground">Kirim tagihan via WhatsApp</p>
                </div>
                <Switch
                  checked={paymentMethods.whatsapp}
                  onCheckedChange={(v) => handleUpdatePaymentMethod("whatsapp", v)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batasan" className="mt-0 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Batasan Sistem</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="stockAlert" className="text-sm font-medium">Batas Minimum Stok</Label>
                <Input
                  id="stockAlert"
                  type="number"
                  min={1}
                  value={defaultStockThreshold}
                  onChange={(e) => setDefaultStockThreshold(parseInt(e.target.value || "0"))}
                  placeholder="5"
                  className="h-12 rounded-xl bg-card border-border"
                />
                <p className="text-xs text-muted-foreground">Jika stok produk mencapai angka ini atau lebih rendah, status Low Stock akan aktif</p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={handleSaveStockThreshold}
                  disabled={saving}
                  className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto"
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Simpan Batasan
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}