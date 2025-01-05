// components/require-role.tsx
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RequireRole({ children, allowedRoles }: RequireRoleProps) {
  const { data: session } = useSession();

  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  return <>{children}</>;
}
