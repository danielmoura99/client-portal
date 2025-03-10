// app/(admin)/admin/users/[userId]/role/_actions/index.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Atualizar a permissão do usuário
export async function updateUserRole(
  userId: string,
  role: "USER" | "ADMIN" | "SUPPORT"
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error("Usuário não encontrado");
    }

    // Se o usuário estiver tentando remover seu próprio privilégio de admin
    if (userId === session.user.id && role !== "ADMIN") {
      throw new Error(
        "Você não pode remover seu próprio privilégio de administrador"
      );
    }

    // Atualizar a role do usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        role,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar permissão:", error);
    throw error;
  }
}
