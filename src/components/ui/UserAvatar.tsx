"use client"

import { cn } from "@/lib/utils"

const avatarColors = [
  "bg-orange-500",
  "bg-teal-600",
  "bg-violet-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-fuchsia-500",
  "bg-cyan-600",
]

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function getColorFromName(name: string | null | undefined): string {
  if (!name) return avatarColors[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-24 w-24 text-2xl",
}

interface UserAvatarProps {
  name: string | null | undefined
  avatarUrl?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function UserAvatar({ name, avatarUrl, size = "md", className }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden shrink-0",
          sizeMap[size],
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={name || "User"}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative rounded-full shrink-0 flex items-center justify-center font-bold text-white select-none",
        getColorFromName(name),
        sizeMap[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
