// app/api/contents/[contentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { checkUserAccess } from "@/lib/services/access-control";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log(
      "Solicitação de conteúdo recebida para ID:",
      resolvedParams.contentId
    );

    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("Acesso não autorizado: usuário não autenticado");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const contentId = resolvedParams.contentId;

    // Buscar o conteúdo no banco de dados
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      console.log("Conteúdo não encontrado para ID:", contentId);
      return new NextResponse("Content not found", { status: 404 });
    }

    console.log("Conteúdo encontrado:", {
      id: content.id,
      title: content.title,
      type: content.type,
      path: content.path,
    });

    // Verificar se o usuário tem acesso ao conteúdo
    const hasAccess = await checkUserAccess(session.user.id, { contentId });

    if (!hasAccess) {
      console.log("Acesso negado para usuário:", session.user.id);
      return new NextResponse("Forbidden", { status: 403 });
    }

    console.log("Acesso autorizado para usuário:", session.user.id);

    // Se o conteúdo for um arquivo para download com URL do Vercel Blob
    if (content.type === "file" && content.path.includes("vercel-blob.com")) {
      // Extraímos o nome do arquivo da URL ou do título
      const filename =
        content.path.split("/").pop() ||
        content.title.replace(/\s+/g, "_") + ".file";

      console.log("Preparando download do arquivo:", filename);

      // Passamos o caminho do arquivo diretamente como JSON para o cliente processar
      // Em vez de redirecionamento que pode ser bloqueado por políticas de segurança
      return NextResponse.json({
        url: content.path,
        filename: filename,
        type: content.type,
      });
    }
    // Para outros tipos de conteúdo (URLs, etc.)
    else {
      console.log("Retornando metadados do conteúdo");
      return NextResponse.json(content);
    }
  } catch (error) {
    console.error("Erro de acesso ao conteúdo:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
