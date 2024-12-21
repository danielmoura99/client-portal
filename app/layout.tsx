// app/layout.tsx
import "@/app/globals.css";
import { AuthProvider } from "@/components/providers/session-provider";

import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Mulish } from "next/font/google";

const mulish = Mulish({
  subsets: ["latin-ext"],
});

export const metadata: Metadata = {
  title: "Portal do Cliente - Traders House",
  description: "Portal do Cliente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${mulish.className} min-h-screen bg-black antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
