// app/(admin)/admin/users/[userId]/_actions/index.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema para validação
const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  document: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
});

// Atualizar usuário
export async function updateUser(
  userId: string,
  data: z.infer<typeof userSchema>
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  // Validar dados
  const validatedData = userSchema.parse(data);

  try {
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar se o email já está em uso por outro usuário
    if (existingUser.email !== validatedData.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (userWithEmail) {
        throw new Error("Este email já está em uso por outro usuário");
      }
    }

    // Verificar se o documento já está em uso por outro usuário
    if (existingUser.document !== validatedData.document) {
      const userWithDocument = await prisma.user.findUnique({
        where: { document: validatedData.document },
      });

      if (userWithDocument) {
        throw new Error("Este documento já está em uso por outro usuário");
      }
    }

    // Atualizar usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        document: validatedData.document,
        phone: validatedData.phone,
        address: validatedData.address,
        zipCode: validatedData.zipCode,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw error;
  }
}
