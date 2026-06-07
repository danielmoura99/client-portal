import type { NextConfig } from "next";

const securityHeaders = [
  // Impede que a página seja carregada em iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Impede que o browser faça sniffing do Content-Type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Controla quais informações de referência são enviadas
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Força HTTPS por 1 ano (incluindo subdomínios)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Restringe acesso a APIs sensíveis do browser
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    domains: ["f4lcvwpy5ew5wkhp.public.blob.vercel-storage.com"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
