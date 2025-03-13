// app/api/admin/contents/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Processar formulário com upload de arquivo
    const formData = await req.formData();

    // Extrair dados do formulário
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as string;
    const productId = formData.get("productId") as string;
    const moduleId = formData.get("moduleId") as string | null;
    const finalModuleId =
      moduleId === "none" || moduleId === "" ? null : moduleId;
    const sortOrder = Number(formData.get("sortOrder") || 0);
    let filePath = formData.get("path") as string;

    // Validar dados essenciais
    if (!title || !type || !productId) {
      return Response.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Processar arquivo, se fornecido
    const file = formData.get("file") as File | null;

    if (file) {
      // Criar uma estrutura de diretório virtual para organização
      const fileName = `contents/${productId}/${file.name}`;

      // Upload para Vercel Blob
      const { url } = await put(fileName, file, {
        access: "public",
      });

      // Atualizar o caminho para a URL do blob
      filePath = url;
    }

    // Criar entrada no banco de dados para o conteúdo
    const content = await prisma.content.create({
      data: {
        title,
        description,
        type,
        path: filePath,
      },
    });

    // Agora criar a associação do conteúdo com o produto
    await prisma.productContent.create({
      data: {
        contentId: content.id,
        productId,
        moduleId: finalModuleId,
        sortOrder,
      },
    });

    return Response.json({ success: true, content });
  } catch (error) {
    console.error("Erro ao criar conteúdo:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
