// app/(admin)/admin/products/[productId]/contents/_actions/index.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Função para buscar conteúdos
export async function getProductContents(productId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    const contents = await prisma.content.findMany({
      where: { productId },
      include: {
        module: true, // Este é o nome da relação no Prisma, não uma variável
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return contents;
  } catch (error) {
    console.error("Erro ao buscar conteúdos:", error);
    throw error;
  }
}

// Função para reordenar conteúdos
export async function reorderContents(productId: string, contentIds: string[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    // Atualizar a ordem de cada conteúdo
    await Promise.all(
      contentIds.map((id, index) =>
        prisma.content.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath(`/admin/products/${productId}/contents`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao reordenar conteúdos:", error);
    throw error;
  }
}

// Função para associar conteúdo a um módulo
export async function assignContentToModule(
  contentId: string,
  moduleId: string | null,
  productId: string
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    // Se moduleId for fornecido, verificar se o módulo existe
    if (moduleId) {
      const moduleItem = await prisma.module.findUnique({
        where: { id: moduleId },
      });

      if (!moduleItem) {
        throw new Error("Módulo não encontrado");
      }
    }

    // Atualizar conteúdo com o módulo
    await prisma.content.update({
      where: { id: contentId },
      data: { moduleId },
    });

    revalidatePath(`/admin/products/${productId}/contents`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao associar conteúdo a módulo:", error);
    throw error;
  }
}

export async function addExistingContentsToProduct(
  productId: string,
  contentIds: string[]
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

    // Verificar se todos os conteúdos existem
    const contentsCount = await prisma.content.count({
      where: {
        id: {
          in: contentIds,
        },
      },
    });

    if (contentsCount !== contentIds.length) {
      throw new Error("Um ou mais conteúdos selecionados não existem");
    }

    // Atualizar cada conteúdo para o novo produto
    const updatePromises = contentIds.map((contentId) =>
      prisma.content.update({
        where: { id: contentId },
        data: {
          productId,
          // Defina moduleId como null ao mover para outro produto
          moduleId: null,
        },
      })
    );

    await Promise.all(updatePromises);

    revalidatePath(`/admin/products/${productId}/contents`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar conteúdos existentes:", error);
    throw error;
  }
}

export async function fetchProductWithContents(productId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        contents: {
          include: {
            module: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        modules: {
          orderBy: {
            sortOrder: "asc",
          },
          include: {
            _count: {
              select: { contents: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    return product;
  } catch (error) {
    console.error("Erro ao buscar produto com conteúdos:", error);
    throw error;
  }
}
