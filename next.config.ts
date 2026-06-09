import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Mengizinkan akses HMR dari IP lokal untuk scan QR via HP
  allowedDevOrigins: ["192.168.1.5"],
};

export default nextConfig;
