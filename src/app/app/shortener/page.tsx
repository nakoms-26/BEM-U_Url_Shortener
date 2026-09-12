import { cookies } from "next/headers";
import ShortLinkForm from "@/components/ShortLinkForm";
import {
  DATABASE_ACCESS_COOKIE_NAME,
  SUPER_ADMIN_COOKIE_NAME,
  hasDatabaseAccess,
} from "@/lib/admin-auth";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Buat Short Link — BEM Unsoed",
  description: "Persingkat URL panjang menjadi tautan pendek resmi BEM Unsoed.",
};

export default async function AppsShortener() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(DATABASE_ACCESS_COOKIE_NAME)?.value;
  const superCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)?.value;
  const isLoggedIn = hasDatabaseAccess(adminCookie, superCookie);

  return <ShortLinkForm initialIsLoggedIn={isLoggedIn} />;
}
