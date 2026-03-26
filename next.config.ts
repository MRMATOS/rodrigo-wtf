import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // X-XSS-Protection deliberately omitted — deprecated header that can
  // introduce vulnerabilities in older browsers. CSP is the modern replacement.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  // HSTS: force HTTPS for 1 year, include subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // CSP: allowlist only known sources
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: Next.js inline scripts + Mapbox GL
      "script-src 'self' 'unsafe-inline' blob: https://api.mapbox.com",
      // Styles: inline (Tailwind/Next) + Mapbox GL CSS + Google Fonts
      "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com",
      // Fonts: Google Fonts + Mapbox
      "font-src 'self' https://fonts.gstatic.com https://api.mapbox.com",
      // Images: self + Supabase storage + Mapbox tiles + data URIs
      "img-src 'self' data: blob: https://*.supabase.co https://*.mapbox.com https://api.mapbox.com",
      // Connections: Supabase (REST + Realtime + Edge Functions) + Mapbox APIs
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://events.mapbox.com",
      // Workers: Mapbox GL uses Web Workers
      "worker-src 'self' blob:",
      // Frames: Google OAuth popup
      "frame-src https://accounts.google.com",
      // Prevent <base> tag hijacking
      "base-uri 'self'",
      // Block <form> submissions to foreign origins
      "form-action 'self'",
      // Force HTTPS on all sub-resource loads (prod only — breaks local IP dev on mobile)
      ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
