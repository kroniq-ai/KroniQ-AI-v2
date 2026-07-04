import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    outputFileTracingRoot: path.join(__dirname),
    /** Reduces dev-only UI that can trip RSC manifest errors when `.next` cache is corrupted. */
    devIndicators: false,
    compress: true,
    /** Smaller, more stable client chunks for icon/motion heavy UI. */
    experimental: {
        optimizePackageImports: ["lucide-react", "framer-motion"],
        devtoolSegmentExplorer: false,
    },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
            { protocol: "https", hostname: "kikxai.netlify.app", pathname: "/**" },
        ]
    },
    async headers() {
        return [
            /* Public root `favicon.ico` is a PNG; correct MIME helps Google and browsers (ico extension, PNG content). */
            {
                source: "/favicon.ico",
                headers: [
                    { key: "Content-Type", value: "image/png" },
                    { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
                ],
            },
            {
                source: "/:path*",
                headers: [
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
