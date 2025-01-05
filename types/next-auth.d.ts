// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      id: string;
      name: string;
      email: string;
      role: "USER" | "ADMIN" | "SUPPORT";
      firstAccess: boolean;
      user: User;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    firstAccess: boolean;
    role: "USER" | "ADMIN" | "SUPPORT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstAccess: boolean;
    role: "USER" | "ADMIN" | "SUPPORT";
  }
}
