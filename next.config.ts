import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    /** Reduces dev-only UI that can trip RSC manifest errors when `.next` cache is corrupted. */
    devIndicators: false,
    /** Smaller, more stable lucide imports — helps dev chunk paths stay consistent. */
    experimental: {
        optimizePackageImports: ["lucide-react"],
        /** Avoids dev-only RSC manifest errors (`SegmentViewNode` missing) that break chunk loading (404 + text/plain). */
        devtoolSegmentExplorer: false,
    },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
        ],
    },
    async headers() {
        return [
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
