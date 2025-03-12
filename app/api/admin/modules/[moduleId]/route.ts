// app/api/admin/modules/[moduleId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const resolvedparams = await params;
    const moduleId = resolvedparams.moduleId;

    // Verificar se o módulo existe
    const moduleItem = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        _count: {
          select: { contents: true },
        },
      },
    });

    if (!moduleItem) {
      return NextResponse.json(
        { error: "Módulo não encontrado" },
        { status: 404 }
      );
    }

    // Se houver conteúdos associados, remover a associação
    if (moduleItem._count.contents > 0) {
      await prisma.productContent.updateMany({
        where: { moduleId },
        data: { moduleId: null },
      });
    }

    // Excluir o módulo
    await prisma.module.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({
      success: true,
      message: "Módulo excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir módulo:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir módulo" },
      { status: 500 }
    );
  }
}
