import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["f4lcvwpy5ew5wkhp.public.blob.vercel-storage.com"],
    // Ou use uma abordagem mais genérica para todos os subdomínios do vercel-storage
    // domains: ['public.blob.vercel-storage.com'],
  },
};

export default nextConfig;
