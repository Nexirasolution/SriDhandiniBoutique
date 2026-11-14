/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve image files as-is: no server-side resizing/optimizer (no Vercel, no sharp load).
    // Upload images already compressed and sized (see notes).
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    // Only bundle the lucide icons actually used
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;