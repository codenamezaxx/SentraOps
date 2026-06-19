"use client"

import * as React from 'react'
import { Bell, CheckCheck, CreditCard, AlertTriangle, RefreshCw, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNotificationStore } from '@/lib/stores/notificationStore'
import type { Notification } from '@/lib/types'

const typeConfig = {
  payment: { icon: CreditCard, className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40' },
  stock: { icon: AlertTriangle, className: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40' },
  sync: { icon: RefreshCw, className: 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/40' },
} as const

export function NotificationBell() {
  const [open, setOpen] = React.useState(false)
  const [profileId, setProfileId] = React.useState<string | null>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const subscribed = React.useRef(false)

  const { notifications, unreadCount, setNotifications, addNotification, markAllReadOptimistic } = useNotificationStore()

  const [supabase] = React.useState(() => createClient())

  // Fetch profile to get store_id
  React.useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('auth_id', user.id)
        .single()
      if (data) {
        setProfileId(data.store_id)
      }
    }
    getProfile()
  }, [supabase])

  // Fetch initial notifications
  React.useEffect(() => {
    if (!profileId) return
    async function fetchNotifications() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('store_id', profileId)
        .order('created_at', { ascending: false })
        .limit(5)
      if (data) {
        setNotifications(data as Notification[])
      }
    }
    fetchNotifications()
  }, [profileId, supabase, setNotifications])

  // Realtime subscription for new notifications
  React.useEffect(() => {
    if (!profileId || subscribed.current) return
    subscribed.current = true

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `store_id=eq.${profileId}`,
        },
        (payload) => {
          addNotification(payload.new as Notification)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      subscribed.current = false
    }
  }, [profileId, supabase, addNotification])

  // Click outside to close
  React.useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleMarkAllRead = async () => {
    if (!profileId) return
    markAllReadOptimistic()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('store_id', profileId)
      .eq('is_read', false)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors active:scale-95 text-muted-foreground relative"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full ring-2 ring-card" />
        )}
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="fixed md:absolute inset-x-4 md:inset-x-auto md:right-0 top-20 md:top-12 z-50 md:w-80 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-border overflow-hidden animate-[fadeIn_0.15s_ease-out]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Notifikasi</h3>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
                <Bell className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Belum ada notifikasi</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.slice(0, 5).map((n) => {
                  const config = typeConfig[n.type] || typeConfig.sync
                  const Icon = config.icon
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                        !n.is_read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.className}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                          {new Date(n.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer action */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 border-t border-border transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Tandai Semua Telah Dibaca
            </button>
          )}
        </div>
      )}
    </div>
  )
}
