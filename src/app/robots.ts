import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/database/"],
      },
    ],
    sitemap: "https://unsoed.link/sitemap.xml",
  };
}
