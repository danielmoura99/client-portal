// app/(admin)/admin/products/[productId]/contents/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ProductContentsClientPage from "./client-page";

interface PageProps {
  params: Promise<{ [productId: string]: string }>;
}

export default async function ProductContentsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await params;

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  try {
    // Buscar o produto com seus conteúdos usando as relações corretas conforme o schema
    const product = await prisma.product.findUnique({
      where: { id: resolvedSearchParams.productId },
    });

    if (!product) {
      notFound();
    }

    // Buscar os módulos do produto
    const modules = await prisma.module.findMany({
      where: { productId: resolvedSearchParams.productId },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { contents: true },
        },
      },
    });

    // Buscar os ProductContent para este produto, incluindo Content e Module
    const productContents = await prisma.productContent.findMany({
      where: { productId: resolvedSearchParams.productId },
      include: {
        content: true,
        module: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    // Construir o objeto formatado conforme esperado pelo componente cliente
    const formattedProduct = {
      ...product,
      type: product.type.toString(),
      productContents: productContents,
      modules: modules,
      // Para compatibilidade com componentes existentes
      contents: productContents.map((pc) => ({
        ...pc.content,
        moduleId: pc.moduleId,
        sortOrder: pc.sortOrder,
        productContentId: pc.id,
      })),
    };

    return (
      <ProductContentsClientPage
        productId={resolvedSearchParams.productId}
        initialProduct={formattedProduct}
      />
    );
  } catch (error) {
    console.error("Erro ao buscar produto com conteúdos:", error);
    throw error;
  }
}
