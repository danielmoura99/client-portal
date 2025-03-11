// app/(admin)/admin/products/[productId]/contents/modules/_actions/index.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema para validação
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const moduleSchema = z.object({
  title: z
    .string()
    .min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ModuleData = z.infer<typeof moduleSchema>;

// Criar módulo
export async function createModule(
  productId: string,
  data: z.infer<typeof moduleSchema>
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    // Criar módulo
    const moduleItem = await prisma.module.create({
      data: {
        title: data.title,
        description: data.description || null,
        sortOrder: data.sortOrder,
        productId,
      },
    });

    revalidatePath(`/admin/products/${productId}/contents`);
    return moduleItem;
  } catch (error) {
    console.error("Erro ao criar módulo:", error);
    throw error;
  }
}

// Atualizar módulo
export async function updateModule(
  moduleId: string,
  productId: string,
  data: z.infer<typeof moduleSchema>
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    // Verificar se o módulo existe
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!existingModule) {
      throw new Error("Módulo não encontrado");
    }

    // Atualizar módulo
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title: data.title,
        description: data.description || null,
        sortOrder: data.sortOrder,
      },
    });

    revalidatePath(`/admin/products/${productId}/contents`);
    return updatedModule;
  } catch (error) {
    console.error("Erro ao atualizar módulo:", error);
    throw error;
  }
}

// Excluir módulo
export async function deleteModule(moduleId: string, productId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    // Verificar se o módulo existe e se tem conteúdos associados
    const moduleWithContents = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        _count: {
          select: { contents: true },
        },
      },
    });

    if (!moduleWithContents) {
      throw new Error("Módulo não encontrado");
    }

    if (moduleWithContents._count.contents > 0) {
      throw new Error(
        "Não é possível excluir o módulo porque existem conteúdos associados a ele"
      );
    }

    // Excluir módulo
    await prisma.module.delete({
      where: { id: moduleId },
    });

    revalidatePath(`/admin/products/${productId}/contents`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir módulo:", error);
    throw error;
  }
}
