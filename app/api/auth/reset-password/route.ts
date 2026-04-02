// app/api/auth/reset-password/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { token, password } = parsed.data;

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
    const hashedPassword = await hash(password, 12);

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
