import reservedData from "@/lib/reserved-slugs.json";

const RESERVED_SET = new Set(
  (reservedData.all_reserved_slugs || []).map((s: string) => s.toLowerCase().trim())
);

/**
 * Mengecek apakah slug dilarang digunakan (path sistem / halaman WP bem-unsoed.com)
 */
export function isReservedSlug(slug: string): boolean {
  if (!slug) return false;
  return RESERVED_SET.has(slug.trim().toLowerCase());
}

/**
 * Mendapatkan daftar semua slug terlarang
 */
export function getAllReservedSlugs(): string[] {
  return reservedData.all_reserved_slugs || [];
}
