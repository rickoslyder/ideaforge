/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use standalone output for Docker builds, not Vercel
  ...(process.env.BUILD_STANDALONE === "true" && { output: "standalone" }),
  // Disable trailing slash to prevent redirect issues with POST requests
  trailingSlash: false,
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
  async redirects() {
    return [
      {
        source: "/",
        destination: "/projects",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
