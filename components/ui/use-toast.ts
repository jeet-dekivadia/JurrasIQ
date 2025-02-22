import type React from "react"
// Simplified version of the use-toast hook
import { useState } from "react"

type Toast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  return {
    toasts,
    toast: (props: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9)
      setToasts((prev) => [...prev, { ...props, id }])
    },
    dismiss: (id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    },
  }
}

