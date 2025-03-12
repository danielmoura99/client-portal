//app/api/admin/products/[productId]/contents/[productContentId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string; productContentId: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { productId, productContentId } = params;

    console.log(
      `Recebida solicitação para excluir: productId=${productId}, productContentId=${productContentId}`
    );

    // Verificar se a relação existe
    const productContent = await prisma.productContent.findUnique({
      where: { id: productContentId },
    });

    if (!productContent) {
      return NextResponse.json(
        { error: "Relação produto-conteúdo não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se a relação pertence ao produto
    if (productContent.productId !== productId) {
      return NextResponse.json(
        { error: "A relação não pertence ao produto especificado" },
        { status: 400 }
      );
    }

    // Excluir a relação (não o conteúdo em si)
    await prisma.productContent.delete({
      where: { id: productContentId },
    });

    return NextResponse.json({
      success: true,
      message: "Relação produto-conteúdo removida com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir relação produto-conteúdo:", error);
    return NextResponse.json(
      {
        error: "Erro interno ao excluir relação produto-conteúdo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
