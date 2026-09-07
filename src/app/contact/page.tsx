import {
  GlassAvatar,
  GlassAvatarFallback,
  GlassAvatarImage,
} from "@/components/ui/glass-avatar";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { MessageCircle } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

export default function Contact() {
  return (
    <div className="flex h-full min-h-full items-center justify-center p-4 py-6">
      <div className="w-full max-w-xs">
        <GlassCard>
          <GlassCardHeader className="items-center text-center">
            <GlassAvatar className="h-20 w-20">
              <GlassAvatarImage src="/Adminn.jpg" alt="Admin" />
              <GlassAvatarFallback>NAKOMS</GlassAvatarFallback>
            </GlassAvatar>
            <GlassCardTitle className="mt-4">Developer & Admin</GlassCardTitle>
            <GlassCardDescription>
              <span className="font-semibold text-slate-700">
                Kementerian Media Komunikasi
              </span>
              <br />
              Direktorat Jenderal Website
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="text-center pb-6">
            <p className="text-slate-500 text-xs mb-4">
              Temukan bug atau ada pertanyaan? Hubungi kami melalui Instagram.
            </p>
            <GlassButton asChild variant="outline" className="w-full">
              <a
                href="https://www.instagram.com/nakomisme/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex gap-2 items-center"
              >
                <MessageCircle className="h-4! w-4!" /> Laporkan Kendala
              </a>
            </GlassButton>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
