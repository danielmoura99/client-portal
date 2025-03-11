// app/api/admin/products/[productId]/modules/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const productId = params.productId;

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return Response.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Buscar módulos do produto
    const modules = await prisma.module.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });

    return Response.json({ modules });
  } catch (error) {
    console.error("Erro ao buscar módulos:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
