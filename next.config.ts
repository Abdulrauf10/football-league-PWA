import type { NextConfig } from "next";
import withPWA from 'next-pwa'

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

const pwaConfig = withPWA({
  dest: 'public', // Destination directory for PWA files (e.g., service worker, manifest)
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development mode
  register: true, // Register the service worker
  skipWaiting: true, // Activate the new service worker immediately
})

export default pwaConfig(nextConfig);
