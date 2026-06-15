"use client"

import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PasswordToggleProps {
  isVisible: boolean
  onToggle: (visible: boolean) => void
}

export default function PasswordToggle({ isVisible, onToggle }: PasswordToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
      onClick={() => onToggle(!isVisible)}
      aria-label={isVisible ? "Hide password" : "Show password"}
    >
      {isVisible ? (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Eye className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  )
}