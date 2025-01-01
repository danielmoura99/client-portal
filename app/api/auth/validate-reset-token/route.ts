// app/api/auth/validate-reset-token/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return Response.json({ error: "Token não fornecido" }, { status: 400 });
    }

    // Verificar se existe usuário com token válido
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    return Response.json({ valid: !!user });
  } catch (error) {
    console.error("[Validate Reset Token] Error:", error);
    return Response.json({ error: "Erro ao validar token" }, { status: 500 });
  }
}
