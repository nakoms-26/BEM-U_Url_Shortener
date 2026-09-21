"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { Order, OrderStatus } from "@/lib/rismed/types";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

interface PrismaOrderRecord {
  id: string;
  createdAt: Date;
  status: string;
  menuType: string;
  nama: string;
  kementerian: string;
  nomorWhatsapp: string;
  sudahBacaSop: boolean;
  isHidden: boolean;
  judulDesain: string | null;
  platformPublikasi: unknown;
  tanggalPublikasi: Date | null;
  waktuPublikasi: string | null;
  linkThumbnail: string | null;
  linkFileKonten: string | null;
  linkCaptionDocs: string | null;
  requestLagu: string | null;
  customShortlink: string | null;
  fiturTambahanWeb: string | null;
  linkDesainSelesai: string | null;
  statusPublikasi: unknown;
  websiteSubType: string | null;
  catatanWebsite: string | null;
  tujuanPemesanan: string | null;
  linkOriginal: string | null;
  linkPengajuanFitur: string | null;
  linkPendaftaranEvent: string | null;
  judulKampanye: string | null;
  namaUrlTwibbon: string | null;
  captionTwibbon: string | null;
  formatTwibbon: string | null;
  warnaChromaKey: string | null;
  tanggalPublikasiTwibbon: Date | null;
  linkAssetTwibbon: string | null;
  namaKegiatan: string | null;
  tanggalKegiatan: Date | null;
  waktuKegiatan: string | null;
  tempatKegiatan: string | null;
  jenisBantuan: string | null;
  jenisBantuanLainnya: string | null;
  judulSurvey: string | null;
  deskripsiSurvey: string | null;
  targetResponden: string | null;
  deadlineSurvey: Date | null;
  linkGdriveBrief: string | null;
  hadiahSurvey: string | null;
}

// Helper to format Prisma Order model back to the application's Order type (snake_case)
function formatOrder(dbOrder: PrismaOrderRecord): Order {
  return {
    id: dbOrder.id,
    created_at: dbOrder.createdAt ? new Date(dbOrder.createdAt).toISOString() : new Date().toISOString(),
    status: dbOrder.status as OrderStatus,
    menu_type: dbOrder.menuType,
    nama: dbOrder.nama,
    kementerian: dbOrder.kementerian,
    nomor_whatsapp: dbOrder.nomorWhatsapp,
    sudah_baca_sop: Boolean(dbOrder.sudahBacaSop),
    is_hidden: Boolean(dbOrder.isHidden),

    // Desain & Publikasi
    judul_desain: dbOrder.judulDesain || "",
    platform_publikasi: Array.isArray(dbOrder.platformPublikasi) 
      ? (dbOrder.platformPublikasi as string[])
      : (typeof dbOrder.platformPublikasi === 'string' ? JSON.parse(dbOrder.platformPublikasi) : []),
    tanggal_publikasi: dbOrder.tanggalPublikasi ? dbOrder.tanggalPublikasi.toISOString().split("T")[0] : "",
    waktu_publikasi: dbOrder.waktuPublikasi || "",
    link_thumbnail: dbOrder.linkThumbnail || "",
    link_file_konten: dbOrder.linkFileKonten || "",
    link_caption_docs: dbOrder.linkCaptionDocs || "",
    request_lagu: dbOrder.requestLagu || "",
    custom_shortlink: dbOrder.customShortlink || "",
    fitur_tambahan_web: dbOrder.fiturTambahanWeb || "",
    link_desain_selesai: dbOrder.linkDesainSelesai || "",
    status_publikasi: typeof dbOrder.statusPublikasi === "object" && dbOrder.statusPublikasi !== null 
      ? (dbOrder.statusPublikasi as Record<string, boolean>)
      : (typeof dbOrder.statusPublikasi === "string" ? JSON.parse(dbOrder.statusPublikasi || "{}") : {}),

    // Website & Twibbon
    website_sub_type: dbOrder.websiteSubType as "shortlink" | "laman_website" | "twibbon" | undefined,
    catatan_website: dbOrder.catatanWebsite || "",
    tujuan_pemesanan: dbOrder.tujuanPemesanan || "",
    link_original: dbOrder.linkOriginal || "",
    link_pengajuan_fitur: dbOrder.linkPengajuanFitur || "",
    link_pendaftaran_event: dbOrder.linkPendaftaranEvent || "",
    judul_kampanye: dbOrder.judulKampanye || "",
    nama_url_twibbon: dbOrder.namaUrlTwibbon || "",
    caption_twibbon: dbOrder.captionTwibbon || "",
    format_twibbon: dbOrder.formatTwibbon as "gambar" | "video" | undefined,
    warna_chroma_key: dbOrder.warnaChromaKey || "",
    tanggal_publikasi_twibbon: dbOrder.tanggalPublikasiTwibbon ? dbOrder.tanggalPublikasiTwibbon.toISOString().split("T")[0] : "",
    link_asset_twibbon: dbOrder.linkAssetTwibbon || "",

    // Bantuan Teknis
    nama_kegiatan: dbOrder.namaKegiatan || "",
    tanggal_kegiatan: dbOrder.tanggalKegiatan ? dbOrder.tanggalKegiatan.toISOString().split("T")[0] : "",
    waktu_kegiatan: dbOrder.waktuKegiatan || "",
    tempat_kegiatan: dbOrder.tempatKegiatan || "",
    jenis_bantuan: dbOrder.jenisBantuan as "podcast" | "take_video" | "live_instagram" | "lainnya",
    jenis_bantuan_lainnya: dbOrder.jenisBantuanLainnya || "",

    // Survey
    judul_survey: dbOrder.judulSurvey || "",
    deskripsi_survey: dbOrder.deskripsiSurvey || "",
    target_responden: dbOrder.targetResponden || "",
    deadline_survey: dbOrder.deadlineSurvey ? dbOrder.deadlineSurvey.toISOString().split("T")[0] : "",
    link_gdrive_brief: dbOrder.linkGdriveBrief || "",
    hadiah_survey: dbOrder.hadiahSurvey as "ada" | "tidak",
  } as Order;
}

