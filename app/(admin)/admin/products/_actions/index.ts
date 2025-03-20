// app/(admin)/admin/products/_actions.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema para validação
const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  type: z.enum(["COURSE", "TOOL", "EVALUATION"]),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  coverImage: z.string().optional(),
});

// Criar produto
export async function createProduct(data: z.infer<typeof productSchema>) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  // Validar dados
  const validatedData = productSchema.parse(data);

  try {
    // Verificar se já existe um produto com o mesmo slug
    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProduct) {
      throw new Error("Já existe um produto com este slug");
    }

    // Criar produto
    await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        slug: validatedData.slug,
        coverImage: validatedData.coverImage,
      },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw error;
  }
}

// Atualizar produto
export async function updateProduct(
  id: string,
  data: z.infer<typeof productSchema>
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  // Validar dados
  const validatedData = productSchema.parse(data);

  try {
    // Verificar se o produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new Error("Produto não encontrado");
    }

    // Verificar se já existe outro produto com o mesmo slug
    if (existingProduct.slug !== validatedData.slug) {
      const productWithSlug = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      });

      if (productWithSlug) {
        throw new Error("Já existe um produto com este slug");
      }
    }

    // Atualizar produto
    await prisma.product.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        slug: validatedData.slug,
        coverImage: validatedData.coverImage,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
}

// Excluir produto
export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    // Verificar se o produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            contents: true,
            userProducts: true,
          },
        },
      },
    });

    if (!existingProduct) {
      throw new Error("Produto não encontrado");
    }

    // Verificar se o produto tem conteúdos ou usuários associados
    if (
      existingProduct._count.contents > 0 ||
      existingProduct._count.userProducts > 0
    ) {
      throw new Error(
        "O produto não pode ser excluído porque possui conteúdos ou usuários associados"
      );
    }

    // Excluir produto
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    throw error;
  }
}
