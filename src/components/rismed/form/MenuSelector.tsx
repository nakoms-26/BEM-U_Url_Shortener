"use client";

import { MENU_OPTIONS, MenuType } from "@/lib/rismed/constants";
import { cn } from "@/lib/utils";
import { Palette, Globe, Video, ClipboardList } from "lucide-react";

const MenuIcon = ({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) => {
  switch (icon) {
    case "palette":
      return <Palette className={className} />;
    case "globe":
      return <Globe className={className} />;
    case "video":
      return <Video className={className} />;
    case "clipboard-list":
      return <ClipboardList className={className} />;
    default:
      return null;
  }
};

interface MenuSelectorProps {
  selectedMenu: MenuType | null;
  onSelectMenu: (menu: MenuType) => void;
}

export function MenuSelector({
  selectedMenu,
  onSelectMenu,
}: MenuSelectorProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Pilih Order</h2>
        <p className="text-muted-foreground text-sm">
          Pilih jenis order sesuai kebutuhan kamu.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
        {MENU_OPTIONS.map((menu) => (
          <button
            key={menu.id}
            type="button"
            onClick={() => onSelectMenu(menu.id)}
            className={cn(
              "flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all duration-200 ",
              "hover:border-primary hover:bg-primary/5 hover:shadow-md",
              selectedMenu === menu.id
                ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                : "border-black/45",
            )}
          >
            <MenuIcon
              icon={menu.icon}
              className="w-10 h-10 mb-3 text-primary"
            />
            <h3 className="font-semibold text-foreground mb-1">{menu.label}</h3>
            <p className="text-sm text-muted-foreground">{menu.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
