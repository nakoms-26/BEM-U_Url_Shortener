
import { z } from "zod"

// Base identity schema (shared across all forms)
export const identitySchema = z.object({
    nama: z.string().min(2, "Nama minimal 2 karakter"),
    kementerian: z.string().min(1, "Pilih kementerian"),
    nomor_whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid (min 10 digit)").max(15, "Nomor terlalu panjang"),
    sudah_baca_sop: z.boolean().refine((val) => val === true, {
        message: "Anda harus menyatakan sudah membaca SOP",
    }),
})

// Menu 1: Desain & Publikasi
export const desainPublikasiSchema = identitySchema.extend({
    menu_type: z.literal("desain_publikasi"),
    judul_desain: z.string().min(5, "Judul desain minimal 5 karakter"),
    platform_publikasi: z.array(z.string()).min(1, "Pilih minimal satu platform"),
    tanggal_publikasi: z.string().min(1, "Tanggal wajib diisi"),
    waktu_publikasi: z.string().min(1, "Waktu wajib diisi"),
    link_file_konten: z.string().min(1, "Wajib diisi (isi '-' jika tidak ada)"),
    link_caption_docs: z.string().min(1, "Wajib diisi (isi '-' jika tidak ada)"),
    request_lagu: z.string().optional(),
})

// Menu 2: Laman Website
export const websiteSchemaObject = identitySchema.extend({
    menu_type: z.literal("website"),
    website_sub_type: z.enum(["shortlink", "laman_website", "twibbon"]),
    // Shortlink fields
    tujuan_pemesanan: z.string().optional(),
    link_original: z.string().optional(),
    custom_shortlink: z.string().optional(),
    // Laman Website fields
    link_pengajuan_fitur: z.string().optional(),
    link_pendaftaran_event: z.string().optional(),
    // Twibbon fields
    judul_kampanye: z.string().optional(),
    nama_url_twibbon: z.string().optional(),
    caption_twibbon: z.string().optional(),
    format_twibbon: z.enum(["gambar", "video"]).optional(),
    warna_chroma_key: z.string().optional(),
    tanggal_publikasi_twibbon: z.string().optional(),
    link_asset_twibbon: z.string().optional(),
})

export const websiteSchema = websiteSchemaObject.superRefine((data, ctx) => {
    if (data.website_sub_type === "shortlink") {
        if (!data.tujuan_pemesanan || data.tujuan_pemesanan.length < 3) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tujuan pemesanan wajib diisi (min 3 karakter)", path: ["tujuan_pemesanan"] })
        }
    }
    if (data.website_sub_type === "laman_website") {
        if (!data.tujuan_pemesanan || data.tujuan_pemesanan.length < 3) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tujuan pemesanan wajib diisi (min 3 karakter)", path: ["tujuan_pemesanan"] })
        }
    }
    if (data.website_sub_type === "twibbon") {
        if (!data.judul_kampanye || data.judul_kampanye.length < 3) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Judul kampanye wajib diisi (min 3 karakter)", path: ["judul_kampanye"] })
        }
        if (!data.nama_url_twibbon || data.nama_url_twibbon.length < 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nama URL twibbon wajib diisi", path: ["nama_url_twibbon"] })
        }
        if (!data.caption_twibbon || data.caption_twibbon.length < 5) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Caption twibbon wajib diisi (min 5 karakter)", path: ["caption_twibbon"] })
        }
        if (!data.format_twibbon) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Format twibbon wajib dipilih", path: ["format_twibbon"] })
        }
        if (data.format_twibbon === "video" && (!data.warna_chroma_key || data.warna_chroma_key.length < 1)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Warna Chroma Key wajib diisi untuk format video", path: ["warna_chroma_key"] })
        }
        if (!data.tanggal_publikasi_twibbon || data.tanggal_publikasi_twibbon.length < 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tanggal publikasi twibbon wajib diisi", path: ["tanggal_publikasi_twibbon"] })
        }
        if (!data.link_asset_twibbon || data.link_asset_twibbon.length < 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Link asset twibbon wajib diisi", path: ["link_asset_twibbon"] })
        }
    }
})

// Menu 3: Bantuan Teknis
export const bantuanTeknisSchema = identitySchema.extend({
    menu_type: z.literal("bantuan_teknis"),
    nama_kegiatan: z.string().min(5, "Nama kegiatan minimal 5 karakter"),
    tanggal_kegiatan: z.string().min(1, "Tanggal wajib diisi"),
    waktu_kegiatan: z.string().min(1, "Waktu wajib diisi"),
    tempat_kegiatan: z.string().min(3, "Tempat kegiatan wajib diisi"),
    jenis_bantuan: z.enum(["podcast", "take_video", "live_instagram", "lainnya"]),
    jenis_bantuan_lainnya: z.string().optional(),
})

// Menu 4: Survey
export const surveySchema = identitySchema.extend({
    menu_type: z.literal("survey"),
    judul_survey: z.string().min(5, "Judul survey minimal 5 karakter"),
    deskripsi_survey: z.string().min(10, "Deskripsi minimal 10 karakter"),
    target_responden: z.string().min(3, "Target responden wajib diisi"),
    deadline_survey: z.string().min(1, "Deadline wajib diisi"),
    link_gdrive_brief: z.string().min(1, "Link G-Drive wajib diisi"),
    hadiah_survey: z.enum(["ada", "tidak"]),
})

// Union type for all forms
export const orderFormSchema = z.discriminatedUnion("menu_type", [
    desainPublikasiSchema,
    websiteSchemaObject,
    bantuanTeknisSchema,
    surveySchema,
])

// Legacy schema for backward compatibility
export const legacyOrderFormSchema = z.object({
    nama: z.string().min(2, "Nama minimal 2 karakter"),
    kementerian: z.string().min(1, "Pilih kementerian"),
    nomor_whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid (min 10 digit)").max(15, "Nomor terlalu panjang"),
    sudah_baca_sop: z.boolean().refine((val) => val === true, {
        message: "Anda harus menyatakan sudah membaca SOP",
    }),
    judul_desain: z.string().min(5, "Judul desain minimal 5 karakter"),
    platform_publikasi: z.array(z.string()).min(1, "Pilih minimal satu platform"),
    tanggal_publikasi: z.string().min(1, "Tanggal wajib diisi"),
    waktu_publikasi: z.string().min(1, "Waktu wajib diisi"),
    link_thumbnail: z.string().optional(),
    link_file_konten: z.string().min(1, "Wajib diisi (isi '-' jika tidak ada)"),
    link_caption_docs: z.string().min(1, "Wajib diisi (isi '-' jika tidak ada)"),
    request_lagu: z.string().optional(),
    custom_shortlink: z.string().optional(),
    fitur_tambahan_web: z.string().optional(),
})

export type IdentityFormValues = z.infer<typeof identitySchema>
export type DesainPublikasiFormValues = z.infer<typeof desainPublikasiSchema>
export type WebsiteFormValues = z.infer<typeof websiteSchema>
export type BantuanTeknisFormValues = z.infer<typeof bantuanTeknisSchema>
export type SurveyFormValues = z.infer<typeof surveySchema>
export type OrderFormValues = z.infer<typeof orderFormSchema>
export type LegacyOrderFormValues = z.infer<typeof legacyOrderFormSchema>
