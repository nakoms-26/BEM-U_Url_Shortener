
export const KEMENTERIAN_OPTIONS = [
    "Lingkar Presiden",
    "Biro Kesekretariatan",
    "Biro Keuangan",
    "Biro Pengembangan Sumber Daya Anggota",
    "Biro Pengendali & Penjamin Mutu",
    "Kementerian Pengembangan Sumber Daya Mahasiswa",
    "Kementerian Seni dan Olahraga",
    "Kementerian Prestasi dan Inovasi",
    "Kementerian Dalam Negeri",
    "Kementerian Luar Negeri",
    "Kementerian Pengabdian Masyarakat",
    "Kementerian Advokasi Kesejahteraan Mahasiswa",
    "Kementerian Aksi dan Propaganda",
    "Kementerian Analisis Isu Strategis",
    "Kementerian Pemberdayaan Perempuan",
    "Kementerian Media Kreatif dan Aplikatif",
    "Kementerian Media Komunikasi dan Informasi",
    "Kementerian Riset dan Data"
]

export const PLATFORM_OPTIONS = [
    "Instagram Feed",
    "X (Twitter)",
    "Instagram Story",
    "Whatsapp Channel",
    "Instagram Reels",
    "TikTok",
    "YouTube",
    "Spotify",
    "Repost"
]

export const WAKTU_PUBLIKASI_OPTIONS = [
    "10.00 (Feeds)",
    "12.00 (Reels & Tiktok)",
    "12.00 (Instagram Story)",
    "13.00 (Feeds)",
    "17.00 (Spotify & YouTube)",
    "18.00 (Reels & Tiktok)",
    "18.00 (Instagram Story)",
    "19.00 (Feeds)"
]

