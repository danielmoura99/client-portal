// app/api/admin/contents/update/[contentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const contentId = resolvedParams.contentId;

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

    // Novo: obter productContents como string JSON e converter para array
    const productContentsStr = formData.get("productContents") as string | null;
    let productContentsList = [];
    if (productContentsStr) {
      try {
        productContentsList = JSON.parse(productContentsStr);
      } catch (e) {
        console.error("Erro ao fazer parse de productContents:", e);
      }
    }

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

    // Transação para atualizar conteúdo e associações de produtos
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

      // 2. Se há productId no formulário principal, garantir essa associação
      if (productId) {
        // Verificar se já existe associação com este produto
        const existingAssociation = await tx.productContent.findFirst({
          where: {
            contentId,
            productId,
          },
        });

        if (existingAssociation) {
          // Atualizar associação existente
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
          // Criar nova associação
          await tx.productContent.create({
            data: {
              contentId,
              productId,
              moduleId: finalModuleId,
              sortOrder,
            },
          });
        }
      }

      // 3. Processar lista adicional de productContents para manter múltiplas associações
      if (productContentsList && productContentsList.length > 0) {
        // Primeiro obter todos os IDs de produtos já associados para não duplicar
        const existingProductIds = new Set(
          (
            await tx.productContent.findMany({
              where: { contentId },
              select: { productId: true },
            })
          ).map((pc) => pc.productId)
        );

        // Processar cada associação da lista
        for (const pc of productContentsList) {
          // Pular se já processamos este productId acima
          if (pc.productId === productId) continue;

          // Pular se já existe (será atualizado apenas se explicitamente solicitado)
          if (existingProductIds.has(pc.productId)) continue;

          // Criar nova associação
          await tx.productContent.create({
            data: {
              contentId,
              productId: pc.productId,
              moduleId: pc.moduleId || null,
              sortOrder: pc.sortOrder || 0,
            },
          });
        }
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
