// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Primeiro, verificar se o usuário está autenticado
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Se for firstAccess e não estiver indo para /primeiro-acesso
    if (
      token.firstAccess &&
      !req.nextUrl.pathname.startsWith("/primeiro-acesso")
    ) {
      return NextResponse.redirect(new URL("/primeiro-acesso", req.url));
    }

    // Se não for firstAccess e tentar acessar /primeiro-acesso
    if (
      !token.firstAccess &&
      req.nextUrl.pathname.startsWith("/primeiro-acesso")
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Verificação de roles para áreas administrativas
    const isAdmin = token.role === "ADMIN" || token.role === "SUPPORT";
    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirecionamento padrão para páginas protegidas
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/profile/:path*",
    "/evaluations/:path*",
    "/requests/:path*",
    "/primeiro-acesso",
    "/admin/:path*", // Adicionado para proteger rotas administrativas
  ],
};
