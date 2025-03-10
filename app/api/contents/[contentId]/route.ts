// app/api/contents/[contentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { checkUserAccess } from "@/lib/services/access-control";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const contentId = params.contentId;

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

    // Se o conteúdo for um arquivo para download
    if (content.type === "file") {
      const filePath = content.path;
      const fullPath = path.join(process.cwd(), "contents", filePath);

      // Verificação de segurança
      const contentsDir = path.join(process.cwd(), "contents");
      if (!fullPath.startsWith(contentsDir)) {
        return new NextResponse("Forbidden", { status: 403 });
      }

      // Verificar se o arquivo existe
      try {
        await fs.promises.access(fullPath);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.error(`File not found: ${fullPath}`);
        return new NextResponse("File not found", { status: 404 });
      }

      // Ler o arquivo
      const fileBuffer = await fs.promises.readFile(fullPath);

      // Determinar o tipo de conteúdo
      let contentType = "application/octet-stream";
      if (fullPath.endsWith(".xlsx")) {
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else if (fullPath.endsWith(".pdf")) {
        contentType = "application/pdf";
      } else if (fullPath.endsWith(".doc") || fullPath.endsWith(".docx")) {
        contentType = "application/msword";
      }

      // Nome do arquivo para download
      const filename = path.basename(fullPath);

      // Configurar headers para download
      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Content-Disposition", `attachment; filename=${filename}`);

      return new NextResponse(fileBuffer, { headers });
    }
    // Se for outro tipo de conteúdo (URLs, etc.)
    else {
      return NextResponse.json(content);
    }
  } catch (error) {
    console.error("Content access error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
