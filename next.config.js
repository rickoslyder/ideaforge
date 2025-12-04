/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use standalone output for Docker builds, not Vercel
  ...(process.env.BUILD_STANDALONE === "true" && { output: "standalone" }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

module.exports = nextConfig;
