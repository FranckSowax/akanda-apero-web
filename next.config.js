/** @type {import('next').NextConfig} */
const path = require('path');

// Détection de l'environnement Netlify
const isNetlify = process.env.NETLIFY === 'true';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Ajoutez ici les fonctionnalités expérimentales si nécessaire
  },
  images: {
    domains: [
      'placeholder.co', 
      'picsum.photos', 
      'placehold.co', 
      'imgur.com', 
      'i.imgur.com', 
      'i.pravatar.cc',
      'images.unsplash.com',
      'source.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placeholder.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
    ],
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Utiliser un module vide pour les modules Node.js problématiques
    config.resolve.alias = {
      ...config.resolve.alias,
      'async_hooks': path.resolve(__dirname, './empty-module.js'),
      'http2': path.resolve(__dirname, './empty-module.js'),
      'dns': path.resolve(__dirname, './empty-module.js'),
      'net': path.resolve(__dirname, './empty-module.js'),
      'tls': path.resolve(__dirname, './empty-module.js'),
      'fs': path.resolve(__dirname, './empty-module.js'),
      'child_process': path.resolve(__dirname, './empty-module.js'),
      'worker_threads': path.resolve(__dirname, './empty-module.js'),
      'os': path.resolve(__dirname, './empty-module.js'),
      'perf_hooks': path.resolve(__dirname, './empty-module.js'),
    };
    
    if (!isServer) {
      // Pour le client (navigateur), désactiver les modules Node.js qui pourraient causer des problèmes
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'fs': false,
        'net': false,
        'tls': false,
        'perf_hooks': false,
        'child_process': false,
        'worker_threads': false,
        'tty': false,
        'os': false,
        'path': false,
        'stream': false,
        'crypto': false,
        'http': false,
        'https': false,
        'zlib': false,
        'util': false
      };
    }
    
    // Ignorer les erreurs spécifiques liées aux modules Node.js
    config.ignoreWarnings = [
      { module: /node_modules[\\/]@opentelemetry/ },
      { module: /node_modules[\\/]node-fetch/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { message: /Module not found: Error: Can't resolve 'async_hooks'/ }
    ];
    
    return config;
  },
};

// Optimisations spécifiques pour Netlify
if (isNetlify) {
  // Optimisations nécessaires pour le déploiement sur Netlify
  nextConfig.poweredByHeader = false;
  nextConfig.trailingSlash = false;
  nextConfig.productionBrowserSourceMaps = false;
  
  console.log('Configuration optimisée pour Netlify activée');
}

module.exports = nextConfig;
