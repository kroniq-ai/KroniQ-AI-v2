import type { MetadataRoute } from "next";
import { resolvePublicSiteOriginServer } from "@/lib/waitlist/public-site-url";

const base = resolvePublicSiteOriginServer();

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/project", "/api/"] },
        sitemap: `${base}/sitemap.xml`,
    };
}
