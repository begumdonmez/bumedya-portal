import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    poweredByHeader: false,
    compress: true,
    images: {
        formats: ["image/avif", "image/webp"],
        minimumCacheTTL: 60 * 60 * 24 * 7, // 7 gün
        deviceSizes: [640, 828, 1080, 1200],
        imageSizes: [16, 32, 64, 128, 256],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "dhvfdhgshstijdukupdg.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    experimental: {
        optimizePackageImports: ["lucide-react"],
    },
};

export default nextConfig;
