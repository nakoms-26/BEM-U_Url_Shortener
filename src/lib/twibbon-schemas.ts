import { z } from "zod";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export interface TwibbonItem {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  type: "IMAGE" | "VIDEO";
  overlayFile: string;
  thumbnail: string;
  config: {
    overlayType?: "IMAGE" | "VIDEO";
    chromaKey?: {
      color?: string;
      similarity?: number;
      smoothness?: number;
    } | null;
    canvasSize?: {
      width: number;
      height: number;
    };
  } | any;
  isActive: boolean;
  downloadsCount: number;
  createdAt: string;
  updatedAt: string;
}

export const twibbonBaseSchema = z.object({
  title: z
    .string()
    .min(3, "Judul minimal 3 karakter")
    .max(255, "Judul maksimal 255 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .max(100, "Slug maksimal 100 karakter")
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "Slug hanya boleh berisi huruf, angka, dan strip (-)"
    ),
  description: z.string().optional().nullable(),
  type: z.enum(["IMAGE", "VIDEO"], {
    required_error: "Tipe harus IMAGE atau VIDEO",
  }),
  chromaColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format warna HEX tidak valid (contoh: #00FF00)")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
});

export const createTwibbonApiSchema = twibbonBaseSchema.extend({
  layerUrl: z.string().url("URL layer frame tidak valid"),
  thumbnailUrl: z.string().url("URL thumbnail tidak valid"),
  password: z.string().min(1, "Password admin wajib diisi"),
});

export const updateTwibbonApiSchema = twibbonBaseSchema.extend({
  id: z.coerce.number().min(1, "ID twibbon tidak valid"),
  layerUrl: z.string().url("URL layer frame tidak valid").optional().nullable(),
  thumbnailUrl: z.string().url("URL thumbnail tidak valid").optional().nullable(),
  password: z.string().min(1, "Password admin wajib diisi"),
});

export const deleteTwibbonApiSchema = z.object({
  id: z.coerce.number().min(1, "ID twibbon tidak valid"),
  slug: z.string().min(1, "Slug wajib diisi"),
  confirmationSlug: z.string().min(1, "Konfirmasi slug wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});
