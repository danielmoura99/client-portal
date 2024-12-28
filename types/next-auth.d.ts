// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      firstAccess: boolean;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    firstAccess: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstAccess: boolean;
  }
}
