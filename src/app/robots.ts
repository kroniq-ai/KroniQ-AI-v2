import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

const origin = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/project/", "/dev-access", "/sigma", "/api/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
