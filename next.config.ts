import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native SQL Server driver: load from node_modules at runtime instead of bundling.
  serverExternalPackages: ["mssql", "msnodesqlv8"],
  experimental: {
    // Admin uploads (PDFs up to 25 MB) go through server actions.
    serverActions: { bodySizeLimit: "30mb" },
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
