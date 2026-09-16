import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // This is a monorepo. Explicitly pin the root so Next does not walk up to
    // an unrelated lockfile in the user profile and fail on restricted paths.
    root: path.resolve(__dirname, '..'),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://images.unsplash.com https://res.cloudinary.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' ${process.env.NODE_ENV === 'development' ? "ws: http: https:" : ""}; frame-ancestors 'self';`
          }
        ]
      }
    ];
  }
};

export default nextConfig;
