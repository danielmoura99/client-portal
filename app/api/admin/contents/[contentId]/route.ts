// app/api/admin/contents/[contentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { mkdir } from "fs/promises";

// Função auxiliar para salvar arquivo
async function saveFile(file: File, destPath: string): Promise<string> {
  // Garantir que o diretório existe
  const dir = path.dirname(destPath);
  await mkdir(dir, { recursive: true });

  // Ler o arquivo como um array de bytes
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Escrever o arquivo no sistema
  await fs.promises.writeFile(destPath, buffer);

  return destPath;
}

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
      // Criar estrutura de diretório
      const baseDir = process.env.CONTENTS_DIR || "contents";

      // Garantir que o caminho está no formato esperado
      if (!filePath || !filePath.startsWith(baseDir)) {
        filePath = `${baseDir}/${productId}/${file.name}`;
      }

      // Caminho absoluto para salvar o arquivo
      const absolutePath = path.join(process.cwd(), filePath);

      // Salvar o arquivo
      await saveFile(file, absolutePath);
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contentId = params.contentId;

    // Buscar o conteúdo para verificar se é um arquivo para excluir do sistema de arquivos
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

    // Transação para remover associações e o conteúdo
    await prisma.$transaction(async (tx) => {
      // 1. Remover todas as associações de produtos
      await tx.productContent.deleteMany({
        where: { contentId },
      });

      // 2. Excluir o conteúdo
      await tx.content.delete({
        where: { id: contentId },
      });
    });

    // Se o conteúdo for um arquivo local (não uma URL externa), tente excluí-lo do sistema de arquivos
    if (content.type === "file" && !content.path.startsWith("http")) {
      // Caminho absoluto para o arquivo
      const filePath = path.join(process.cwd(), content.path);

      // Verificação de segurança para garantir que o arquivo está dentro do diretório de conteúdos
      const contentsDir = path.join(process.cwd(), "contents");
      if (filePath.startsWith(contentsDir)) {
        try {
          // Verificar se o arquivo existe antes de tentar excluí-lo
          await fs.promises.access(filePath);
          // Excluir o arquivo
          await fs.promises.unlink(filePath);
        } catch (fileError) {
          // Se o arquivo não existir ou houver um erro ao excluí-lo, apenas registramos o erro
          // mas consideramos a operação bem-sucedida, pois o registro no banco foi excluído
          console.warn(
            `Arquivo não encontrado ou não pode ser excluído: ${filePath}`,
            fileError
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir conteúdo:", error);
    return NextResponse.json(
      {
        error: "Erro ao excluir conteúdo",
        message:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contentId = params.contentId;

    // Buscar o conteúdo com suas associações de produtos
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        productContents: {
          include: {
            product: true,
            module: true,
          },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Conteúdo não encontrado" },
        { status: 404 }
      );
    }

    // Formatar a resposta para o frontend
    const formattedContent = {
      ...content,
      productAssociations: content.productContents.map((pc) => ({
        id: pc.id,
        productId: pc.productId,
        productName: pc.product.name,
        moduleId: pc.moduleId,
        moduleName: pc.module?.title || null,
        sortOrder: pc.sortOrder,
      })),
      // Campo para compatibilidade com frontend existente
      primaryProductId: content.productContents[0]?.productId || null,
      primaryModuleId: content.productContents[0]?.moduleId || null,
      productContents: undefined, // Remover dados brutos
    };

    return NextResponse.json(formattedContent);
  } catch (error) {
    console.error("Erro ao buscar detalhes do conteúdo:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
