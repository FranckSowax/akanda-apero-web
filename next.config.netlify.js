/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.imgur.com', 'picsum.photos', 'placeholder.co'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.co',
      },
    ],
  },
  // Ajouter ces options pour aider avec le déploiement Netlify
  output: 'standalone',
  poweredByHeader: false,
  trailingSlash: false,
  productionBrowserSourceMaps: false
};

module.exports = nextConfig;
