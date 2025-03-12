// app/api/admin/contents/delete/[contentId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

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

    // Se o conteúdo for um arquivo local, excluir do sistema de arquivos
    if (content.type === "file" && !content.path.startsWith("http")) {
      try {
        // Construir caminho completo do arquivo
        const fullPath = path.join(process.cwd(), content.path);

        // Verificar se o arquivo existe
        if (fs.existsSync(fullPath)) {
          // Excluir o arquivo
          fs.unlinkSync(fullPath);
          console.log(`Arquivo excluído: ${fullPath}`);
        }
      } catch (fsError) {
        console.error("Erro ao excluir arquivo:", fsError);
        // Continuamos mesmo se houver erro no sistema de arquivos
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
