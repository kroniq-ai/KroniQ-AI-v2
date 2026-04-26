import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo/site";

/** Sitemap: real URLs only (no URL fragments; sections are in JSON-LD + on-page content). */
const ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] =
  [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.9 },
    { path: "/cto", changeFrequency: "monthly", priority: 0.78 },
    { path: "/login", changeFrequency: "monthly", priority: 0.5 },
    { path: "/signup", changeFrequency: "monthly", priority: 0.55 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  ];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: path === "" ? absUrl("/") : absUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
