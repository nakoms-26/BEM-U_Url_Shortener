"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface GasDriveResponse {
  success: boolean;
  data?: {
    path: string;
    folderName: string;
    folderUrl: string;
    folderId: string;
  };
  error?: string;
}

/**
 * Memanggil Webhook Google Apps Script untuk membuat folder Google Drive
 */
export async function triggerGasDriveWebhook(payload: {
  kementerian: string;
  tanggal_publikasi: string;
  waktu_publikasi: string;
  platform_publikasi: string[] | string;
}): Promise<GasDriveResponse> {
  const webhookUrl =
    process.env.GAS_DRIVE_WEBHOOK_URL || process.env.GAS_DRIVE_WEBHOOK_UR;

  if (!webhookUrl) {
    return {
      success: false,
      error: "GAS_DRIVE_WEBHOOK_URL belum dikonfigurasi di file .env server.",
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    const json: GasDriveResponse = await res.json();
    return json;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error triggering Google Apps Script webhook:", msg);
    return {
      success: false,
      error: `Gagal memanggil Google Apps Script: ${msg}`,
    };
  }
}

/**
 * Server Action: Otomatisasi pembuatan folder Google Drive untuk pesanan yang sudah ada di database
 */
export async function createDriveFolderForExistingOrder(orderId: string): Promise<{
  success: boolean;
  folderUrl?: string;
  error?: string;
}> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Pesanan tidak ditemukan" };
    }

    let platforms: string[] = [];
    if (Array.isArray(order.platformPublikasi)) {
      platforms = order.platformPublikasi as string[];
    } else if (typeof order.platformPublikasi === "string") {
      try {
        platforms = JSON.parse(order.platformPublikasi);
      } catch {
        platforms = order.platformPublikasi.split(",").map((s) => s.trim());
      }
    }

    const tanggalStr = order.tanggalPublikasi
      ? order.tanggalPublikasi.toISOString().split("T")[0]
      : "";

    const gasRes = await triggerGasDriveWebhook({
      kementerian: order.kementerian,
      tanggal_publikasi: tanggalStr,
      waktu_publikasi: order.waktuPublikasi || "10.00",
      platform_publikasi: platforms,
    });

    if (!gasRes.success || !gasRes.data?.folderUrl) {
      return {
        success: false,
        error: gasRes.error || "Gagal membuat folder via Google Apps Script",
      };
    }

    // Update link file konten di database dengan link folder yang baru dibuat
    await prisma.order.update({
      where: { id: orderId },
      data: {
        linkFileKonten: gasRes.data.folderUrl,
      },
    });

    revalidatePath("/app/rismed/admin");
    revalidatePath("/app/rismed/monitoring");

    return {
      success: true,
      folderUrl: gasRes.data.folderUrl,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
