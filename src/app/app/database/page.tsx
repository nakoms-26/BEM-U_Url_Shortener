import { cookies } from "next/headers";
import pool from "@/lib/db";
import DatabaseClient from "@/components/DatabaseClient";
import { RowDataPacket } from "mysql2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LinkRow extends RowDataPacket {
  id: string;
  lembaga: string | null;
  slug: string;
  url_asli: string | null;
  jumlah_klik: number | null;
  created_at: Date | string;
}

export default async function Database() {

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
      <div className="p-4 py-6">
        <DatabaseClient initialLinks={links} />
      </div>
    );
  } catch (error: any) {
    console.error("Gagal mengambil data dari MySQL:", error.message);
    return (
      <div className="text-slate-900 text-center mt-20">Gagal memuat data.</div>
    );
  }
}
