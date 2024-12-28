// app/api/auth/reset-password/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    // Buscar usuário com token válido
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return Response.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hash(password, 10);

    // Atualizar usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        firstAccess: false,
      },
    });

    return Response.json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error("[Reset Password] Error:", error);
    return Response.json({ error: "Erro ao redefinir senha" }, { status: 500 });
  }
}
