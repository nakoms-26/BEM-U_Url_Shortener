"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { X, Users2, ImageIcon, BarChart3, Sparkles, ArrowRight } from "lucide-react"

interface UpdateItem {
    icon: typeof Users2
    text: ReactNode
    subText?: string
    color: string
    bg: string
    href?: string
    buttonLabel?: string
}

const UPDATE_ITEMS: UpdateItem[] = [
    {
        icon: Users2,
        text: "Lihat list PJ dan langsung bisa chat lewat tombol",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        href: "/app/rismed/pj",
        buttonLabel: "Lihat PJ",
    },
    {
        icon: BarChart3,
        text: "Lihat tab statistik",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        href: "/app/rismed/statistik",
        buttonLabel: "Lihat Statistik",
    },
    {
        icon: ImageIcon,
        text: <>Form pemesanan Twibbon yang akan dipublikasi di <a href="https://twibbon.bem-unsoed.com" target="_blank" rel="noopener noreferrer" className="font-bold underline text-purple-500 italic">twibbon.bem-unsoed.com</a></>,
        subText: "Pesan melalui section Pemesanan Website",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
]

const AUTO_CLOSE_MS = 10000

export function UpdatePopup() {
    const [isVisible, setIsVisible] = useState(true)
    const [isClosing, setIsClosing] = useState(false)
    const [progress, setProgress] = useState(100)
    const router = useRouter()

    const handleClose = useCallback(() => {
        setIsClosing(true)
        setTimeout(() => setIsVisible(false), 300)
    }, [])

    const handleNavigate = (href: string) => {
        handleClose()
        setTimeout(() => router.push(href), 300)
    }

    // Auto-close countdown
    useEffect(() => {
        if (!isVisible || isClosing) return

        const startTime = Date.now()
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime
            const remaining = Math.max(0, 100 - (elapsed / AUTO_CLOSE_MS) * 100)
            setProgress(remaining)

            if (remaining <= 0) {
                clearInterval(interval)
                handleClose()
            }
        }, 50)

        return () => clearInterval(interval)
    }, [isVisible, isClosing, handleClose])

    if (!isVisible) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"
                    }`}
                onClick={handleClose}
            />

            {/* Popup */}
            <div
                className={`fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md transition-all duration-300 ${isClosing
                    ? "opacity-0 scale-95"
                    : "opacity-100 scale-100 animate-in zoom-in-95 fade-in duration-400"
                    }`}
            >
                <div className="relative bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
                    {/* Progress bar (auto-close countdown) */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                        <div
                            className="h-full bg-primary transition-all duration-100 ease-linear rounded-r-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">
                                Yang Baru!
                            </h3>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Tutup"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-5 pb-5 space-y-2.5">
                        {UPDATE_ITEMS.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                    }}
                                >
                                    <div className={`shrink-0 p-2 rounded-lg ${item.bg}`}>
                                        <Icon className={`w-4 h-4 ${item.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground/90 leading-relaxed">
                                            {item.text}
                                        </p>
                                        {item.subText && (
                                            <p className="text-xs text-muted-foreground mt-1 italic">
                                                {item.subText}
                                            </p>
                                        )}
                                        {item.href && item.buttonLabel && (
                                            <button
                                                onClick={() => handleNavigate(item.href!)}
                                                className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${item.bg} ${item.color} hover:opacity-80 transition-opacity`}
                                            >
                                                {item.buttonLabel}
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Footer hint */}
                    <div className="px-5 pb-4">
                        <p className="text-xs text-muted-foreground text-center">
                            Otomatis tertutup dalam beberapa detik
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
