// app/api/auth/change-password/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { hash, compare } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const changePasswordSchema = z.object({
  current: z.string().min(1, "Senha atual é obrigatória"),
  new: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
})

export async function POST(req: NextRequest) {
  try {
    // Verificar se usuário está autenticado
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Validar e obter dados da requisição
    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ message: parsed.error.errors[0].message }, { status: 400 });
    }
    const { current, new: newPassword } = parsed.data;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar senha atual
    const isValidPassword = await compare(current, user.password);
    if (!isValidPassword) {
      return Response.json(
        { message: "Senha atual incorreta" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hash(newPassword, 12);

    // Atualizar usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        firstAccess: false,
        updatedAt: new Date(),
      },
    });

    return Response.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("[Change Password] Error:", error);
    return Response.json({ message: "Erro ao alterar senha" }, { status: 500 });
  }
}
