// app/api/admin/contents/delete/[contentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

export async function DELETE(
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

    // Buscar o conteúdo no banco de dados
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        productContents: true,
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Conteúdo não encontrado" },
        { status: 404 }
      );
    }

    // Se o conteúdo for um arquivo no Vercel Blob, excluí-lo
    if (content.type === "file" && content.path.includes("vercel-blob.com")) {
      try {
        await del(content.path);
        console.log(`Arquivo excluído do Vercel Blob: ${content.path}`);
      } catch (deleteError) {
        console.error("Erro ao excluir arquivo do Vercel Blob:", deleteError);
        // Continuamos mesmo se houver erro na exclusão do blob
      }
    }

    // Excluir as relações primeiro
    await prisma.productContent.deleteMany({
      where: { contentId },
    });

    // Excluir o conteúdo do banco de dados
    await prisma.content.delete({
      where: { id: contentId },
    });

    return NextResponse.json({
      success: true,
      message: "Conteúdo excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir conteúdo:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir conteúdo" },
      { status: 500 }
    );
  }
}
