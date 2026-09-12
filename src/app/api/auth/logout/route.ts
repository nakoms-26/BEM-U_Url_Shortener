import { NextResponse } from "next/server";
import {
  DATABASE_ACCESS_COOKIE_NAME,
  SUPER_ADMIN_COOKIE_NAME,
} from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Berhasil keluar.",
  });

  response.cookies.set({
    name: DATABASE_ACCESS_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: SUPER_ADMIN_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}
