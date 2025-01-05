// app/(auth)/redefinir-senha/[token]/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redefinir Senha",
  description: "Redefina sua senha",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
