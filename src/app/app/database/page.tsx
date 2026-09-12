import { cookies } from "next/headers";
import pool from "@/lib/db";
import DatabaseClient from "@/components/DatabaseClient";
import DatabaseSkeletonView from "@/components/DatabaseSkeletonView";
import { RowDataPacket } from "mysql2";
import {
  DATABASE_ACCESS_COOKIE_NAME,
  SUPER_ADMIN_COOKIE_NAME,
  hasDatabaseAccess,
} from "@/lib/admin-auth";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Database Link — BEM Unsoed",
  description: "Kelola database tautan pendek dan pantau statistik klik tautan BEM Unsoed.",
};

interface LinkRow extends RowDataPacket {
  id: string;
  lembaga: string | null;
  slug: string;
  url_asli: string | null;
  jumlah_klik: number | null;
  created_at: Date | string;
}

export default async function Database() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(DATABASE_ACCESS_COOKIE_NAME)?.value;
  const superCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)?.value;
  const isAuthed = hasDatabaseAccess(adminCookie, superCookie);

  // Jika belum login, tampilkan skeleton view
  if (!isAuthed) {
    return <DatabaseSkeletonView />;
  }

  try {
    const [rows] = await pool.query<LinkRow[]>(
      "SELECT id, lembaga, slug, url_asli, jumlah_klik, created_at FROM links ORDER BY created_at DESC"
    );

    const links = rows.map((row) => ({
      id: row.id,
      lembaga: row.lembaga,
      slug: row.slug,
      url_asli: row.url_asli,
      jumlah_klik: row.jumlah_klik,
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
    }));

    return (
      <div className="flex flex-col min-h-full px-6 py-4 md:py-6 max-w-md mx-auto w-full gap-5 pb-24">
        <DatabaseClient initialLinks={links} />
      </div>
    );
  } catch (error: any) {
    console.error("Gagal mengambil data dari MySQL:", error.message);
    return (
      <div className="text-slate-900 text-center mt-20">Gagal memuat data database.</div>
    );
  }
}
