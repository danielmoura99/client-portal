// app/api/admin/contents/get/[contentId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const resolvedParams = await params;
    const contentId = resolvedParams.contentId;

    // Buscar o conteúdo com suas associações de produtos
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        productContents: {
          include: {
            product: true,
            module: true,
          },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Conteúdo não encontrado" },
        { status: 404 }
      );
    }

    // Formatar a resposta para o frontend
    const formattedContent = {
      ...content,
      productAssociations: content.productContents.map((pc) => ({
        id: pc.id,
        productId: pc.productId,
        productName: pc.product.name,
        moduleId: pc.moduleId,
        moduleName: pc.module?.title || null,
        sortOrder: pc.sortOrder,
      })),
      // Campo para compatibilidade com frontend existente
      primaryProductId: content.productContents[0]?.productId || null,
      primaryModuleId: content.productContents[0]?.moduleId || null,
      productContents: undefined, // Remover dados brutos
    };

    return NextResponse.json(formattedContent);
  } catch (error) {
    console.error("Erro ao buscar detalhes do conteúdo:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
