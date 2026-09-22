"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Users2,
  Palette,
  Globe,
  ImageIcon,
  Video,
  ClipboardList,
  MonitorSmartphone,
  Megaphone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PJPageSkeleton } from "@/components/rismed/shared/Skeletons";
import {
  fetchPJContacts,
  fetchAllPJMappings,
  PJContact,
  PJMapping,
  PJ_CATEGORY_LABELS,
  PJCategory,
  DAYS_OF_WEEK,
} from "@/lib/rismed/pj";
import { KEMENKO_GROUPS } from "@/lib/rismed/constants";

// Category display config
const CATEGORY_CONFIG: Record<
  PJCategory,
  { icon: React.ReactNode; description: string }
> = {
  desain_grafis: {
    icon: <Palette className="w-5 h-5" />,
    description: "Pemesanan desain grafis dan publikasi konten",
  },
  website: {
    icon: <Globe className="w-5 h-5" />,
    description: "Pemesanan shortlink dan halaman website",
  },
  twibbon: {
    icon: <ImageIcon className="w-5 h-5" />,
    description: "Pemesanan platform twibbon",
  },
  bantuan_teknis: {
    icon: <Video className="w-5 h-5" />,
    description: "Podcast, video, live instagram, dll",
  },
  survey: {
    icon: <ClipboardList className="w-5 h-5" />,
    description: "Publikasi survey dan kuesioner",
  },
  platform_khusus: {
    icon: <MonitorSmartphone className="w-5 h-5" />,
    description: "Reels, TikTok, Spotify, YouTube",
  },
  publikasi: {
    icon: <Megaphone className="w-5 h-5" />,
    description: "Penugasan harian publikasi konten",
  },
  intern_desain: {
    icon: <Palette className="w-5 h-5" />,
    description: "PJ Desain Intern (per proker)",
  },
  intern_website: {
    icon: <Globe className="w-5 h-5" />,
    description: "PJ Website Intern (per proker)",
  },
};

// Order categories for display
const CATEGORY_ORDER: PJCategory[] = [
  "desain_grafis",
  "website",
  "twibbon",
  "bantuan_teknis",
  "survey",
  "platform_khusus",
  "publikasi",
  "intern_desain",
  "intern_website",
];

interface PJAssignment {
  contact: PJContact;
  lookupKey: string;
}

interface CategoryGroup {
  category: PJCategory;
  assignments: PJAssignment[];
}

export default function LihatPJPage() {
  const [contacts, setContacts] = useState<PJContact[]>([]);
  const [mappings, setMappings] = useState<PJMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [contactsData, mappingsData] = await Promise.all([
        fetchPJContacts(),
        fetchAllPJMappings(),
      ]);
      setContacts(contactsData);
      setMappings(mappingsData);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Build contact lookup
  const contactMap = useMemo(() => {
    const map = new Map<string, PJContact>();
    contacts.forEach((c) => map.set(c.id, c));
    return map;
  }, [contacts]);

  // Group mappings by category
  const categoryGroups: CategoryGroup[] = useMemo(() => {
    return CATEGORY_ORDER.map((category) => {
      const categoryMappings = mappings.filter(
        (m) => m.category === category && m.pj_id
      );

      const assignments: PJAssignment[] = categoryMappings
        .map((m) => {
          const contact =
            m.pj_contacts || (m.pj_id ? contactMap.get(m.pj_id) : null);
          if (!contact) return null;
          return { contact, lookupKey: m.lookup_key };
        })
        .filter(Boolean) as PJAssignment[];

      return { category, assignments };
    }).filter((g) => g.assignments.length > 0);
  }, [mappings, contactMap]);

  // Format phone number for WhatsApp link
  const formatWaLink = (nomor: string) => {
    const clean = nomor.replace(/\D/g, "");
    return `https://wa.me/${clean}`;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center">
        <div className="flex-1 container py-6 sm:py-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <PJPageSkeleton />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 container py-6 sm:py-10 px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link href="/app/rismed">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Form
            </Button>
          </Link>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20">
                <Users2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Daftar Penanggung Jawab (PJ)
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Hubungi PJ yang bertanggung jawab atas layanan yang kamu butuhkan
              melalui WhatsApp.
            </p>
          </div>
        </div>

        {/* Category Cards */}
        {categoryGroups.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Belum ada PJ yang ditugaskan</p>
            <p className="text-sm mt-1">
              Data PJ akan muncul setelah admin melakukan penugasan.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-5">
            {categoryGroups.map(({ category, assignments }) => {
              const config = CATEGORY_CONFIG[category];

              // Deduplicate contacts and group their lookup keys
              const contactGrouped = new Map<
                string,
                { contact: PJContact; keys: string[] }
              >();
              assignments.forEach(({ contact, lookupKey }) => {
                if (!contactGrouped.has(contact.id)) {
                  contactGrouped.set(contact.id, {
                    contact,
                    keys: [],
                  });
                }
                contactGrouped.get(contact.id)!.keys.push(lookupKey);
              });
              const uniqueContacts = Array.from(contactGrouped.values());

              return (
                <Card
                  key={category}
                  className="overflow-hidden border border-border/60"
                >
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/15 text-white">
                      {config.icon}
                    </div>
                    <div>
                      <h2 className="font-semibold text-base sm:text-lg text-white">
                        {PJ_CATEGORY_LABELS[category]}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/85">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      {uniqueContacts.map(({ contact, keys }) => (
                        <div
                          key={contact.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 px-4 sm:px-5 py-3 hover:bg-muted/40 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base text-foreground">
                              {contact.nama}
                            </p>
                            <ul className="mt-1 space-y-0.5">
                              {(category === "publikasi"
                                ? keys.filter((k) =>
                                    (DAYS_OF_WEEK as readonly string[]).includes(k)
                                  )
                                : category === "survey"
                                  ? ["Semua kementerian"]
                                  : category === "twibbon"
                                    ? keys.map((k) => {
                                        const group = KEMENKO_GROUPS.find((g) => g.name === k);
                                        return group
                                          ? `${k} (${group.kementerian.map((m) => m.replace("Kementerian ", "").replace("Biro ", "")).join(", ")})`
                                          : k;
                                      })
                                    : keys
                              ).map((item) => (
                                <li
                                  key={item}
                                  className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5"
                                >
                                  <span className="text-primary/60 shrink-0">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <a
                            href={formatWaLink(contact.nomor)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <Button
                              size="sm"
                              className="w-full sm:w-auto gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors text-xs sm:text-sm px-3 sm:px-4 cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Chat PJ
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
