// app/(admin)/admin/users/[userId]/access/_actions/index.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addProductAccess(userId: string, productId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    // Verificar se o acesso já existe
    const existingAccess = await prisma.userProduct.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingAccess) {
      throw new Error("O usuário já tem acesso a este produto");
    }

    // Criar o acesso
    await prisma.userProduct.create({
      data: {
        userId,
        productId,
      },
    });

    revalidatePath(`/admin/users/${userId}/access`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar acesso:", error);
    throw error;
  }
}

export async function removeProductAccess(userId: string, productId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    // Verificar se o acesso existe
    const existingAccess = await prisma.userProduct.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!existingAccess) {
      throw new Error("Acesso não encontrado");
    }

    // Remover o acesso
    await prisma.userProduct.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    revalidatePath(`/admin/users/${userId}/access`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover acesso:", error);
    throw error;
  }
}
