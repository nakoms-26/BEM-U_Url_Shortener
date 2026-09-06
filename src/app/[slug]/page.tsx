import pool from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    openGraph: {
      images: [],
    },
  };
}

// Tipe data untuk parameter
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface LinkRow extends RowDataPacket {
  url_asli: string;
  jumlah_klik: number;
}

export default async function RedirectPage({ params }: PageProps) {
  // 1. Tangkap parameter slug dari URL
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    // 2. Cari di database MySQL: apakah ada slug yang cocok?
    const [rows] = await pool.query<LinkRow[]>(
      "SELECT url_asli, jumlah_klik FROM links WHERE slug = ? LIMIT 1",
      [slug]
    );

    // 3. Jika data tidak ditemukan, tampilkan halaman 404
    if (!rows || rows.length === 0) {
      notFound();
    }

    const link = rows[0];

    // Update jumlah klik secara asinkron
    pool
      .query("UPDATE links SET jumlah_klik = jumlah_klik + 1 WHERE slug = ?", [
        slug,
      ])
      .catch((err) => {
        console.error("Gagal update klik:", err);
      });

    // 4. Jika data ditemukan, lakukan REDIRECT ke URL Asli
    redirect(link.url_asli);
  } catch (error) {
    // Re-throw NEXT_REDIRECT or NEXT_NOT_FOUND errors used by next/navigation
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest: string }).digest === "string" &&
      ((error as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
        (error as { digest: string }).digest.startsWith("NEXT_NOT_FOUND"))
    ) {
      throw error;
    }

    console.error("Database error:", error);
    notFound();
  }
}
