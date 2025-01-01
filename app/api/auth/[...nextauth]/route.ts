//client-portal/app/api/auth/[...nextauth]/route.ts
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    signOut: "/login", // Adicionando página de signOut
    error: "/login", // Adicionando página de erro
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Dados de login inválidos");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            firstAccess: true, // Adicionando firstAccess na seleção
          },
        });

        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Senha incorreta");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          firstAccess: user.firstAccess, // Retornando firstAccess
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.firstAccess = user.firstAccess;
      }

      // Permite atualização do token quando a sessão é atualizada
      if (trigger === "update" && session) {
        token.firstAccess = session.user.firstAccess;
      }

      return token;
    },
    async session({ session, token }) {
      // Garantir que session.user existe antes de tentar atribuir propriedades
      session.user = session.user || {};

      if (token) {
        session.user.id = token.id;
        session.user.firstAccess = token.firstAccess;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Se a URL começar com o baseUrl, permite o redirecionamento
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Se for uma URL relativa, adiciona o baseUrl
      else if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Caso contrário, redireciona para o baseUrl
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
