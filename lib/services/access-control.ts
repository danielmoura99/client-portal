// lib/services/access-control.ts
import { prisma } from "@/lib/prisma";
import { Product, ProductType, UserProduct } from "@prisma/client";

export interface AccessOptions {
  productSlug?: string;
  productType?: string;
  contentId?: string;
}

type UserProductWithProduct = UserProduct & {
  product: Product;
};

export async function checkUserAccess(
  userId: string,
  options: AccessOptions
): Promise<boolean> {
  // Se nenhuma opção for especificada, negar acesso
  if (!options.productSlug && !options.productType && !options.contentId) {
    return false;
  }

  // Primeiro verificar se o usuário é admin (pode acessar tudo)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "ADMIN") {
    return true;
  }

  // Verificação baseada em contentId específico
  if (options.contentId) {
    // Alterado para verificar através de ProductContent
    const productContent = await prisma.productContent.findFirst({
      where: {
        contentId: options.contentId,
        product: {
          userProducts: {
            some: {
              userId: userId,
              expiresAt: {
                gte: new Date(),
              },
            },
          },
        },
      },
    });

    if (productContent) return true;

    return false;
  }

  // Verificação baseada em slug do produto
  if (options.productSlug) {
    const product = await prisma.product.findUnique({
      where: { slug: options.productSlug },
    });

    if (!product) return false;

    const userProduct = await prisma.userProduct.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: product.id,
        },
      },
    });

    if (
      userProduct &&
      (!userProduct.expiresAt || userProduct.expiresAt > new Date())
    ) {
      return true;
    }
  }

  // Verificação baseada no tipo de produto
  if (options.productType) {
    // Primeiro, verificamos se o tipo informado é um ProductType válido
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!Object.values(ProductType).includes(options.productType as any)) {
      return false;
    }

    // Buscar produtos do usuário que não expiraram
    const userProducts = await prisma.userProduct.findMany({
      where: {
        userId: userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        product: true,
      },
    });

    // Verificar se algum produto tem o tipo especificado
    const hasProductOfType = userProducts.some(
      (userProduct) => userProduct.product.type === options.productType
    );

    if (hasProductOfType) {
      return true;
    }
  }

  return false;
}

// Função utilitária para obter produtos do usuário
export async function getUserProducts(
  userId: string
): Promise<UserProductWithProduct[]> {
  return prisma.userProduct.findMany({
    where: {
      userId: userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      product: true,
    },
  });
}

// Função para obter conteúdos de um produto
export async function getProductContents(productId: string) {
  // Alterado para usar ProductContent
  return prisma.productContent.findMany({
    where: { productId },
    include: {
      content: true,
      module: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}
