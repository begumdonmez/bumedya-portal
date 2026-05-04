import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        formats: ["image/avif", "image/webp"],
        minimumCacheTTL: 60 * 60 * 24 * 7, // 7 gün
        remotePatterns: [
            {
                protocol: "https",
                hostname: "dhvfdhgshstijdukupdg.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
};

export default nextConfig;
