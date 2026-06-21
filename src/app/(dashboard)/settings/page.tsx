"use client"

import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useEffect, useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TabsContent, TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs"
import { UserAvatar } from "@/components/ui/UserAvatar"
import { Badge } from "@/components/ui/badge"
import {
  Store,
  Loader2,
  User,
  Camera,
  Trash2,
  Save,
  ImageUp,
  Building2,
  MapPin,
  Phone,
  ScrollText,
  Wallet,
  QrCode,
  MessageCircle,
  HandCoins,
  PackageOpen,
  Settings2,
  CheckCircle2,
  AtSign,
  ShieldCheck,
  Lock,
  KeyRound,
  AlertTriangle,
  LogOut,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

interface StoreSettings {
  id: string
  name: string
  address: string | null
  phone: string | null
  receipt_footer: string | null
  payment_methods: Record<string, boolean> | null
  default_stock_threshold: number | null
}

interface TabDefinition {
  value: string
  label: string
  icon: React.ElementType
  ownerOnly?: boolean
}

const allTabs: TabDefinition[] = [
  { value: "akun", label: "Akun", icon: User },
  { value: "profil", label: "Profil Toko", icon: Building2, ownerOnly: true },
  { value: "pembayaran", label: "Metode Pembayaran", icon: Wallet, ownerOnly: true },
  { value: "batasan", label: "Batasan Sistem", icon: Settings2, ownerOnly: true },
]

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-border/50">
      <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

function FormField({ id, label, children, helpText }: { id?: string; label: string; children: React.ReactNode; helpText?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground/90">{label}</Label>
      {children}
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile state
  const [profileName, setProfileName] = useState("")
  const [profileEmail, setProfileEmail] = useState("")
  const [profileRole, setProfileRole] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState("")
  const [uploading, setUploading] = useState(false)

  // Store state
  const [store, setStore] = useState<StoreSettings | null>(null)
  const [storeName, setStoreName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [receiptFooter, setReceiptFooter] = useState("")
  const [defaultStockThreshold, setDefaultStockThreshold] = useState(5)
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    qris: true,
    whatsapp: true,
    piutang: true,
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("akun")

  // Password change state
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Filter tabs by role
  const visibleTabs = useMemo(
    () => allTabs.filter((tab) => !tab.ownerOnly || profileRole === "owner"),
    [profileRole]
  )

  // Derive safe active tab — corrects if current tab becomes hidden (e.g. role change)
  const safeActiveTab = useMemo(() => {
    if (!visibleTabs.some((t) => t.value === activeTab) && visibleTabs.length > 0) {
      return visibleTabs[0].value
    }
    return activeTab
  }, [visibleTabs, activeTab])

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)
        setProfileEmail(user.email || "")

        const { data: profileData } = await supabase
          .from("profiles")
          .select("name, role, avatar_url, store_id")
          .eq("auth_id", user.id)
          .single()

        if (profileData) {
          setProfileName(profileData.name || "")
          setProfileRole(profileData.role || "")
          setAvatarUrl(profileData.avatar_url || null)

          if (profileData.store_id) {
            const { data: storeData } = await supabase
              .from("stores")
              .select("*")
              .eq("id", profileData.store_id)
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
                default_stock_threshold: raw.default_stock_threshold as number | null,
              })
              setStoreName(String(raw.name || ""))
              setAddress(String(raw.address || ""))
              setPhone(String(raw.phone || ""))
              setReceiptFooter(String(raw.receipt_footer || ""))
              setDefaultStockThreshold(Number(raw.default_stock_threshold || 5))
              setPaymentMethods(
                ((raw.payment_methods as Record<string, boolean>) || {
                  cash: true,
                  qris: true,
                  whatsapp: true,
                  piutang: true,
                }) as { cash: boolean; qris: boolean; whatsapp: boolean; piutang: boolean }
              )
            }
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchData()
  }, [supabase])

  // --- Avatar handlers ---
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB.")
      return
    }
    setUploading(true)
    try {
      const filePath = `${userId}/avatar.jpg`
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { contentType: "image/jpeg", upsert: true })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("auth_id", userId)

      setAvatarUrl(publicUrl)
      toast.success("Foto profil berhasil diperbarui.")
    } catch {
      toast.error("Gagal mengunggah foto profil.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemoveAvatar = async () => {
    if (!userId) return
    setUploading(true)
    try {
      await supabase.storage.from("avatars").remove([`${userId}/avatar.jpg`])
      await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("auth_id", userId)
      setAvatarUrl(null)
      toast.success("Foto profil dihapus.")
    } catch {
      toast.error("Gagal menghapus foto profil.")
    } finally {
      setUploading(false)
    }
  }

  // --- Password change ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter.")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.")
      return
    }
    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success("Password berhasil diperbarui.")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("Gagal memperbarui password. Coba lagi.")
    } finally {
      setChangingPassword(false)
    }
  }

  // --- Delete account ---
  const handleDeleteAccount = async () => {
    if (!deletePassword) return
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal menghapus akun')
      toast.success("Akun berhasil dihapus.")
      await supabase.auth.signOut()
      window.location.assign('/login')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus akun.')
      setDeletePassword("")
    } finally {
      setDeletingAccount(false)
    }
  }

  const resetDeleteState = () => {
    setDeletePassword("")
  }

  // --- Save handlers ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await supabase
        .from("profiles")
        .update({ name: profileName })
        .eq("auth_id", userId)
      toast.success("Profil akun berhasil diperbarui.")
    } catch {
      toast.error("Gagal memperbarui profil akun.")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return
    setSaving(true)
    try {
      const res = await fetch('/api/store/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          name: storeName,
          address,
          phone,
          receipt_footer: receiptFooter,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan')
      toast.success("Profil toko berhasil diperbarui.")
      setStore((prev) =>
        prev ? { ...prev, name: storeName, address, phone, receipt_footer: receiptFooter } : prev
      )
    } catch {
      toast.error("Gagal memperbarui profil toko. Pastikan Anda adalah pemilik toko.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePaymentMethod = async (method: string, value: boolean) => {
    const updated = { ...paymentMethods, [method]: value }
    setPaymentMethods(updated)
    if (!store) return
    try {
      const res = await fetch('/api/store/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          payment_methods: updated,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan')
      toast.success("Metode pembayaran diperbarui.")
    } catch {
      toast.error("Gagal memperbarui metode pembayaran. Pastikan Anda adalah pemilik toko.")
      setPaymentMethods(paymentMethods)
    }
  }

  const handleSaveStockThreshold = async () => {
    if (!store) return
    setSaving(true)
    try {
      const res = await fetch('/api/store/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          default_stock_threshold: defaultStockThreshold,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan')
      toast.success("Batasan stok berhasil diperbarui.")
    } catch {
      toast.error("Gagal memperbarui batasan stok. Pastikan Anda adalah pemilik toko.")
    } finally {
      setSaving(false)
    }
  }

  const tabTriggerClass =
    "rounded-xl shrink-0 h-11 px-5 justify-center gap-2 border-none! transition-all duration-200 data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:shadow-md text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"

  return (
    <div className="max-w-4xl mx-auto space-y-5 md:space-y-8 pb-24 md:pb-0">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Pengaturan</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Kelola profil akun, toko, dan preferensi Anda.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={safeActiveTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-row bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-1 gap-2 h-auto border-none shadow-none overflow-x-auto overflow-y-hidden no-scrollbar flex-nowrap justify-start">
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className={tabTriggerClass}>
              <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 md:mt-6 bg-card border border-border rounded-2xl p-4 md:p-7 shadow-sm">
          {/* ====== AKUN TAB ====== */}
          <TabsContent value="akun" className="mt-0 space-y-5 md:space-y-7">
            <SectionHeader
              icon={User}
              title="Profil Akun"
              description="Kelola informasi pribadi dan foto profil Anda."
            />

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 p-4 md:p-5 bg-muted/30 rounded-2xl border border-border/50">
              <div className="relative group">
                <UserAvatar name={profileName} avatarUrl={avatarUrl} size="xl" />
                {avatarUrl && (
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center sm:items-start gap-2 md:gap-3">
                <p className="text-sm font-medium text-foreground">Foto Profil</p>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadAvatar}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 md:h-10 rounded-xl gap-1.5 md:gap-2 text-xs md:text-sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    )}
                    {avatarUrl ? "Ganti Foto" : "Unggah Foto"}
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 md:h-10 rounded-xl gap-1.5 md:gap-2 text-xs md:text-sm text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={uploading}
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      Hapus
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Format JPG/PNG. Maksimal 2MB.</p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <FormField id="profileName" label="Nama Tampilan" helpText="Nama yang akan muncul di sidebar dan struk.">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="profileName"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Nama Anda"
                      className="h-12 rounded-xl bg-card border-border pl-10"
                    />
                  </div>
                </FormField>

                <FormField label="Email">
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={profileEmail}
                      disabled
                      className="h-12 rounded-xl bg-muted/50 border-border text-muted-foreground pl-10 cursor-not-allowed"
                    />
                  </div>
                </FormField>
              </div>

              <FormField label="Peran">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  <Badge
                    variant="outline"
                    className={
                      profileRole === "owner"
                        ? "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800 text-xs md:text-sm px-2.5 md:px-3 py-1 md:py-1.5 rounded-xl font-medium"
                        : "bg-zinc-100 dark:bg-zinc-800 text-muted-foreground border-border text-xs md:text-sm px-2.5 md:px-3 py-1 md:py-1.5 rounded-xl font-medium"
                    }
                  >
                    {profileRole === "owner" ? "Owner" : "Kasir"}
                  </Badge>
                  {profileRole === "owner" && (
                    <span className="text-xs text-muted-foreground">— Akses penuh ke semua fitur</span>
                  )}
                </div>
              </FormField>

              <div className="pt-2 md:pt-3 border-t border-border/50">
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-11 md:h-12 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-accent-blue-foreground w-full md:w-auto gap-2 text-sm"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Simpan Profil
                </Button>
              </div>
            </form>

            {/* ====== GANTI PASSWORD ====== */}
            <div className="pt-6 border-t border-border/50 space-y-4 md:space-y-5">
              <SectionHeader
                icon={Lock}
                title="Ganti Password"
                description="Perbarui kata sandi akun Anda."
              />

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField id="newPassword" label="Password Baru">
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        minLength={6}
                        className="h-12 rounded-xl bg-card border-border pl-10"
                      />
                    </div>
                  </FormField>

                  <FormField id="confirmPassword" label="Konfirmasi Password">
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        minLength={6}
                        className="h-12 rounded-xl bg-card border-border pl-10"
                      />
                    </div>
                  </FormField>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={changingPassword}
                    className="h-11 md:h-12 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-accent-blue-foreground gap-2 w-full md:w-auto text-sm"
                  >
                    {changingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Perbarui Password
                  </Button>
                </div>
              </form>
            </div>

            {/* ====== HAPUS AKUN ====== */}
            <div className="pt-6 border-t border-border/50 space-y-4 md:space-y-5">
              <SectionHeader
                icon={AlertTriangle}
                title="Hapus Akun"
                description="Hapus akun Anda secara permanen. Tindakan ini tidak dapat dibatalkan."
              />

              <div className="p-4 md:p-5 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <p className="font-semibold">Yang perlu diketahui:</p>
                    <ul className="list-disc list-inside text-xs space-y-0.5 opacity-80">
                      <li>Semua data pribadi dan akses akan dihapus</li>
                      <li>Data toko tetap tersimpan untuk pengguna lain</li>
                      {profileRole === "owner" && (
                        <li>Pastikan sudah ada owner lain sebelum menghapus akun</li>
                      )}
                    </ul>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      className="h-11 md:h-12 rounded-xl gap-2 w-full md:w-auto text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus Akun Saya
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        Konfirmasi Hapus Akun
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3 pt-2">
                        <p>Tindakan ini <strong>tidak dapat dibatalkan</strong>. Semua akses Anda akan dihapus permanen.</p>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-foreground">Masukkan password untuk konfirmasi</label>
                          <Input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Password Anda"
                            className="h-12 rounded-xl border-border"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel className="rounded-xl h-11" onClick={resetDeleteState}>
                        Batal
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="rounded-xl h-11 bg-red-600 hover:bg-red-700 text-white gap-2"
                        disabled={deletingAccount || !deletePassword}
                        onClick={handleDeleteAccount}
                      >
                        {deletingAccount ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                        {deletingAccount ? "Menghapus..." : "Hapus Akun Saya"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>

          {/* ====== PROFIL TOKO TAB ====== */}
          {profileRole === "owner" && (
          <TabsContent value="profil" className="mt-0 space-y-5 md:space-y-7">
            <SectionHeader
              icon={Building2}
              title="Profil Toko"
              description="Informasi toko yang akan ditampilkan di struk dan tagihan."
            />

            <form onSubmit={handleSaveStoreProfile} className="space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <FormField id="storeName" label="Nama Toko">
                  <div className="relative">
                    <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="storeName"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="SentraOps Store"
                      className="h-12 rounded-xl bg-card border-border pl-10"
                    />
                  </div>
                </FormField>

                <FormField id="phone" label="Telepon">
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0821..."
                      className="h-12 rounded-xl bg-card border-border pl-10"
                    />
                  </div>
                </FormField>
              </div>

              <FormField id="address" label="Alamat">
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jl. ..."
                    className="h-12 rounded-xl bg-card border-border pl-10"
                  />
                </div>
              </FormField>

              <FormField id="footer" label="Teks Footer Struk" helpText="Pesan yang muncul di bagian bawah setiap struk belanja.">
                <div className="relative">
                  <ScrollText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="footer"
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    placeholder="Terima kasih atas kunjungannya"
                    className="h-12 rounded-xl bg-card border-border pl-10"
                  />
                </div>
              </FormField>

              <div className="pt-2 border-t border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                <p className="text-xs text-muted-foreground">Perubahan akan langsung tersimpan di database.</p>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-11 md:h-12 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-accent-blue-foreground gap-2 w-full md:w-auto text-sm"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </TabsContent>
          )}

          {/* ====== METODE PEMBAYARAN TAB ====== */}
          <TabsContent value="pembayaran" className="mt-0 space-y-5 md:space-y-7">
            <SectionHeader
              icon={Wallet}
              title="Metode Pembayaran"
              description="Aktifkan atau nonaktifkan metode pembayaran yang tersedia di POS."
            />

            <div className="space-y-2 md:space-y-3">
              {/* Cash */}
              <div className="flex items-center justify-between p-4 md:p-5 border border-border rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Tunai</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Aktifkan pembayaran dengan uang tunai
                    </p>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.cash}
                  onCheckedChange={(v) => handleUpdatePaymentMethod("cash", v)}
                />
              </div>

              {/* QRIS */}
              <div className="flex items-center justify-between p-4 md:p-5 border border-border rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">QRIS (Xendit)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Aktifkan pembayaran via kode QR
                    </p>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.qris}
                  onCheckedChange={(v) => handleUpdatePaymentMethod("qris", v)}
                />
              </div>

              {/* WhatsApp */}
              <div className="flex items-center justify-between p-4 md:p-5 border border-border rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">WhatsApp Link</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Kirim tagihan via WhatsApp ke pelanggan
                    </p>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.whatsapp}
                  onCheckedChange={(v) => handleUpdatePaymentMethod("whatsapp", v)}
                />
              </div>

              {/* Piutang */}
              <div className="flex items-center justify-between p-4 md:p-5 border border-border rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 shrink-0">
                    <HandCoins className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Piutang / Tagihan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Izinkan pembayaran dicicil atau membuat tagihan untuk pelanggan
                    </p>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.piutang}
                  onCheckedChange={(v) => handleUpdatePaymentMethod("piutang", v)}
                />
              </div>
            </div>
          </TabsContent>

          {/* ====== BATASAN SISTEM TAB ====== */}
          <TabsContent value="batasan" className="mt-0 space-y-5 md:space-y-7">
            <SectionHeader
              icon={Settings2}
              title="Batasan Sistem"
              description="Atur ambang batas dan notifikasi untuk manajemen stok."
            />

            <div className="p-4 md:p-5 bg-muted/30 rounded-2xl border border-border/50 space-y-4 md:space-y-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl md:p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 shrink-0">
                  <PackageOpen className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="flex-1">
                  <FormField id="stockAlert" label="Batas Minimum Stok" helpText="Jika stok produk mencapai angka ini atau lebih rendah, status Low Stock akan aktif.">
                    <div className="flex items-center gap-3">
                      <Input
                        id="stockAlert"
                        type="number"
                        min={1}
                        value={defaultStockThreshold}
                        onChange={(e) =>
                          setDefaultStockThreshold(parseInt(e.target.value || "0"))
                        }
                        placeholder="5"
                        className="h-12 rounded-xl bg-card border-border max-w-35 md:max-w-40 text-center text-base md:text-lg font-semibold"
                      />
                      <span className="text-sm text-muted-foreground">unit</span>
                    </div>
                  </FormField>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                {defaultStockThreshold > 0
                  ? `Produk dengan stok ≤ ${defaultStockThreshold} unit akan ditandai kritis`
                  : "Batasan stok belum diatur"}
              </div>
              <Button
                onClick={handleSaveStockThreshold}
                disabled={saving}
                className="h-11 md:h-12 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-accent-blue-foreground gap-2 w-full md:w-auto text-sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan Batasan
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
