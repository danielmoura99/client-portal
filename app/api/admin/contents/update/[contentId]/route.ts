// app/api/admin/contents/update/[contentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

export async function PUT(
  req: NextRequest,
  { params }: { params: { contentId: string } }
) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const contentId = params.contentId;

    // Verificar se o conteúdo existe
    const existingContent = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        productContents: true,
      },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: "Conteúdo não encontrado" },
        { status: 404 }
      );
    }

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
    if (!title || !type) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Processar arquivo, se fornecido
    const file = formData.get("file") as File | null;

    if (file) {
      // Criar um nome de arquivo estruturado
      const fileName = `contents/${productId}/${file.name}`;

      // Se o arquivo antigo era do Vercel Blob, excluí-lo
      if (
        existingContent.path &&
        existingContent.path.includes("vercel-blob.com")
      ) {
        try {
          await del(existingContent.path);
        } catch (deleteError) {
          console.warn(
            "Aviso: Não foi possível excluir o blob antigo:",
            deleteError
          );
          // Continuamos mesmo se a exclusão falhar
        }
      }

      // Upload para Vercel Blob
      const { url } = await put(fileName, file, {
        access: "public",
      });

      // Atualizar o caminho para a URL do blob
      filePath = url;
    }

    // Transação para atualizar conteúdo e associação de produto
    const updatedContent = await prisma.$transaction(async (tx) => {
      // 1. Atualizar o conteúdo base
      const content = await tx.content.update({
        where: { id: contentId },
        data: {
          title,
          description,
          type,
          path: filePath,
        },
      });

      // 2. Verificar se já existe associação com este produto
      const existingAssociation = await tx.productContent.findFirst({
        where: {
          contentId,
          productId,
        },
      });

      // 3. Atualizar ou criar a associação
      if (existingAssociation) {
        await tx.productContent.update({
          where: {
            id: existingAssociation.id,
          },
          data: {
            moduleId: finalModuleId,
            sortOrder,
          },
        });
      } else {
        // Se o produto selecionado é diferente, criar nova associação
        await tx.productContent.create({
          data: {
            contentId,
            productId,
            moduleId: finalModuleId,
            sortOrder,
          },
        });
      }

      return content;
    });

    return NextResponse.json({ success: true, content: updatedContent });
  } catch (error) {
    console.error("Erro ao atualizar conteúdo:", error);
    return NextResponse.json(
      {
        error: "Erro ao atualizar conteúdo",
        message:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
