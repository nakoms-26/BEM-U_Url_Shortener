
import { MenuType } from "./constants";
export type { MenuType };

export type OrderStatus = 'new' | 'in progress' | 'under review' | 'ready' | 'pause' | 'cancel'

// Base order interface for database
export interface BaseOrder {
    id: string
    created_at: string
    status: OrderStatus
    menu_type: MenuType
    nama: string
    kementerian: string
    nomor_whatsapp: string
    sudah_baca_sop: boolean
    is_hidden?: boolean
}

// Desain & Publikasi order
export interface DesainPublikasiOrder extends BaseOrder {
    menu_type: "desain_publikasi"
    judul_desain: string
    platform_publikasi: string[]
    tanggal_publikasi: string
    waktu_publikasi: string
    link_file_konten: string
    link_caption_docs: string
    request_lagu?: string
    link_desain_selesai?: string
    status_publikasi?: Record<string, boolean>
}

// Website order
export interface WebsiteOrder extends BaseOrder {
    menu_type: "website"
    website_sub_type?: "shortlink" | "laman_website" | "twibbon"
    tujuan_pemesanan?: string
    link_original?: string
    custom_shortlink?: string
    link_pengajuan_fitur?: string
    link_pendaftaran_event?: string
    // Twibbon fields
    judul_kampanye?: string
    nama_url_twibbon?: string
    caption_twibbon?: string
    format_twibbon?: "gambar" | "video"
    warna_chroma_key?: string
    tanggal_publikasi_twibbon?: string
    link_asset_twibbon?: string
}

// Bantuan Teknis order
export interface BantuanTeknisOrder extends BaseOrder {
    menu_type: "bantuan_teknis"
    nama_kegiatan: string
    tanggal_kegiatan: string
    waktu_kegiatan: string
    tempat_kegiatan: string
    jenis_bantuan: "podcast" | "take_video" | "live_instagram" | "lainnya"
    jenis_bantuan_lainnya?: string
}

// Survey order
export interface SurveyOrder extends BaseOrder {
    menu_type: "survey"
    judul_survey: string
    deskripsi_survey: string
    target_responden: string
    deadline_survey: string
    link_gdrive_brief: string
    hadiah_survey: "ada" | "tidak"
}

// Union type for all orders
export type Order = DesainPublikasiOrder | WebsiteOrder | BantuanTeknisOrder | SurveyOrder

// Legacy Order type for backward compatibility
export interface LegacyOrder {
    id: string
    created_at: string
    status: OrderStatus
    nama: string
    kementerian: string
    nomor_whatsapp: string
    sudah_baca_sop: boolean
    judul_desain: string
    platform_publikasi: string[]
    tanggal_publikasi: string
    waktu_publikasi: string
    link_thumbnail?: string
    link_file_konten: string
    link_caption_docs: string
    request_lagu?: string
    custom_shortlink?: string
    fitur_tambahan_web?: string
    link_desain_selesai?: string
    is_hidden?: boolean
}
