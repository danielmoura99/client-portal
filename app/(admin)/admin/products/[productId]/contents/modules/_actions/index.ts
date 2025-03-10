// app/(admin)/admin/products/[productId]/contents/modules/_actions/index.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema para validação
const moduleSchema = z.object({
  title: z
    .string()
    .min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

type ModuleData = z.infer<typeof moduleSchema>;

// Criar um novo módulo
export async function createModule(productId: string, data: ModuleData) {
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

    // Validar dados
    const validatedData = moduleSchema.parse(data);

    // Criar módulo
    const module = await prisma.module.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        sortOrder: validatedData.sortOrder,
        productId: productId,
      },
    });

    // Revalidar páginas que exibem módulos
    revalidatePath(`/admin/products/${productId}/contents`);

    return { success: true, module };
  } catch (error) {
    console.error("Erro ao criar módulo:", error);
    throw error;
  }
}

// Atualizar um módulo existente
export async function updateModule(
  moduleId: string,
  productId: string,
  data: ModuleData
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

    // Verificar se o módulo pertence ao produto especificado
    if (existingModule.productId !== productId) {
      throw new Error("Módulo não pertence ao produto especificado");
    }

    // Validar dados
    const validatedData = moduleSchema.parse(data);

    // Atualizar módulo
    const module = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        sortOrder: validatedData.sortOrder,
      },
    });

    // Revalidar páginas que exibem módulos
    revalidatePath(`/admin/products/${productId}/contents`);
    revalidatePath(`/admin/products/${productId}/contents/modules/${moduleId}`);

    return { success: true, module };
  } catch (error) {
    console.error("Erro ao atualizar módulo:", error);
    throw error;
  }
}

// Excluir um módulo
export async function deleteModule(moduleId: string, productId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    // Verificar se o módulo existe
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        _count: {
          select: { contents: true },
        },
      },
    });

    if (!module) {
      throw new Error("Módulo não encontrado");
    }

    // Verificar se o módulo pertence ao produto especificado
    if (module.productId !== productId) {
      throw new Error("Módulo não pertence ao produto especificado");
    }

    // Verificar se o módulo possui conteúdos associados
    if (module._count.contents > 0) {
      throw new Error(
        "Este módulo possui conteúdos associados e não pode ser excluído"
      );
    }

    // Excluir o módulo
    await prisma.module.delete({
      where: { id: moduleId },
    });

    // Revalidar páginas que exibem módulos
    revalidatePath(`/admin/products/${productId}/contents`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir módulo:", error);
    throw error;
  }
}
