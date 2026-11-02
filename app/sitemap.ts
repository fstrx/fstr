import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // sitemaps need absolute urls; empty until NEXT_PUBLIC_SITE_URL is set
  if (!site.url) return [];
  return [{ url: site.url, lastModified: site.updated, changeFrequency: "monthly", priority: 1 }];
}
