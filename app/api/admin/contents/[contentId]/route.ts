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
    const sortOrder = Number(formData.get("sortOrder") || 0);
    let filePath = formData.get("path") as string;

    // Validar dados essenciais
    if (!title || !type || !productId) {
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

    // Atualizar entrada no banco de dados
    const content = await prisma.content.update({
      where: { id: contentId },
      data: {
        title,
        description,
        type,
        path: filePath,
        productId,
        moduleId: moduleId || null,
        sortOrder,
      },
    });

    return NextResponse.json({ success: true, content });
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
    });

    if (!content) {
      return NextResponse.json(
        { error: "Conteúdo não encontrado" },
        { status: 404 }
      );
    }

    // Excluir o conteúdo do banco de dados
    await prisma.content.delete({
      where: { id: contentId },
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
