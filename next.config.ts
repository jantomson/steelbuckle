const nextConfig = {
  reactStrictMode: true,
  // Add this to disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure image domains for next/image
  images: {
    domains: ["localhost", "res.cloudinary.com", "steelbuckle.ee"],
    // Allow placeholder images for development
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Comment this out if you need API routes
  // output: "export",
};

export default nextConfig;