// Fetch all orders
export async function getOrders(): Promise<{ data: Order[] | null; error: string | null }> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { data: (orders as unknown as PrismaOrderRecord[]).map(formatOrder), error: null };
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error fetching orders from MySQL:", msg);
    return { data: null, error: msg || "Failed to fetch orders" };
  }
}

// Create new order from client form
export async function createOrder(data: Record<string, unknown>): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    const dbData: Record<string, unknown> = {
      nama: String(data.nama || ""),
      kementerian: String(data.kementerian || ""),
      nomorWhatsapp: String(data.nomor_whatsapp || ""),
      sudahBacaSop: Boolean(data.sudah_baca_sop),
      menuType: String(data.menu_type || ""),
      status: "new",
      isHidden: false,
    };

    // Desain & Publikasi fields
    if (data.menu_type === "desain_publikasi") {
      dbData.judulDesain = String(data.judul_desain || "");
      dbData.platformPublikasi = Array.isArray(data.platform_publikasi) ? data.platform_publikasi : [];
      if (data.tanggal_publikasi) {
        dbData.tanggalPublikasi = new Date(String(data.tanggal_publikasi));
      }
      dbData.waktuPublikasi = String(data.waktu_publikasi || "");
      dbData.linkFileKonten = String(data.link_file_konten || "");
      dbData.linkCaptionDocs = String(data.link_caption_docs || "");
      dbData.requestLagu = data.request_lagu ? String(data.request_lagu) : null;
      dbData.statusPublikasi = {};
    }

    // Website fields
    if (data.menu_type === "website") {
      dbData.websiteSubType = data.website_sub_type ? String(data.website_sub_type) : null;
      dbData.tujuanPemesanan = data.tujuan_pemesanan ? String(data.tujuan_pemesanan) : null;
      dbData.linkOriginal = data.link_original ? String(data.link_original) : null;
      dbData.customShortlink = data.custom_shortlink ? String(data.custom_shortlink) : null;
      dbData.linkPengajuanFitur = data.link_pengajuan_fitur ? String(data.link_pengajuan_fitur) : null;
      dbData.linkPendaftaranEvent = data.link_pendaftaran_event ? String(data.link_pendaftaran_event) : null;
      dbData.catatanWebsite = data.catatan_website ? String(data.catatan_website) : null;

      // Twibbon specific fields
      dbData.judulKampanye = data.judul_kampanye ? String(data.judul_kampanye) : null;
      dbData.namaUrlTwibbon = data.nama_url_twibbon ? String(data.nama_url_twibbon) : null;
      dbData.captionTwibbon = data.caption_twibbon ? String(data.caption_twibbon) : null;
      dbData.formatTwibbon = data.format_twibbon ? String(data.format_twibbon) : null;
      dbData.warnaChromaKey = data.warna_chroma_key ? String(data.warna_chroma_key) : null;
      if (data.tanggal_publikasi_twibbon) {
        dbData.tanggalPublikasiTwibbon = new Date(String(data.tanggal_publikasi_twibbon));
      }
      dbData.linkAssetTwibbon = data.link_asset_twibbon ? String(data.link_asset_twibbon) : null;
    }

    // Bantuan Teknis fields
    if (data.menu_type === "bantuan_teknis") {
      dbData.namaKegiatan = String(data.nama_kegiatan || "");
      if (data.tanggal_kegiatan) {
        dbData.tanggalKegiatan = new Date(String(data.tanggal_kegiatan));
      }
      dbData.waktuKegiatan = String(data.waktu_kegiatan || "");
      dbData.tempatKegiatan = String(data.tempat_kegiatan || "");
      dbData.jenisBantuan = String(data.jenis_bantuan || "");
      dbData.jenisBantuanLainnya = data.jenis_bantuan_lainnya ? String(data.jenis_bantuan_lainnya) : null;
    }

    // Survey fields
    if (data.menu_type === "survey") {
      dbData.judulSurvey = String(data.judul_survey || "");
      dbData.deskripsiSurvey = String(data.deskripsi_survey || "");
      dbData.targetResponden = String(data.target_responden || "");
      if (data.deadline_survey) {
        dbData.deadlineSurvey = new Date(String(data.deadline_survey));
      }
      dbData.linkGdriveBrief = String(data.link_gdrive_brief || "");
      dbData.hadiahSurvey = String(data.hadiah_survey || "");
    }

    const created = await prisma.order.create({
      data: dbData as unknown as Prisma.OrderUncheckedCreateInput,
    });

    revalidatePath("/app/rismed/monitoring");
    revalidatePath("/app/rismed/admin");
    revalidatePath("/app/rismed/jadwal");
    revalidatePath("/app/rismed/statistik");

    return { success: true, data: formatOrder(created as unknown as PrismaOrderRecord) };
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error creating order in MySQL:", msg);
    return { success: false, error: msg || "Failed to create order" };
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    revalidatePath("/app/rismed/admin");
    revalidatePath("/app/rismed/monitoring");
    revalidatePath("/app/rismed/jadwal");
    return { success: true };
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error updating order status:", msg);
    return { success: false, error: msg };
  }
}

