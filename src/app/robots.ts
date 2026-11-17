import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // The share image lives under /api but must stay reachable for link previews.
    rules: [{ userAgent: "*", allow: ["/", "/api/og"], disallow: "/api/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
