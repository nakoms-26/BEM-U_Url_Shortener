"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Database, ContactRound, Link as LinkIcon, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", icon: Home, label: "Apps", href: "/app" },
  { id: "shortener", icon: LinkIcon, label: "Shortener", href: "/app/shortener" },
  { id: "qr", icon: QrCode, label: "QR Code", href: "/app/qrgenerator" },
  { id: "database", icon: Database, label: "Database", href: "/app/database" },
  { id: "contact", icon: ContactRound, label: "Contact", href: "/app/contact" },
];

export default function Dock() {
  const pathname = usePathname();
  const validPaths = navItems.map((item) => item.href);

  // Sembunyikan di halaman redirect [slug] dan 404
  if (pathname !== "/app" && !pathname.startsWith("/app/")) {
    return null;
  }

  return (
    <nav
      className={cn(
        "flex-shrink-0 flex items-stretch",
        "bg-white/95 backdrop-blur-sm",
        "border-t border-slate-200",
        // Safe area inset untuk notch/home indicator di iPhone modern
        "pb-[env(safe-area-inset-bottom,0px)]",
      )}
    >
      {navItems.map(({ id, icon: Icon, label, href }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={id}
            href={href}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center gap-1.5 pt-4 pb-6",
              "transition-colors duration-150 active:bg-slate-50",
              isActive ? "text-violet-700" : "text-slate-400",
            )}
          >
            <Icon
              className={cn(
                "w-[22px] h-[22px] transition-all duration-150",
              )}
              strokeWidth={isActive ? 2.25 : 1.75}
            />
            <span
              className={cn(
                "text-[10px] font-medium leading-none",
                isActive ? "text-violet-700" : "text-slate-400",
              )}
            >
              {label}
            </span>

            {/* Active indicator dot */}
            {isActive && (
              <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-px bg-violet-600 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
