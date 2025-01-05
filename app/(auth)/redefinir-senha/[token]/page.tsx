// app/(auth)/redefinir-senha/[token]/page.tsx

import { ResetPasswordForm } from "./reset-password-form";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getResetToken(token: string) {
  try {
    return { token };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const token = await getResetToken(resolvedParams.token);

  if (!token) {
    notFound();
  }

  return <ResetPasswordForm token={resolvedParams.token} />;
}
