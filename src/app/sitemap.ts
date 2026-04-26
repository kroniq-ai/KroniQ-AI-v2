import type { MetadataRoute } from "next";
import { resolvePublicSiteOriginServer } from "@/lib/waitlist/public-site-url";

const base = resolvePublicSiteOriginServer();

/** Minimal sitemap for the marketing / waitlist site. */
export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();
    const paths = ["", "/about", "/privacy", "/terms", "/cto", "/sigma"];
    const routes = paths.map((path) => ({
        url: `${base}${path}`,
        lastModified,
        changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
        priority: path === "" ? 1 : path === "/about" ? 0.75 : 0.55,
    }));
    return routes;
}
