import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    // only advertise a sitemap once a real domain is configured
    ...(site.url ? { sitemap: new URL("/sitemap.xml", site.url).toString() } : {}),
  };
}
