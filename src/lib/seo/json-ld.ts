import { kroniqAppIconPath } from "@/lib/brand/kroniq-assets";
import { absUrl, getSiteUrl, siteName, siteTagline, defaultDescription, SITEMAP_LANDING_ROUTES } from "@/lib/seo/site";

const CTX = "https://schema.org" as const;

/**
 * One JSON-LD @graph for the root layout: Organization, WebSite, SoftwareApplication,
 * ItemList (sitelink / navigation intent), and JoinAction to the waitlist.
 * (Google’s actual sitelinks are algorithmic; this encodes the same information clearly.)
 */
export function buildRootJsonLd() {
  const siteUrl = getSiteUrl();
  const orgId = `${siteUrl}#organization`;
  const siteId = `${siteUrl}#website`;

  const logoUrl = absUrl(kroniqAppIconPath);
  const fromList = process.env.NEXT_PUBLIC_SAME_AS_SOCIALS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const discord = process.env.NEXT_PUBLIC_DISCORD_URL?.trim();
  const sameAs =
    fromList && fromList.length > 0
      ? fromList
      : discord
        ? [discord]
        : undefined;

  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": orgId,
    name: siteName,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
    },
    description:
      "Autonomous AI CMO for founder-led growth — outreach, content, leads, and follow-up from one shared mission context.",
    parentOrganization: { "@type": "Organization", name: "XYZ Intelligence" },
  };
  if (sameAs?.length) org.sameAs = sameAs;

  const site: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": siteId,
    name: siteName,
    alternateName: `${siteName} | ${siteTagline}`,
    url: siteUrl,
    description: defaultDescription,
    inLanguage: "en-CA",
    isAccessibleForFree: true,
    publisher: { "@id": orgId },
    potentialAction: {
      "@type": "RegisterAction",
      name: "Join the KroniQ waitlist",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absUrl("/#waitlist"),
      },
    },
  };

  const app: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description: `${siteName} — ${siteTagline}. Outreach, content, leads, and follow-up from one mission context. Private beta.`,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
    },
  };

  const listItems = SITEMAP_LANDING_ROUTES.map((r, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: r.name,
    item: {
      "@type": "WebPage",
      name: r.name,
      description: r.description,
      url: absUrl(r.path),
      isPartOf: { "@id": siteId },
      inLanguage: "en-CA",
    },
  }));

  const mainNav: Record<string, unknown> = {
    "@type": "ItemList",
    "@id": `${siteUrl}#sitenavigation`,
    name: `${siteName} — key pages and sections`,
    numberOfItems: listItems.length,
    itemListElement: listItems,
  };

  return {
    "@context": CTX,
    "@graph": [org, site, app, mainNav],
  };
}
