"use client";

import { useSession } from "next-auth/react";

export function DebugSession() {
  const { data: session, status } = useSession();

  if (process.env.NODE_ENV === "development") {
    console.log("Client Session Status:", status);
    console.log("Client Session:", !!session);
  }

  return null;
}
