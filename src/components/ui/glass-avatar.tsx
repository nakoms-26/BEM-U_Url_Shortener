"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

const GlassAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    /** @deprecated No longer used, kept for API compatibility */
    glowEffect?: boolean
  }
>(({ className, glowEffect: _glowEffect, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      "border border-slate-300",
      className,
    )}
    {...props}
  />
))
GlassAvatar.displayName = AvatarPrimitive.Root.displayName

const GlassAvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
))
GlassAvatarImage.displayName = AvatarPrimitive.Image.displayName

const GlassAvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full",
      "bg-slate-100 text-slate-700 text-sm font-medium",
      className,
    )}
    {...props}
  />
))
GlassAvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { GlassAvatar, GlassAvatarImage, GlassAvatarFallback }
