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
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const resolvedParams = await params;
    const contentId = resolvedParams.contentId;

    // Buscar o conteúdo no banco de dados
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return new NextResponse("Content not found", { status: 404 });
    }

    // Verificar se o usuário tem acesso ao conteúdo
    const hasAccess = await checkUserAccess(session.user.id, { contentId });

    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Se o conteúdo for um arquivo para download com URL do Vercel Blob
    if (content.type === "file" && content.path.includes("vercel-blob.com")) {
      // Extraímos o nome do arquivo da URL ou do título
      const filename =
        content.path.split("/").pop() ||
        content.title.replace(/\s+/g, "_") + ".file";

      // Adicionamos o parâmetro de download com o nome do arquivo
      const downloadUrl = new URL(content.path);
      downloadUrl.searchParams.append("download", filename);

      // Redirecionar para a URL do Vercel Blob com o parâmetro de download
      return NextResponse.redirect(downloadUrl.toString());
    }
    // Para outros tipos de conteúdo (URLs, etc.)
    else {
      return NextResponse.json(content);
    }
  } catch (error) {
    console.error("Content access error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
