// next.config.mjs
import path from "path";
import { fileURLToPath } from "url";
import withPWAInit from "@ducanh2912/next-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  fallbacks: {
    document: "/~offline",
  },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "nextjs-static-assets",
          expiration: { maxEntries: 64 },
        },
      },
      {
        urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "external-unsplash-images",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
      {
        urlPattern: /\.(?:woff2?|eot|ttf|otf)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "web-fonts",
          expiration: { maxEntries: 10 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/",
        permanent: true,
      },
    ];
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
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://images.unsplash.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' ${process.env.NODE_ENV === 'development' ? "ws: http: https:" : ""}; frame-ancestors 'self';`
          }
        ]
      }
    ];
  }
};

export default withPWA(nextConfig);
