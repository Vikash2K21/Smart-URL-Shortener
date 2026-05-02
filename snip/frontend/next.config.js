/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Proxy all /api/* requests to Spring Boot on port 8080
        // This avoids CORS issues during local development
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "https://smart-url-shortener-a29p.onrender.com"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
