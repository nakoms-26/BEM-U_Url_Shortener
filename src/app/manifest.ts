import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BEM Unsoed — Portal & Shortener",
    short_name: "BEM Unsoed",
    description:
      "Portal URL Shortener, QR Code Generator & Kampanye Twibbon BEM Unsoed.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
