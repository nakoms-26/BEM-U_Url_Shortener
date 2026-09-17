export const SHORT_LINK_BASE_URL =
  process.env.NEXT_PUBLIC_SHORT_LINK_BASE_URL || "https://bem-unsoed.com";

/**
 * Menghasilkan URL lengkap shortlink, misal: https://bem-unsoed.com/slug
 */
export function getShortUrl(slug: string): string {
  const base = SHORT_LINK_BASE_URL.replace(/\/+$/, "");
  const cleanSlug = (slug || "").replace(/^\/+/, "");
  return cleanSlug ? `${base}/${cleanSlug}` : base;
}

/**
 * Menghasilkan tampilan URL shortlink tanpa protokol https://, misal: bem-unsoed.com/slug
 */
export function getShortDisplayUrl(slug: string): string {
  return getShortUrl(slug).replace(/^https?:\/\//, "");
}

/**
 * Menghasilkan nama domain dasar shortlink, misal: bem-unsoed.com
 */
export function getShortDomain(): string {
  return SHORT_LINK_BASE_URL.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}
