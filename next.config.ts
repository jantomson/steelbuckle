const nextConfig = {
  reactStrictMode: true,
  // Configure image domains for next/image
  images: {
    domains: ["localhost"],
    // Allow placeholder images for development
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Generate static exports for deployment
  output: "export",
  // Base path for deployment (if needed)
  // basePath: '/your-base-path',
};