export const STATUS_OPTIONS = [
    { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
    { value: "in progress", label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
    { value: "under review", label: "Under Review", color: "bg-purple-100 text-purple-800" },
    { value: "ready", label: "Ready", color: "bg-green-100 text-green-800" },
    { value: "pause", label: "Pause", color: "bg-orange-100 text-orange-800" },
    { value: "cancel", label: "Cancel", color: "bg-red-100 text-red-800" }
] as const

// Jenis Menu/Layanan
export type MenuType = "desain_publikasi" | "website" | "bantuan_teknis" | "survey"

export const MENU_OPTIONS: { id: MenuType; label: string; description: string; icon: "palette" | "globe" | "video" | "clipboard-list" }[] = [
    { id: "desain_publikasi", label: "Desain & Publikasi", description: "Pemesanan desain grafis dan publikasi konten", icon: "palette" },
    { id: "website", label: "Laman Website", description: "Pemesanan Shortlink, Halaman website dan Twibbon", icon: "globe" },
    { id: "bantuan_teknis", label: "Bantuan Teknis", description: "Podcast, video, live instagram, dll", icon: "video" },
    { id: "survey", label: "Survey", description: "Publikasi survey/kuesioner", icon: "clipboard-list" },
]

// Jenis Bantuan Teknis
export const JENIS_BANTUAN_OPTIONS = [
    { id: "podcast", label: "Podcast", pj: "A" },
    { id: "take_video", label: "Take Konten Video", pj: "A" },
    { id: "live_instagram", label: "Live Instagram", pj: "B" },
    { id: "lainnya", label: "Lainnya (isi sendiri)", pj: "A" },
] as const

// ================================================================
// PJ (Penanggung Jawab) Mappings — FALLBACK DATA
// Source of truth: tabel `pj_mappings` di Supabase (dikelola via Admin Dashboard)
// Data di bawah ini digunakan sebagai fallback jika database tidak tersedia
// ================================================================

// PJ Desain Grafis berdasarkan kementerian pemesan (untuk menu Desain & Publikasi)
export const PJ_DESAIN_GRAFIS: Record<string, { nama: string; nomor: string }> = {
    "Lingkar Presiden": { nama: "Rosyid", nomor: "6289516552616" },
    "Biro Kesekretariatan": { nama: "Livia", nomor: "6289504858150" },
    "Biro Keuangan": { nama: "Dhina", nomor: "6285691140342" },
    "Biro Pengembangan Sumber Daya Anggota": { nama: "Kes", nomor: "62895362396200" },
    "Biro Pengendali & Penjamin Mutu": { nama: "Fira", nomor: "6288706691442" },
    "Kementerian Pengembangan Sumber Daya Mahasiswa": { nama: "Fira", nomor: "6288706691442" },
    "Kementerian Seni dan Olahraga": { nama: "Livia", nomor: "6289504858150" },
    "Kementerian Prestasi dan Inovasi": { nama: "Rahma", nomor: "6281392626815" },
    "Kementerian Dalam Negeri": { nama: "Isa", nomor: "6285727631992" },
    "Kementerian Luar Negeri": { nama: "Dhina", nomor: "6285691140342" },
    "Kementerian Pengabdian Masyarakat": { nama: "Rissa", nomor: "6281393665862" },
    "Kementerian Advokasi Kesejahteraan Mahasiswa": { nama: "Kynaa", nomor: "6289526269980" },
    "Kementerian Aksi dan Propaganda": { nama: "Kes", nomor: "62895362396200" },
    "Kementerian Analisis Isu Strategis": { nama: "Rahma", nomor: "6281392626815" },
    "Kementerian Pemberdayaan Perempuan": { nama: "Kynaa", nomor: "6289526269980" },
    "Kementerian Media Kreatif dan Aplikatif": { nama: "Rosyid", nomor: "6289516552616" },
    "Kementerian Media Komunikasi dan Informasi": { nama: "Rissa", nomor: "6281393665862" },
    "Kementerian Riset dan Data": { nama: "Isa", nomor: "6285727631992" },
}

// PJ Website berdasarkan kementerian pemesan
export const PJ_WEBSITE: Record<string, { nama: string; nomor: string }> = {
    "Lingkar Presiden": { nama: "Aufa", nomor: "6285947647645" },
    "Biro Kesekretariatan": { nama: "Aufa", nomor: "6285947647645" },
    "Biro Keuangan": { nama: "Aufa", nomor: "6285947647645" },
    "Biro Pengembangan Sumber Daya Anggota": { nama: "Najmi", nomor: "62816400771" },
    "Biro Pengendali & Penjamin Mutu": { nama: "Najmi", nomor: "62816400771" },
    "Kementerian Pengembangan Sumber Daya Mahasiswa": { nama: "Albert", nomor: "6281226895057" },
    "Kementerian Seni dan Olahraga": { nama: "Albert", nomor: "6281226895057" },
    "Kementerian Prestasi dan Inovasi": { nama: "Albert", nomor: "6281226895057" },
    "Kementerian Dalam Negeri": { nama: "Najmi", nomor: "62816400771" },
    "Kementerian Luar Negeri": { nama: "Najmi", nomor: "62816400771" },
    "Kementerian Pengabdian Masyarakat": { nama: "Najmi", nomor: "62816400771" },
    "Kementerian Advokasi Kesejahteraan Mahasiswa": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Aksi dan Propaganda": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Analisis Isu Strategis": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Pemberdayaan Perempuan": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Media Kreatif dan Aplikatif": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Media Komunikasi dan Informasi": { nama: "Bintang", nomor: "6285710205061" },
    "Kementerian Riset dan Data": { nama: "Bintang", nomor: "6285710205061" },
}

// ================================================================
// Struktur Kemenkoan & Biro BEM Unsoed 2026
// ================================================================
export const KEMENKO_GROUPS = [
    {
        id: "spi",
        name: "Satuan Pengawas Internal",
        shortName: "SPI",
        kementerian: [
            "Biro Pengembangan Sumber Daya Anggota",
            "Biro Pengendali & Penjamin Mutu"
        ]
    },
    {
        id: "sekjen",
        name: "Sekretaris Jenderal",
        shortName: "Sekjen",
        kementerian: [
            "Lingkar Presiden",
            "Biro Kesekretariatan",
            "Biro Keuangan"
        ]
    },
    {
        id: "polper",
        name: "Kemenko Polper",
        shortName: "Polper",
        kementerian: [
            "Kementerian Advokasi Kesejahteraan Mahasiswa",
            "Kementerian Pemberdayaan Perempuan",
            "Kementerian Aksi dan Propaganda",
            "Kementerian Analisis Isu Strategis"
        ]
    },
    {
        id: "pm",
        name: "Kemenko PM",
        shortName: "PM",
        kementerian: [
            "Kementerian Pengembangan Sumber Daya Mahasiswa",
            "Kementerian Prestasi dan Inovasi",
            "Kementerian Seni dan Olahraga"
        ]
    },
    {
        id: "respub",
        name: "Kemenko Respub",
        shortName: "Respub",
        kementerian: [
            "Kementerian Pengabdian Masyarakat",
            "Kementerian Dalam Negeri",
            "Kementerian Luar Negeri"
        ]
    },
    {
        id: "rismed",
        name: "Kemenko Rismed",
        shortName: "Rismed",
        kementerian: [
            "Kementerian Media Komunikasi dan Informasi",
            "Kementerian Media Kreatif dan Aplikatif",
            "Kementerian Riset dan Data"
        ]
    }
] as const

export const KEMENKO_NAMES = [
    "Satuan Pengawas Internal",
    "Sekretaris Jenderal",
    "Kemenko Polper",
    "Kemenko PM",
    "Kemenko Respub",
    "Kemenko Rismed"
] as const

export const KEMENTERIAN_TO_KEMENKO: Record<string, string> = {
    "Lingkar Presiden": "Sekretaris Jenderal",
    "Biro Kesekretariatan": "Sekretaris Jenderal",
    "Biro Keuangan": "Sekretaris Jenderal",
    "Biro Pengembangan Sumber Daya Anggota": "Satuan Pengawas Internal",
    "Biro Pengendali & Penjamin Mutu": "Satuan Pengawas Internal",
    "Kementerian Pengembangan Sumber Daya Mahasiswa": "Kemenko PM",
    "Kementerian Prestasi dan Inovasi": "Kemenko PM",
    "Kementerian Seni dan Olahraga": "Kemenko PM",
    "Kementerian Pengabdian Masyarakat": "Kemenko Respub",
    "Kementerian Dalam Negeri": "Kemenko Respub",
    "Kementerian Luar Negeri": "Kemenko Respub",
    "Kementerian Advokasi Kesejahteraan Mahasiswa": "Kemenko Polper",
    "Kementerian Pemberdayaan Perempuan": "Kemenko Polper",
    "Kementerian Aksi dan Propaganda": "Kemenko Polper",
    "Kementerian Analisis Isu Strategis": "Kemenko Polper",
    "Kementerian Media Komunikasi dan Informasi": "Kemenko Rismed",
    "Kementerian Media Kreatif dan Aplikatif": "Kemenko Rismed",
    "Kementerian Riset dan Data": "Kemenko Rismed"
}

// PJ Twibbon berdasarkan Kemenko
export const PJ_TWIBBON: Record<string, { nama: string; nomor: string }> = {
    "Satuan Pengawas Internal": { nama: "Najmi", nomor: "62816400771" },
    "Sekretaris Jenderal": { nama: "Aufa", nomor: "6285947647645" },
    "Kemenko Polper": { nama: "Bintang", nomor: "6285710205061" },
    "Kemenko PM": { nama: "Albert", nomor: "6281226895057" },
    "Kemenko Respub": { nama: "Najmi", nomor: "62816400771" },
    "Kemenko Rismed": { nama: "Bintang", nomor: "6285710205061" },
}

// PJ Bantuan Teknis
export const PJ_BANTUAN_TEKNIS: Record<"A" | "B", { nama: string; nomor: string }> = {
    "A": { nama: "Feli", nomor: "6285640447440" },  // Podcast, Video, Lainnya
    "B": { nama: "Wulan", nomor: "6287758922681" },  // Live Instagram
}

// PJ Survey
export const PJ_SURVEY: { nama: string; nomor: string } = {
    nama: "Fahmi",  // Ganti dengan nama PJ survey
    nomor: "6289630259393"  // Ganti dengan nomor PJ survey
}

// PJ Platform Khusus (untuk Desain & Publikasi)
export const PJ_PLATFORM_KHUSUS: Record<string, { nama: string; nomor: string; platforms: string[] }> = {
    "reels_tiktok": { nama: "Zahran", nomor: "6285880125168", platforms: ["Instagram Reels", "TikTok"] },
    "spotify": { nama: "Nashwa", nomor: "6287722540756", platforms: ["Spotify"] },
    "youtube": { nama: "Shava", nomor: "6285727194418", platforms: ["YouTube"] },
}

// PJ Publikasi (per hari)
export const PJ_PUBLIKASI: Record<string, { nama: string; nomor: string }> = {
    "Senin": { nama: "Dimas", nomor: "6289529284887" },
    "Selasa": { nama: "Calista", nomor: "6281388800395" },
}

// PJ Intern Desain Grafis (per kementerian & proker)
export const PJ_INTERN_DESAIN: Record<string, { nama: string; nomor: string; proker: string }[]> = {
    "Kementerian Media Kreatif dan Aplikatif": [
        { nama: "Maura", nomor: "62895396055600", proker: "Malaka" },
        { nama: "Racha", nomor: "6281226767725", proker: "Nulispedia" },
    ],
    "Kementerian Luar Negeri": [
        { nama: "Maura", nomor: "62895396055600", proker: "Media Partner" },
    ],
    "Kementerian Seni dan Olahraga": [
        { nama: "Racha", nomor: "6281226767725", proker: "Seniora Mengapresiasi" },
    ],
}

// PJ Intern Website (per kementerian & proker)
export const PJ_INTERN_WEBSITE: Record<string, { nama: string; nomor: string; proker: string }[]> = {
    "Kementerian Pengembangan Sumber Daya Mahasiswa": [
        { nama: "Ayisha", nomor: "628112022020", proker: "S.O.L.O" },
    ],
    "Kementerian Seni dan Olahraga": [
        { nama: "Ayisha", nomor: "628112022020", proker: "PORSOED" },
    ],
    "Kementerian Aksi dan Propaganda": [
        { nama: "Ayisha", nomor: "628112022020", proker: "Sekolah Politik Pergerakan" },
    ],
    "Kementerian Pengabdian Masyarakat": [
        { nama: "Naila Rona", nomor: "6282298233138", proker: "Desa Cita & Pesta Rakyat Soedirman" },
    ],
    "Biro Pengembangan Sumber Daya Anggota": [
        { nama: "Naila Rona", nomor: "6282298233138", proker: "Internship BEM Unsoed" },
    ],
    "Kementerian Pemberdayaan Perempuan": [
        { nama: "Naila Rona", nomor: "6282298233138", proker: "ALERTA: PEKA" },
    ],
}

// Periode Triwulan BEM Unsoed 2026
export type TriwulanKey = "1_periode" | "triwulan_1" | "triwulan_2" | "triwulan_3"

export const TRIWULAN_PERIODS: { key: TriwulanKey; label: string; shortLabel: string; startDate: string | null; endDate: string | null }[] = [
    { key: "1_periode", label: "1 Periode", shortLabel: "1 Periode", startDate: null, endDate: null },
    { key: "triwulan_1", label: "Triwulan 1", shortLabel: "TW 1", startDate: null, endDate: "2026-06-16" },
    { key: "triwulan_2", label: "Triwulan 2", shortLabel: "TW 2", startDate: "2026-06-17", endDate: "2026-09-25" },
    { key: "triwulan_3", label: "Triwulan 3", shortLabel: "TW 3", startDate: "2026-09-26", endDate: null },
]
