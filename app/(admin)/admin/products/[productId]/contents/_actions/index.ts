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
    // Modificado: agora busca através da tabela ProductContent
    const productContents = await prisma.productContent.findMany({
      where: { productId },
      include: {
        content: true,
        module: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // Transformar para manter compatibilidade com código existente
    const contents = productContents.map((pc) => ({
      ...pc.content,
      sortOrder: pc.sortOrder,
      productId: pc.productId,
      moduleId: pc.moduleId,
      productContentId: pc.id, // Adiciona o ID da relação
    }));

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
    // Atualizar a ordem de cada conteúdo no relacionamento ProductContent
    await Promise.all(
      contentIds.map(async (id, index) => {
        // Buscar o ProductContent correspondente
        await prisma.productContent.updateMany({
          where: {
            contentId: id,
            productId,
          },
          data: { sortOrder: index },
        });
      })
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

    // Atualizar a relação ProductContent com o módulo
    await prisma.productContent.updateMany({
      where: {
        contentId,
        productId,
      },
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

    // Verificar quais conteúdos já estão associados ao produto
    const existingAssociations = await prisma.productContent.findMany({
      where: {
        productId,
        contentId: {
          in: contentIds,
        },
      },
      select: { contentId: true },
    });

    const existingContentIds = existingAssociations.map((e) => e.contentId);
    const newContentIds = contentIds.filter(
      (id) => !existingContentIds.includes(id)
    );

    // Criar apenas as novas associações
    if (newContentIds.length > 0) {
      const createPromises = newContentIds.map((contentId) =>
        prisma.productContent.create({
          data: {
            productId,
            contentId,
            moduleId: null,
          },
        })
      );

      await Promise.all(createPromises);
    }

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
    // Buscar o produto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
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

    // Buscar os relacionamentos ProductContent para este produto
    const productContents = await prisma.productContent.findMany({
      where: { productId },
      include: {
        content: true,
        module: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // Transformar para o formato esperado pelo código existente
    const transformedContents = productContents.map((pc) => ({
      ...pc.content,
      sortOrder: pc.sortOrder,
      productId: pc.productId,
      moduleId: pc.moduleId,
      module: pc.module,
      productContentId: pc.id,
    }));

    // Adicionar os conteúdos transformados ao objeto do produto
    const productWithContents = {
      ...product,
      contents: transformedContents,
    };

    return productWithContents;
  } catch (error) {
    console.error("Erro ao buscar produto com conteúdos:", error);
    throw error;
  }
}
