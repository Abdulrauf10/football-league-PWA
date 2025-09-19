# ⚽ Football League PWA (Next.js 15)

A **Progressive Web App (PWA)** built with Next.js 15 and [next-pwa](https://github.com/shadowwalker/next-pwa).  
Supports **offline caching**, **installation to mobile/desktop**, and a **custom app manifest**.

🔗 **Live Demo:** [football-league-pwa.vercel.app](https://football-league-pwa.vercel.app/)

---

## 🚀 Getting Started

### 1. Install dependencies
npm install next-pwa
# or
yarn add next-pwa

### 2. Configure next.config.ts
import withPWA from "next-pwa";
import type { NextConfig } from "next";

const withPwa = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPwa(nextConfig);

### 3. Add TypeScript support
types/next-pwa.d.ts

declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAOptions = {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    buildExcludes?: string[];
    [key: string]: any;
  };

  export default function withPWA(
    options: PWAOptions
  ): (config: NextConfig) => NextConfig;
}

Update tsconfig.json:
"include": [
  "next-env.d.ts",
  "**/*.ts",
  "**/*.tsx",
  ".next/types/**/*.ts",
  "types/**/*.d.ts"
]


### 4. Create manifest.webmanifest
{
  "name": "Football League PWA",
  "short_name": "FootballLeague",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0d47a1",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

### 5. Add icons
public/
 ├── manifest.json
 └── icons/
     ├── icon-192x192.png
     └── icon-512x512.png

### 6. Configure metadata in app/layout.tsx
export const metadata: Metadata = {
  title: "Football League PWA",
  description: "A Next.js 15 Progressive Web App for football fans",
  manifest: "/manifest.webmanifest",
  themeColor: "#0d47a1",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/icons/icon-192x192.png"
  }
};

### 7. Run locally
npm run dev