// Update arbitrary fields (e.g. link_desain_selesai, status_publikasi, is_hidden)
export async function updateOrder(orderId: string, fields: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: Record<string, unknown> = {};
    
    if (fields.status !== undefined) updateData.status = fields.status;
    if (fields.link_desain_selesai !== undefined) updateData.linkDesainSelesai = fields.link_desain_selesai;
    if (fields.status_publikasi !== undefined) updateData.statusPublikasi = fields.status_publikasi;
    if (fields.is_hidden !== undefined) updateData.isHidden = Boolean(fields.is_hidden);
    if (fields.tanggal_publikasi !== undefined) {
      updateData.tanggalPublikasi = fields.tanggal_publikasi ? new Date(String(fields.tanggal_publikasi)) : null;
    }
    if (fields.waktu_publikasi !== undefined) updateData.waktuPublikasi = fields.waktu_publikasi;
    if (fields.deadline_survey !== undefined) {
      updateData.deadlineSurvey = fields.deadline_survey ? new Date(String(fields.deadline_survey)) : null;
    }
    if (fields.tanggal_kegiatan !== undefined) {
      updateData.tanggalKegiatan = fields.tanggal_kegiatan ? new Date(String(fields.tanggal_kegiatan)) : null;
    }
    if (fields.waktu_kegiatan !== undefined) updateData.waktuKegiatan = fields.waktu_kegiatan;

    await prisma.order.update({
      where: { id: orderId },
      data: updateData as unknown as Prisma.OrderUpdateInput,
    });

    revalidatePath("/app/rismed/admin");
    revalidatePath("/app/rismed/monitoring");
    revalidatePath("/app/rismed/jadwal");
    return { success: true };
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error updating order:", msg);
    return { success: false, error: msg };
  }
}

// Delete an order
export async function deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.order.delete({
      where: { id: orderId },
    });
    revalidatePath("/app/rismed/admin");
    revalidatePath("/app/rismed/monitoring");
    revalidatePath("/app/rismed/jadwal");
    return { success: true };
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error deleting order:", msg);
    return { success: false, error: msg };
  }
}
