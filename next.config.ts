import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
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
