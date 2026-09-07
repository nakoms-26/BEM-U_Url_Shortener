"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type NotificationType = "success" | "error" | "warning" | "info"
type NotificationPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"

interface Notification {
  id: string
  type: NotificationType
  title: string
  description?: React.ReactNode
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
}

const NotificationContext = React.createContext<NotificationContextType | null>(null)

export function useNotification() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a GlassNotificationProvider")
  }
  return context
}

export function GlassNotificationProvider({
  children,
  position = "bottom-right",
}: {
  children: React.ReactNode
  position?: NotificationPosition
}) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])

  const addNotification = React.useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setNotifications((prev) => [...prev, { ...notification, id }])
    if (notification.duration !== 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, notification.duration || 5000)
    }
  }, [])

  const removeNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <GlassNotificationContainer position={position} />
    </NotificationContext.Provider>
  )
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    accent: "border-l-emerald-500",
    iconColor: "text-emerald-400",
    bgIcon: "bg-emerald-500/10",
  },
  error: {
    icon: AlertCircle,
    accent: "border-l-red-500",
    iconColor: "text-red-400",
    bgIcon: "bg-red-500/10",
  },
  warning: {
    icon: AlertTriangle,
    accent: "border-l-amber-500",
    iconColor: "text-amber-400",
    bgIcon: "bg-amber-500/10",
  },
  info: {
    icon: Info,
    accent: "border-l-violet-500",
    iconColor: "text-violet-400",
    bgIcon: "bg-violet-500/10",
  },
}

const positionStyles: Record<NotificationPosition, string> = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
}

function GlassNotificationContainer({ position = "bottom-right" }: { position?: NotificationPosition }) {
  const { notifications, removeNotification } = useNotification()

  return (
    <div
      className={cn("fixed z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none", positionStyles[position])}
      role="region"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <GlassNotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

interface GlassNotificationItemProps {
  notification: Notification
  onClose: () => void
  style?: React.CSSProperties
  animationClass?: string
}

function GlassNotificationItem({ notification, onClose }: GlassNotificationItemProps) {
  const config = typeConfig[notification.type]
  const Icon = config.icon

  return (
    <div
      className="pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200"
      role="alert"
    >
      <div
        className={cn(
          "flex items-start gap-3 p-4 rounded-xl",
          "bg-white border border-slate-200 shadow-sm",
          "border-l-4",
          config.accent,
          "shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
        )}
      >
        <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0", config.bgIcon)}>
          <Icon className={cn("w-4 h-4", config.iconColor)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 text-sm">{notification.title}</h4>
          {notification.description && (
            <div className="mt-1 text-sm text-slate-500">{notification.description}</div>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// Standalone notification component (used via sonner toast.custom)
export function GlassNotification({
  type = "info",
  title,
  description,
  className,
}: {
  type?: NotificationType
  title: string
  description?: React.ReactNode
  className?: string
}) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl",
        "bg-white border border-slate-200 shadow-sm",
        "border-l-4",
        config.accent,
        "shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0", config.bgIcon)}>
        <Icon className={cn("w-4 h-4", config.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-900 text-sm">{title}</h4>
        {description && (
          <div className="mt-1 text-sm text-slate-500">{description}</div>
        )}
      </div>
    </div>
  )
}

export { GlassNotificationItem }
export type { NotificationPosition }
